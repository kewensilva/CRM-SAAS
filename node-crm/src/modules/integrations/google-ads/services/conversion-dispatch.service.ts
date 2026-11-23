import { logger } from "../../../../shared/logger/logger";
import { googleAdsUploadRepository } from "../repositories/google-ads-upload.repository";
import type { GoogleAdsConversionUpload } from "../types/google-ads.types";
import type { HashedUserIdentifier } from "./data-manager.client";
import { dataManagerClient } from "./data-manager.client";
import { requireConnection } from "./google-ads-connection.service";

// Envia um registro de envio ao Google e grava o resultado. Nunca lança: qualquer falha
// (conexão expirada, conta sem acesso, ação de conversão errada) fica no histórico como
// FAILED com o motivo, e o cliente pode clicar em "Reenviar".
export const sendUpload = async (upload: GoogleAdsConversionUpload, conversionActionId: string): Promise<GoogleAdsConversionUpload> => {
    try {
        const { connection, accessToken } = await requireConnection(upload.tenantId, true);
        const customerId = connection.customerId as string;
        const { requestId } = await dataManagerClient.ingestConversion(accessToken, {
            customerId,
            loginCustomerId: connection.loginCustomerId ?? customerId,
            conversionActionId,
            transactionId: upload.id,
            occurredAt: upload.occurredAt,
            gclid: upload.gclid,
            userIdentifiers: (upload.userIdentifiers as HashedUserIdentifier[] | null) ?? [],
            value: upload.conversionValue === null ? null : Number(upload.conversionValue),
            currency: connection.currencyCode,
        });

        return await googleAdsUploadRepository.markSent(upload.id, requestId);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida ao enviar ao Google Ads.";

        logger.warn({ uploadId: upload.id, message }, "[google-ads] envio de conversão falhou.");

        return googleAdsUploadRepository.markFailed(upload.id, message);
    }
};
