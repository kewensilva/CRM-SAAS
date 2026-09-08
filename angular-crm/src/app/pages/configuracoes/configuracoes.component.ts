import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionService } from '../../core/auth/session.service';
import { MetaService } from '../../core/meta/meta.service';
import { ProductsService } from '../../core/products/products.service';
import { UsersService } from '../../core/users/users.service';
import { WebWidgetService } from '../../core/web-widget/web-widget.service';
import { MetaIntegration, MetaIntegrationLog } from '../../models/meta-integration.model';
import { Product } from '../../models/product.model';
import { TenantUser } from '../../models/tenant.model';
import {
  MAX_WIDGET_MESSAGE_FIELDS,
  WebWidgetIntegration,
  WebWidgetLog,
  WebWidgetMessageField,
  WIDGET_BUTTON_ICONS,
  WidgetButtonIcon,
} from '../../models/web-widget.model';

type MessageFieldGroup = FormGroup<{
  key: FormControl<string>;
  label: FormControl<string>;
}>;

const generateFieldKey = (): string => `campo_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const WIDGET_LOG_DISPLAYED_COLUMNS = ['createdAt', 'status', 'utmSource', 'message'];
const META_LOG_DISPLAYED_COLUMNS = ['createdAt', 'status', 'formId', 'message'];

const DUPLICATE_STRATEGY_LABELS: Record<'IGNORE' | 'UPDATE', string> = {
  IGNORE: 'Manter o Lead existente',
  UPDATE: 'Atualizar os dados do Lead existente',
};

// buttonLabel é texto livre do Tenant Admin — precisa escapar aspas/&/< antes de injetar
// no atributo do <script> gerado (o snippet é copiado literalmente pro site do cliente).
const escapeHtmlAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

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
    const widget = this.widget();

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
      widget.messageFields.length > 0
        ? `data-message-fields="${escapeHtmlAttr(JSON.stringify(widget.messageFields))}"`
        : null,
    ]
      .filter((attr): attr is string => attr !== null)
      .join(' ');

    return `<script src="${environment.apiUrl}/webhooks/web-widget/widget.js" ${attrs} defer></script>`;
  });

  // Parametrização do widget (feature de "standby"): por ora só o Analista, atuando
  // dentro do tenant (session.isAnalystSession), pode editar — Tenant Admin comum
  // continua só consultando, mesma regra "gerenciado pelo administrador da plataforma"
  // já documentada no hint acima. Ver CLAUDE.md > gap de permissões de Integrações.
  readonly canEditWidget = computed(() => this.session.isAnalystSession());
  // Mesma regra do widget acima — cadastro de produtos também é parametrização do
  // Analista (ver products module no backend).
  readonly canManageProducts = computed(() => this.session.isAnalystSession());

  readonly widgetForm;
  readonly widgetSaving = signal(false);
  readonly widgetEditError = signal<string | null>(null);
  readonly widgetEditSuccess = signal<string | null>(null);
  readonly widgetButtonIcons = WIDGET_BUTTON_ICONS;
  readonly maxMessageFields = MAX_WIDGET_MESSAGE_FIELDS;

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

  readonly products = signal<Product[]>([]);
  readonly productsSaving = signal(false);
  readonly productsError = signal<string | null>(null);
  readonly productForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService,
    private readonly webWidgetService: WebWidgetService,
    private readonly metaService: MetaService,
    private readonly productsService: ProductsService,
    private readonly clipboard: Clipboard,
    readonly session: SessionService,
  ) {
    this.productForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      price: this.formBuilder.control<number | null>(null),
    });

    this.metaForm = this.formBuilder.group({
      enabled: this.formBuilder.nonNullable.control(false),
      pageId: this.formBuilder.nonNullable.control(''),
      pageAccessToken: this.formBuilder.nonNullable.control(''),
      defaultResponsibleUserId: this.formBuilder.control<string | null>(null),
      duplicateStrategy: this.formBuilder.nonNullable.control<'IGNORE' | 'UPDATE'>('IGNORE'),
    });

    this.widgetForm = this.formBuilder.group({
      enabled: this.formBuilder.nonNullable.control(false),
      defaultResponsibleUserId: this.formBuilder.control<string | null>(null),
      duplicateStrategy: this.formBuilder.nonNullable.control<'IGNORE' | 'UPDATE'>('IGNORE'),
      showEmailField: this.formBuilder.nonNullable.control(true),
      showPhoneField: this.formBuilder.nonNullable.control(true),
      messageFields: this.formBuilder.array<MessageFieldGroup>([]),
      buttonLabel: this.formBuilder.nonNullable.control('Fale conosco'),
      buttonContentType: this.formBuilder.nonNullable.control<'TEXT' | 'ICON'>('TEXT'),
      buttonIcon: this.formBuilder.control<WidgetButtonIcon | null>(null),
      buttonColor: this.formBuilder.nonNullable.control('#FF9521'),
    });
  }

  get widgetMessageFields(): FormArray<MessageFieldGroup> {
    return this.widgetForm.controls.messageFields;
  }

  addWidgetMessageField(): void {
    if (this.widgetMessageFields.length >= MAX_WIDGET_MESSAGE_FIELDS) {
      return;
    }

    this.widgetMessageFields.push(
      this.formBuilder.group({
        key: this.formBuilder.nonNullable.control(generateFieldKey()),
        label: this.formBuilder.nonNullable.control('', Validators.required),
      }),
    );
  }

  removeWidgetMessageField(index: number): void {
    this.widgetMessageFields.removeAt(index);
  }

  private setWidgetMessageFields(fields: WebWidgetMessageField[]): void {
    this.widgetMessageFields.clear();
    fields.forEach((field) => {
      this.widgetMessageFields.push(
        this.formBuilder.group({
          key: this.formBuilder.nonNullable.control(field.key),
          label: this.formBuilder.nonNullable.control(field.label, Validators.required),
        }),
      );
    });
  }

  saveWidget(): void {
    if (this.widgetForm.invalid) {
      this.widgetForm.markAllAsTouched();
      return;
    }

    const value = this.widgetForm.getRawValue();

    this.widgetSaving.set(true);
    this.widgetEditError.set(null);
    this.widgetEditSuccess.set(null);

    this.webWidgetService
      .update({
        enabled: value.enabled,
        defaultResponsibleUserId: value.defaultResponsibleUserId ?? undefined,
        duplicateStrategy: value.duplicateStrategy,
        showEmailField: value.showEmailField,
        showPhoneField: value.showPhoneField,
        messageFields: value.messageFields.filter((field) => field.label.trim().length > 0),
        buttonLabel: value.buttonLabel || undefined,
        buttonContentType: value.buttonContentType,
        buttonIcon: value.buttonContentType === 'ICON' ? (value.buttonIcon ?? undefined) : undefined,
        buttonColor: value.buttonColor || undefined,
      })
      .subscribe({
        next: (widget) => {
          this.widget.set(widget);
          this.widgetSaving.set(false);
          this.widgetEditSuccess.set('Configuração do widget salva com sucesso.');
        },
        error: () => {
          this.widgetSaving.set(false);
          this.widgetEditError.set('Não foi possível salvar a configuração do widget.');
        },
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
      products: this.productsService.list(),
    }).subscribe({
      next: ({ users, widget, widgetLogs, meta, metaLogs, products }) => {
        this.users.set(users);
        this.widget.set(widget);
        this.widgetLogs.set(widgetLogs);
        this.metaLogs.set(metaLogs);
        this.products.set(products);

        if (widget) {
          this.widgetForm.patchValue({
            enabled: widget.enabled,
            defaultResponsibleUserId: widget.defaultResponsibleUserId,
            duplicateStrategy: widget.duplicateStrategy,
            showEmailField: widget.showEmailField,
            showPhoneField: widget.showPhoneField,
            buttonLabel: widget.buttonLabel,
            buttonContentType: widget.buttonContentType,
            buttonIcon: widget.buttonIcon,
            buttonColor: widget.buttonColor,
          });
          this.setWidgetMessageFields(widget.messageFields);
        }

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

  addProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const { name, price } = this.productForm.getRawValue();

    this.productsSaving.set(true);
    this.productsError.set(null);

    this.productsService
      .create({ name: name.trim(), price: price ?? undefined })
      .subscribe({
        next: (product) => {
          this.products.update((current) => [...current, product]);
          this.productForm.reset({ name: '', price: null });
          this.productsSaving.set(false);
        },
        error: () => {
          this.productsSaving.set(false);
          this.productsError.set('Não foi possível cadastrar o produto.');
        },
      });
  }

  toggleProductStatus(product: Product): void {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    this.productsService.update(product.id, { status: nextStatus }).subscribe({
      next: (updated) => {
        this.products.update((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      error: () => {
        this.productsError.set('Não foi possível alterar o status do produto.');
      },
    });
  }

  removeProduct(product: Product): void {
    this.productsService.remove(product.id).subscribe({
      next: () => {
        this.products.update((current) => current.filter((item) => item.id !== product.id));
      },
      error: () => {
        this.productsError.set('Não foi possível remover o produto.');
      },
    });
  }
}
