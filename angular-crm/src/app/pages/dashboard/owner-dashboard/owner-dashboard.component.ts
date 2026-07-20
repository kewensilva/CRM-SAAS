import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { DashboardService } from '../../../core/dashboard/dashboard.service';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { PlatformDashboardSummary } from '../../../models/dashboard.model';
import { Tenant } from '../../../models/tenant.model';

interface MetricCard {
  title: string;
  value: number;
  chartImage: string;
  chartTint: 'green' | 'blue' | 'orange' | 'red';
}

const buildMetricCards = (summary: PlatformDashboardSummary): MetricCard[] => [
  {
    title: 'Meus Clientes',
    value: summary.tenantsCount,
    chartImage: 'assets/images/chart-oportunidades.svg',
    chartTint: 'green',
  },
  {
    title: 'Total de Usuários',
    value: summary.usersCount,
    chartImage: 'assets/images/chart-qualificados.svg',
    chartTint: 'blue',
  },
  {
    title: 'Total de Leads',
    value: summary.leadsCount,
    chartImage: 'assets/images/chart-ganhos.svg',
    chartTint: 'orange',
  },
  {
    title: 'Leads Qualificados',
    value: summary.qualifiedLeadsCount,
    chartImage: 'assets/images/chart-perdas.svg',
    chartTint: 'red',
  },
];

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss',
})
export class OwnerDashboardComponent implements OnInit {
  readonly metricCards = signal<MetricCard[]>([]);
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
