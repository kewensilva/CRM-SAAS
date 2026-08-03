import { NotFoundError } from "../../../shared/errors";
import { companyRepository } from "../../companies/repositories/company.repository";
import type { CreateLeadDTO, UpdateLeadDTO } from "../dto/create-lead.dto";
import { leadRepository } from "../repositories/lead.repository";
import type { Lead, LeadWithDetails } from "../types/lead.types";

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

const updateLead = async (id: string, tenantId: string, data: UpdateLeadDTO): Promise<Lead> => {
    const lead = await leadRepository.findByIdAndTenant(id, tenantId);

    if (!lead) {
        throw new NotFoundError("Lead não encontrado.");
    }

    return leadRepository.update(id, data);
};

// Kanban de Leads: cada Lead vem com o Deal associado (se Vendido/Perdido) e a origem
// calculada a partir de qual integração (se alguma) gerou o registro.
const listWithDetails = async (tenantId: string): Promise<LeadWithDetails[]> => {
    const leads = await leadRepository.listByTenantWithLogs(tenantId);

    return leads.map(({ webWidgetLogs, metaLogs, ...lead }) => ({
        ...lead,
        source: webWidgetLogs.length > 0 ? "Site" : metaLogs.length > 0 ? "Meta" : "Manual",
    }));
};

export const leadService = {
    createLead,
    listLeadsByTenant,
    listWithDetails,
    updateLead,
};
