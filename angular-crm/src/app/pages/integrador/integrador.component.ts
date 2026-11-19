import { Component, OnInit, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ConversionSyncService } from '../../core/conversion-sync/conversion-sync.service';
import { ConversionIntegration, ConversionSource } from '../../models/conversion-sync.model';
import { apiErrorMessage } from './api-error';
import { ConversionConnectionComponent } from './conversion-connection/conversion-connection.component';
import { SOURCE_DEFINITIONS, SOURCE_OPTIONS } from './conversion-sources';

// Integrador de conversões offline no estilo Zapier: lista de integrações (origem → Google Ads)
// e, ao abrir uma, o editor em passos "Quando isto acontecer → Faça isto".
@Component({
  selector: 'app-integrador',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ConversionConnectionComponent],
  templateUrl: './integrador.component.html',
  styleUrl: './integrador.component.scss',
})
export class IntegradorComponent implements OnInit {
  readonly sourceOptions = SOURCE_OPTIONS;
  readonly integrations = signal<ConversionIntegration[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedId = signal<string | null>(null);

  readonly selected = computed(() => this.integrations().find((item) => item.id === this.selectedId()) ?? null);

  constructor(private readonly conversionSyncService: ConversionSyncService) {}

  ngOnInit(): void {
    this.load();
  }

  sourceLabel(source: ConversionSource): string {
    return SOURCE_DEFINITIONS[source].label;
  }

  sourceBadge(source: ConversionSource): string {
    return SOURCE_DEFINITIONS[source].badge;
  }

  activeRules(integration: ConversionIntegration): number {
    return integration.rules.filter((rule) => rule.enabled).length;
  }

  // Cria já com nome padrão e abre o editor — como no Zapier, o resto se ajusta nos passos.
  create(source: ConversionSource): void {
    this.creating.set(true);
    this.errorMessage.set(null);

    this.conversionSyncService.create({ name: `${this.sourceLabel(source)} → Google Ads`, source }).subscribe({
      next: (integration) => {
        this.creating.set(false);
        this.integrations.update((list) => [...list, integration]);
        this.selectedId.set(integration.id);
      },
      error: (error: unknown) => {
        this.creating.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível criar a integração.'));
      },
    });
  }

  open(id: string): void {
    this.selectedId.set(id);
  }

  back(): void {
    this.selectedId.set(null);
  }

  // Editor avisou mudança: integração excluída (null) sai da lista e volta para ela; senão
  // recarrega (as regras vêm junto com a integração).
  onConnectionChanged(id: string, updated: ConversionIntegration | null): void {
    if (!updated) {
      this.integrations.update((list) => list.filter((item) => item.id !== id));
      this.selectedId.set(null);
      return;
    }

    this.load();
  }

  private load(): void {
    this.conversionSyncService.list().subscribe({
      next: (integrations) => {
        this.integrations.set(integrations);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar as integrações.'));
        this.loading.set(false);
      },
    });
  }
}
