import { ValidationError } from "../../../../shared/errors";
import type { ConversionSource, ConversionTrigger } from "../types/conversion-sync.types";

// Gatilhos que cada origem consegue informar (ver parsers em services/sources).
const TRIGGERS_BY_SOURCE: Record<ConversionSource, ConversionTrigger[]> = {
    RD_STATION_MARKETING: ["NEW_CONVERSION", "OPPORTUNITY", "LIFECYCLE_STAGE"],
    RD_STATION_CRM: ["DEAL_STAGE", "DEAL_WON"],
    BITRIX24: ["DEAL_STAGE", "DEAL_WON"],
};

// Etapa/estágio precisa dizer qual; oportunidade e ganho não têm valor a escolher.
const VALUE_REQUIRED: ConversionTrigger[] = ["LIFECYCLE_STAGE", "DEAL_STAGE"];
const VALUE_NOT_ALLOWED: ConversionTrigger[] = ["OPPORTUNITY", "DEAL_WON"];
// Só negócios têm valor (R$) para mandar ao Google Ads.
const SOURCES_WITH_VALUE: ConversionSource[] = ["RD_STATION_CRM", "BITRIX24"];

export const assertRuleFitsSource = (
    source: ConversionSource,
    rule: { trigger: ConversionTrigger; triggerValue: string | null; sendValue: boolean },
): void => {
    const errors: { field: string; message: string }[] = [];

    if (!TRIGGERS_BY_SOURCE[source].includes(rule.trigger)) {
        errors.push({ field: "trigger", message: "Este gatilho não existe para a origem desta conexão." });
    }

    if (VALUE_REQUIRED.includes(rule.trigger) && !rule.triggerValue) {
        errors.push({ field: "triggerValue", message: "Informe a etapa/estágio que dispara a regra." });
    }

    if (VALUE_NOT_ALLOWED.includes(rule.trigger) && rule.triggerValue) {
        errors.push({ field: "triggerValue", message: "Este gatilho não usa etapa/estágio." });
    }

    if (rule.sendValue && !SOURCES_WITH_VALUE.includes(source)) {
        errors.push({ field: "sendValue", message: "RD Station Marketing não informa valor de venda." });
    }

    if (errors.length > 0) {
        throw new ValidationError("Regra inválida para esta origem.", errors);
    }
};
