import type { Request, Response } from "express";

import { conversionWebhookService } from "../services/conversion-webhook.service";

// Público: quem chama é o RD Station ou o Bitrix24, não um usuário logado. A conexão é
// identificada pelo token aleatório da URL. Responde logo — o processamento segue em segundo
// plano e o resultado fica nos logs da conexão.
const receive = async (req: Request, res: Response) => {
    const headers = { "x-crm-token": req.get("x-crm-token") };

    await conversionWebhookService.receive(req.params.token as string, req.body, headers);

    res.status(200).json({ success: true, data: null });
};

export const conversionWebhookController = {
    receive,
};
