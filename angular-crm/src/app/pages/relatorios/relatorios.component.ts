import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

import { ReportsService } from '../../core/reports/reports.service';
import { ReportPeriod, ReportSummary } from '../../models/report.model';
import { GoogleAnalyticsReportComponent } from './google-analytics-report/google-analytics-report.component';

const MONTH_NAMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// "AAAA-MM-DD" no fuso do navegador — mesmo formato do <input type="date"> e da API.
const toIsoDay = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Padrão: do dia 1 do mês corrente até hoje (o que a página mostrava antes, só que por dias).
const defaultPeriod = (): ReportPeriod => {
  const today = new Date();

  return { startDate: toIsoDay(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: toIsoDay(today) };
};

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GoogleAnalyticsReportComponent],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
})
export class RelatoriosComponent {
  readonly periodForm = new FormGroup({
    startDate: new FormControl(defaultPeriod().startDate, { nonNullable: true }),
    endDate: new FormControl(defaultPeriod().endDate, { nonNullable: true }),
  });

  // Último período válido escolhido — alimenta o resumo e o bloco do Google Analytics.
  readonly period = signal<ReportPeriod>(defaultPeriod());
  readonly periodError = signal<string | null>(null);
  readonly summary = signal<ReportSummary | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly reportsService: ReportsService) {
    this.periodForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.applyPeriod());

    // switchMap descarta a resposta de um período anterior ainda em voo (ex.: o usuário
    // trocou as datas antes da primeira consulta terminar).
    toObservable(this.period)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap((period) =>
          this.reportsService.getSummary(period).pipe(
            catchError((error: unknown) => {
              this.errorMessage.set(
                (error as { error?: { message?: string } })?.error?.message ?? 'Não foi possível carregar o relatório.',
              );
              this.loading.set(false);

              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      });
  }

  // Só consulta quando as duas datas estão preenchidas e em ordem; senão mantém o último
  // período válido na tela e mostra o motivo.
  private applyPeriod(): void {
    const { startDate, endDate } = this.periodForm.getRawValue();

    if (!startDate || !endDate) {
      this.periodError.set('Informe as duas datas.');
      return;
    }

    if (startDate > endDate) {
      this.periodError.set('A data inicial deve ser anterior ou igual à final.');
      return;
    }

    this.periodError.set(null);

    if (startDate !== this.period().startDate || endDate !== this.period().endDate) {
      this.period.set({ startDate, endDate });
    }
  }

  // "out/2026" ou "set/2026 a out/2026" — meses cheios usados no budget do período.
  budgetMonthsLabel(months: string[]): string {
    const label = (value: string) => `${MONTH_NAMES[Number(value.slice(5, 7)) - 1]}/${value.slice(0, 4)}`;

    return months.length <= 1 ? label(months[0] ?? '') : `${label(months[0])} a ${label(months[months.length - 1])}`;
  }

  formatDay(isoDate: string): string {
    return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
  }
}
