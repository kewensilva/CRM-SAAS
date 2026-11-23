import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import type { SaveGoogleAdsRuleDTO, UpdateGoogleAdsRuleDTO } from "../dto/google-ads.dto";
import type { GoogleAdsConversionRule, GoogleAdsConversionTrigger } from "../types/google-ads.types";

const listByTenant = (tenantId: string): Promise<GoogleAdsConversionRule[]> =>
    prisma.googleAdsConversionRule.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: "asc" } });

const findByIdAndTenant = (id: string, tenantId: string): Promise<GoogleAdsConversionRule | null> =>
    prisma.googleAdsConversionRule.findFirst({ where: { id, tenantId, deletedAt: null } });

// Regras ligadas para um momento do Lead — o filtro de Origem é aplicado por quem chama.
const listEnabledByTrigger = (tenantId: string, trigger: GoogleAdsConversionTrigger): Promise<GoogleAdsConversionRule[]> =>
    prisma.googleAdsConversionRule.findMany({ where: { tenantId, trigger, enabled: true, deletedAt: null } });

const create = (tenantId: string, connectionId: string, data: SaveGoogleAdsRuleDTO): Promise<GoogleAdsConversionRule> =>
    prisma.googleAdsConversionRule.create({
        data: {
            tenantId,
            connectionId,
            name: data.name,
            trigger: data.trigger,
            originFilter: data.originFilter,
            conversionActionId: data.conversionActionId,
            conversionActionName: data.conversionActionName ?? null,
            sendValue: data.sendValue,
            enabled: data.enabled ?? true,
        },
    });

const update = (id: string, data: UpdateGoogleAdsRuleDTO): Promise<GoogleAdsConversionRule> => {
    const changes = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

    return prisma.googleAdsConversionRule.update({
        where: { id },
        data: changes as Prisma.GoogleAdsConversionRuleUpdateInput,
    });
};

const softDelete = (id: string): Promise<GoogleAdsConversionRule> =>
    prisma.googleAdsConversionRule.update({ where: { id }, data: { deletedAt: new Date(), enabled: false } });

export const googleAdsRuleRepository = {
    listByTenant,
    findByIdAndTenant,
    listEnabledByTrigger,
    create,
    update,
    softDelete,
};
