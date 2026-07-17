import { metaConfig } from "../../../../config/meta";
import { IntegrationError } from "../../../../shared/errors";
import type { MetaLeadFieldData } from "../types/meta-integration.types";

// Busca os dados completos do lead na Graph API — o webhook só avisa que um lead chegou
// (leadgen_id), os campos do formulário (nome, e-mail, telefone) vêm daqui.
// https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving
const fetchLeadFieldData = async (
    leadgenId: string,
    pageAccessToken: string,
): Promise<MetaLeadFieldData> => {
    const url = `${metaConfig.graphApiBaseUrl}/${leadgenId}?access_token=${encodeURIComponent(pageAccessToken)}`;

    let response: Response;

    try {
        response = await fetch(url);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com a Graph API da Meta: ${message}`);
    }

    if (!response.ok) {
        const body = await response.text();

        throw new IntegrationError(`Graph API retornou ${response.status}: ${body}`);
    }

    return response.json() as Promise<MetaLeadFieldData>;
};

export const metaGraphApiClient = {
    fetchLeadFieldData,
};
