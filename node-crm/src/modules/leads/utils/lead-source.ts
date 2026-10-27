import type { LeadSource } from "../types/lead.types";

// Origem = por onde o Lead ENTROU no CRM (Site, Meta ou Manual), diferente da Fonte (UTM /
// plataforma: instagram, google, facebook...). Vem só do log que CRIOU o Lead (status
// PROCESSED — o repositório já filtra isso): um envio posterior marcado como DUPLICATE
// também aponta para o Lead e, sem esse filtro, um Lead cadastrado à mão virava "Site"
// quando a mesma pessoa preenchia o formulário do site depois.
export const resolveLeadSource = (lead: {
    webWidgetLogs: { id: string }[];
    metaLogs: { id: string }[];
}): LeadSource => {
    if (lead.webWidgetLogs.length > 0) {
        return "Site";
    }

    return lead.metaLogs.length > 0 ? "Meta" : "Manual";
};
