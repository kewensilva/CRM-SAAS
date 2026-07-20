import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

import { DashboardService } from '../../../core/dashboard/dashboard.service';
import { DashboardSummary } from '../../../models/dashboard.model';

interface MetricCard {
  title: string;
  value: number;
  trendIcon?: string;
  chartImage?: string;
  chartTint?: 'green' | 'blue' | 'orange' | 'red';
}

const buildMetricCards = (summary: DashboardSummary): MetricCard[] => [
  {
    title: 'Oportunidades',
    value: summary.leadsCount,
    trendIcon: 'assets/images/icon-trend-oportunidades.svg',
    chartImage: 'assets/images/chart-oportunidades.svg',
    chartTint: 'green',
  },
  {
    title: 'Qualificados',
    value: summary.dealsInProgress,
    trendIcon: 'assets/images/icon-trend-up.svg',
    chartImage: 'assets/images/chart-qualificados.svg',
    chartTint: 'blue',
  },
  {
    title: 'Ganhos',
    value: summary.dealsWon,
    trendIcon: 'assets/images/icon-trend-up.svg',
    chartImage: 'assets/images/chart-ganhos.svg',
    chartTint: 'orange',
  },
  {
    title: 'Perdas',
    value: summary.dealsLost,
    trendIcon: 'assets/images/icon-trend-up.svg',
    chartImage: 'assets/images/chart-perdas.svg',
    chartTint: 'red',
  },
  {
    title: 'Atividades pendentes',
    value: summary.pendingActivities,
  },
];

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-dashboard.component.html',
  styleUrl: './tenant-dashboard.component.scss',
})
export class TenantDashboardComponent implements OnInit {
  readonly periodLabel = '01 - Abril / 22 Abril';
  readonly metricCards = signal<MetricCard[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.metricCards.set(buildMetricCards(summary));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do Dashboard.');
        this.loading.set(false);
      },
    });
  }
}
