import { BusinessRuleError, NotFoundError } from "../../../shared/errors";
import { leadRepository } from "../../leads/repositories/lead.repository";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { UpdateWidgetDTO } from "../dto/update-widget.dto";
import type { WidgetSubmissionDTO } from "../dto/widget-submission.dto";
import { widgetRepository } from "../repositories/widget.repository";
import type { Lead } from "../../leads/types/lead.types";
import type { TenantWidget } from "../types/widget.types";

const getByTenant = async (tenantId: string): Promise<TenantWidget> => {
    const widget = await widgetRepository.findByTenant(tenantId);

    if (!widget) {
        throw new NotFoundError("Widget ainda não configurado para este tenant.");
    }

    return widget;
};

const updateByTenant = async (
    tenantId: string,
    data: UpdateWidgetDTO,
): Promise<TenantWidget> => {
    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant) {
        throw new NotFoundError("Tenant não encontrado.");
    }

    if (data.defaultResponsibleUserId) {
        const responsible = await userRepository.findById(data.defaultResponsibleUserId);

        if (!responsible || responsible.tenantId !== tenantId || responsible.status !== "ACTIVE") {
            throw new NotFoundError("Usuário responsável padrão não encontrado.");
        }
    }

    return widgetRepository.upsertByTenant(tenantId, data);
};

// Endpoint público — quem chama é o formulário embutido no site do tenant, não um
// usuário logado. Só aceita os campos que o Owner habilitou (requestedFields), ignora o
// resto defensivamente (o form legítimo só manda o que ele mesmo renderizou).
const submitLead = async (tenantId: string, payload: WidgetSubmissionDTO): Promise<Lead> => {
    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant || tenant.status !== "ACTIVE") {
        throw new NotFoundError("Tenant não encontrado.");
    }

    const widget = await widgetRepository.findByTenant(tenantId);

    if (!widget || !widget.enabled) {
        throw new NotFoundError("Widget não habilitado para este tenant.");
    }

    if (!widget.defaultResponsibleUserId) {
        throw new BusinessRuleError(
            "Widget não possui um responsável padrão configurado — contate o suporte.",
        );
    }

    const requested = new Set(widget.requestedFields);

    return leadRepository.create({
        tenantId,
        responsibleUserId: widget.defaultResponsibleUserId,
        name: payload.name,
        email: requested.has("email") ? payload.email : undefined,
        phone: requested.has("phone") ? payload.phone : undefined,
        cpf: requested.has("cpf") ? payload.cpf : undefined,
        location: requested.has("location") ? payload.location : undefined,
        referralSource: requested.has("referralSource") ? payload.referralSource : undefined,
        notes: requested.has("notes") ? payload.notes : undefined,
    });
};

export const widgetService = {
    getByTenant,
    updateByTenant,
    submitLead,
};
