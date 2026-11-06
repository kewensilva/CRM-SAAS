import type { ConversionRule, NormalizedSourceEvent } from "../types/conversion-sync.types";

export type RuleMatch = { rule: ConversionRule; transactionId: string };

const TRANSACTION_ID_MAX_LENGTH = 100;

const sameText = (a: string | null | undefined, b: string | null | undefined): boolean =>
    Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());

// transactionId identifica UMA conversão: o Google deduplica por ele dentro da ação de
// conversão, e o CRM também (único por regra). Negócio ganho = uma vez por negócio; etapa =
// uma vez por negócio e etapa; conversão de formulário = uma por envio do formulário.
const transactionIdFor = (rule: ConversionRule, event: NormalizedSourceEvent): string | null => {
    const { signals, externalId } = event;

    switch (rule.trigger) {
        case "NEW_CONVERSION":
            if (!signals.newConversion || (rule.triggerValue && !sameText(rule.triggerValue, signals.newConversion.identifier))) {
                return null;
            }
            return `conversion:${externalId}:${event.eventKey}`;
        case "OPPORTUNITY":
            return signals.opportunity ? `opportunity:${externalId}` : null;
        case "LIFECYCLE_STAGE":
            return sameText(rule.triggerValue, signals.lifecycleStage) ? `stage:${externalId}:${rule.triggerValue}` : null;
        case "DEAL_STAGE":
            return signals.dealStage?.some((stage) => sameText(rule.triggerValue, stage))
                ? `deal-stage:${externalId}:${rule.triggerValue}`
                : null;
        case "DEAL_WON":
            return signals.dealWon ? `deal-won:${externalId}` : null;
        default:
            return null;
    }
};

// Regras ativas que o evento dispara, cada uma com o transactionId da conversão.
export const matchRules = (rules: ConversionRule[], event: NormalizedSourceEvent): RuleMatch[] =>
    rules.flatMap((rule) => {
        if (!rule.enabled) {
            return [];
        }

        const transactionId = transactionIdFor(rule, event);

        return transactionId ? [{ rule, transactionId: transactionId.slice(0, TRANSACTION_ID_MAX_LENGTH) }] : [];
    });
