import type { Request, Response } from "express";

import { ValidationError } from "../../../../shared/errors";
import { toPublicIntegration } from "../services/meta-integration.mapper";
import { metaConnectionHealthService } from "../services/meta-connection-health.service";
import { metaIntegrationService } from "../services/meta-integration.service";
import { metaLogRepository } from "../repositories/meta-log.repository";
import { updateMetaIntegrationSchema } from "../validators/meta-integration.validator";

const get = async (req: Request, res: Response) => {
    const integration = await metaIntegrationService.getByTenant(req.auth.tenantId as string);

        return res.status(200).json({ success: true, data: toPublicIntegration(integration) });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateMetaIntegrationSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const integration = await metaIntegrationService.updateByTenant(
        req.auth.tenantId as string,
        parsed.data,
    );

        return res.status(200).json({ success: true, data: toPublicIntegration(integration) });
};

const listLogs = async (req: Request, res: Response) => {
    const logs = await metaLogRepository.listByTenant(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: logs });
};

const health = async (req: Request, res: Response) => {
    const data = await metaConnectionHealthService.getHealth(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data });
};

const resubscribe = async (req: Request, res: Response) => {
    await metaConnectionHealthService.resubscribe(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: { subscribed: true } });
};

export const metaIntegrationController = {
    get,
    update,
    listLogs,
    health,
    resubscribe,
};
