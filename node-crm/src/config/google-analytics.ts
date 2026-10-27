// Conta de serviço da plataforma (uma só para todos os tenants) que lê as propriedades GA4
// dos clientes. Opcionais de propósito: sem elas o servidor sobe normalmente e só a
// integração com Google Analytics responde erro explicando o que falta configurar.
// A chave privada vem do JSON da conta de serviço (campo private_key); em variáveis de
// ambiente as quebras de linha costumam chegar como "\n" literal, então são restauradas aqui.
export const googleAnalyticsConfig = {
    serviceAccountEmail: process.env.GA_SERVICE_ACCOUNT_EMAIL || null,
    serviceAccountPrivateKey: process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n") || null,
    tokenUrl: "https://oauth2.googleapis.com/token",
    dataApiBaseUrl: "https://analyticsdata.googleapis.com/v1beta",
    // Somente leitura — o CRM nunca altera nada na propriedade do cliente.
    scope: "https://www.googleapis.com/auth/analytics.readonly",
};
