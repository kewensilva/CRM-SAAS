import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { UpdateWidgetDTO } from "../dto/update-widget.dto";
import type { TenantWidget } from "../types/widget.types";

const findByTenant = (tenantId: string): Promise<TenantWidget | null> => {
    return prisma.tenantWidget.findFirst({
        where: { tenantId, deletedAt: null },
    });
};

// Upsert: o registro só nasce quando o Owner configura algo pela 1ª vez, mesmo padrão de
// meta-integration.repository.ts — nem todo Tenant vai ter o widget habilitado.
const upsertByTenant = (tenantId: string, data: UpdateWidgetDTO): Promise<TenantWidget> => {
    const updateData = stripUndefined(data) as unknown as Prisma.TenantWidgetUpdateInput;
    const createData = {
        tenantId,
        ...stripUndefined(data),
    } as unknown as Prisma.TenantWidgetUncheckedCreateInput;

    return prisma.tenantWidget.upsert({
        where: { tenantId },
        update: updateData,
        create: createData,
    });
};

export const widgetRepository = {
    findByTenant,
    upsertByTenant,
};
