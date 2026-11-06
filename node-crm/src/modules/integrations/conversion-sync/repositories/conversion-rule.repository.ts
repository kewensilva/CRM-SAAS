import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import { stripUndefined } from "../../../../shared/helpers/nullable-fields";
import type { CreateConversionRuleDTO, SaveConversionRuleDTO } from "../dto/conversion-rule.dto";
import type { ConversionRule } from "../types/conversion-sync.types";

const create = (tenantId: string, integrationId: string, data: CreateConversionRuleDTO): Promise<ConversionRule> =>
    prisma.conversionRule.create({
        data: { tenantId, integrationId, ...stripUndefined(data) } as Prisma.ConversionRuleUncheckedCreateInput,
    });

const update = (id: string, data: SaveConversionRuleDTO): Promise<ConversionRule> =>
    prisma.conversionRule.update({ where: { id }, data: stripUndefined(data) as Prisma.ConversionRuleUpdateInput });

const softDelete = async (id: string): Promise<void> => {
    await prisma.conversionRule.update({ where: { id }, data: { deletedAt: new Date(), enabled: false } });
};

const findByIdAndIntegration = (id: string, integrationId: string): Promise<ConversionRule | null> =>
    prisma.conversionRule.findFirst({ where: { id, integrationId, deletedAt: null } });

const listByIntegrations = (integrationIds: string[]): Promise<ConversionRule[]> =>
    prisma.conversionRule.findMany({
        where: { integrationId: { in: integrationIds }, deletedAt: null },
        orderBy: { createdAt: "asc" },
    });

export const conversionRuleRepository = {
    create,
    update,
    softDelete,
    findByIdAndIntegration,
    listByIntegrations,
};
