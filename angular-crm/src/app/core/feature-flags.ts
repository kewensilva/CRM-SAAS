// Funcionalidades prontas no código mas ainda fora do ar. Para ativar, troque para true —
// o menu e a rota passam a aparecer (o backend já atende).
export const FEATURE_FLAGS = {
  // Integrador RD Station / Bitrix24 → Google Ads: aguardando a CMB definir os eventos de
  // conversão e configurar o MCC/conta de serviço.
  conversionSync: false,
} as const;
