export type Owner = {
    id: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
};
