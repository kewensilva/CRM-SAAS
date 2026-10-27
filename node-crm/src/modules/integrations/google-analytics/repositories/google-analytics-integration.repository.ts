import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import { stripUndefined } from "../../../../shared/helpers/nullable-fields";
import type { UpdateGoogleAnalyticsIntegrationDTO } from "../dto/update-google-analytics-integration.dto";
import type { GoogleAnalyticsIntegration } from "../types/google-analytics.types";

const findByTenant = (tenantId: string): Promise<GoogleAnalyticsIntegration | null> => {
    return prisma.googleAnalyticsIntegration.findFirst({
        where: { tenantId, deletedAt: null },
    });
};

// Mesmo padrão da integração Meta: o registro só nasce na primeira vez que o tenant
// configura algo — nem todo cliente usa Google Analytics.
const upsertByTenant = (
    tenantId: string,
    data: UpdateGoogleAnalyticsIntegrationDTO,
): Promise<GoogleAnalyticsIntegration> => {
    const values = stripUndefined(data);

    return prisma.googleAnalyticsIntegration.upsert({
        where: { tenantId },
        update: values as Prisma.GoogleAnalyticsIntegrationUpdateInput,
        create: { tenantId, ...values } as Prisma.GoogleAnalyticsIntegrationUncheckedCreateInput,
    });
};

export const googleAnalyticsIntegrationRepository = {
    findByTenant,
    upsertByTenant,
};
