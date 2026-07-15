import type { CreateLeadDTO } from "../dto/create-lead.dto";
import { leadRepository } from "../repositories/lead.repository";
import type { Lead } from "../types/lead.types";

const createLead = (data: CreateLeadDTO): Lead => {
    return leadRepository.create(data);
};

const listLeads = (): Lead[] => {
    return leadRepository.list();
};

export const leadService = {
    createLead,
    listLeads,
};
