import { Component, ViewChild, computed, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';

import { ConversionSyncService } from '../../../core/conversion-sync/conversion-sync.service';
import { ConversionIntegration, ConversionRule } from '../../../models/conversion-sync.model';
import { apiErrorMessage } from '../api-error';
import { SOURCE_DEFINITIONS, triggerLabel } from '../conversion-sources';

// Regras da conexão: "quando <gatilho> acontecer, envie a ação de conversão <ID> ao Google Ads".
@Component({
  selector: 'app-conversion-rules',
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
    MatTooltipModule,
  ],
  templateUrl: './conversion-rules.component.html',
  styleUrl: './conversion-rules.component.scss',
})
export class ConversionRulesComponent {
  readonly integration = input.required<ConversionIntegration>();
  readonly changed = output<void>();

  readonly definition = computed(() => SOURCE_DEFINITIONS[this.integration().source]);
  readonly saving = signal(false);
  readonly busyRuleId = signal<string | null>(null);
  readonly message = signal<{ text: string; error: boolean } | null>(null);

  // Gatilho escolhido no formulário — decide se aparece o campo de etapa/identificador.
  private readonly triggerValue = signal<string>('');
  readonly selectedTrigger = computed(() => this.definition().triggers.find((option) => option.value === this.triggerValue()));

  readonly form;

  // resetForm() limpa também o estado "enviado" — sem isso o Material pinta os campos vazios
  // de vermelho logo após adicionar a regra.
  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly conversionSyncService: ConversionSyncService,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      trigger: ['', Validators.required],
      triggerValue: [''],
      conversionActionId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      sendValue: [false],
    });
  }

  onTriggerChange(value: string): void {
    this.triggerValue.set(value);
    this.form.controls.triggerValue.setValue('');
  }

  labelOf(rule: ConversionRule): string {
    return triggerLabel(this.integration().source, rule.trigger);
  }

  addRule(): void {
    const option = this.selectedTrigger();
    const value = this.form.getRawValue();

    if (this.form.invalid || !option || (option.valueRequired && !value.triggerValue.trim())) {
      this.form.markAllAsTouched();
      this.message.set({ text: 'Preencha nome, gatilho, etapa (quando pedida) e o ID da ação de conversão.', error: true });
      return;
    }

    this.saving.set(true);
    this.message.set(null);

    this.conversionSyncService
      .createRule(this.integration().id, {
        name: value.name.trim(),
        trigger: option.value,
        triggerValue: option.valueHint ? value.triggerValue.trim() : '',
        conversionActionId: value.conversionActionId.trim(),
        sendValue: this.definition().supportsValue && value.sendValue,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.formDirective?.resetForm();
          this.triggerValue.set('');
          this.changed.emit();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.message.set({ text: apiErrorMessage(error, 'Não foi possível criar a regra.'), error: true });
        },
      });
  }

  toggle(rule: ConversionRule): void {
    this.run(rule, this.conversionSyncService.updateRule(this.integration().id, rule.id, { enabled: !rule.enabled }), null);
  }

  test(rule: ConversionRule): void {
    this.run(
      rule,
      this.conversionSyncService.testRule(this.integration().id, rule.id),
      `"${rule.name}": o Google Ads aceitou a conta e a ação de conversão (teste, nada foi registrado).`,
    );
  }

  remove(rule: ConversionRule): void {
    if (window.confirm(`Excluir a regra "${rule.name}"?`)) {
      this.run(rule, this.conversionSyncService.removeRule(this.integration().id, rule.id), null);
    }
  }

  // Ação sobre uma regra existente: sucesso com texto mostra a mensagem (teste); sem texto,
  // avisa o card para recarregar a conexão.
  private run(rule: ConversionRule, request: Observable<unknown>, successText: string | null): void {
    this.busyRuleId.set(rule.id);
    this.message.set(null);

    request.subscribe({
      next: () => {
        this.busyRuleId.set(null);
        if (successText) {
          this.message.set({ text: successText, error: false });
        } else {
          this.changed.emit();
        }
      },
      error: (error: unknown) => {
        this.busyRuleId.set(null);
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível concluir a ação.'), error: true });
      },
    });
  }
}
