import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';

import { DashboardService } from '../../../core/dashboard/dashboard.service';
import {
  AnalystActivityItem,
  OwnerTenantCard,
  PlatformDashboardSummary,
  PlatformTrendPoint,
} from '../../../models/dashboard.model';
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

// Períodos disponíveis no ranking de frequência dos analistas.
const PERIOD_OPTIONS = [7, 30, 90] as const;
const DEFAULT_PERIOD_DAYS = 30;

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
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  // Cada bloco carrega e falha de forma independente: um erro nos analistas, por exemplo,
  // não esconde os cards das empresas.
  readonly tenantCards = signal<OwnerTenantCard[]>([]);
  readonly tenantCardsLoading = signal(true);
  readonly tenantCardsError = signal<string | null>(null);

  readonly periodOptions = PERIOD_OPTIONS;
  readonly periodDays = signal<number>(DEFAULT_PERIOD_DAYS);
  readonly analysts = signal<AnalystActivityItem[]>([]);
  readonly analystsLoading = signal(true);
  readonly analystsError = signal<string | null>(null);

  // switchMap descarta a resposta de um período anterior ainda em voo, para uma consulta lenta
  // (ex.: 90 dias) não sobrescrever a do período escolhido depois.
  private readonly analystsPeriod$ = new Subject<number>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTenantCards();
    this.watchAnalysts();
    this.analystsPeriod$.next(this.periodDays());
  }

  changePeriod(days: number): void {
    if (days === this.periodDays()) {
      return;
    }

    this.periodDays.set(days);
    this.analystsPeriod$.next(days);
  }

  // Largura da barra relativa ao analista mais ativo do período (mínimo visível quando > 0).
  barWidth(analyst: AnalystActivityItem): number {
    const max = Math.max(...this.analysts().map((item) => item.accessCount), 0);

    if (max === 0 || analyst.accessCount === 0) {
      return 0;
    }

    return Math.max(4, Math.round((analyst.accessCount / max) * 100));
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  trackByTenant(_index: number, card: OwnerTenantCard): string {
    return card.tenantId;
  }

  trackByAnalyst(_index: number, analyst: AnalystActivityItem): string {
    return analyst.analystId;
  }

  private loadSummary(): void {
    this.dashboardService.getPlatformSummary().subscribe({
      next: (summary) => {
        this.metricCards.set(buildMetricCards(summary));
        this.statusSegments.set(buildStatusSegments(summary));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do Dashboard.');
        this.loading.set(false);
      },
    });
  }

  private loadTenantCards(): void {
    this.dashboardService.getOwnerTenantCards().subscribe({
      next: (cards) => {
        this.tenantCards.set(cards);
        this.tenantCardsLoading.set(false);
      },
      error: () => {
        this.tenantCardsError.set('Não foi possível carregar os dados das empresas.');
        this.tenantCardsLoading.set(false);
      },
    });
  }

  // O erro é tratado dentro do switchMap: se escapasse, encerraria o fluxo e as próximas trocas
  // de período deixariam de funcionar.
  private watchAnalysts(): void {
    this.analystsPeriod$
      .pipe(
        switchMap((days) => {
          this.analystsLoading.set(true);
          this.analystsError.set(null);

          return this.dashboardService.getAnalystActivity(days).pipe(
            catchError(() => {
              this.analystsError.set('Não foi possível carregar a frequência dos analistas.');
              this.analystsLoading.set(false);

              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((summary) => {
        this.analysts.set(summary.analysts);
        this.analystsLoading.set(false);
      });
  }
}
