import { hashPassword } from "../../../shared/auth/password";
import { ConflictError } from "../../../shared/errors";
import type { CreateTenantDTO } from "../dto/create-tenant.dto";
import { tenantRepository } from "../repositories/tenant.repository";
import type { Tenant } from "../types/tenant.types";

const createTenant = async (data: CreateTenantDTO): Promise<Tenant> => {
    const existingTenant = await tenantRepository.findByDomain(data.domain);

    if (existingTenant) {
        throw new ConflictError("Já existe um tenant com este domínio.");
    }

    const passwordHash = await hashPassword(data.adminPassword);

    return tenantRepository.create(
        { name: data.name, tradeName: data.tradeName, domain: data.domain },
        { name: data.adminName, email: data.adminEmail, passwordHash },
    );
};

const listTenants = (): Promise<Tenant[]> => {
    return tenantRepository.list();
};

export const tenantService = {
    createTenant,
    listTenants,
};
