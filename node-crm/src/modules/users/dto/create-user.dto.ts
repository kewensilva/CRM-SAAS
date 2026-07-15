import type { UserProfile } from "../types/user.types";

export type CreateUserDTO = {
    tenantId: string | null;
    name: string;
    email: string;
    password: string;
    profile: UserProfile;
};
