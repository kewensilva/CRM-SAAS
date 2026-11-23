// Funcionalidades que podem ser ligadas/desligadas sem mexer no resto do código — com false, o
// menu e a rota somem (o backend continua atendendo).
export const FEATURE_FLAGS = {
  // Integrador Google Ads (conversões offline dos Leads). O envio real depende do cliente OAuth
  // do Google configurado no servidor (GOOGLE_ADS_OAUTH_*).
  googleAdsIntegrator: true,
} as const;
