// Integrador Google Ads: cada cliente conecta a PRÓPRIA conta Google (OAuth, como no RD
// Station) e o CRM envia as conversões offline pela Data Manager API em nome dele.
// Tudo opcional: sem as variáveis o servidor sobe e só o Integrador explica o que falta.
//
// GOOGLE_ADS_OAUTH_*: cliente OAuth "Aplicativo da Web" criado no Google Cloud da CMB, com a
//   Data Manager API ativada e o redirecionamento https://<front>/integrador cadastrado.
// GOOGLE_ADS_DEVELOPER_TOKEN: opcional — com ele, contas e ações de conversão aparecem em
//   listas para escolher (Google Ads API); sem ele, o cliente digita os IDs.
const apiVersion = process.env.GOOGLE_ADS_API_VERSION || "v26";

export const googleAdsConfig = {
    oauthClientId: process.env.GOOGLE_ADS_OAUTH_CLIENT_ID || null,
    oauthClientSecret: process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET || null,
    oauthRedirectUri: process.env.GOOGLE_ADS_OAUTH_REDIRECT_URI || null,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || null,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    revokeUrl: "https://oauth2.googleapis.com/revoke",
    adsApiBaseUrl: `https://googleads.googleapis.com/${apiVersion}`,
    ingestUrl: "https://datamanager.googleapis.com/v1/events:ingest",
    // datamanager: envio das conversões. adwords: listar contas e ações de conversão.
    scopes: [
        "openid",
        "email",
        "https://www.googleapis.com/auth/datamanager",
        "https://www.googleapis.com/auth/adwords",
    ],
};
