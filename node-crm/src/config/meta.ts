const requireEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }

    return value;
};

export const metaConfig = {
    appSecret: requireEnv("META_APP_SECRET"),
    webhookVerifyToken: requireEnv("META_WEBHOOK_VERIFY_TOKEN"),
    graphApiBaseUrl: "https://graph.facebook.com/v19.0",
};
