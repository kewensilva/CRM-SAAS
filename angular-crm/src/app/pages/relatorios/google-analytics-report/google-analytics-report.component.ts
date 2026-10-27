import { Component, computed, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

import { GoogleAnalyticsService } from '../../../core/google-analytics/google-analytics.service';
import { GoogleAnalyticsMonthlyReport } from '../../../models/google-analytics.model';

const apiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { error?: { message?: string } })?.error?.message ?? fallback;

// Bloco "Google Analytics" da página Relatórios. Recebe o mesmo mês do seletor da página e
// carrega por conta própria — falha no Google não esconde o resto do relatório.
@Component({
  selector: 'app-google-analytics-report',
  standalone: true,
  templateUrl: './google-analytics-report.component.html',
  styleUrl: './google-analytics-report.component.scss',
})
export class GoogleAnalyticsReportComponent {
  readonly month = input.required<string>();

  readonly report = signal<GoogleAnalyticsMonthlyReport | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  // Barra de cada cidade relativa à maior do mês.
  readonly maxCityUsers = computed(() => {
    const report = this.report();

    return report?.configured ? Math.max(...report.byCity.map((row) => row.activeUsers), 0) : 0;
  });

  constructor(private readonly googleAnalyticsService: GoogleAnalyticsService) {
    // switchMap descarta a resposta de um mês anterior ainda em voo; o erro é tratado por
    // dentro para não encerrar o fluxo nas próximas trocas de mês.
    toObservable(this.month)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap((month) =>
          this.googleAnalyticsService.getMonthlyReport(month).pipe(
            catchError((error: unknown) => {
              this.report.set(null);
              this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar os dados do Google Analytics.'));
              this.loading.set(false);

              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((report) => {
        this.report.set(report);
        this.loading.set(false);
      });
  }

  cityBarWidth(activeUsers: number): number {
    const max = this.maxCityUsers();

    return max === 0 ? 0 : Math.max(2, Math.round((activeUsers / max) * 100));
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  formatDay(isoDate: string): string {
    return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}`;
  }
}
