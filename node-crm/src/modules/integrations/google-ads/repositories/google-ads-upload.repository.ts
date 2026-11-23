import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import type { GoogleAdsConversionUpload } from "../types/google-ads.types";

type CreateUploadData = {
    tenantId: string;
    connectionId: string;
    ruleId: string;
    leadId: string;
    gclid: string | null;
    hasEmail: boolean;
    hasPhone: boolean;
    userIdentifiers: unknown;
    conversionValue: number | null;
    occurredAt: Date;
};

const UNIQUE_VIOLATION = "P2002";
const HISTORY_LIMIT = 50;

// null = já existe envio desta regra para este Lead ((ruleId, leadId) único): a mesma
// conversão nunca sai duas vezes, mesmo que o Lead volte ao mesmo status.
const createPending = async (data: CreateUploadData): Promise<GoogleAdsConversionUpload | null> => {
    try {
        return await prisma.googleAdsConversionUpload.create({
            data: {
                ...data,
                userIdentifiers: data.userIdentifiers as Prisma.InputJsonValue,
                conversionValue: data.conversionValue,
            },
        });
    } catch (error) {
        if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
            return null;
        }

        throw error;
    }
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<GoogleAdsConversionUpload | null> =>
    prisma.googleAdsConversionUpload.findFirst({ where: { id, tenantId } });

const markSent = (id: string, googleRequestId: string | null): Promise<GoogleAdsConversionUpload> =>
    prisma.googleAdsConversionUpload.update({
        where: { id },
        data: { status: "SENT", googleRequestId, errorMessage: null },
    });

const markFailed = (id: string, errorMessage: string): Promise<GoogleAdsConversionUpload> =>
    prisma.googleAdsConversionUpload.update({ where: { id }, data: { status: "FAILED", errorMessage } });

// Histórico na tela: últimos envios, com o nome do Lead.
const listRecent = (tenantId: string, ruleId?: string) =>
    prisma.googleAdsConversionUpload.findMany({
        where: { tenantId, ...(ruleId ? { ruleId } : {}) },
        orderBy: { createdAt: "desc" },
        take: HISTORY_LIMIT,
        include: { lead: { select: { name: true } }, rule: { select: { name: true } } },
    });

export const googleAdsUploadRepository = { createPending, findByIdAndTenant, markSent, markFailed, listRecent };
