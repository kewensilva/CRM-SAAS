import { NotFoundError } from "../../../shared/errors";
import { publishLeadEvent } from "../../../shared/events/lead-events";
import { companyRepository } from "../../companies/repositories/company.repository";
import type { CreateLeadDTO, UpdateLeadDTO } from "../dto/create-lead.dto";
import { leadRepository } from "../repositories/lead.repository";
import { resolveLeadSource } from "../utils/lead-source";
import type { Lead, LeadConversionData, LeadHistoryEntry, LeadWithDetails } from "../types/lead.types";

// Regra de visibilidade do Vendedor (USER): enxerga Leads em "Sem contato" (fila comum)
// + os que ele mesmo é responsável. Usado tanto pra filtrar a listagem (listWithDetails)
// quanto pra bloquear acesso direto por id a um Lead de outro vendedor (updateLead aqui
// e moveLeadStatus em deal.service.ts, que reusa esta função). Tenant Admin e Manager
// (perfil em descontinuação, ainda suportado) continuam vendo tudo.
export const isLeadVisibleToRequester = (
    lead: { status: Lead["status"]; responsibleUserId: string },
    requestingUserId: string,
    requestingProfile: string,
): boolean => {
    if (requestingProfile !== "USER") {
        return true;
    }

    return lead.status === "SEM_CONTATO" || lead.responsibleUserId === requestingUserId;
};

const createLead = async (data: CreateLeadDTO, changedByUserId: string | null): Promise<Lead> => {
    if (data.companyId) {
        const company = await companyRepository.findByIdAndTenant(data.companyId, data.tenantId);

        if (!company) {
            throw new NotFoundError("Empresa não encontrada.");
        }
    }

    const lead = await leadRepository.create(data, changedByUserId);

    publishLeadEvent({ type: "LeadCreated", tenantId: lead.tenantId, leadId: lead.id });

    return lead;
};

const listLeadsByTenant = (tenantId: string): Promise<Lead[]> => {
    return leadRepository.listByTenant(tenantId);
};

const updateLead = async (
    id: string,
    tenantId: string,
    data: UpdateLeadDTO,
    requestingUserId: string,
    requestingProfile: string,
): Promise<Lead> => {
    const lead = await leadRepository.findByIdAndTenant(id, tenantId);

    if (!lead || !isLeadVisibleToRequester(lead, requestingUserId, requestingProfile)) {
        throw new NotFoundError("Lead não encontrado.");
    }

    return leadRepository.update(id, data);
};

// Kanban de Leads: cada Lead vem com o Deal associado (se Vendido/Perdido) e a origem
// calculada a partir de qual integração (se alguma) gerou o registro.
//
// Vendedor (USER) só enxerga: Leads ainda em "Sem contato" (fila comum, ninguém assumiu
// ainda) + os que ele mesmo é responsável, uma vez que saíram de "Sem contato" — não vê
// leads de outro vendedor. Tenant Admin (e Manager, perfil em descontinuação mas ainda
// suportado no backend) continua vendo tudo. Owner/Analista não chamam essa rota.
const listWithDetails = async (
    tenantId: string,
    requestingUserId: string,
    requestingProfile: string,
): Promise<LeadWithDetails[]> => {
    const leads = await leadRepository.listByTenantWithLogs(tenantId);

    const visible = leads.filter((lead) =>
        isLeadVisibleToRequester(lead, requestingUserId, requestingProfile),
    );

    return visible.map(({ webWidgetLogs, metaLogs, ...lead }) => ({
        ...lead,
        source: resolveLeadSource({ webWidgetLogs, metaLogs }),
    }));
};

// Ver detalhes do Lead > histórico: mesma regra de visibilidade da listagem (Vendedor
// só enxerga o próprio Lead ou um ainda sem responsável assumido).
const listHistory = async (
    id: string,
    tenantId: string,
    requestingUserId: string,
    requestingProfile: string,
): Promise<LeadHistoryEntry[]> => {
    const lead = await leadRepository.findByIdAndTenant(id, tenantId);

    if (!lead || !isLeadVisibleToRequester(lead, requestingUserId, requestingProfile)) {
        throw new NotFoundError("Lead não encontrado.");
    }

    return leadRepository.listHistoryByLead(id, tenantId);
};

// Interface do módulo de Leads para o Integrador Google Ads (não expõe o repositório).
const getConversionData = async (leadId: string, tenantId: string): Promise<LeadConversionData | null> => {
    const lead = await leadRepository.findForConversion(leadId, tenantId);

    if (!lead) {
        return null;
    }

    const dealValue = lead.deal?.value;

    return {
        id: lead.id,
        tenantId: lead.tenantId,
        email: lead.email,
        phone: lead.phone,
        gclid: lead.gclid,
        source: resolveLeadSource(lead),
        dealValue: dealValue === null || dealValue === undefined ? null : Number(dealValue),
    };
};

export const leadService = {
    getConversionData,
    createLead,
    listLeadsByTenant,
    listWithDetails,
    updateLead,
    listHistory,
};
