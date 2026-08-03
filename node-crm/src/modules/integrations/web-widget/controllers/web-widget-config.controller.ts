import type { Request, Response } from "express";

import { ValidationError } from "../../../../shared/errors";
import { webWidgetConfigService } from "../services/web-widget-config.service";
import { webWidgetLogRepository } from "../repositories/web-widget-log.repository";
import { updateWebWidgetIntegrationSchema } from "../validators/web-widget-config.validator";

const get = async (req: Request, res: Response) => {
    const integration = await webWidgetConfigService.getByTenant(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: integration });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateWebWidgetIntegrationSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const integration = await webWidgetConfigService.updateByTenant(
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: integration });
};

const regenerateKey = async (req: Request, res: Response) => {
    const integration = await webWidgetConfigService.regenerateKey(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: integration });
};

const listLogs = async (req: Request, res: Response) => {
    const logs = await webWidgetLogRepository.listByTenant(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: logs });
};

// Contrapartes do Owner às 4 rotas acima — mesmo serviço, só que o tenantId vem da URL
// (/tenants/:tenantId/web-widget) em vez de req.auth.tenantId, já que o Owner configura o
// widget de qualquer tenant, não o próprio (que nem existe pra esse perfil).
const getForTenant = async (req: Request, res: Response) => {
    const integration = await webWidgetConfigService.getByTenant(req.params.tenantId as string);

    return res.status(200).json({ success: true, data: integration });
};

const updateForTenant = async (req: Request, res: Response) => {
    const parsed = updateWebWidgetIntegrationSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const integration = await webWidgetConfigService.updateByTenant(
        req.params.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: integration });
};

const regenerateKeyForTenant = async (req: Request, res: Response) => {
    const integration = await webWidgetConfigService.regenerateKey(req.params.tenantId as string);

    return res.status(200).json({ success: true, data: integration });
};

const listLogsForTenant = async (req: Request, res: Response) => {
    const logs = await webWidgetLogRepository.listByTenant(req.params.tenantId as string);

    return res.status(200).json({ success: true, data: logs });
};

export const webWidgetConfigController = {
    get,
    update,
    regenerateKey,
    listLogs,
    getForTenant,
    updateForTenant,
    regenerateKeyForTenant,
    listLogsForTenant,
};
