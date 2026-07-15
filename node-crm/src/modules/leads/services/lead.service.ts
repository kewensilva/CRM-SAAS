import type { CreateLeadDTO } from "../dto/create-lead.dto";
import { leadRepository } from "../repositories/lead.repository";
import type { Lead } from "../types/lead.types";

const createLead = (data: CreateLeadDTO): Promise<Lead> => {
    return leadRepository.create(data);
};

const listLeadsByTenant = (tenantId: string): Promise<Lead[]> => {
    return leadRepository.listByTenant(tenantId);
};

export const leadService = {
    createLead,
    listLeadsByTenant,
};
