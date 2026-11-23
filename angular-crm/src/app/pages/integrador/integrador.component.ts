import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { GoogleAdsService } from '../../core/google-ads/google-ads.service';
import { GoogleAdsConnection, GoogleAdsRule } from '../../models/google-ads.model';
import { apiErrorMessage } from './api-error';
import { GoogleAdsAccountComponent } from './google-ads-account/google-ads-account.component';
import { GoogleAdsHistoryComponent } from './google-ads-history/google-ads-history.component';
import { originLabel, triggerLabel } from './google-ads-labels';
import { GoogleAdsRuleEditorComponent } from './google-ads-rule-editor/google-ads-rule-editor.component';

// Integrador Google Ads no estilo Zapier: conecta a conta Google do cliente e lista as
// integrações "momento do Lead no CRM → conversão no Google Ads"; ao abrir uma, o editor em passos.
@Component({
  selector: 'app-integrador',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    GoogleAdsAccountComponent,
    GoogleAdsHistoryComponent,
    GoogleAdsRuleEditorComponent,
  ],
  templateUrl: './integrador.component.html',
  styleUrl: './integrador.component.scss',
})
export class IntegradorComponent implements OnInit {
  readonly connection = signal<GoogleAdsConnection | null>(null);
  readonly rules = signal<GoogleAdsRule[]>([]);
  readonly loading = signal(true);
  readonly connecting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly busyRuleId = signal<string | null>(null);
  // null = lista; 'new' = criando; id = editando.
  readonly editing = signal<string | null>(null);

  readonly editingRule = computed(() => this.rules().find((rule) => rule.id === this.editing()) ?? null);
  readonly canCreate = computed(() => Boolean(this.connection()?.connected));
  readonly triggerLabel = triggerLabel;
  readonly originLabel = originLabel;

  constructor(
    private readonly googleAdsService: GoogleAdsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.handleOAuthReturn()) {
      this.load();
    }
  }

  open(id: string | 'new'): void {
    this.editing.set(id);
  }

  closeEditor(): void {
    this.editing.set(null);
    this.loadRules();
  }

  toggle(rule: GoogleAdsRule): void {
    this.busyRuleId.set(rule.id);
    this.googleAdsService.updateRule(rule.id, { enabled: !rule.enabled }).subscribe({
      next: (updated) => {
        this.busyRuleId.set(null);
        this.rules.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      },
      error: (error: unknown) => {
        this.busyRuleId.set(null);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível ligar/desligar a integração.'));
      },
    });
  }

  // Criada ou salva: atualiza a lista e mantém o editor aberto nela (para Testar).
  onRuleSaved(saved: GoogleAdsRule): void {
    this.rules.update((list) =>
      list.some((rule) => rule.id === saved.id) ? list.map((rule) => (rule.id === saved.id ? saved : rule)) : [...list, saved],
    );
    this.editing.set(saved.id);
  }

  onConnectionChanged(connection: GoogleAdsConnection): void {
    this.connection.set(connection);
  }

  // Volta do Google com ?code&state (ou ?error): troca o code e limpa a URL.
  private handleOAuthReturn(): boolean {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (!code && !error) {
      return false;
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });

    if (error || !code || !state) {
      this.errorMessage.set(
        error === 'access_denied'
          ? 'A conexão com o Google Ads foi cancelada.'
          : `O Google recusou a autorização${error ? ` (${error})` : ''}. Tente de novo.`,
      );
      this.load();
      return true;
    }

    this.connecting.set(true);
    this.googleAdsService.exchangeCode(code, state).subscribe({
      next: () => {
        this.connecting.set(false);
        this.load();
      },
      error: (exchangeError: unknown) => {
        this.connecting.set(false);
        this.errorMessage.set(apiErrorMessage(exchangeError, 'Não foi possível concluir a conexão com o Google Ads.'));
        this.load();
      },
    });

    return true;
  }

  private load(): void {
    this.loading.set(true);
    this.googleAdsService.getConnection().subscribe({
      next: (connection) => {
        this.connection.set(connection);
        this.loadRules();
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar o Integrador.'));
      },
    });
  }

  private loadRules(): void {
    this.googleAdsService.listRules().subscribe({
      next: (rules) => {
        this.rules.set(rules);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar as integrações.'));
      },
    });
  }
}
