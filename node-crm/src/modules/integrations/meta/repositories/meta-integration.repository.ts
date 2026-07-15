import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import { stripUndefined } from "../../../../shared/helpers/nullable-fields";
import type { UpdateMetaIntegrationDTO } from "../dto/update-meta-integration.dto";
import type { MetaIntegration } from "../types/meta-integration.types";

const findByTenant = (tenantId: string): Promise<MetaIntegration | null> => {
    return prisma.metaIntegration.findFirst({
        where: { tenantId, deletedAt: null },
    });
};

const findByPageId = (pageId: string): Promise<MetaIntegration | null> => {
    return prisma.metaIntegration.findFirst({
        where: { pageId, enabled: true, deletedAt: null },
    });
};

// Upsert: a integração nasce desabilitada e sem página vinculada assim que o Tenant é
// criado seria complexidade sem uso real (nem todo Tenant vai usar Meta Lead Ads) — em vez
// disso o registro só é criado na primeira vez que o Tenant Admin configura algo.
const upsertByTenant = (tenantId: string, data: UpdateMetaIntegrationDTO): Promise<MetaIntegration> => {
    const updateData = stripUndefined(data) as unknown as Prisma.MetaIntegrationUpdateInput;
    const createData = {
        tenantId,
        ...stripUndefined(data),
    } as unknown as Prisma.MetaIntegrationUncheckedCreateInput;

    return prisma.metaIntegration.upsert({
        where: { tenantId },
        update: updateData,
        create: createData,
    });
};

export const metaIntegrationRepository = {
    findByTenant,
    findByPageId,
    upsertByTenant,
};
