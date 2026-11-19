import { DatePipe } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MetaService } from '../../../core/meta/meta.service';
import { MetaConnectionHealth, MetaIntegration } from '../../../models/meta-integration.model';

type StepState = 'ok' | 'warn' | 'error' | 'loading';
type Step = { key: string; title: string; detail: string; state: StepState };

// Ferramenta oficial da Meta para mandar um lead de teste para um formulário da Página.
const LEAD_TESTING_TOOL_URL = 'https://developers.facebook.com/tools/lead-ads-testing';
const STATE_ICONS: Record<StepState, string> = { ok: 'check', warn: 'priority_high', error: 'close', loading: 'more_horiz' };

const apiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { error?: { message?: string } })?.error?.message ?? fallback;

const instagramStep = (health: MetaConnectionHealth): Step => {
  const check = health.instagram;
  const base = { key: 'instagram', title: 'Instagram vinculado' };

  if (check.error !== null) {
    return { ...base, state: 'warn', detail: `Não foi possível verificar: ${check.error}` };
  }

  if (!check.value) {
    return {
      ...base,
      state: 'warn',
      detail:
        'Nenhuma conta do Instagram vinculada a esta Página. Vincule em Meta Business Suite → Configurações → Contas do Instagram para anunciar no Instagram com esta Página.',
    };
  }

  const handle = check.value.username ? `@${check.value.username}` : `conta ${check.value.id}`;

  return { ...base, state: 'ok', detail: `${handle} — leads dos anúncios do Instagram chegam por esta Página.` };
};

const webhookStep = (health: MetaConnectionHealth): Step => {
  const check = health.webhookSubscribed;
  const base = { key: 'webhook', title: 'Recebimento automático de leads' };

  if (check.error !== null) {
    return { ...base, state: 'warn', detail: `Não foi possível verificar: ${check.error}` };
  }

  return check.value
    ? { ...base, state: 'ok', detail: 'A Meta avisa o CRM assim que um lead preenche o formulário.' }
    : { ...base, state: 'error', detail: 'A Página não está avisando o CRM. Clique em "Reativar recebimento".' };
};

const formsStep = (health: MetaConnectionHealth): Step => {
  const check = health.forms;
  const base = { key: 'forms', title: 'Formulários de cadastro' };

  if (check.error !== null) {
    return { ...base, state: 'warn', detail: `Não foi possível listar: ${check.error}` };
  }

  const active = check.value.filter((form) => form.status === 'ACTIVE').length;

  return check.value.length === 0
    ? { ...base, state: 'warn', detail: 'Nenhum formulário criado nesta Página ainda. Crie no Gerenciador de Anúncios ao montar o anúncio.' }
    : { ...base, state: 'ok', detail: `${check.value.length} formulário(s), ${active} ativo(s). Todos entram no CRM.` };
};

const activationStep = (health: MetaConnectionHealth): Step => {
  const base = { key: 'activation', title: 'Integração ativa' };

  if (!health.hasDefaultResponsible) {
    return { ...base, state: 'error', detail: 'Escolha o responsável padrão abaixo e ative a integração.' };
  }

  return health.enabled
    ? { ...base, state: 'ok', detail: 'Leads novos entram no CRM com o responsável padrão.' }
    : { ...base, state: 'error', detail: 'Ative a integração abaixo para começar a receber os leads.' };
};

// Checklist da conexão com a Meta, no estilo dos CRMs de mercado: mostra a Página, o
// Instagram vinculado, se o recebimento está ativo e os formulários — e como consertar cada item.
@Component({
  selector: 'app-meta-connection-status',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './meta-connection-status.component.html',
  styleUrl: './meta-connection-status.component.scss',
})
export class MetaConnectionStatusComponent {
  readonly integration = input<MetaIntegration | null>(null);

  readonly health = signal<MetaConnectionHealth | null>(null);
  readonly loading = signal(false);
  readonly resubscribing = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly leadTestingToolUrl = LEAD_TESTING_TOOL_URL;
  readonly stateIcons = STATE_ICONS;

  readonly steps = computed<Step[]>(() => {
    const health = this.health();

    if (!health?.connected) {
      return [];
    }

    return [instagramStep(health), webhookStep(health), formsStep(health), activationStep(health)];
  });

  readonly allOk = computed(() => this.steps().length > 0 && this.steps().every((step) => step.state === 'ok'));
  readonly needsResubscribe = computed(() => this.health()?.webhookSubscribed.value === false);

  constructor(private readonly metaService: MetaService) {
    // Recarrega sempre que a integração muda (conectou, trocou de Página, ativou, salvou).
    effect(() => {
      const integration = this.integration();

      if (integration?.pageId && integration.hasPageToken) {
        this.load();
      } else {
        this.health.set(null);
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.metaService.health().subscribe({
      next: (health) => {
        this.health.set(health);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível verificar a conexão com a Meta.'));
        this.loading.set(false);
      },
    });
  }

  resubscribe(): void {
    this.resubscribing.set(true);
    this.errorMessage.set(null);

    this.metaService.resubscribe().subscribe({
      next: () => {
        this.resubscribing.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.resubscribing.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível reativar o recebimento de leads.'));
      },
    });
  }
}
