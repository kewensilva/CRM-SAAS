import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ReportsService } from '../../core/reports/reports.service';
import { ReportSummary } from '../../models/report.model';

// "2026-09" — mesmo formato aceito pelo <input type="month"> e pela API
// (ver report.validator.ts no backend).
const currentMonthValue = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
})
export class RelatoriosComponent implements OnInit {
  readonly monthControl = new FormControl<string>(currentMonthValue(), { nonNullable: true });
  readonly summary = signal<ReportSummary | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly reportsService: ReportsService) {}

  ngOnInit(): void {
    this.load();
    this.monthControl.valueChanges.subscribe(() => this.load());
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.reportsService.getSummary(this.monthControl.value).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar o relatório.');
        this.loading.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatPercent(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
  }
}
