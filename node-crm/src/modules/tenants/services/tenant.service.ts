import { hashPassword } from "../../../shared/auth/password";
import { ConflictError, NotFoundError } from "../../../shared/errors";
import type { CreateTenantDTO } from "../dto/create-tenant.dto";
import type { UpdateTenantDTO } from "../dto/update-tenant.dto";
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

const getTenant = async (id: string): Promise<Tenant> => {
    const tenant = await tenantRepository.findById(id);

    if (!tenant) {
        throw new NotFoundError("Tenant não encontrado.");
    }

    return tenant;
};

const listTenants = (): Promise<Tenant[]> => {
    return tenantRepository.list();
};

const updateTenant = async (id: string, data: UpdateTenantDTO): Promise<Tenant> => {
    await getTenant(id);

    if (data.domain) {
        const existingTenant = await tenantRepository.findByDomain(data.domain);

        if (existingTenant && existingTenant.id !== id) {
            throw new ConflictError("Já existe um tenant com este domínio.");
        }
    }

    return tenantRepository.update(id, data);
};

const deleteTenant = async (id: string): Promise<void> => {
    await getTenant(id);
    await tenantRepository.softDelete(id);
};

export const tenantService = {
    createTenant,
    getTenant,
    listTenants,
    updateTenant,
    deleteTenant,
};
