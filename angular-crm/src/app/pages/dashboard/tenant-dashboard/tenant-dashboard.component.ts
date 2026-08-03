import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { LeadsService } from '../../../core/leads/leads.service';
import { Lead, LeadStatus } from '../../../models/lead.model';
import {
  LeadDetailsDialogComponent,
  LeadDetailsDialogData,
} from '../../../shared/components/lead-details-dialog/lead-details-dialog.component';
import {
  LeadsFilterDialogComponent,
  LeadsFilterDialogData,
} from '../../../shared/components/leads-filter-dialog/leads-filter-dialog.component';
import { LeadListDialogComponent, LeadListDialogData } from '../../../shared/components/lead-list-dialog/lead-list-dialog.component';
import { DonutSegment, OriginDonutChartComponent } from '../../../shared/components/origin-donut-chart/origin-donut-chart.component';
import { TrendSparklineComponent, SparklinePoint } from '../../../shared/components/trend-sparkline/trend-sparkline.component';
import { EMPTY_LEADS_FILTER, LeadsFilterValue, matchesLeadFilter } from '../../../shared/utils/lead-filter.util';

const QUALIFIED_STATUSES: LeadStatus[] = ['EM_ANDAMENTO', 'VENDIDO', 'PERDIDO'];
const RECENT_LEADS_LIMIT = 8;

interface MetricCard {
  title: string;
  value: number;
  sumValue?: number;
  trend?: SparklinePoint[];
  color?: string;
  matches: (lead: Lead) => boolean;
}

const TREND_DAYS = 14;

// Mesma cor usada em outras telas (status-badge/erro) — cada card é uma única série
// (magnitude ao longo do tempo), então uma cor sequencial por card, sem paleta categórica.
const CARD_COLORS = {
  green: '#2e7d32',
  blue: '#1976d2',
  orange: '#ef6c00',
  red: '#c62828',
} as const;

// Mesmas 3 cores validadas pelo dataviz skill (scripts/validate_palette.js) — ordem fixa
// por origem (Site/Meta/Manual), nunca ciclada.
const ORIGIN_COLORS: Record<Lead['source'], string> = {
  Site: CARD_COLORS.green,
  Meta: CARD_COLORS.blue,
  Manual: CARD_COLORS.orange,
};

const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

// Valor monetário associado a um Lead: o valor final da negociação se já existe (Vendido/
// Perdido), senão o valor orçado enquanto em andamento — nunca soma os dois.
const leadValue = (lead: Lead): number => {
  if (lead.deal?.value) {
    return Number(lead.deal.value) || 0;
  }
  if (lead.budgetValue) {
    return Number(lead.budgetValue) || 0;
  }
  return 0;
};

const sumValue = (leads: Lead[]): number => leads.reduce((sum, lead) => sum + leadValue(lead), 0);

// Os últimos 14 dias, terminando hoje — mesma janela usada pelo backend antes de a
// tela de Dashboard passar a computar tudo a partir do mesmo GET /leads que Kanban/CRM
// já usam (necessário para o filtro de data/status/origem valer também nos gráficos).
const buildTrendDates = (): string[] => {
  const today = new Date();
  return Array.from({ length: TREND_DAYS }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (TREND_DAYS - 1 - index));
    return dayKey(day);
  });
};

const buildMetricCards = (leads: Lead[]): MetricCard[] => {
  const dates = buildTrendDates();

  const trendFor = (matches: (lead: Lead) => boolean): SparklinePoint[] =>
    dates.map((date) => ({
      date,
      value: leads.filter((lead) => matches(lead) && dayKey(new Date(lead.createdAt)) === date).length,
    }));

  const qualifiedMatch = (lead: Lead): boolean => QUALIFIED_STATUSES.includes(lead.status);
  const wonMatch = (lead: Lead): boolean => lead.status === 'VENDIDO';
  const lostMatch = (lead: Lead): boolean => lead.status === 'PERDIDO';
  const allMatch = (): boolean => true;

  return [
    {
      title: 'Oportunidades',
      value: leads.length,
      trend: trendFor(allMatch),
      color: CARD_COLORS.green,
      matches: allMatch,
    },
    {
      title: 'Qualificados',
      value: leads.filter(qualifiedMatch).length,
      sumValue: sumValue(leads.filter(qualifiedMatch)),
      trend: trendFor(qualifiedMatch),
      color: CARD_COLORS.blue,
      matches: qualifiedMatch,
    },
    {
      title: 'Ganhos',
      value: leads.filter(wonMatch).length,
      sumValue: sumValue(leads.filter(wonMatch)),
      trend: trendFor(wonMatch),
      color: CARD_COLORS.orange,
      matches: wonMatch,
    },
    {
      title: 'Perdas',
      value: leads.filter(lostMatch).length,
      sumValue: sumValue(leads.filter(lostMatch)),
      trend: trendFor(lostMatch),
      color: CARD_COLORS.red,
      matches: lostMatch,
    },
  ];
};

const buildOriginSegments = (leads: Lead[]): DonutSegment[] => {
  const sources: Lead['source'][] = ['Site', 'Meta', 'Manual'];

  return sources.map((source) => ({
    label: source === 'Meta' ? 'Meta (rede social)' : source,
    value: leads.filter((lead) => lead.source === source).length,
    color: ORIGIN_COLORS[source],
  }));
};

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TrendSparklineComponent, OriginDonutChartComponent],
  templateUrl: './tenant-dashboard.component.html',
  styleUrl: './tenant-dashboard.component.scss',
})
export class TenantDashboardComponent implements OnInit {
  readonly metricCards = signal<MetricCard[]>([]);
  readonly originSegments = signal<DonutSegment[]>([]);
  readonly recentLeadNames = signal<string[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly periodLabel = signal('Últimos 14 dias');

  private allLeads: Lead[] = [];
  private filteredLeads: Lead[] = [];
  private filter: LeadsFilterValue = EMPTY_LEADS_FILTER;

  constructor(
    private readonly leadsService: LeadsService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.leadsService.list().subscribe({
      next: (leads) => {
        this.allLeads = leads;
        this.rebuildCards();
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do Dashboard.');
        this.loading.set(false);
      },
    });
  }

  private rebuildCards(): void {
    this.filteredLeads = this.allLeads.filter((lead) => matchesLeadFilter(lead, this.filter));
    this.metricCards.set(buildMetricCards(this.filteredLeads));
    this.originSegments.set(buildOriginSegments(this.filteredLeads));
    this.recentLeadNames.set(this.filteredLeads.slice(0, RECENT_LEADS_LIMIT).map((lead) => lead.name));
    this.periodLabel.set(this.buildPeriodLabel());
  }

  private buildPeriodLabel(): string {
    const format = (date: Date): string =>
      date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    if (this.filter.datePreset) {
      const labels: Record<string, string> = {
        THIS_MONTH: 'Este mês',
        LAST_30: 'Últimos 30 dias',
        LAST_60: 'Últimos 60 dias',
        LAST_90: 'Últimos 90 dias',
      };
      return labels[this.filter.datePreset] ?? 'Últimos 14 dias';
    }

    if (this.filter.startDate && this.filter.endDate) {
      return `${format(this.filter.startDate)} - ${format(this.filter.endDate)}`;
    }

    if (this.filter.startDate) {
      return `A partir de ${format(this.filter.startDate)}`;
    }

    if (this.filter.endDate) {
      return `Até ${format(this.filter.endDate)}`;
    }

    return 'Últimos 14 dias';
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
        this.rebuildCards();
      });
  }

  openCardLeads(card: MetricCard): void {
    const leads = this.filteredLeads.filter((lead) => card.matches(lead));

    this.dialog.open(LeadListDialogComponent, {
      data: { title: card.title, leads } as LeadListDialogData,
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  openLeadByName(name: string): void {
    const lead = this.filteredLeads.find((candidate) => candidate.name === name);

    if (!lead) {
      return;
    }

    this.dialog.open(LeadDetailsDialogComponent, { data: { lead } as LeadDetailsDialogData });
  }
}
