// Subconjunto fixo de campos opcionais do Lead que o widget pode pedir — "name" fica de
// fora porque é sempre coletado (Lead.name é obrigatório).
export type WidgetFieldKey = "phone" | "email" | "location" | "cpf" | "referralSource" | "notes";

export const WIDGET_FIELD_KEYS: WidgetFieldKey[] = [
    "phone",
    "email",
    "location",
    "cpf",
    "referralSource",
    "notes",
];

export type TenantWidget = {
    id: string;
    tenantId: string;
    enabled: boolean;
    buttonColor: string | null;
    icon: string | null;
    defaultResponsibleUserId: string | null;
    // Prisma tipa a coluna nativa como string[] — narrowed para WidgetFieldKey[] só na
    // borda (validator/service), não aqui, pra não precisar de cast no retorno do Prisma.
    requestedFields: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
