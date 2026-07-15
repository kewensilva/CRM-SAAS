const requireEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }

    return value;
};

export const jwtConfig = {
    accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
};
