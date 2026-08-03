import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DealsService } from '../../core/deals/deals.service';
import { LeadsService } from '../../core/leads/leads.service';
import { Lead, LeadStatus } from '../../models/lead.model';
import {
  AddLeadDialogComponent,
} from '../../shared/components/add-lead-dialog/add-lead-dialog.component';
import {
  ImportLeadsDialogComponent,
} from '../../shared/components/import-leads-dialog/import-leads-dialog.component';
import {
  LeadDetailsDialogComponent,
  LeadDetailsDialogData,
} from '../../shared/components/lead-details-dialog/lead-details-dialog.component';
import {
  LeadsFilterDialogComponent,
  LeadsFilterDialogData,
} from '../../shared/components/leads-filter-dialog/leads-filter-dialog.component';
import { EMPTY_LEADS_FILTER, LeadsFilterValue, matchesLeadFilter } from '../../shared/utils/lead-filter.util';
import {
  ValueDialogComponent,
  ValueDialogData,
  ValueDialogResult,
} from './value-dialog/value-dialog.component';

const STATUS_LABELS: Record<LeadStatus, string> = {
  SEM_CONTATO: 'Sem contato',
  NAO_ATENDE: 'Não atende',
  EM_ANDAMENTO: 'Em andamento',
  VENDIDO: 'Vendido',
  PERDIDO: 'Perdido',
};

interface KanbanColumn {
  status: LeadStatus;
  label: string;
}

const COLUMNS: KanbanColumn[] = [
  { status: 'SEM_CONTATO', label: 'Sem contato' },
  { status: 'NAO_ATENDE', label: 'Não atende' },
  { status: 'EM_ANDAMENTO', label: 'Em andamento' },
  { status: 'VENDIDO', label: 'Vendido' },
  { status: 'PERDIDO', label: 'Perdido' },
];

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
})
export class LeadsComponent implements OnInit {
  readonly columns = COLUMNS;
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

  board: Record<LeadStatus, Lead[]> = {
    SEM_CONTATO: [],
    NAO_ATENDE: [],
    EM_ANDAMENTO: [],
    VENDIDO: [],
    PERDIDO: [],
  };

  private allLeads: Lead[] = [];
  private filter: LeadsFilterValue = EMPTY_LEADS_FILTER;

  constructor(
    private readonly leadsService: LeadsService,
    private readonly dealsService: DealsService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.leadsService.list().subscribe({
      next: (leads) => {
        this.allLeads = leads;
        this.rebuildBoard();
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os leads.');
        this.loading.set(false);
      },
    });
  }

  private rebuildBoard(): void {
    const filtered = this.allLeads.filter((lead) => matchesLeadFilter(lead, this.filter));

    const board: Record<LeadStatus, Lead[]> = {
      SEM_CONTATO: [],
      NAO_ATENDE: [],
      EM_ANDAMENTO: [],
      VENDIDO: [],
      PERDIDO: [],
    };

    for (const lead of filtered) {
      board[lead.status].push(lead);
    }

    this.board = board;
  }

  isDragDisabled(lead: Lead): boolean {
    return lead.status === 'VENDIDO' || lead.status === 'PERDIDO';
  }

  onDrop(event: CdkDragDrop<Lead[]>, targetStatus: LeadStatus): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const lead = event.previousContainer.data[event.previousIndex];
    const previousContainer = event.previousContainer;
    const container = event.container;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    transferArrayItem(previousContainer.data, container.data, previousIndex, currentIndex);

    const revert = (): void => {
      transferArrayItem(container.data, previousContainer.data, currentIndex, previousIndex);
    };

    if (targetStatus === 'VENDIDO') {
      this.openValueDialog({ mode: 'won', initialValue: null }, revert, (result) => {
        this.moveStatus(lead, targetStatus, result, revert);
      });
      return;
    }

    if (targetStatus === 'PERDIDO') {
      this.openValueDialog({ mode: 'lost', initialValue: null }, revert, (result) => {
        this.moveStatus(lead, targetStatus, result, revert);
      });
      return;
    }

    if (targetStatus === 'EM_ANDAMENTO') {
      this.openValueDialog({ mode: 'in-progress', initialValue: null }, revert, (result) => {
        this.moveStatus(lead, targetStatus, result, revert);
      });
      return;
    }

    this.moveStatus(lead, targetStatus, {}, revert);
  }

  private openValueDialog(
    data: ValueDialogData,
    onCancel: () => void,
    onConfirm: (result: ValueDialogResult) => void,
  ): void {
    const dialogRef = this.dialog.open(ValueDialogComponent, { data });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        onCancel();
        return;
      }
      onConfirm(result);
    });
  }

  private moveStatus(
    lead: Lead,
    status: LeadStatus,
    result: ValueDialogResult,
    revert: () => void,
  ): void {
    this.actionError.set(null);

    const payload: { status: LeadStatus; value?: number; lostReason?: string } = { status };
    if (result.value !== undefined) {
      payload.value = result.value;
    }
    if (result.lostReason !== undefined) {
      payload.lostReason = result.lostReason;
    }

    this.leadsService.moveStatus(lead.id, payload).subscribe({
      next: ({ deal, budgetValue }) => {
        lead.status = status;
        lead.deal = deal;
        lead.budgetValue = budgetValue;
      },
      error: (error) => {
        revert();
        this.actionError.set(this.extractErrorMessage(error));
      },
    });
  }

  editBudgetValue(lead: Lead): void {
    this.dialog
      .open(ValueDialogComponent, {
        data: { mode: 'in-progress', initialValue: this.parseValue(lead.budgetValue) } as ValueDialogData,
      })
      .afterClosed()
      .subscribe((result: ValueDialogResult | undefined) => {
        if (!result) {
          return;
        }

        this.actionError.set(null);

        this.leadsService.moveStatus(lead.id, { status: 'EM_ANDAMENTO', value: result.value }).subscribe({
          next: ({ budgetValue }) => {
            lead.budgetValue = budgetValue;
          },
          error: (error) => {
            this.actionError.set(this.extractErrorMessage(error));
          },
        });
      });
  }

  editDealValue(lead: Lead): void {
    if (!lead.deal) {
      return;
    }

    const dealId = lead.deal.id;

    this.dialog
      .open(ValueDialogComponent, {
        data: { mode: 'edit-value', initialValue: this.parseValue(lead.deal.value) } as ValueDialogData,
      })
      .afterClosed()
      .subscribe((result: ValueDialogResult | undefined) => {
        if (!result || result.value === undefined) {
          return;
        }

        this.actionError.set(null);

        this.dealsService.updateValue(dealId, result.value).subscribe({
          next: (updated) => {
            if (lead.deal) {
              lead.deal = { ...lead.deal, value: updated.value };
            }
          },
          error: (error) => {
            this.actionError.set(this.extractErrorMessage(error));
          },
        });
      });
  }

  showDetails(lead: Lead): void {
    this.dialog.open(LeadDetailsDialogComponent, {
      data: { lead } as LeadDetailsDialogData,
    });
  }

  openFilter(): void {
    this.dialog
      .open(LeadsFilterDialogComponent, {
        data: { filter: this.filter } as LeadsFilterDialogData,
      })
      .afterClosed()
      .subscribe((result: LeadsFilterValue | undefined) => {
        if (!result) {
          return;
        }
        this.filter = result;
        this.rebuildBoard();
      });
  }

  openAddLead(): void {
    this.dialog
      .open(AddLeadDialogComponent)
      .afterClosed()
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.actionError.set(null);

        this.leadsService.create(payload).subscribe({
          next: (lead) => {
            this.allLeads = [lead, ...this.allLeads];
            this.rebuildBoard();
          },
          error: (error) => {
            this.actionError.set(this.extractErrorMessage(error));
          },
        });
      });
  }

  openImport(): void {
    this.dialog
      .open(ImportLeadsDialogComponent)
      .afterClosed()
      .subscribe((shouldReload: boolean | undefined) => {
        if (shouldReload) {
          this.load();
        }
      });
  }

  exportLeads(): void {
    const filtered = this.allLeads.filter((lead) => matchesLeadFilter(lead, this.filter));
    const leadIds = filtered.map((lead) => lead.id);

    this.actionError.set(null);

    this.leadsService.export(leadIds, this.buildFilterSummary()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.actionError.set(this.extractErrorMessage(error));
      },
    });
  }

  private buildFilterSummary(): string {
    const parts: string[] = [];

    if (this.filter.statuses.length > 0) {
      parts.push(`Status: ${this.filter.statuses.map((status) => STATUS_LABELS[status]).join(', ')}`);
    }
    if (this.filter.sources.length > 0) {
      parts.push(`Origem: ${this.filter.sources.join(', ')}`);
    }
    if (this.filter.responsibleUserId) {
      parts.push('Vendedor: filtrado');
    }
    if (this.filter.datePreset) {
      const labels: Record<string, string> = {
        THIS_MONTH: 'Este mês',
        LAST_30: 'Últimos 30 dias',
        LAST_60: 'Últimos 60 dias',
        LAST_90: 'Últimos 90 dias',
      };
      parts.push(`Período: ${labels[this.filter.datePreset] ?? this.filter.datePreset}`);
    } else if (this.filter.startDate || this.filter.endDate) {
      parts.push('Período: personalizado');
    }

    return parts.length > 0 ? parts.join(' | ') : 'Nenhum filtro aplicado';
  }

  private parseValue(value: string | null): number | null {
    if (!value) {
      return null;
    }
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  private extractErrorMessage(error: unknown): string {
    const httpError = error as { error?: { message?: string } };
    return httpError?.error?.message ?? 'Não foi possível concluir a ação.';
  }

  formatValue(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return '';
    }
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
