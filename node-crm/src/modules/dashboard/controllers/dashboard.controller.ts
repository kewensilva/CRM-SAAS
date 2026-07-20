import type { Request, Response } from "express";

import { dashboardService } from "../services/dashboard.service";

const get = async (req: Request, res: Response) => {
    const summary = await dashboardService.getSummary(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: summary });
};

const getPlatform = async (_req: Request, res: Response) => {
    const summary = await dashboardService.getPlatformSummary();

    return res.status(200).json({ success: true, data: summary });
};

export const dashboardController = {
    get,
    getPlatform,
};
