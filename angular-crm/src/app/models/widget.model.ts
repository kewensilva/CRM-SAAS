export type WidgetFieldKey = 'phone' | 'email' | 'location' | 'cpf' | 'referralSource' | 'notes';

export interface TenantWidget {
  id: string;
  tenantId: string;
  enabled: boolean;
  buttonColor: string | null;
  icon: string | null;
  defaultResponsibleUserId: string | null;
  requestedFields: WidgetFieldKey[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
