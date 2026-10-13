const requireEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }

    return value;
};

const graphVersion = process.env.META_GRAPH_API_VERSION || "v23.0";

export const metaConfig = {
    appSecret: requireEnv("META_APP_SECRET"),
    webhookVerifyToken: requireEnv("META_WEBHOOK_VERIFY_TOKEN"),
    // Versão da Graph API configurável por variável de ambiente (META_GRAPH_API_VERSION),
    // para trocar de versão sem alterar código quando a Meta descontinuar a atual.
    graphApiBaseUrl: `https://graph.facebook.com/${graphVersion}`,

    // "Conectar com o Facebook" (OAuth). Opcionais de propósito: sem elas o servidor sobe
    // normalmente e só o botão de conexão responde erro explicando o que falta configurar.
    appId: process.env.META_APP_ID,
    // Deve ser IDÊNTICA à URI cadastrada em "URIs de redirecionamento OAuth válidos" no app
    // da Meta. É a tela de Configurações do front (ex.: https://www.crm-cmb.com.br/configuracoes).
    oauthRedirectUri: process.env.META_OAUTH_REDIRECT_URI,
    oauthDialogUrl: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
    // Somente o que o CRM usa — a Meta reprova pedido de permissões "para o futuro".
    oauthScopes: [
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_metadata",
        "leads_retrieval",
    ],
};