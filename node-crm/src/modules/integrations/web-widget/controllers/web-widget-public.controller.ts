import path from "path";

import type { Request, Response } from "express";

import { ValidationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";
import { webWidgetLeadService } from "../services/web-widget-lead.service";
import { webWidgetSubmissionSchema } from "../validators/web-widget-submission.validator";

const WIDGET_SCRIPT_PATH = path.join(__dirname, "..", "public", "widget.js");

// CORS aberto pra essas rotas vem do middleware global em app.ts (prefixo
// /api/v1/webhooks/web-widget), não precisa ser tratado aqui.

// Arquivo estático servido à mão (sem express.static, é um único arquivo) — não há
// bundler no projeto, widget.js é JS vanilla escrito diretamente (ver CLAUDE.md).
const serveScript = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    // 5min → 30s: Tenant Admin ajusta cor/ícone/conteúdo do botão na tela de config e
    // espera ver o efeito quase na hora ao testar no site — 5min de cache tornava isso
    // frustrante (parecia que a config não tinha salvo).
    res.setHeader("Cache-Control", "public, max-age=30");

    return res.sendFile(WIDGET_SCRIPT_PATH);
};

// Não é a origem/publicKey que decide validade de forma visível ao chamador — mesmo uma
// publicKey inválida ou um widget desabilitado responde 200, só a validação estrutural do
// payload (ex.: nome ausente) retorna 400, para ajudar o desenvolvedor do site a depurar a
// integração sem vazar informação sobre quais chaves existem.
const submitLead = async (req: Request, res: Response) => {
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
    serveScript,
    submitLead,
};
