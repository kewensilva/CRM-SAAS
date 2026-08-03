export type UserProfile = "OWNER" | "TENANT_ADMIN" | "MANAGER" | "USER" | "ANALYST";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type User = {
    id: string;
    tenantId: string | null;
    name: string;
    email: string;
    passwordHash: string;
    profile: UserProfile;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
