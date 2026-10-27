import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { dashboardService } from "../services/dashboard.service";
import { analystActivityQuerySchema } from "../validators/dashboard.validator";

const get = async (req: Request, res: Response) => {
    const summary = await dashboardService.getSummary(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: summary });
};

const getPlatform = async (_req: Request, res: Response) => {
    const summary = await dashboardService.getPlatformSummary();

    return res.status(200).json({ success: true, data: summary });
};

const getOwnerTenantCards = async (_req: Request, res: Response) => {
    const cards = await dashboardService.getOwnerTenantCards();

    return res.status(200).json({ success: true, data: cards });
};

const getAnalystActivity = async (req: Request, res: Response) => {
    const parsed = analystActivityQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "query"),
            message: issue.message,
        }));

        throw new ValidationError("Parâmetros inválidos.", details);
    }

    const summary = await dashboardService.getAnalystActivity(parsed.data.days);

    return res.status(200).json({ success: true, data: summary });
};

export const dashboardController = {
    get,
    getPlatform,
    getOwnerTenantCards,
    getAnalystActivity,
};
