import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { WebWidgetService } from '../../../core/web-widget/web-widget.service';
import { TenantUser } from '../../../models/tenant.model';
import {
  WebWidgetIntegration,
  WebWidgetLog,
  WIDGET_BUTTON_ICONS,
  WidgetButtonIcon,
} from '../../../models/web-widget.model';

const LOG_DISPLAYED_COLUMNS = ['createdAt', 'status', 'utmSource', 'message'];

// buttonLabel é texto livre do Tenant Admin — precisa escapar aspas/&/< antes de injetar
// no atributo do <script> gerado (o snippet é copiado literalmente pro site do cliente).
const escapeHtmlAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const ICON_LABELS: Record<WidgetButtonIcon, string> = {
  chat: 'Balão de chat',
  message: 'Envelope',
  whatsapp: 'WhatsApp',
  help: 'Interrogação',
  phone: 'Telefone',
  cart: 'Carrinho',
};

// Contraparte do Owner de pages/configuracoes/configuracoes.component.ts — mesmo widget,
// mesma tela, só que configurando o tenant escolhido em "Empresas" em vez do próprio
// tenant do usuário autenticado (que nem existe pro perfil Owner).
@Component({
  selector: 'app-tenant-web-widget',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ClipboardModule,
    DatePipe,
    MatButtonModule,
    MatCheckboxModule,
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
  templateUrl: './tenant-web-widget.component.html',
  styleUrl: './tenant-web-widget.component.scss',
})
export class TenantWebWidgetComponent implements OnInit {
  readonly logDisplayedColumns = LOG_DISPLAYED_COLUMNS;
  readonly buttonIcons = WIDGET_BUTTON_ICONS;
  readonly iconLabels = ICON_LABELS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly regenerating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly users = signal<TenantUser[]>([]);
  readonly integration = signal<WebWidgetIntegration | null>(null);
  readonly logs = signal<WebWidgetLog[]>([]);

  readonly embedSnippet = computed(() => {
    const widget = this.integration();

    if (!widget) {
      return null;
    }

    const attrs = [
      `data-key="${widget.publicKey}"`,
      `data-label="${escapeHtmlAttr(widget.buttonLabel)}"`,
      `data-color="${escapeHtmlAttr(widget.buttonColor)}"`,
      `data-content-type="${widget.buttonContentType}"`,
      widget.buttonIcon ? `data-icon="${widget.buttonIcon}"` : null,
      `data-show-email="${widget.showEmailField}"`,
      `data-show-phone="${widget.showPhoneField}"`,
      `data-show-message="${widget.showMessageField}"`,
    ]
      .filter((attr): attr is string => attr !== null)
      .join(' ');

    return `<script src="${environment.apiUrl}/webhooks/web-widget/widget.js" ${attrs} defer></script>`;
  });

  readonly form;

  private tenantId = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tenantsService: TenantsService,
    private readonly webWidgetService: WebWidgetService,
    private readonly clipboard: Clipboard,
  ) {
    this.form = this.formBuilder.group({
      enabled: this.formBuilder.nonNullable.control(false),
      defaultResponsibleUserId: this.formBuilder.control<string | null>(null),
      duplicateStrategy: this.formBuilder.nonNullable.control<'IGNORE' | 'UPDATE'>('IGNORE'),
      showEmailField: this.formBuilder.nonNullable.control(true),
      showPhoneField: this.formBuilder.nonNullable.control(true),
      showMessageField: this.formBuilder.nonNullable.control(true),
      buttonLabel: this.formBuilder.nonNullable.control('Fale conosco'),
      buttonContentType: this.formBuilder.nonNullable.control<'TEXT' | 'ICON'>('TEXT'),
      buttonIcon: this.formBuilder.control<WidgetButtonIcon | null>(null),
      buttonColor: this.formBuilder.nonNullable.control('#FF9521'),
    });
  }

  ngOnInit(): void {
    const tenantId = this.route.snapshot.paramMap.get('id');

    if (!tenantId) {
      this.errorMessage.set('Empresa não encontrada.');
      this.loading.set(false);
      return;
    }

    this.tenantId = tenantId;
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      users: this.tenantsService.listUsers(this.tenantId),
      widget: this.webWidgetService.getForTenant(this.tenantId),
      logs: this.webWidgetService.listLogsForTenant(this.tenantId),
    }).subscribe({
      next: ({ users, widget, logs }) => {
        this.users.set(users);
        this.logs.set(logs);

        if (widget) {
          this.integration.set(widget);
          this.form.patchValue({
            enabled: widget.enabled,
            defaultResponsibleUserId: widget.defaultResponsibleUserId,
            duplicateStrategy: widget.duplicateStrategy,
            showEmailField: widget.showEmailField,
            showPhoneField: widget.showPhoneField,
            showMessageField: widget.showMessageField,
            buttonLabel: widget.buttonLabel,
            buttonContentType: widget.buttonContentType,
            buttonIcon: widget.buttonIcon,
            buttonColor: widget.buttonColor,
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do widget.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // A API só aceita string | undefined nesses campos ("omitir" = não alterar) — mesmo
    // padrão dos demais módulos de update do backend.
    this.webWidgetService
      .updateForTenant(this.tenantId, {
        enabled: value.enabled,
        defaultResponsibleUserId: value.defaultResponsibleUserId ?? undefined,
        duplicateStrategy: value.duplicateStrategy,
        showEmailField: value.showEmailField,
        showPhoneField: value.showPhoneField,
        showMessageField: value.showMessageField,
        buttonLabel: value.buttonLabel || undefined,
        buttonContentType: value.buttonContentType,
        buttonIcon: value.buttonContentType === 'ICON' ? (value.buttonIcon ?? undefined) : undefined,
        buttonColor: value.buttonColor || undefined,
      })
      .subscribe({
        next: (widget) => {
          this.integration.set(widget);
          this.saving.set(false);
          this.successMessage.set('Configuração salva com sucesso.');
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Não foi possível salvar a configuração do widget.');
        },
      });
  }

  regenerateKey(): void {
    const confirmed = window.confirm(
      'Gerar uma nova chave invalida o código já embutido no site do cliente até que ele seja atualizado. Continuar?',
    );

    if (!confirmed) {
      return;
    }

    this.regenerating.set(true);
    this.errorMessage.set(null);

    this.webWidgetService.regenerateKeyForTenant(this.tenantId).subscribe({
      next: (widget) => {
        this.integration.set(widget);
        this.regenerating.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível gerar uma nova chave.');
        this.regenerating.set(false);
      },
    });
  }

  copyEmbedSnippet(): void {
    const snippet = this.embedSnippet();

    if (snippet) {
      this.clipboard.copy(snippet);
    }
  }

  goBack(): void {
    this.router.navigate(['/empresas']);
  }
}
