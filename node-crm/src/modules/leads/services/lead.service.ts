import { NotFoundError } from "../../../shared/errors";
import { companyRepository } from "../../companies/repositories/company.repository";
import type { CreateLeadDTO } from "../dto/create-lead.dto";
import { leadRepository } from "../repositories/lead.repository";
import type { Lead } from "../types/lead.types";

const createLead = async (data: CreateLeadDTO): Promise<Lead> => {
    if (data.companyId) {
        const company = await companyRepository.findByIdAndTenant(data.companyId, data.tenantId);

        if (!company) {
            throw new NotFoundError("Empresa não encontrada.");
        }
    }

    return leadRepository.create(data);
};

const listLeadsByTenant = (tenantId: string): Promise<Lead[]> => {
    return leadRepository.listByTenant(tenantId);
};

export const leadService = {
    createLead,
    listLeadsByTenant,
};
