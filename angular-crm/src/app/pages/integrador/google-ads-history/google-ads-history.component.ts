import { DatePipe } from '@angular/common';
import { Component, OnInit, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { GoogleAdsService } from '../../../core/google-ads/google-ads.service';
import { GoogleAdsUpload } from '../../../models/google-ads.model';
import { apiErrorMessage } from '../api-error';
import { STATUS_LABELS } from '../google-ads-labels';

// Histórico de conversões enviadas ao Google Ads (todas, ou só de uma integração), com
// "Reenviar" para as que falharam.
@Component({
  selector: 'app-google-ads-history',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './google-ads-history.component.html',
  styleUrl: './google-ads-history.component.scss',
})
export class GoogleAdsHistoryComponent implements OnInit {
  readonly ruleId = input<string | undefined>(undefined);

  readonly uploads = signal<GoogleAdsUpload[]>([]);
  readonly loading = signal(true);
  readonly busyId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly statusLabels = STATUS_LABELS;

  constructor(private readonly googleAdsService: GoogleAdsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.googleAdsService.listHistory(this.ruleId()).subscribe({
      next: (uploads) => {
        this.uploads.set(uploads);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar o histórico.'));
      },
    });
  }

  retry(upload: GoogleAdsUpload): void {
    this.busyId.set(upload.id);
    this.errorMessage.set(null);
    this.googleAdsService.retryUpload(upload.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (error: unknown) => {
        this.busyId.set(null);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível reenviar.'));
      },
    });
  }

  formatValue(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  identifiers(upload: GoogleAdsUpload): string {
    return [upload.hasGclid ? 'GCLID' : null, upload.hasEmail ? 'e-mail' : null, upload.hasPhone ? 'telefone' : null]
      .filter(Boolean)
      .join(' + ') || 'sem identificação';
  }
}
