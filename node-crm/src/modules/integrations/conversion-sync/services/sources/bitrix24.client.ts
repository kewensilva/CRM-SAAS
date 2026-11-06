import { IntegrationError } from "../../../../../shared/errors";
import { logger } from "../../../../../shared/logger/logger";
import { asRecord } from "./source-helpers";
import type { UnknownRecord } from "./source-helpers";

// REST do Bitrix24 pela URL de webhook de entrada que o cliente gera no portal
// (https://<portal>.bitrix24.com.br/rest/<usuario>/<codigo>/). O webhook de saída só avisa o
// ID do negócio — os dados vêm daqui. crm.deal.get/crm.contact.get estão marcados como
// legados na documentação (substitutos: crm.item.get), mas seguem funcionando e devolvem
// STAGE_SEMANTIC_ID, que diz se o negócio foi ganho.
const callBitrix = async (baseUrl: string, method: string, id: string): Promise<UnknownRecord> => {
    const url = `${baseUrl.replace(/\/+$/, "")}/${method}.json?ID=${encodeURIComponent(id)}`;
    let response: Response;

    try {
        response = await fetch(url);
    } catch (error) {
        throw new IntegrationError(`Falha ao conectar com o Bitrix24: ${error instanceof Error ? error.message : ""}`);
    }

    if (!response.ok) {
        logger.warn({ method, id, status: response.status }, "[conversion-sync] Bitrix24 recusou a chamada REST.");
        throw new IntegrationError(`Bitrix24 retornou ${response.status} em ${method}.`);
    }

    return asRecord(asRecord(await response.json())["result"]);
};

export const fetchBitrixDeal = (baseUrl: string, dealId: string): Promise<UnknownRecord> =>
    callBitrix(baseUrl, "crm.deal.get", dealId);

export const fetchBitrixContact = (baseUrl: string, contactId: string): Promise<UnknownRecord> =>
    callBitrix(baseUrl, "crm.contact.get", contactId);
