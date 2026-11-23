import { Component, OnChanges, ViewChild, computed, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Observable } from 'rxjs';

import { GoogleAdsService } from '../../../core/google-ads/google-ads.service';
import {
  GoogleAdsConnection,
  GoogleAdsConversionAction,
  GoogleAdsConversionTrigger,
  GoogleAdsLeadOrigin,
  GoogleAdsRule,
  SaveGoogleAdsRulePayload,
} from '../../../models/google-ads.model';
import { apiErrorMessage } from '../api-error';
import { GoogleAdsHistoryComponent } from '../google-ads-history/google-ads-history.component';
import { ORIGIN_OPTIONS, OriginChoice, TRIGGER_OPTIONS, formatCustomerId } from '../google-ads-labels';

const CONVERSION_ACTION_PATTERN = /^\d{1,20}$/;

// Editor de uma integração em passos, como no Zapier: "1. Quando isto acontecer no CRM" →
// "2. Faça isto no Google Ads", com teste e histórico de envios.
@Component({
  selector: 'app-google-ads-rule-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    GoogleAdsHistoryComponent,
  ],
  templateUrl: './google-ads-rule-editor.component.html',
  styleUrl: './google-ads-rule-editor.component.scss',
})
export class GoogleAdsRuleEditorComponent implements OnChanges {
  readonly rule = input<GoogleAdsRule | null>(null);
  readonly connection = input<GoogleAdsConnection | null>(null);
  readonly saved = output<GoogleAdsRule>();
  readonly closed = output<void>();

  readonly triggerOptions = TRIGGER_OPTIONS;
  readonly originOptions = ORIGIN_OPTIONS;
  readonly saving = signal(false);
  readonly message = signal<{ text: string; error: boolean } | null>(null);
  readonly conversionActions = signal<GoogleAdsConversionAction[] | null>(null);
  readonly selectedTrigger = signal<GoogleAdsConversionTrigger>('LEAD_WON');

  readonly accountLabel = computed(() => {
    const connection = this.connection();

    return connection?.customerId
      ? `${connection.customerName || 'Conta'} · ${formatCustomerId(connection.customerId)}`
      : 'Nenhuma conta escolhida ainda';
  });
  readonly useActionList = computed(() => Boolean(this.connection()?.listingAvailable && this.connection()?.customerId));

  readonly form;

  @ViewChild(GoogleAdsHistoryComponent) private history?: GoogleAdsHistoryComponent;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly googleAdsService: GoogleAdsService,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      trigger: ['LEAD_WON' as GoogleAdsConversionTrigger],
      originFilter: ['ALL' as OriginChoice],
      conversionActionId: ['', [Validators.required, Validators.pattern(CONVERSION_ACTION_PATTERN)]],
      conversionActionName: [''],
      sendValue: [true],
      enabled: [true],
    });
  }

  ngOnChanges(): void {
    const rule = this.rule();

    this.form.reset({
      name: rule?.name ?? '',
      trigger: rule?.trigger ?? 'LEAD_WON',
      originFilter: (rule?.originFilter ?? 'ALL') as OriginChoice,
      conversionActionId: rule?.conversionActionId ?? '',
      conversionActionName: rule?.conversionActionName ?? '',
      sendValue: rule?.sendValue ?? true,
      enabled: rule?.enabled ?? true,
    });
    this.selectedTrigger.set(rule?.trigger ?? 'LEAD_WON');

    if (this.useActionList() && this.conversionActions() === null) {
      this.loadConversionActions();
    }
  }

  selectTrigger(trigger: GoogleAdsConversionTrigger): void {
    this.form.controls.trigger.setValue(trigger);
    this.selectedTrigger.set(trigger);
  }

  chooseAction(action: GoogleAdsConversionAction): void {
    this.form.patchValue({ conversionActionId: action.id, conversionActionName: action.name });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: SaveGoogleAdsRulePayload = {
      ...value,
      originFilter: value.originFilter === 'ALL' ? null : (value.originFilter as GoogleAdsLeadOrigin),
      name: value.name.trim(),
      conversionActionName: value.conversionActionName.trim() || null,
      sendValue: value.trigger === 'LEAD_WON' && value.sendValue,
    };
    const rule = this.rule();
    const request = rule ? this.googleAdsService.updateRule(rule.id, payload) : this.googleAdsService.createRule(payload);

    this.submit(request, rule ? 'Integração salva.' : 'Integração criada. Ela já vale para os próximos leads.', (saved) =>
      this.saved.emit(saved as GoogleAdsRule),
    );
  }

  test(): void {
    const rule = this.rule();

    if (rule) {
      this.submit(this.googleAdsService.testRule(rule.id), 'Teste aprovado pelo Google: conta e ação de conversão estão certas.');
    }
  }

  remove(): void {
    const rule = this.rule();

    if (rule && window.confirm(`Excluir a integração "${rule.name}"? Ela para de enviar conversões.`)) {
      this.submit(this.googleAdsService.removeRule(rule.id), 'Integração excluída.', () => this.closed.emit());
    }
  }

  private loadConversionActions(): void {
    this.googleAdsService.listConversionActions().subscribe({
      next: (actions) => this.conversionActions.set(actions),
      error: (error: unknown) => {
        this.conversionActions.set([]);
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível listar as ações de conversão.'), error: true });
      },
    });
  }

  private submit(request: Observable<unknown>, successText: string, onSuccess?: (result: unknown) => void): void {
    this.saving.set(true);
    this.message.set(null);
    request.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.message.set({ text: successText, error: false });
        this.history?.load();
        onSuccess?.(result);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível concluir.'), error: true });
      },
    });
  }
}
