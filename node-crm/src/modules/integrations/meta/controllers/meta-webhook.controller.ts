import type { Request, Response } from "express";

import { metaConfig } from "../../../../config/meta";
import { AuthenticationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";
import { metaWebhookService } from "../services/meta-webhook.service";
import { isValidMetaSignature } from "../services/meta-signature";
import type { MetaWebhookPayload } from "../types/meta-integration.types";

// Handshake de assinatura do webhook — a Meta chama isso uma vez ao configurar a URL de
// callback. https://developers.facebook.com/docs/graph-api/webhooks/getting-started
const verify = (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === metaConfig.webhookVerifyToken && typeof challenge === "string") {
        return res.status(200).send(challenge);
    }

    return res.status(403).send("Verificação falhou.");
};

// Nunca retorna erro pra Meta — mesmo payloads malformados ou falhas internas ficam
// registradas (MetaIntegrationLog quando possível, log de aplicação como último recurso)
// e a resposta é sempre 200, para não derrubar a inscrição do webhook nem gerar retries.
const receive = async (req: Request, res: Response) => {
    const signature = req.headers["x-hub-signature-256"];

    if (!isValidMetaSignature(req.rawBody, typeof signature === "string" ? signature : undefined)) {
        throw new AuthenticationError("Assinatura inválida.");
    }

    try {
        await metaWebhookService.processWebhookPayload(req.body as MetaWebhookPayload);
    } catch (error) {
        logger.error({
            msg: "Falha ao processar webhook da Meta",
            requestId: req.requestId,
            error: error instanceof Error ? error.message : error,
        });
    }

    return res.status(200).json({ success: true, data: null });
};

export const metaWebhookController = {
    verify,
    receive,
};
