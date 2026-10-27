import type { Request, Response } from "express";
import type { ZodType } from "zod";

import { ValidationError } from "../../../../shared/errors";
import { googleAnalyticsService } from "../services/google-analytics.service";
import {
    googleAnalyticsReportQuerySchema,
    updateGoogleAnalyticsIntegrationSchema,
} from "../validators/google-analytics.validator";

const parse = <T>(schema: ZodType<T>, input: unknown): T => {
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    return parsed.data;
};

const getSettings = async (req: Request, res: Response) => {
    const settings = await googleAnalyticsService.getSettings(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: settings });
};

const updateSettings = async (req: Request, res: Response) => {
    const data = parse(updateGoogleAnalyticsIntegrationSchema, req.body);
    const settings = await googleAnalyticsService.updateSettings(req.auth.tenantId as string, data);

    return res.status(200).json({ success: true, data: settings });
};

const getMonthlyReport = async (req: Request, res: Response) => {
    const { month } = parse(googleAnalyticsReportQuerySchema, req.query);
    const report = await googleAnalyticsService.getMonthlyReport(req.auth.tenantId as string, month);

    return res.status(200).json({ success: true, data: report });
};

export const googleAnalyticsController = {
    getSettings,
    updateSettings,
    getMonthlyReport,
};
