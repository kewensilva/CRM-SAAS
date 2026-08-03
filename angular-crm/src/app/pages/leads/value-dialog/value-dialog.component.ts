import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { LostReasonsService } from '../../../core/lost-reasons/lost-reasons.service';
import { LostReason } from '../../../models/lost-reason.model';

export type ValueDialogMode = 'won' | 'lost' | 'edit-value' | 'in-progress';

export interface ValueDialogData {
  mode: ValueDialogMode;
  initialValue?: number | null;
  initialReason?: string | null;
}

export interface ValueDialogResult {
  value?: number;
  lostReason?: string;
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
    MatSelectModule,
  ],
  templateUrl: './value-dialog.component.html',
  styleUrl: './value-dialog.component.scss',
})
export class ValueDialogComponent implements OnInit {
  readonly form;
  readonly lostReasonOptions = signal<LostReason[]>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: ValueDialogData,
    private readonly dialogRef: MatDialogRef<ValueDialogComponent, ValueDialogResult>,
    private readonly formBuilder: FormBuilder,
    private readonly lostReasonsService: LostReasonsService,
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
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'lost') {
      this.lostReasonsService.list().subscribe({
        next: (reasons) => this.lostReasonOptions.set(reasons),
        error: () => this.lostReasonOptions.set([]),
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
    return false;
  }

  save(): void {
    if (this.saveDisabled) {
      this.form.markAllAsTouched();
      return;
    }

    const { value, lostReason } = this.form.getRawValue();
    const result: ValueDialogResult = {};

    if (value !== null && value !== undefined) {
      result.value = Number(value);
    }

    if (this.data.mode === 'lost' && lostReason) {
      result.lostReason = lostReason.trim();
    }

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
