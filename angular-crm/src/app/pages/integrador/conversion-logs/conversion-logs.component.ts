import { DatePipe } from '@angular/common';
import { Component, OnInit, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

import { ConversionSyncService } from '../../../core/conversion-sync/conversion-sync.service';
import { ConversionLogs, ConversionUploadLog } from '../../../models/conversion-sync.model';
import { apiErrorMessage } from '../api-error';

const UPLOAD_STATUS_LABELS = { PENDING: 'Pendente', SENT: 'Enviada', FAILED: 'Falhou' } as const;
const WEBHOOK_STATUS_LABELS = {
  RECEIVED: 'Recebido',
  PROCESSED: 'Processado',
  IGNORED: 'Ignorado',
  FAILED: 'Falhou',
  REJECTED: 'Rejeitado',
} as const;

// Histórico da conexão: conversões enviadas ao Google Ads (com reenvio) e webhooks recebidos
// (com reprocessamento dos que falharam).
@Component({
  selector: 'app-conversion-logs',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './conversion-logs.component.html',
  styleUrl: './conversion-logs.component.scss',
})
export class ConversionLogsComponent implements OnInit {
  readonly integrationId = input.required<string>();

  readonly logs = signal<ConversionLogs | null>(null);
  readonly loading = signal(false);
  readonly busyId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly uploadStatusLabels = UPLOAD_STATUS_LABELS;
  readonly webhookStatusLabels = WEBHOOK_STATUS_LABELS;

  constructor(private readonly conversionSyncService: ConversionSyncService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.conversionSyncService.logs(this.integrationId()).subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar o histórico.'));
        this.loading.set(false);
      },
    });
  }

  // Com o que o Google Ads vai tentar atribuir a conversão.
  identification(upload: ConversionUploadLog): string {
    const parts = [upload.gclid ? 'GCLID' : null, upload.hasEmail ? 'e-mail' : null, upload.hasPhone ? 'telefone' : null];

    return parts.filter(Boolean).join(' + ') || 'nenhuma';
  }

  retryUpload(id: string): void {
    this.run(id, this.conversionSyncService.retryUpload(id));
  }

  reprocessWebhook(id: string): void {
    this.run(id, this.conversionSyncService.reprocessWebhook(this.integrationId(), id));
  }

  private run(id: string, request: Observable<unknown>): void {
    this.busyId.set(id);
    this.errorMessage.set(null);

    request.subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (error: unknown) => {
        this.busyId.set(null);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível concluir a ação.'));
      },
    });
  }
}
