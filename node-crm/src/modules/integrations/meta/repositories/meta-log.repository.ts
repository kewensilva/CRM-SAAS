import { prisma } from "../../../../shared/database/prisma-client";
import type {
    MetaIntegrationLog,
    MetaIntegrationLogStatus,
    MetaWebhookPayload,
} from "../types/meta-integration.types";

type CreateLogData = {
    tenantId: string | null;
    leadgenId: string;
    pageId: string | null;
    formId: string | null;
    adId: string | null;
    rawPayload: MetaWebhookPayload;
};

// Cria o registro ANTES de qualquer processamento — é o que garante que nenhum evento
// recebido do webhook seja perdido, mesmo que o processamento subsequente falhe ou lance
// uma exceção não tratada (business-rules.md > Integração Meta Lead Ads).
const createReceived = (data: CreateLogData): Promise<MetaIntegrationLog> => {
    return prisma.metaIntegrationLog.create({
        data: {
            tenantId: data.tenantId,
            leadgenId: data.leadgenId,
            pageId: data.pageId,
            formId: data.formId,
            adId: data.adId,
            rawPayload: JSON.stringify(data.rawPayload),
            status: "RECEIVED",
        },
    });
};

const markProcessed = (id: string, leadId: string): Promise<MetaIntegrationLog> => {
    return prisma.metaIntegrationLog.update({
        where: { id },
        data: { status: "PROCESSED", leadId },
    });
};

const markDuplicate = (id: string, leadId: string | null): Promise<MetaIntegrationLog> => {
    return prisma.metaIntegrationLog.update({
        where: { id },
        data: { status: "DUPLICATE", leadId },
    });
};

const markFailed = (id: string, errorMessage: string): Promise<MetaIntegrationLog> => {
    return prisma.metaIntegrationLog.update({
        where: { id },
        data: { status: "FAILED", errorMessage },
    });
};

const listByTenant = (
    tenantId: string,
    status?: MetaIntegrationLogStatus | undefined,
): Promise<MetaIntegrationLog[]> => {
    return prisma.metaIntegrationLog.findMany({
        where: { tenantId, ...(status ? { status } : {}) },
        orderBy: { createdAt: "desc" },
    });
};

export const metaLogRepository = {
    createReceived,
    markProcessed,
    markDuplicate,
    markFailed,
    listByTenant,
};
