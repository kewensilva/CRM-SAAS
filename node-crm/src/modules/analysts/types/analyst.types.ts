export type Analyst = {
    id: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
};

export type AnalystWithAccess = Analyst & {
    tenantAccess: { tenantId: string; tenantName: string }[];
};
