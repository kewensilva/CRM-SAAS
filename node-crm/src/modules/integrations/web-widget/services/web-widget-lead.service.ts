import { leadRepository } from "../../../leads/repositories/lead.repository";
import { webWidgetIntegrationRepository } from "../repositories/web-widget-integration.repository";
import { webWidgetLogRepository } from "../repositories/web-widget-log.repository";
import type { WebWidgetSubmissionPayload } from "../types/web-widget-integration.types";

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
        message: payload.message ?? null,
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

    const lead = await leadRepository.create({
        tenantId: integration.tenantId,
        responsibleUserId: integration.defaultResponsibleUserId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
    });

    await webWidgetLogRepository.markProcessed(log.id, lead.id);
};

export const webWidgetLeadService = {
    processSubmission,
};
