import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { DashboardService } from '../../../core/dashboard/dashboard.service';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { PlatformDashboardSummary, PlatformTrendPoint } from '../../../models/dashboard.model';
import { Tenant } from '../../../models/tenant.model';
import { DonutSegment, OriginDonutChartComponent } from '../../../shared/components/origin-donut-chart/origin-donut-chart.component';
import { SparklinePoint, TrendSparklineComponent } from '../../../shared/components/trend-sparkline/trend-sparkline.component';

interface MetricCard {
  title: string;
  value: number;
  trend: SparklinePoint[];
  color: string;
  secondaryLabel?: string;
}

// Mesmas cores já validadas (dataviz skill) e usadas no dashboard do tenant — ordem fixa
// por card, não ciclada.
const CARD_COLORS = {
  green: '#2e7d32',
  blue: '#1976d2',
  orange: '#ef6c00',
  red: '#c62828',
} as const;

const toSparkline = (points: PlatformTrendPoint[]): SparklinePoint[] =>
  points.map((point) => ({ date: point.date, value: point.value }));

const formatPercentChange = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}% nos últimos 30 dias`;
};

const buildMetricCards = (summary: PlatformDashboardSummary): MetricCard[] => [
  {
    title: 'Meus Clientes',
    value: summary.tenantsCount,
    trend: toSparkline(summary.tenantsTrend),
    color: CARD_COLORS.green,
    secondaryLabel: formatPercentChange(summary.newTenantsPercentChange),
  },
  {
    title: 'Total de Usuários',
    value: summary.usersCount,
    trend: toSparkline(summary.usersTrend),
    color: CARD_COLORS.blue,
  },
  {
    title: 'Total de Leads',
    value: summary.leadsCount,
    trend: toSparkline(summary.leadsTrend),
    color: CARD_COLORS.orange,
  },
  {
    title: 'Leads Qualificados',
    value: summary.qualifiedLeadsCount,
    trend: toSparkline(summary.qualifiedLeadsTrend),
    color: CARD_COLORS.red,
  },
];

const buildStatusSegments = (summary: PlatformDashboardSummary): DonutSegment[] => [
  { label: 'Ativas', value: summary.tenantStatusBreakdown.active, color: CARD_COLORS.green },
  { label: 'Inativas', value: summary.tenantStatusBreakdown.inactive, color: CARD_COLORS.red },
];

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, TrendSparklineComponent, OriginDonutChartComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss',
})
export class OwnerDashboardComponent implements OnInit {
  readonly metricCards = signal<MetricCard[]>([]);
  readonly statusSegments = signal<DonutSegment[]>([]);
  readonly tenants = signal<Tenant[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tenantsService: TenantsService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.dashboardService.getPlatformSummary(),
      tenants: this.tenantsService.list(),
    }).subscribe({
      next: ({ summary, tenants }) => {
        this.metricCards.set(buildMetricCards(summary));
        this.statusSegments.set(buildStatusSegments(summary));
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do Dashboard.');
        this.loading.set(false);
      },
    });
  }
}
