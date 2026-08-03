import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Lead } from '../../../models/lead.model';
import { LeadDetailsDialogComponent, LeadDetailsDialogData } from '../lead-details-dialog/lead-details-dialog.component';

export interface LeadListDialogData {
  title: string;
  leads: Lead[];
}

const STATUS_LABELS: Record<Lead['status'], string> = {
  SEM_CONTATO: 'Sem contato',
  NAO_ATENDE: 'Não atende',
  EM_ANDAMENTO: 'Em andamento',
  VENDIDO: 'Vendido',
  PERDIDO: 'Perdido',
};

@Component({
  selector: 'app-lead-list-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './lead-list-dialog.component.html',
  styleUrl: './lead-list-dialog.component.scss',
})
export class LeadListDialogComponent {
  readonly data: LeadListDialogData;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: LeadListDialogData,
    private readonly dialog: MatDialog,
  ) {
    this.data = data;
  }

  statusLabel(lead: Lead): string {
    return STATUS_LABELS[lead.status];
  }

  showDetails(lead: Lead): void {
    this.dialog.open(LeadDetailsDialogComponent, { data: { lead } as LeadDetailsDialogData });
  }
}
