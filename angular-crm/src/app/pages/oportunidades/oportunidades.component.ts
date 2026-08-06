import { Component, OnInit, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { LeadsService } from '../../core/leads/leads.service';
import { Lead, LeadStatus } from '../../models/lead.model';

const STATUS_LABELS: Record<LeadStatus, string> = {
  SEM_CONTATO: 'Sem contato',
  NAO_ATENDE: 'Não atende',
  EM_ANDAMENTO: 'Em andamento',
  VENDIDO: 'Vendido',
  PERDIDO: 'Perdido',
};

@Component({
  selector: 'app-oportunidades',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './oportunidades.component.html',
  styleUrl: './oportunidades.component.scss',
})
export class OportunidadesComponent implements OnInit {
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly searchTerm = signal('');

  private readonly currentMonthLeads = signal<Lead[]>([]);

  readonly filteredLeads = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const leads = this.currentMonthLeads();

    if (!term) {
      return leads;
    }

    return leads.filter((lead) => {
      const name = lead.name?.toLowerCase() ?? '';
      const email = lead.email?.toLowerCase() ?? '';
      const phone = lead.phone?.toLowerCase() ?? '';
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  });

  constructor(private readonly leadsService: LeadsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.leadsService.list().subscribe({
      next: (leads) => {
        this.currentMonthLeads.set(this.filterByCurrentMonth(leads));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as oportunidades.');
        this.loading.set(false);
      },
    });
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  statusLabel(status: LeadStatus): string {
    return STATUS_LABELS[status];
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  // UTM só existe pra leads do Web Widget (Meta Lead Ads é formulário nativo, sem UTM de
  // site) — mostra "origem / mídia" quando dá (ex.: "instagram / social"), ou só a
  // origem quando só ela veio preenchida. Nunca editável, ver models/lead.model.ts.
  utmSummary(lead: Lead): string | null {
    if (!lead.utmSource) {
      return null;
    }
    return lead.utmMedium ? `${lead.utmSource} / ${lead.utmMedium}` : lead.utmSource;
  }

  formatValue(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return '';
    }
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private filterByCurrentMonth(leads: Lead[]): Lead[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return leads.filter((lead) => {
      const createdAt = new Date(lead.createdAt);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    });
  }
}
