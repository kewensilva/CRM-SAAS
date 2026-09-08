import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { LostReasonsService } from '../../../core/lost-reasons/lost-reasons.service';
import { ProductsService } from '../../../core/products/products.service';
import { LostReason } from '../../../models/lost-reason.model';
import { DEAL_INSTALLMENT_OPTIONS, DealPaymentType } from '../../../models/lead.model';
import { Product } from '../../../models/product.model';

export type ValueDialogMode = 'won' | 'lost' | 'edit-value' | 'in-progress';

export interface ValueDialogData {
  mode: ValueDialogMode;
  initialValue?: number | null;
  initialReason?: string | null;
}

export interface ValueDialogResult {
  value?: number;
  lostReason?: string;
  paymentType?: DealPaymentType;
  installments?: number;
  productId?: string;
}

@Component({
  selector: 'app-value-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './value-dialog.component.html',
  styleUrl: './value-dialog.component.scss',
})
export class ValueDialogComponent implements OnInit {
  readonly form;
  readonly lostReasonOptions = signal<LostReason[]>([]);
  readonly installmentOptions = DEAL_INSTALLMENT_OPTIONS;
  readonly productOptions = signal<Product[]>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: ValueDialogData,
    private readonly dialogRef: MatDialogRef<ValueDialogComponent, ValueDialogResult>,
    private readonly formBuilder: FormBuilder,
    private readonly lostReasonsService: LostReasonsService,
    private readonly productsService: ProductsService,
  ) {
    this.form = this.formBuilder.group({
      value: [
        this.data.initialValue ?? null,
        this.data.mode === 'lost' ? [Validators.required] : [],
      ],
      lostReason: [
        this.data.initialReason ?? '',
        this.data.mode === 'lost' ? [Validators.required] : [],
      ],
      paymentType: this.formBuilder.nonNullable.control<DealPaymentType>('UNICO'),
      installments: this.formBuilder.control<number | null>(null),
      productId: this.formBuilder.control<string | null>(null),
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'lost') {
      this.lostReasonsService.list().subscribe({
        next: (reasons) => this.lostReasonOptions.set(reasons),
        error: () => this.lostReasonOptions.set([]),
      });
    }

    // Só busca o catálogo quando faz sentido oferecê-lo (fechar Vendido) — tenant sem
    // nenhum produto ativo simplesmente não mostra o seletor (ver showProductField).
    if (this.data.mode === 'won') {
      this.productsService.list().subscribe({
        next: (products) => this.productOptions.set(products.filter((product) => product.status === 'ACTIVE')),
        error: () => this.productOptions.set([]),
      });
    }
  }

  get title(): string {
    switch (this.data.mode) {
      case 'won':
        return 'Marcar como vendido';
      case 'lost':
        return 'Marcar como perdido';
      case 'edit-value':
        return 'Editar valor da negociação';
      case 'in-progress':
        return 'Mover para em andamento';
    }
  }

  get showReasonField(): boolean {
    return this.data.mode === 'lost';
  }

  get showPaymentTypeField(): boolean {
    return this.data.mode === 'won';
  }

  get showInstallmentsField(): boolean {
    return this.showPaymentTypeField && this.form.controls.paymentType.value === 'RECORRENTE';
  }

  get showProductField(): boolean {
    return this.data.mode === 'won' && this.productOptions().length > 0;
  }

  get canSubmitWithoutValue(): boolean {
    return this.data.mode === 'won' || this.data.mode === 'in-progress';
  }

  get saveLabel(): string {
    if (this.canSubmitWithoutValue && !this.form.controls.value.value) {
      return 'Salvar sem valor';
    }
    return 'Salvar';
  }

  get saveDisabled(): boolean {
    if (this.data.mode === 'lost') {
      return !this.form.controls.value.value || !this.form.controls.lostReason.value?.trim();
    }
    if (this.data.mode === 'edit-value') {
      return !this.form.controls.value.value;
    }
    if (this.showInstallmentsField) {
      return !this.form.controls.installments.value;
    }
    return false;
  }

  save(): void {
    if (this.saveDisabled) {
      this.form.markAllAsTouched();
      return;
    }

    const { value, lostReason, paymentType, installments, productId } = this.form.getRawValue();
    const result: ValueDialogResult = {};

    if (value !== null && value !== undefined) {
      result.value = Number(value);
    }

    if (this.data.mode === 'lost' && lostReason) {
      result.lostReason = lostReason.trim();
    }

    if (this.showPaymentTypeField) {
      result.paymentType = paymentType;
      if (paymentType === 'RECORRENTE' && installments) {
        result.installments = Number(installments);
      }
    }

    if (this.showProductField && productId) {
      result.productId = productId;
    }

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
