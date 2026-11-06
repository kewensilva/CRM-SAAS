// Integrador de conversões offline → Google Ads via Data Manager API (substitui o
// UploadClickConversions da Google Ads API, fechado a integrações novas desde 15/06/2026).
// Autentica com uma conta de serviço da CMB adicionada ao MCC (Standard ou Admin); se as
// variáveis próprias não forem definidas, reaproveita a conta de serviço do Google Analytics.
// Opcionais: sem elas o servidor sobe e só o envio ao Google Ads explica o que falta.
export const googleAdsConfig = {
    serviceAccountEmail:
        process.env.GOOGLE_ADS_SERVICE_ACCOUNT_EMAIL || process.env.GA_SERVICE_ACCOUNT_EMAIL || null,
    serviceAccountPrivateKey:
        (process.env.GOOGLE_ADS_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY)?.replace(
            /\\n/g,
            "\n",
        ) || null,
    // ID do MCC da CMB (10 dígitos, sem hífens) — vai como loginAccount em cada envio.
    managerAccountId: process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID?.replace(/\D/g, "") || null,
    ingestUrl: "https://datamanager.googleapis.com/v1/events:ingest",
    scope: "https://www.googleapis.com/auth/datamanager",
};
