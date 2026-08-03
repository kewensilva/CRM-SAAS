import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LeadsService } from '../../core/leads/leads.service';
import { Lead } from '../../models/lead.model';
import {
  LeadsFilterDialogComponent,
  LeadsFilterDialogData,
} from '../../shared/components/leads-filter-dialog/leads-filter-dialog.component';
import { EMPTY_LEADS_FILTER, LeadsFilterValue, matchesLeadFilter } from '../../shared/utils/lead-filter.util';

interface CalendarDay {
  day: number;
  count: number;
  opacity: number;
}

const isSameMonth = (isoDate: string, year: number, month: number): boolean => {
  const date = new Date(isoDate);
  return date.getFullYear() === year && date.getMonth() === month;
};

const buildCalendarGrid = (leads: Lead[], year: number, month: number): CalendarDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const countsByDay = new Array(daysInMonth + 1).fill(0);

  for (const lead of leads) {
    const date = new Date(lead.createdAt);
    if (date.getFullYear() === year && date.getMonth() === month) {
      countsByDay[date.getDate()] += 1;
    }
  }

  const maxCount = Math.max(...countsByDay, 0);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const count = countsByDay[day];
    const opacity = maxCount === 0 ? 0 : 0.12 + (count / maxCount) * 0.78;
    return { day, count, opacity };
  });
};

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTooltipModule],
  templateUrl: './crm.component.html',
  styleUrl: './crm.component.scss',
})
export class CrmComponent implements OnInit {
  readonly allLeads = signal<Lead[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly filter = signal<LeadsFilterValue>(EMPTY_LEADS_FILTER);

  readonly leads = computed(() => this.allLeads().filter((lead) => matchesLeadFilter(lead, this.filter())));

  readonly totalInteressados = computed(() => this.leads().length);

  readonly novasOportunidadesMesAtual = computed(() => {
    const now = new Date();
    return this.leads().filter((lead) => isSameMonth(lead.createdAt, now.getFullYear(), now.getMonth())).length;
  });

  readonly oportunidadesMesAnterior = computed(() => {
    const now = new Date();
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return this.leads().filter((lead) =>
      isSameMonth(lead.createdAt, previousMonthDate.getFullYear(), previousMonthDate.getMonth()),
    ).length;
  });

  readonly calendarGrid = computed(() => {
    const now = new Date();
    return buildCalendarGrid(this.leads(), now.getFullYear(), now.getMonth());
  });

  readonly currentMonthLabel = computed(() =>
    new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  );

  constructor(
    private readonly leadsService: LeadsService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.leadsService.list().subscribe({
      next: (leads) => {
        this.allLeads.set(leads);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do CRM.');
        this.loading.set(false);
      },
    });
  }

  openFilter(): void {
    this.dialog
      .open(LeadsFilterDialogComponent, {
        data: { filter: this.filter() } as LeadsFilterDialogData,
      })
      .afterClosed()
      .subscribe((result: LeadsFilterValue | undefined) => {
        if (!result) {
          return;
        }
        this.filter.set(result);
      });
  }
}
