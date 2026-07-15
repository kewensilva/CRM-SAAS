import { NotFoundError } from "../../../shared/errors";
import type { UpdateSettingsDTO } from "../dto/update-settings.dto";
import { settingsRepository } from "../repositories/settings.repository";
import type { Settings } from "../types/settings.types";

const getByTenant = async (tenantId: string): Promise<Settings> => {
    const settings = await settingsRepository.findByTenant(tenantId);

    if (!settings) {
        throw new NotFoundError("Configurações não encontradas para este tenant.");
    }

    return settings;
};

const updateByTenant = async (tenantId: string, data: UpdateSettingsDTO): Promise<Settings> => {
    await getByTenant(tenantId);

    return settingsRepository.updateByTenant(tenantId, data);
};

export const settingsService = {
    getByTenant,
    updateByTenant,
};
