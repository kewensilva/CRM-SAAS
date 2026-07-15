import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { settingsService } from "../services/settings.service";
import { updateSettingsSchema } from "../validators/settings.validator";

const get = async (req: Request, res: Response) => {
    const settings = await settingsService.getByTenant(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: settings });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateSettingsSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const settings = await settingsService.updateByTenant(req.auth.tenantId as string, parsed.data);

    return res.status(200).json({ success: true, data: settings });
};

export const settingsController = {
    get,
    update,
};
