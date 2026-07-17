import { NotFoundError, ValidationError } from "../../../../shared/errors";
import { userRepository } from "../../../users/repositories/user.repository";
import type { UpdateMetaIntegrationDTO } from "../dto/update-meta-integration.dto";
import { metaIntegrationRepository } from "../repositories/meta-integration.repository";
import type { MetaIntegration } from "../types/meta-integration.types";

const getByTenant = async (tenantId: string): Promise<MetaIntegration> => {
    const integration = await metaIntegrationRepository.findByTenant(tenantId);

    if (!integration) {
        throw new NotFoundError("Integração Meta Lead Ads ainda não configurada para este tenant.");
    }

    return integration;
};

const updateByTenant = async (
    tenantId: string,
    data: UpdateMetaIntegrationDTO,
): Promise<MetaIntegration> => {
    if (data.defaultResponsibleUserId) {
        const responsible = await userRepository.findById(data.defaultResponsibleUserId);

        if (!responsible || responsible.tenantId !== tenantId || responsible.status !== "ACTIVE") {
            throw new NotFoundError("Usuário responsável padrão não encontrado.");
        }
    }

    if (data.enabled) {
        const current = await metaIntegrationRepository.findByTenant(tenantId);
        const pageId = data.pageId ?? current?.pageId;
        const pageAccessToken = data.pageAccessToken ?? current?.pageAccessToken;
        const defaultResponsibleUserId = data.defaultResponsibleUserId ?? current?.defaultResponsibleUserId;

        if (!pageId || !pageAccessToken || !defaultResponsibleUserId) {
            throw new ValidationError(
                "Para habilitar a integração é preciso informar pageId, pageAccessToken e defaultResponsibleUserId.",
            );
        }
    }

    return metaIntegrationRepository.upsertByTenant(tenantId, data);
};

export const metaIntegrationService = {
    getByTenant,
    updateByTenant,
};
