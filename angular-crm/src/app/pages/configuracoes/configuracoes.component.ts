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
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UsersService } from '../../core/users/users.service';
import { WebWidgetService } from '../../core/web-widget/web-widget.service';
import { TenantUser } from '../../models/tenant.model';
import { WebWidgetIntegration, WebWidgetLog } from '../../models/web-widget.model';

const LOG_DISPLAYED_COLUMNS = ['createdAt', 'status', 'utmSource', 'message'];

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
    MatTooltipModule,
  ],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.scss',
})
export class ConfiguracoesComponent implements OnInit {
  readonly logDisplayedColumns = LOG_DISPLAYED_COLUMNS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly regenerating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly users = signal<TenantUser[]>([]);
  readonly integration = signal<WebWidgetIntegration | null>(null);
  readonly logs = signal<WebWidgetLog[]>([]);

  readonly embedSnippet = computed(() => {
    const publicKey = this.integration()?.publicKey;

    if (!publicKey) {
      return null;
    }

    return `<script src="${environment.apiUrl}/webhooks/web-widget/widget.js" data-key="${publicKey}" defer></script>`;
  });

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService,
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
      logs: this.webWidgetService.listLogs(),
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
      .update({
        enabled: value.enabled,
        defaultResponsibleUserId: value.defaultResponsibleUserId ?? undefined,
        duplicateStrategy: value.duplicateStrategy,
        showEmailField: value.showEmailField,
        showPhoneField: value.showPhoneField,
        showMessageField: value.showMessageField,
        buttonLabel: value.buttonLabel || undefined,
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

    this.webWidgetService.regenerateKey().subscribe({
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
}
