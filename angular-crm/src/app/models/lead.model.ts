export type LeadStatus = 'SEM_CONTATO' | 'NAO_ATENDE' | 'EM_ANDAMENTO' | 'VENDIDO' | 'PERDIDO';

export type LeadSource = 'Site' | 'Meta' | 'Manual';

export type DealStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

export interface LeadDeal {
  id: string;
  status: DealStatus;
  value: string | null;
  lostReason: string | null;
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
