import path from "path";

import type { Request, Response } from "express";

import { ValidationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";
import { webWidgetLeadService } from "../services/web-widget-lead.service";
import { webWidgetSubmissionSchema } from "../validators/web-widget-submission.validator";

const WIDGET_SCRIPT_PATH = path.join(__dirname, "..", "public", "widget.js");

// O widget é embutido em domínios arbitrários de clientes (Wix, Shopify, WordPress, etc.),
// então essas duas rotas precisam de CORS aberto — exceção pontual e documentada, o resto
// da API não tem CORS habilitado (ver CLAUDE.md > Estado atual do código).
const setPublicCorsHeaders = (res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const corsPreflight = (req: Request, res: Response) => {
    setPublicCorsHeaders(res);

    return res.status(204).end();
};

// Arquivo estático servido à mão (sem express.static, é um único arquivo) — não há
// bundler no projeto, widget.js é JS vanilla escrito diretamente (ver CLAUDE.md).
const serveScript = (req: Request, res: Response) => {
    setPublicCorsHeaders(res);
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");

    return res.sendFile(WIDGET_SCRIPT_PATH);
};

// Não é a origem/publicKey que decide validade de forma visível ao chamador — mesmo uma
// publicKey inválida ou um widget desabilitado responde 200, só a validação estrutural do
// payload (ex.: nome ausente) retorna 400, para ajudar o desenvolvedor do site a depurar a
// integração sem vazar informação sobre quais chaves existem.
const submitLead = async (req: Request, res: Response) => {
    setPublicCorsHeaders(res);

    const parsed = webWidgetSubmissionSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    try {
        await webWidgetLeadService.processSubmission(parsed.data);
    } catch (error) {
        logger.error({
            msg: "Falha ao processar submissão do widget de captura de Leads",
            requestId: req.requestId,
            error: error instanceof Error ? error.message : error,
        });
    }

    return res.status(200).json({ success: true, data: null });
};

export const webWidgetPublicController = {
    corsPreflight,
    serveScript,
    submitLead,
};
