import { DatePipe } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DealsService } from '../../../core/deals/deals.service';
import { LeadsService } from '../../../core/leads/leads.service';
import { Lead } from '../../../models/lead.model';

export interface LeadDetailsDialogData {
  lead: Lead;
}

const STATUS_LABELS: Record<Lead['status'], string> = {
  SEM_CONTATO: 'Sem contato',
  NAO_ATENDE: 'Não atende',
  EM_ANDAMENTO: 'Em andamento',
  VENDIDO: 'Vendido',
  PERDIDO: 'Perdido',
};

@Component({
  selector: 'app-lead-details-dialog',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './lead-details-dialog.component.html',
  styleUrl: './lead-details-dialog.component.scss',
})
export class LeadDetailsDialogComponent {
  readonly lead: Lead;
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saved = signal(false);

  readonly form;
  readonly valueForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: LeadDetailsDialogData,
    private readonly formBuilder: FormBuilder,
    private readonly leadsService: LeadsService,
    private readonly dealsService: DealsService,
  ) {
    this.lead = data.lead;

    this.form = this.formBuilder.group({
      name: [this.lead.name],
      email: [this.lead.email ?? ''],
      phone: [this.lead.phone ?? ''],
      notes: [this.lead.notes ?? ''],
    });

    this.valueForm = this.formBuilder.group({
      value: [this.parseValue(this.lead.deal?.value ?? null)],
      lostReason: [this.lead.deal?.lostReason ?? ''],
    });
  }

  get statusLabel(): string {
    return STATUS_LABELS[this.lead.status];
  }

  formatValue(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return value;
    }
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private parseValue(value: string | null): number | null {
    if (!value) {
      return null;
    }
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  save(): void {
    this.saving.set(true);
    this.saveError.set(null);
    this.saved.set(false);

    const { name, email, phone, notes } = this.form.getRawValue();

    this.leadsService
      .update(this.lead.id, {
        name: name ?? undefined,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      })
      .subscribe({
        next: (updated) => {
          this.lead.name = updated.name;
          this.lead.email = updated.email;
          this.lead.phone = updated.phone;
          this.lead.notes = updated.notes;
          this.saving.set(false);
          this.saved.set(true);
        },
        error: (error) => {
          this.saving.set(false);
          this.saveError.set(this.extractErrorMessage(error));
        },
      });
  }

  saveDealValue(): void {
    if (!this.lead.deal) {
      return;
    }

    const { value } = this.valueForm.getRawValue();

    this.runDealUpdate(this.dealsService.updateValue(this.lead.deal.id, value ?? 0));
  }

  saveDealLostReason(): void {
    if (!this.lead.deal) {
      return;
    }

    const { lostReason } = this.valueForm.getRawValue();

    if (!lostReason) {
      return;
    }

    this.runDealUpdate(this.dealsService.updateLostReason(this.lead.deal.id, lostReason));
  }

  private runDealUpdate(request$: ReturnType<DealsService['updateValue']>): void {
    this.saving.set(true);
    this.saveError.set(null);
    this.saved.set(false);

    request$.subscribe({
      next: (updated) => {
        if (this.lead.deal) {
          this.lead.deal = { ...this.lead.deal, value: updated.value, lostReason: updated.lostReason };
        }
        this.saving.set(false);
        this.saved.set(true);
      },
      error: (error) => {
        this.saving.set(false);
        this.saveError.set(this.extractErrorMessage(error));
      },
    });
  }

  private extractErrorMessage(error: unknown): string {
    const httpError = error as { error?: { message?: string } };
    return httpError?.error?.message ?? 'Não foi possível salvar as alterações.';
  }
}
