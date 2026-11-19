// Funcionalidades prontas no código mas ainda fora do ar. Para ativar, troque para true —
// o menu e a rota passam a aparecer (o backend já atende).
export const FEATURE_FLAGS = {
  // Integrador Ads (RD Station Marketing → Google Ads). Ativo; o envio real ao Google depende
  // do MCC da CMB e da conta de serviço configurados no servidor.
  conversionSync: true,
} as const;
