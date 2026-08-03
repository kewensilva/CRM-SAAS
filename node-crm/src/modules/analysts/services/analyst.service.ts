import { hashPassword } from "../../../shared/auth/password";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { CreateAnalystDTO } from "../dto/create-analyst.dto";
import { analystRepository } from "../repositories/analyst.repository";
import type { AnalystWithAccess } from "../types/analyst.types";

const assertTenantsExist = async (tenantIds: string[]): Promise<void> => {
    const results = await Promise.all(tenantIds.map((id) => tenantRepository.findById(id)));

    if (results.some((tenant) => !tenant)) {
        throw new ValidationError("Uma ou mais empresas selecionadas não existem.");
    }
};

const createAnalyst = async (data: CreateAnalystDTO): Promise<AnalystWithAccess> => {
    const existing = await userRepository.findByTenantAndEmail(null, data.email);

    if (existing) {
        throw new ConflictError("Já existe um usuário com este e-mail.");
    }

    await assertTenantsExist(data.tenantIds);

    const passwordHash = await hashPassword(data.password);

    return analystRepository.createWithAccess({
        name: data.name,
        email: data.email,
        passwordHash,
        tenantIds: data.tenantIds,
    });
};

const listAnalysts = (): Promise<AnalystWithAccess[]> => {
    return analystRepository.listAnalysts();
};

const replaceAccess = async (analystId: string, tenantIds: string[]): Promise<AnalystWithAccess> => {
    const analyst = await analystRepository.findByIdWithAccess(analystId);

    if (!analyst) {
        throw new NotFoundError("Analista não encontrado.");
    }

    await assertTenantsExist(tenantIds);
    await analystRepository.replaceAccess(analystId, tenantIds);

    return analystRepository.findByIdWithAccess(analystId) as Promise<AnalystWithAccess>;
};

const deleteAnalyst = async (analystId: string): Promise<void> => {
    const analyst = await analystRepository.findByIdWithAccess(analystId);

    if (!analyst) {
        throw new NotFoundError("Analista não encontrado.");
    }

    await analystRepository.softDelete(analystId);
};

export const analystService = {
    createAnalyst,
    listAnalysts,
    replaceAccess,
    deleteAnalyst,
};
