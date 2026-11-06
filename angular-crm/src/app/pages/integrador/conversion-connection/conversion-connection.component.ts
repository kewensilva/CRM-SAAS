import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnChanges, computed, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConversionSyncService } from '../../../core/conversion-sync/conversion-sync.service';
import { ConversionIntegration, SaveConversionIntegrationPayload } from '../../../models/conversion-sync.model';
import { apiErrorMessage } from '../api-error';
import { ConversionLogsComponent } from '../conversion-logs/conversion-logs.component';
import { ConversionRulesComponent } from '../conversion-rules/conversion-rules.component';
import { SOURCE_DEFINITIONS } from '../conversion-sources';

const SECRET_PLACEHOLDER = '••••••••••••';

// Uma conexão de origem (RD Marketing, RD CRM ou Bitrix24): URL do webhook, configuração,
// regras e histórico. Segredos nunca voltam da API — campo vazio = manter o que está salvo.
@Component({
  selector: 'app-conversion-connection',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ConversionRulesComponent,
    ConversionLogsComponent,
  ],
  templateUrl: './conversion-connection.component.html',
  styleUrl: './conversion-connection.component.scss',
})
export class ConversionConnectionComponent implements OnChanges {
  readonly integration = input.required<ConversionIntegration>();
  readonly changed = output<ConversionIntegration | null>();

  readonly definition = computed(() => SOURCE_DEFINITIONS[this.integration().source]);
  readonly webhookUrl = computed(() => this.conversionSyncService.webhookUrl(this.integration().webhookToken));
  readonly saving = signal(false);
  readonly message = signal<{ text: string; error: boolean } | null>(null);
  readonly secretPlaceholder = SECRET_PLACEHOLDER;

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly conversionSyncService: ConversionSyncService,
    private readonly clipboard: Clipboard,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      name: [''],
      enabled: [false],
      googleAdsCustomerId: [''],
      gclidField: [''],
      sourceApiUrl: [''],
      sourceApiToken: [''],
      webhookSecret: [''],
    });
  }

  ngOnChanges(): void {
    const integration = this.integration();

    this.form.reset({
      name: integration.name,
      enabled: integration.enabled,
      googleAdsCustomerId: integration.googleAdsCustomerId ?? '',
      gclidField: integration.gclidField ?? '',
      sourceApiUrl: '',
      sourceApiToken: '',
      webhookSecret: '',
    });
  }

  copyWebhookUrl(): void {
    this.clipboard.copy(this.webhookUrl());
    this.message.set({ text: 'URL do webhook copiada.', error: false });
  }

  save(): void {
    const value = this.form.getRawValue();
    // Segredo vazio = manter o salvo (undefined não altera no backend).
    const secret = (text: string) => text.trim() || undefined;

    this.submit(
      this.conversionSyncService.update(this.integration().id, {
        name: value.name.trim(),
        enabled: value.enabled,
        googleAdsCustomerId: value.googleAdsCustomerId.trim(),
        gclidField: value.gclidField.trim(),
        sourceApiUrl: secret(value.sourceApiUrl),
        sourceApiToken: secret(value.sourceApiToken),
        webhookSecret: secret(value.webhookSecret),
      } satisfies SaveConversionIntegrationPayload),
      'Conexão salva.',
    );
  }

  regenerateToken(): void {
    if (window.confirm('Gerar uma nova URL? A atual para de funcionar — será preciso colar a nova na origem.')) {
      this.submit(this.conversionSyncService.regenerateToken(this.integration().id), 'Nova URL gerada. Atualize-a na origem.');
    }
  }

  remove(): void {
    if (!window.confirm(`Excluir a conexão "${this.integration().name}"? Os webhooks dela deixam de ser aceitos.`)) {
      return;
    }

    this.conversionSyncService.remove(this.integration().id).subscribe({
      next: () => this.changed.emit(null),
      error: (error: unknown) =>
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível excluir a conexão.'), error: true }),
    });
  }

  // Regras mudaram: o card pai recarrega a lista (as regras vêm junto com a conexão).
  onRulesChanged(): void {
    this.changed.emit(this.integration());
  }

  private submit(request: ReturnType<ConversionSyncService['update']>, successText: string): void {
    this.saving.set(true);
    this.message.set(null);

    request.subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.message.set({ text: successText, error: false });
        this.changed.emit(updated);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível salvar a conexão.'), error: true });
      },
    });
  }
}
