export interface BudgetEntry {
  id: string;
  tenantId: string;
  channelName: string;
  month: string;
  budget: string;
  investment: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UpsertBudgetEntryPayload {
  channelName: string;
  month: string;
  budget?: number;
  investment?: number;
}

export interface UpdateBudgetEntryPayload {
  channelName?: string;
  budget?: number;
  investment?: number;
}
