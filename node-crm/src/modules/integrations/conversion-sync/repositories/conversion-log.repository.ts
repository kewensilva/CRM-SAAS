import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import type { HashedUserIdentifier } from "../services/google-ads-data-manager.client";
import type { ConversionUploadStatus, ConversionWebhookStatus } from "../types/conversion-sync.types";

const LIST_LIMIT = 100;
// Violação de unicidade do Prisma — aqui, (ruleId, transactionId) já existe.
const UNIQUE_VIOLATION = "P2002";

export type ConversionUploadRecord = {
    id: string;
    tenantId: string;
    integrationId: string;
    ruleId: string;
    webhookLogId: string;
    externalId: string;
    transactionId: string;
    gclid: string | null;
    hasEmail: boolean;
    hasPhone: boolean;
    userIdentifiers: unknown;
    conversionValue: unknown;
    occurredAt: Date;
    status: ConversionUploadStatus;
    googleRequestId: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type NewConversionUpload = {
    tenantId: string;
    integrationId: string;
    ruleId: string;
    webhookLogId: string;
    externalId: string;
    transactionId: string;
    gclid: string | null;
    userIdentifiers: HashedUserIdentifier[];
    conversionValue: number | null;
    occurredAt: Date;
};

const createWebhookLog = (data: { tenantId: string | null; integrationId: string | null; rawPayload: unknown }) =>
    prisma.conversionWebhookLog.create({
        data: { ...data, rawPayload: (data.rawPayload ?? {}) as Prisma.InputJsonValue },
    });

const markWebhookLog = async (id: string, status: ConversionWebhookStatus, errorMessage: string | null = null) => {
    await prisma.conversionWebhookLog.update({ where: { id }, data: { status, errorMessage } });
};

// null = conversão já registrada antes (mesma regra + transactionId): não envia de novo.
const createUpload = async (data: NewConversionUpload): Promise<ConversionUploadRecord | null> => {
    try {
        return await prisma.conversionUpload.create({
            data: {
                ...data,
                hasEmail: data.userIdentifiers.some((identifier) => "emailAddress" in identifier),
                hasPhone: data.userIdentifiers.some((identifier) => "phoneNumber" in identifier),
                userIdentifiers: data.userIdentifiers as Prisma.InputJsonValue,
            },
        });
    } catch (error) {
        if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
            return null;
        }

        throw error;
    }
};

const markUpload = async (
    id: string,
    data: { status: ConversionUploadStatus; googleRequestId?: string | null; errorMessage?: string | null },
) => {
    await prisma.conversionUpload.update({
        where: { id },
        data: { status: data.status, googleRequestId: data.googleRequestId ?? null, errorMessage: data.errorMessage ?? null },
    });
};

const findWebhookLog = (id: string, integrationId: string) =>
    prisma.conversionWebhookLog.findFirst({ where: { id, integrationId } });

const findUploadByIdAndTenant = (id: string, tenantId: string): Promise<ConversionUploadRecord | null> =>
    prisma.conversionUpload.findFirst({ where: { id, tenantId } });

// Envios + webhooks da conexão, mais recentes primeiro (tela de logs do integrador).
const listUploadsByIntegration = (integrationId: string) =>
    prisma.conversionUpload.findMany({
        where: { integrationId },
        include: { rule: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: LIST_LIMIT,
    });

const listWebhookLogsByIntegration = (integrationId: string) =>
    prisma.conversionWebhookLog.findMany({
        where: { integrationId },
        select: { id: true, status: true, errorMessage: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: LIST_LIMIT,
    });

export const conversionLogRepository = {
    createWebhookLog,
    markWebhookLog,
    findWebhookLog,
    createUpload,
    markUpload,
    findUploadByIdAndTenant,
    listUploadsByIntegration,
    listWebhookLogsByIntegration,
};
