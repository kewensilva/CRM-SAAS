import { NotFoundError, ValidationError } from "../../../../shared/errors";
import { userRepository } from "../../../users/repositories/user.repository";
import type { UpdateWebWidgetIntegrationDTO } from "../dto/update-web-widget-integration.dto";
import { webWidgetIntegrationRepository } from "../repositories/web-widget-integration.repository";
import type { WebWidgetIntegration } from "../types/web-widget-integration.types";

const getByTenant = async (tenantId: string): Promise<WebWidgetIntegration> => {
    const integration = await webWidgetIntegrationRepository.findByTenant(tenantId);

    if (!integration) {
        throw new NotFoundError("Widget de captura de Leads ainda não configurado para este tenant.");
    }

    return integration;
};

const updateByTenant = async (
    tenantId: string,
    data: UpdateWebWidgetIntegrationDTO,
): Promise<WebWidgetIntegration> => {
    if (data.defaultResponsibleUserId) {
        const responsible = await userRepository.findById(data.defaultResponsibleUserId);

        if (!responsible || responsible.tenantId !== tenantId || responsible.status !== "ACTIVE") {
            throw new NotFoundError("Usuário responsável padrão não encontrado.");
        }
    }

    if (data.enabled) {
        const current = await webWidgetIntegrationRepository.findByTenant(tenantId);
        const defaultResponsibleUserId = data.defaultResponsibleUserId ?? current?.defaultResponsibleUserId;

        if (!defaultResponsibleUserId) {
            throw new ValidationError(
                "Para habilitar o widget é preciso informar defaultResponsibleUserId.",
            );
        }
    }

    return webWidgetIntegrationRepository.upsertByTenant(tenantId, data);
};

const regenerateKey = async (tenantId: string): Promise<WebWidgetIntegration> => {
    const integration = await webWidgetIntegrationRepository.findByTenant(tenantId);

    if (!integration) {
        throw new NotFoundError("Widget de captura de Leads ainda não configurado para este tenant.");
    }

    return webWidgetIntegrationRepository.regenerateKey(tenantId);
};

export const webWidgetConfigService = {
    getByTenant,
    updateByTenant,
    regenerateKey,
};
