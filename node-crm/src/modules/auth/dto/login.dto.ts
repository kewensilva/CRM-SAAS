export type LoginDTO = {
    tenantSlug?: string | undefined;
    email: string;
    password: string;
};

export type LoginResult = {
    accessToken: string;
    refreshToken: string;
};
