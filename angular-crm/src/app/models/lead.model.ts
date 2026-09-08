export type LeadStatus = 'SEM_CONTATO' | 'NAO_ATENDE' | 'EM_ANDAMENTO' | 'VENDIDO' | 'PERDIDO';

export type LeadSource = 'Site' | 'Meta' | 'Manual';

export type DealStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

// Só relevante quando o Deal é Vendido — UNICO é o default (inclusive negociações
// fechadas antes desta feature).
export type DealPaymentType = 'UNICO' | 'RECORRENTE';

export const DEAL_INSTALLMENT_OPTIONS = [3, 6, 12, 24, 36] as const;

export interface LeadDeal {
  id: string;
  status: DealStatus;
  value: string | null;
  lostReason: string | null;
  paymentType: DealPaymentType;
  installments: number | null;
}

export interface Lead {
  id: string;
  tenantId: string;
  companyId: string | null;
  responsibleUserId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  budgetValue: string | null;
  notes: string | null;
  // Capturados só na criação (origem Web Widget) — nunca editáveis, ver harness.
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deal: LeadDeal | null;
  source: LeadSource;
}

export interface MoveLeadStatusPayload {
  status: LeadStatus;
  value?: number;
  lostReason?: string;
  paymentType?: DealPaymentType;
  installments?: number;
}

export interface MoveLeadStatusResult {
  leadStatus: LeadStatus;
  budgetValue: string | null;
  deal: LeadDeal | null;
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface CreateLeadPayload {
  name: string;
  email?: string;
  phone?: string;
}

export interface ImportLeadsResult {
  createdCount: number;
  errors: { row: number; message: string }[];
}

export interface LeadHistoryEntry {
  id: string;
  tenantId: string;
  leadId: string;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  changedByUserId: string | null;
  changedAt: string;
  changedByUser: { name: string } | null;
}
