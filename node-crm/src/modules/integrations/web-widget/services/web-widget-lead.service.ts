import { leadRepository } from "../../../leads/repositories/lead.repository";
import { webWidgetIntegrationRepository } from "../repositories/web-widget-integration.repository";
import { webWidgetLogRepository } from "../repositories/web-widget-log.repository";
import type {
    WebWidgetIntegration,
    WebWidgetSubmissionPayload,
} from "../types/web-widget-integration.types";

// Junta as respostas dos campos de mensagem parametrizados num texto único, pra manter o
// log num só campo de texto (WebWidgetLog.message) — usa o label configurado quando
// encontra a config do tenant (widget habilitado com essa publicKey); cai pra chave crua
// como fallback (ex.: publicKey desabilitada/inválida, integration null aqui).
const formatMessageAnswers = (
    answers: Record<string, string> | undefined,
    integration: WebWidgetIntegration | null,
): string | null => {
    if (!answers) {
        return null;
    }

    const entries = Object.entries(answers).filter(([, value]) => value.trim().length > 0);

    if (entries.length === 0) {
        return null;
    }

    const labelByKey = new Map(integration?.messageFields.map((field) => [field.key, field.label]) ?? []);

    return entries.map(([key, value]) => `${labelByKey.get(key) ?? key}: ${value}`).join(" | ");
};

// Processa uma submissão do widget público. Nunca lança — toda falha vira um WebWidgetLog
// com status FAILED em vez de derrubar a requisição, mesmo princípio de
// business-rules.md > Integração Meta Lead Ads ("nenhum Lead deverá ser descartado sem
// registro") aplicado aqui a uma origem de Lead diferente.
const processSubmission = async (payload: WebWidgetSubmissionPayload): Promise<void> => {
    const integration = await webWidgetIntegrationRepository.findByPublicKey(payload.publicKey);

    const log = await webWidgetLogRepository.createReceived({
        tenantId: integration?.tenantId ?? null,
        pageUrl: payload.pageUrl ?? null,
        referrer: payload.referrer ?? null,
        utmSource: payload.utmSource ?? null,
        utmMedium: payload.utmMedium ?? null,
        utmCampaign: payload.utmCampaign ?? null,
        utmTerm: payload.utmTerm ?? null,
        utmContent: payload.utmContent ?? null,
        message: formatMessageAnswers(payload.messageAnswers, integration),
        rawPayload: payload,
    });

    // Honeypot: campo oculto que só um bot preencheria. Registra e descarta silenciosamente
    // — não deve revelar ao chamador que a submissão foi identificada como spam.
    if (payload.website) {
        await webWidgetLogRepository.markFailed(log.id, "Spam detectado (honeypot preenchido).");

        return;
    }

    if (!integration) {
        await webWidgetLogRepository.markFailed(
            log.id,
            "Nenhum widget habilitado encontrado para a chave pública informada.",
        );

        return;
    }

    if (!integration.defaultResponsibleUserId) {
        await webWidgetLogRepository.markFailed(
            log.id,
            "Widget habilitado, mas incompleto: falta defaultResponsibleUserId.",
        );

        return;
    }

    const existingLead = payload.email
        ? await leadRepository.findByTenantAndEmail(integration.tenantId, payload.email)
        : null;

    if (existingLead) {
        if (integration.duplicateStrategy === "UPDATE") {
            await leadRepository.updateContactInfo(existingLead.id, {
                name: payload.name,
                ...(payload.email ? { email: payload.email } : {}),
                ...(payload.phone ? { phone: payload.phone } : {}),
            });
        }

        await webWidgetLogRepository.markDuplicate(log.id, existingLead.id);

        return;
    }

    // changedByUserId nulo: lead criado pela integração, sem usuário autenticado por trás.
    const lead = await leadRepository.create(
        {
            tenantId: integration.tenantId,
            responsibleUserId: integration.defaultResponsibleUserId,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            utmSource: payload.utmSource,
            utmMedium: payload.utmMedium,
            utmCampaign: payload.utmCampaign,
            utmTerm: payload.utmTerm,
            utmContent: payload.utmContent,
        },
        null,
    );

    await webWidgetLogRepository.markProcessed(log.id, lead.id);
};

export const webWidgetLeadService = {
    processSubmission,
};
