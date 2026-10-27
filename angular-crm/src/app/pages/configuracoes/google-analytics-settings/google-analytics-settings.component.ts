import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GoogleAnalyticsService } from '../../../core/google-analytics/google-analytics.service';
import { GoogleAnalyticsSettings } from '../../../models/google-analytics.model';

// Mesma regra do backend: só os números da propriedade (aceita colar "properties/123").
const PROPERTY_ID_PATTERN = /^(properties\/)?\d+$/;

const apiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { error?: { message?: string } })?.error?.message ?? fallback;

// Card de Configurações da integração GA4 — componente próprio para não crescer ainda mais o
// configuracoes.component (já bem acima do limite de tamanho do code-style.md).
@Component({
  selector: 'app-google-analytics-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './google-analytics-settings.component.html',
  styleUrl: './google-analytics-settings.component.scss',
})
export class GoogleAnalyticsSettingsComponent implements OnInit {
  readonly settings = signal<GoogleAnalyticsSettings | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
    private readonly clipboard: Clipboard,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      enabled: false,
      propertyId: ['', Validators.pattern(PROPERTY_ID_PATTERN)],
    });
  }

  ngOnInit(): void {
    this.googleAnalyticsService.getSettings().subscribe({
      next: (settings) => {
        this.applySettings(settings);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar a integração com o Google Analytics.'));
        this.loading.set(false);
      },
    });
  }

  copyServiceAccountEmail(): void {
    const email = this.settings()?.serviceAccountEmail;

    if (email) {
      this.clipboard.copy(email);
      this.successMessage.set('E-mail copiado.');
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { enabled, propertyId } = this.form.getRawValue();

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Ao ativar, o backend testa o acesso à propriedade antes de salvar — erro aqui traz o
    // motivo dado pelo Google (ex.: conta de serviço sem permissão na propriedade).
    this.googleAnalyticsService.updateSettings({ enabled, propertyId: propertyId.trim() || undefined }).subscribe({
      next: (settings) => {
        this.applySettings(settings);
        this.saving.set(false);
        this.successMessage.set(
          settings.enabled
            ? 'Integração ativa. Os dados do Google Analytics já aparecem em Relatórios.'
            : 'Configuração salva.',
        );
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível salvar a integração.'));
      },
    });
  }

  private applySettings(settings: GoogleAnalyticsSettings): void {
    this.settings.set(settings);
    this.form.patchValue({ enabled: settings.enabled, propertyId: settings.propertyId ?? '' });
  }
}
