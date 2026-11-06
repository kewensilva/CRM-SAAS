import { ConversionSource, ConversionTrigger } from '../../models/conversion-sync.model';

// Textos e campos que mudam conforme a origem — espelha conversion-rule-policy.ts do backend.
export interface TriggerOption {
  value: ConversionTrigger;
  label: string;
  // null = o gatilho não usa valor; senão, o texto de ajuda do campo.
  valueHint: string | null;
  valueRequired: boolean;
}

export interface SourceDefinition {
  label: string;
  gclidHint: string;
  usesApiToken: boolean;
  usesApiUrl: boolean;
  secretLabel: string | null;
  supportsValue: boolean;
  triggers: TriggerOption[];
  setupSteps: string[];
}

const DEAL_TRIGGERS = (stageHint: string): TriggerOption[] => [
  { value: 'DEAL_WON', label: 'Negócio ganho', valueHint: null, valueRequired: false },
  { value: 'DEAL_STAGE', label: 'Negócio entrou na etapa', valueHint: stageHint, valueRequired: true },
];

export const SOURCE_DEFINITIONS: Record<ConversionSource, SourceDefinition> = {
  RD_STATION_MARKETING: {
    label: 'RD Station Marketing',
    gclidHint: 'Campo personalizado com o GCLID (ex.: cf_gclid)',
    usesApiToken: false,
    usesApiUrl: false,
    secretLabel: null,
    supportsValue: false,
    triggers: [
      {
        value: 'NEW_CONVERSION',
        label: 'Nova conversão (formulário / landing page)',
        valueHint: 'Identificador da conversão (vazio = qualquer conversão)',
        valueRequired: false,
      },
      { value: 'OPPORTUNITY', label: 'Marcado como oportunidade', valueHint: null, valueRequired: false },
      { value: 'LIFECYCLE_STAGE', label: 'Estágio do funil', valueHint: 'Ex.: Lead Qualificado', valueRequired: true },
    ],
    setupSteps: [
      'No RD Station Marketing: Integrações → Webhooks → Criar webhook.',
      'Cole a URL do webhook abaixo e escolha o gatilho (Conversão ou Marcação de oportunidade).',
      'Para enviar o GCLID, capture-o num campo personalizado do formulário (ex.: cf_gclid).',
    ],
  },
  RD_STATION_CRM: {
    label: 'RD Station CRM',
    gclidHint: 'Rótulo do campo personalizado do negócio com o GCLID',
    usesApiToken: true,
    usesApiUrl: false,
    secretLabel: 'Valor do cabeçalho X-CRM-Token (opcional)',
    supportsValue: true,
    triggers: DEAL_TRIGGERS('Nome da etapa, ex.: Proposta enviada'),
    setupSteps: [
      'No RD Station CRM: Configurações → Webhooks → criar webhook para "Negociação atualizada" e "criada".',
      'Cole a URL do webhook abaixo. Opcional: cabeçalho X-CRM-Token com o mesmo valor informado aqui.',
      'Informe o token da API (Perfil → Token) para o CRM buscar e-mail e telefone do contato.',
    ],
  },
  BITRIX24: {
    label: 'Bitrix24',
    gclidHint: 'Campo do GCLID no negócio ou contato (ex.: UF_CRM_1700000000)',
    usesApiToken: false,
    usesApiUrl: true,
    secretLabel: 'Token de aplicação do webhook de saída',
    supportsValue: true,
    triggers: DEAL_TRIGGERS('ID da etapa, ex.: C1:PREPAYMENT_INVOICE'),
    setupSteps: [
      'No Bitrix24: Desenvolvedores → Outros → Webhook de entrada, com permissão CRM. Cole a URL dele aqui.',
      'Depois, Webhook de saída com os eventos de negócio criado e atualizado (ONCRMDEALADD / ONCRMDEALUPDATE).',
      'Cole a URL do webhook abaixo no webhook de saída e copie o "token de aplicação" para cá.',
    ],
  },
};

export const SOURCE_OPTIONS = (Object.keys(SOURCE_DEFINITIONS) as ConversionSource[]).map((value) => ({
  value,
  label: SOURCE_DEFINITIONS[value].label,
}));

export const triggerLabel = (source: ConversionSource, trigger: ConversionTrigger): string =>
  SOURCE_DEFINITIONS[source].triggers.find((option) => option.value === trigger)?.label ?? trigger;
