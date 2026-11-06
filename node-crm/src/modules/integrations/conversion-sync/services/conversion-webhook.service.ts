import { AuthenticationError, BusinessRuleError, NotFoundError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";
import { conversionIntegrationRepository } from "../repositories/conversion-integration.repository";
import { conversionLogRepository } from "../repositories/conversion-log.repository";
import { conversionRuleRepository } from "../repositories/conversion-rule.repository";
import type { ConversionIntegration, ConversionWebhookStatus } from "../types/conversion-sync.types";
import { dispatchMatches } from "./conversion-dispatch.service";
import { matchRules } from "./rule-matcher";
import { isWebhookAuthentic, resolveSourceEvent } from "./source-event.service";

type Headers = Record<string, string | undefined>;

// Processa um webhook já registrado e autenticado. Pode ser chamado de novo (reprocessar):
// envios já registrados não se repetem (único por regra + transactionId).
const processWebhook = async (integration: ConversionIntegration, logId: string, payload: unknown): Promise<void> => {
    if (!integration.enabled) {
        await conversionLogRepository.markWebhookLog(logId, "IGNORED", "Conexão desativada.");
        return;
    }

    const resolved = await resolveSourceEvent(integration, payload);

    if (!resolved) {
        await conversionLogRepository.markWebhookLog(logId, "IGNORED", "Evento não tratado pelo integrador.");
        return;
    }

    const rules = await conversionRuleRepository.listByIntegrations([integration.id]);
    const matches = matchRules(rules, resolved.event);

    if (matches.length === 0) {
        await conversionLogRepository.markWebhookLog(logId, "IGNORED", "Nenhuma regra disparada por este evento.");
        return;
    }

    const event = resolved.loadContact ? await resolved.loadContact() : resolved.event;
    const summary = await dispatchMatches(integration, matches, event, logId);

    await conversionLogRepository.markWebhookLog(
        logId,
        summary.failed > 0 ? "FAILED" : "PROCESSED",
        `${summary.sent} enviada(s), ${summary.failed} com falha, ${summary.duplicates} já enviada(s) antes.`,
    );
};

// Falha no processamento (API da origem fora do ar, token da origem errado...) fica no log
// como FAILED, com o motivo — e pode ser reprocessada depois de corrigir a configuração.
const processSafely = async (integration: ConversionIntegration, logId: string, payload: unknown): Promise<void> => {
    try {
        await processWebhook(integration, logId, payload);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida no processamento.";

        logger.warn({ webhookLogId: logId, error: message }, "[conversion-sync] Falha ao processar webhook.");
        await conversionLogRepository.markWebhookLog(logId, "FAILED", message);
    }
};

// Recebe o webhook: grava o log ANTES de qualquer processamento (nada é descartado sem
// registro), confere o segredo da origem e processa em segundo plano — RD Station CRM exige
// resposta em até 5 s e o processamento chama APIs externas.
const receive = async (webhookToken: string, payload: unknown, headers: Headers): Promise<void> => {
    const integration = await conversionIntegrationRepository.findByWebhookToken(webhookToken);
    const log = await conversionLogRepository.createWebhookLog({
        tenantId: integration?.tenantId ?? null,
        integrationId: integration?.id ?? null,
        rawPayload: payload,
    });

    if (!integration) {
        await conversionLogRepository.markWebhookLog(log.id, "FAILED", "Token de webhook não corresponde a nenhuma conexão.");
        throw new NotFoundError("Webhook não encontrado.");
    }

    if (!isWebhookAuthentic(integration, payload, headers)) {
        await conversionLogRepository.markWebhookLog(log.id, "REJECTED", "Webhook com token de verificação inválido.");
        throw new AuthenticationError("Token de verificação do webhook inválido.");
    }

    setImmediate(() => {
        void processSafely(integration, log.id, payload);
    });
};

// "Reprocessar" na tela de logs: só webhooks que falharam (nunca os rejeitados na verificação).
const reprocess = async (tenantId: string, integrationId: string, logId: string): Promise<{ status: ConversionWebhookStatus }> => {
    const integration = await conversionIntegrationRepository.findByIdAndTenant(integrationId, tenantId);
    const log = await conversionLogRepository.findWebhookLog(logId, integrationId);

    if (!integration || !log) {
        throw new NotFoundError("Webhook não encontrado.");
    }

    if (log.status !== "FAILED") {
        throw new BusinessRuleError("Só é possível reprocessar webhooks que falharam.");
    }

    await processSafely(integration, log.id, log.rawPayload);

    const updated = await conversionLogRepository.findWebhookLog(logId, integrationId);

    return { status: updated?.status ?? "FAILED" };
};

export const conversionWebhookService = {
    receive,
    reprocess,
};
