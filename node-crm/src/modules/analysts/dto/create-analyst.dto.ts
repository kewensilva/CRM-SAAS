export type CreateAnalystDTO = {
    name: string;
    email: string;
    password: string;
    tenantIds: string[];
};

export type ReplaceAnalystAccessDTO = {
    tenantIds: string[];
};
