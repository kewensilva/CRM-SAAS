import { prisma } from "../../../../shared/database/prisma-client";
import type { WebWidgetLog, WebWidgetLogStatus, WebWidgetSubmissionPayload } from "../types/web-widget-integration.types";

type CreateLogData = {
    tenantId: string | null;
    pageUrl: string | null;
    referrer: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    message: string | null;
    rawPayload: WebWidgetSubmissionPayload;
};

// Cria o log ANTES de qualquer processamento — "nenhum Lead deverá ser descartado sem
// registro" (mesmo princípio de business-rules.md > Integração Meta Lead Ads), aplicado
// também a uma publicKey inválida/rotacionada.
const createReceived = (data: CreateLogData): Promise<WebWidgetLog> => {
    return prisma.webWidgetLog.create({
        data: {
            tenantId: data.tenantId,
            pageUrl: data.pageUrl,
            referrer: data.referrer,
            utmSource: data.utmSource,
            utmMedium: data.utmMedium,
            utmCampaign: data.utmCampaign,
            utmTerm: data.utmTerm,
            utmContent: data.utmContent,
            message: data.message,
            rawPayload: JSON.stringify(data.rawPayload),
            status: "RECEIVED",
        },
    });
};

const markProcessed = (id: string, leadId: string): Promise<WebWidgetLog> => {
    return prisma.webWidgetLog.update({
        where: { id },
        data: { status: "PROCESSED", leadId },
    });
};

const markDuplicate = (id: string, leadId: string | null): Promise<WebWidgetLog> => {
    return prisma.webWidgetLog.update({
        where: { id },
        data: { status: "DUPLICATE", leadId },
    });
};

const markFailed = (id: string, errorMessage: string): Promise<WebWidgetLog> => {
    return prisma.webWidgetLog.update({
        where: { id },
        data: { status: "FAILED", errorMessage },
    });
};

const listByTenant = (
    tenantId: string,
    status?: WebWidgetLogStatus | undefined,
): Promise<WebWidgetLog[]> => {
    return prisma.webWidgetLog.findMany({
        where: { tenantId, ...(status ? { status } : {}) },
        orderBy: { createdAt: "desc" },
    });
};

export const webWidgetLogRepository = {
    createReceived,
    markProcessed,
    markDuplicate,
    markFailed,
    listByTenant,
};
