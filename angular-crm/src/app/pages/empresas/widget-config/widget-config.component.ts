import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TenantsService } from '../../../core/tenants/tenants.service';
import { WidgetsService } from '../../../core/widgets/widgets.service';
import { TenantUser } from '../../../models/tenant.model';
import { WidgetFieldKey } from '../../../models/widget.model';

interface WidgetFieldOption {
  key: WidgetFieldKey;
  label: string;
}

interface IconOption {
  value: string;
  label: string;
}

const WIDGET_FIELD_OPTIONS: WidgetFieldOption[] = [
  { key: 'phone', label: 'Telefone' },
  { key: 'email', label: 'E-mail' },
  { key: 'location', label: 'Localização' },
  { key: 'cpf', label: 'CPF' },
  { key: 'referralSource', label: 'Onde nos achou' },
  { key: 'notes', label: 'Observações' },
];

const ICON_OPTIONS: IconOption[] = [
  { value: 'chat', label: 'Chat' },
  { value: 'campaign', label: 'Campanha' },
  { value: 'mail', label: 'E-mail' },
  { value: 'phone_in_talk', label: 'Telefone' },
  { value: 'contact_support', label: 'Suporte' },
  { value: 'forum', label: 'Fórum' },
];

const DEFAULT_BUTTON_COLOR = '#ff9521';

@Component({
  selector: 'app-widget-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './widget-config.component.html',
  styleUrl: './widget-config.component.scss',
})
export class WidgetConfigComponent implements OnInit {
  readonly fieldOptions = WIDGET_FIELD_OPTIONS;
  readonly iconOptions = ICON_OPTIONS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly users = signal<TenantUser[]>([]);

  readonly form;

  private tenantId = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tenantsService: TenantsService,
    private readonly widgetsService: WidgetsService,
  ) {
    this.form = this.formBuilder.group({
      enabled: this.formBuilder.nonNullable.control(false),
      buttonColor: this.formBuilder.nonNullable.control(DEFAULT_BUTTON_COLOR),
      icon: this.formBuilder.nonNullable.control(ICON_OPTIONS[0].value),
      defaultResponsibleUserId: this.formBuilder.control<string | null>(null),
      requestedFields: this.formBuilder.group({
        phone: this.formBuilder.nonNullable.control(false),
        email: this.formBuilder.nonNullable.control(false),
        location: this.formBuilder.nonNullable.control(false),
        cpf: this.formBuilder.nonNullable.control(false),
        referralSource: this.formBuilder.nonNullable.control(false),
        notes: this.formBuilder.nonNullable.control(false),
      }),
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

    forkJoin({
      users: this.tenantsService.listUsers(tenantId),
      widget: this.widgetsService.get(tenantId),
    }).subscribe({
      next: ({ users, widget }) => {
        this.users.set(users);

        if (widget) {
          this.form.patchValue({
            enabled: widget.enabled,
            buttonColor: widget.buttonColor ?? DEFAULT_BUTTON_COLOR,
            icon: widget.icon ?? ICON_OPTIONS[0].value,
            defaultResponsibleUserId: widget.defaultResponsibleUserId,
          });

          const fieldsGroup = this.form.controls.requestedFields;
          WIDGET_FIELD_OPTIONS.forEach((option) => {
            fieldsGroup.get(option.key)?.setValue(widget.requestedFields.includes(option.key));
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
    const requestedFields = WIDGET_FIELD_OPTIONS.filter(
      (option) => value.requestedFields[option.key],
    ).map((option) => option.key);

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // A API só aceita string | undefined nesses campos ("omitir" = não alterar) — não
    // suporta null explícito pra limpar, mesmo padrão dos demais módulos de update do
    // backend. Omitir a chave em vez de mandar null quando o campo está vazio.
    this.widgetsService
      .update(this.tenantId, {
        enabled: value.enabled,
        buttonColor: value.buttonColor || undefined,
        icon: value.icon || undefined,
        defaultResponsibleUserId: value.defaultResponsibleUserId ?? undefined,
        requestedFields,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Configuração salva com sucesso.');
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Não foi possível salvar a configuração do widget.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/empresas']);
  }
}
