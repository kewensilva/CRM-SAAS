export interface LostReason {
  id: string;
  tenantId: string | null;
  label: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
