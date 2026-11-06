import { logger } from "../../../../shared/logger/logger";
import type { ConversionUploadRecord } from "../repositories/conversion-log.repository";
import { conversionLogRepository } from "../repositories/conversion-log.repository";
import type { ConversionIntegration, ConversionRule, NormalizedSourceEvent } from "../types/conversion-sync.types";
import type { HashedUserIdentifier } from "./google-ads-data-manager.client";
import { buildUserIdentifiers, googleAdsDataManagerClient } from "./google-ads-data-manager.client";
import type { RuleMatch } from "./rule-matcher";

export type DispatchSummary = { sent: number; failed: number; duplicates: number };

// Envia um registro de envio ao Google Ads e grava o resultado. Nunca lança: a falha fica no
// próprio envio (com o motivo) para aparecer na tela e poder ser reenviada.
export const sendUpload = async (
    upload: ConversionUploadRecord,
    rule: ConversionRule,
    integration: ConversionIntegration,
): Promise<boolean> => {
    try {
        if (!integration.googleAdsCustomerId) {
            throw new Error("Conta Google Ads do cliente não configurada nesta conexão.");
        }

        const { requestId } = await googleAdsDataManagerClient.ingestConversion({
            customerId: integration.googleAdsCustomerId,
            conversionActionId: rule.conversionActionId,
            transactionId: upload.transactionId,
            occurredAt: upload.occurredAt,
            gclid: upload.gclid,
            userIdentifiers: (upload.userIdentifiers ?? []) as HashedUserIdentifier[],
            value: rule.sendValue && upload.conversionValue !== null ? Number(upload.conversionValue) : null,
            currency: integration.currencyCode,
        });

        await conversionLogRepository.markUpload(upload.id, { status: "SENT", googleRequestId: requestId });

        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida ao enviar ao Google Ads.";

        logger.warn({ uploadId: upload.id, error: message }, "[conversion-sync] Conversão não enviada.");
        await conversionLogRepository.markUpload(upload.id, { status: "FAILED", errorMessage: message });

        return false;
    }
};

// Uma conversão por regra disparada. Conversão já registrada antes (mesma regra +
// transactionId) não é enviada de novo — RD e Bitrix repetem o mesmo evento com frequência.
export const dispatchMatches = async (
    integration: ConversionIntegration,
    matches: RuleMatch[],
    event: NormalizedSourceEvent,
    webhookLogId: string,
): Promise<DispatchSummary> => {
    const summary: DispatchSummary = { sent: 0, failed: 0, duplicates: 0 };
    const userIdentifiers = buildUserIdentifiers(event.email, event.phone);

    for (const { rule, transactionId } of matches) {
        const upload = await conversionLogRepository.createUpload({
            tenantId: integration.tenantId,
            integrationId: integration.id,
            ruleId: rule.id,
            webhookLogId,
            externalId: event.externalId,
            transactionId,
            gclid: event.gclid,
            userIdentifiers,
            conversionValue: event.value,
            occurredAt: event.occurredAt,
        });

        if (!upload) {
            summary.duplicates += 1;
            continue;
        }

        if (await sendUpload(upload, rule, integration)) {
            summary.sent += 1;
        } else {
            summary.failed += 1;
        }
    }

    return summary;
};
