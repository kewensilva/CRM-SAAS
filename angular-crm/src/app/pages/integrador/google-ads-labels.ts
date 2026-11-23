import { GoogleAdsConversionTrigger, GoogleAdsLeadOrigin, GoogleAdsUploadStatus } from '../../models/google-ads.model';

// Textos dos "gatilhos" (passo 1 do editor) — espelha conversion-trigger.service.ts do backend.
export const TRIGGER_OPTIONS: { value: GoogleAdsConversionTrigger; label: string; hint: string; icon: string }[] = [
  {
    value: 'LEAD_CREATED',
    label: 'Novo lead no CRM',
    hint: 'Assim que o lead entra: site, Facebook/Instagram ou cadastro manual.',
    icon: 'person_add',
  },
  {
    value: 'LEAD_QUALIFIED',
    label: 'Lead qualificado',
    hint: 'Quando o vendedor move o lead para "Em andamento".',
    icon: 'trending_up',
  },
  {
    value: 'LEAD_WON',
    label: 'Lead vendido',
    hint: 'Quando o lead é marcado como Vendido — pode enviar o valor da venda.',
    icon: 'paid',
  },
];

// 'ALL' só na tela: o mat-select trata null como "limpar seleção" e não mostraria o texto.
export type OriginChoice = GoogleAdsLeadOrigin | 'ALL';

export const ORIGIN_OPTIONS: { value: OriginChoice; label: string }[] = [
  { value: 'ALL', label: 'Leads de todas as origens' },
  { value: 'SITE', label: 'Só leads do site (formulário / botão)' },
  { value: 'META', label: 'Só leads do Facebook / Instagram' },
  { value: 'MANUAL', label: 'Só leads cadastrados à mão' },
];

export const STATUS_LABELS: Record<GoogleAdsUploadStatus, string> = {
  PENDING: 'Enviando',
  SENT: 'Enviada',
  FAILED: 'Falhou',
};

export const triggerLabel = (trigger: GoogleAdsConversionTrigger): string =>
  TRIGGER_OPTIONS.find((option) => option.value === trigger)?.label ?? trigger;

export const originLabel = (origin: GoogleAdsLeadOrigin | null): string =>
  ORIGIN_OPTIONS.find((option) => option.value === (origin ?? 'ALL'))?.label ?? 'Leads de todas as origens';

// 1234567890 → 123-456-7890, como aparece no Google Ads.
export const formatCustomerId = (id: string | null): string =>
  id && id.length === 10 ? `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}` : (id ?? '');
