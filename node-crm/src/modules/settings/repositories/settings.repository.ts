import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { UpdateSettingsDTO } from "../dto/update-settings.dto";
import type { Settings } from "../types/settings.types";

const findByTenant = (tenantId: string): Promise<Settings | null> => {
    return prisma.settings.findFirst({
        where: { tenantId, deletedAt: null },
    });
};

const updateByTenant = (tenantId: string, data: UpdateSettingsDTO): Promise<Settings> => {
    const updateData = stripUndefined(data) as unknown as Prisma.SettingsUpdateInput;

    return prisma.settings.update({
        where: { tenantId },
        data: updateData,
    });
};

export const settingsRepository = {
    findByTenant,
    updateByTenant,
};
