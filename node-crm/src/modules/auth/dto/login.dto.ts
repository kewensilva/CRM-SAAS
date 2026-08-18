export type LoginDTO = {
    tenantSlug?: string | undefined;
    email: string;
    password: string;
};

export type LoginResult = {
    accessToken: string;
    refreshToken: string;
    // Front-end usa isso pra abrir a tela obrigatória de troca de senha antes de
    // liberar o resto da aplicação — primeiro acesso de qualquer perfil (Owner,
    // Analista, Tenant Admin, Manager, User) ou depois de um reset feito por um admin.
    mustChangePassword: boolean;
};
