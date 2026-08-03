import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MetaService } from '../../core/meta/meta.service';
import { UsersService } from '../../core/users/users.service';
import { WebWidgetService } from '../../core/web-widget/web-widget.service';
import { MetaIntegration, MetaIntegrationLog } from '../../models/meta-integration.model';
import { TenantUser } from '../../models/tenant.model';
import { WebWidgetIntegration, WebWidgetLog } from '../../models/web-widget.model';

const WIDGET_LOG_DISPLAYED_COLUMNS = ['createdAt', 'status', 'utmSource', 'message'];
const META_LOG_DISPLAYED_COLUMNS = ['createdAt', 'status', 'formId', 'message'];

const DUPLICATE_STRATEGY_LABELS: Record<'IGNORE' | 'UPDATE', string> = {
  IGNORE: 'Manter o Lead existente',
  UPDATE: 'Atualizar os dados do Lead existente',
};

function maskToken(token: string): string {
  const visibleChars = 4;

  if (token.length <= visibleChars) {
    return '•'.repeat(8);
  }

  return `${'•'.repeat(8)}${token.slice(-visibleChars)}`;
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ClipboardModule,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.scss',
})
export class ConfiguracoesComponent implements OnInit {
  readonly widgetLogDisplayedColumns = WIDGET_LOG_DISPLAYED_COLUMNS;
  readonly metaLogDisplayedColumns = META_LOG_DISPLAYED_COLUMNS;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly users = signal<TenantUser[]>([]);
  readonly widget = signal<WebWidgetIntegration | null>(null);
  readonly widgetLogs = signal<WebWidgetLog[]>([]);

  readonly widgetResponsibleUserName = computed(() => {
    const userId = this.widget()?.defaultResponsibleUserId;

    if (!userId) {
      return 'Nenhum';
    }

    const user = this.users().find((candidate) => candidate.id === userId);

    return user ? `${user.name} (${user.email})` : 'Nenhum';
  });

  readonly widgetDuplicateStrategyLabel = computed(() => {
    const strategy = this.widget()?.duplicateStrategy;

    return strategy ? DUPLICATE_STRATEGY_LABELS[strategy] : '—';
  });

  readonly embedSnippet = computed(() => {
    const publicKey = this.widget()?.publicKey;

    if (!publicKey) {
      return null;
    }

    return `<script src="${environment.apiUrl}/webhooks/web-widget/widget.js" data-key="${publicKey}" defer></script>`;
  });

  readonly metaSaving = signal(false);
  readonly metaErrorMessage = signal<string | null>(null);
  readonly metaSuccessMessage = signal<string | null>(null);
  readonly meta = signal<MetaIntegration | null>(null);
  readonly metaLogs = signal<MetaIntegrationLog[]>([]);

  readonly metaTokenPlaceholder = computed(() => {
    const token = this.meta()?.pageAccessToken;

    return token ? maskToken(token) : 'Nenhum token configurado';
  });

  readonly metaForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService,
    private readonly webWidgetService: WebWidgetService,
    private readonly metaService: MetaService,
    private readonly clipboard: Clipboard,
  ) {
    this.metaForm = this.formBuilder.group({
      enabled: this.formBuilder.nonNullable.control(false),
      pageId: this.formBuilder.nonNullable.control(''),
      pageAccessToken: this.formBuilder.nonNullable.control(''),
      defaultResponsibleUserId: this.formBuilder.control<string | null>(null),
      duplicateStrategy: this.formBuilder.nonNullable.control<'IGNORE' | 'UPDATE'>('IGNORE'),
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      users: this.usersService.list(),
      widget: this.webWidgetService.get(),
      widgetLogs: this.webWidgetService.listLogs(),
      meta: this.metaService.get(),
      metaLogs: this.metaService.listLogs(),
    }).subscribe({
      next: ({ users, widget, widgetLogs, meta, metaLogs }) => {
        this.users.set(users);
        this.widget.set(widget);
        this.widgetLogs.set(widgetLogs);
        this.metaLogs.set(metaLogs);

        this.meta.set(meta);
        this.metaForm.patchValue({
          enabled: meta?.enabled ?? false,
          pageId: meta?.pageId ?? '',
          defaultResponsibleUserId: meta?.defaultResponsibleUserId ?? null,
          duplicateStrategy: meta?.duplicateStrategy ?? 'IGNORE',
        });

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados de configuração.');
        this.loading.set(false);
      },
    });
  }

  copyEmbedSnippet(): void {
    const snippet = this.embedSnippet();

    if (snippet) {
      this.clipboard.copy(snippet);
    }
  }

  saveMeta(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      return;
    }

    const value = this.metaForm.getRawValue();

    this.metaSaving.set(true);
    this.metaErrorMessage.set(null);
    this.metaSuccessMessage.set(null);

    // A API só aceita string | undefined nesses campos ("omitir" = não alterar) — mesmo
    // padrão dos demais módulos de update do backend. pageAccessToken vazio = não alterar
    // o token já salvo (campo é tratado como senha, nunca exibido em texto puro).
    this.metaService
      .update({
        enabled: value.enabled,
        pageId: value.pageId || undefined,
        pageAccessToken: value.pageAccessToken || undefined,
        defaultResponsibleUserId: value.defaultResponsibleUserId ?? undefined,
        duplicateStrategy: value.duplicateStrategy,
      })
      .subscribe({
        next: (meta) => {
          this.meta.set(meta);
          this.metaForm.patchValue({ pageAccessToken: '' });
          this.metaSaving.set(false);
          this.metaSuccessMessage.set('Configuração da integração Meta Lead Ads salva com sucesso.');
        },
        error: () => {
          this.metaSaving.set(false);
          this.metaErrorMessage.set('Não foi possível salvar a configuração da integração Meta Lead Ads.');
        },
      });
  }
}
