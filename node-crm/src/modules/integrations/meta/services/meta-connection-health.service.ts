import { IntegrationError, NotFoundError } from "../../../../shared/errors";
import { metaIntegrationRepository } from "../repositories/meta-integration.repository";
import { metaLogRepository } from "../repositories/meta-log.repository";
import type { MetaIntegrationLogStatus } from "../types/meta-integration.types";
import { metaGraphApiClient } from "./meta-graph-api.client";
import type { MetaInstagramAccount, MetaLeadForm } from "./meta-page-assets.client";
import { metaPageAssetsClient } from "./meta-page-assets.client";

// Cada verificação é independente: uma falha (ex.: permissão que a Meta não liberou) vira a
// mensagem daquele item, sem esconder o resultado dos outros.
type Check<T> = { value: T; error: null } | { value: null; error: string };

export type MetaConnectionHealth = {
    connected: boolean;
    page: { id: string; name: string | null } | null;
    instagram: Check<MetaInstagramAccount | null>;
    webhookSubscribed: Check<boolean>;
    forms: Check<MetaLeadForm[]>;
    hasDefaultResponsible: boolean;
    enabled: boolean;
    lastLead: { receivedAt: Date; status: MetaIntegrationLogStatus } | null;
};

const toCheck = <T>(result: PromiseSettledResult<T>): Check<T> =>
    result.status === "fulfilled"
        ? { value: result.value, error: null }
        : { value: null, error: result.reason instanceof Error ? result.reason.message : "Falha ao consultar a Meta." };

const NOT_CHECKED: Check<never> = { value: null, error: "Página não conectada." };

const getHealth = async (tenantId: string): Promise<MetaConnectionHealth> => {
    const integration = await metaIntegrationRepository.findByTenant(tenantId);
    const lastLog = await metaLogRepository.findLatestByTenant(tenantId);
    const lastLead = lastLog ? { receivedAt: lastLog.createdAt, status: lastLog.status } : null;
    const base = {
        hasDefaultResponsible: Boolean(integration?.defaultResponsibleUserId),
        enabled: Boolean(integration?.enabled),
        lastLead,
    };

    if (!integration?.pageId || !integration.pageAccessToken) {
        return { ...base, connected: false, page: null, instagram: NOT_CHECKED, webhookSubscribed: NOT_CHECKED, forms: NOT_CHECKED };
    }

    const { pageId, pageAccessToken } = integration;
    const [instagram, webhookSubscribed, forms] = await Promise.allSettled([
        metaPageAssetsClient.fetchInstagramAccount(pageId, pageAccessToken),
        metaPageAssetsClient.isSubscribedToLeadgen(pageId, pageAccessToken),
        metaPageAssetsClient.listLeadForms(pageId, pageAccessToken),
    ]);

    return {
        ...base,
        connected: true,
        page: { id: pageId, name: integration.pageName },
        instagram: toCheck(instagram),
        webhookSubscribed: toCheck(webhookSubscribed),
        forms: toCheck(forms),
    };
};

// Refaz a assinatura do webhook da Página conectada — o conserto quando o status mostra
// que a Meta parou de avisar o CRM (ex.: alguém removeu o app nas configurações da Página).
const resubscribe = async (tenantId: string): Promise<void> => {
    const integration = await metaIntegrationRepository.findByTenant(tenantId);

    if (!integration?.pageId || !integration.pageAccessToken) {
        throw new NotFoundError("Nenhuma Página conectada. Clique em \"Conectar com o Facebook\".");
    }

    const result = await metaGraphApiClient.subscribePageToLeadgen(integration.pageId, integration.pageAccessToken);

    if (!result.success) {
        throw new IntegrationError("A Meta não confirmou a assinatura da Página no webhook.");
    }
};

export const metaConnectionHealthService = { getHealth, resubscribe };
