import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { reportService } from "../services/report.service";
import { monthQuerySchema } from "../validators/report.validator";

const getSummary = async (req: Request, res: Response) => {
    const parsed = monthQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "month"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const summary = await reportService.getSummary(req.auth.tenantId as string, parsed.data.month);

    return res.status(200).json({ success: true, data: summary });
};

export const reportController = {
    getSummary,
};
