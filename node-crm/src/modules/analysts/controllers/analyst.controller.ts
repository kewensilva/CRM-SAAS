import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { analystService } from "../services/analyst.service";
import { createAnalystSchema, replaceAnalystAccessSchema } from "../validators/analyst.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createAnalystSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const analyst = await analystService.createAnalyst(parsed.data);

    return res.status(201).json({ success: true, data: analyst });
};

const list = async (_req: Request, res: Response) => {
    const analysts = await analystService.listAnalysts();

    return res.status(200).json({ success: true, data: analysts });
};

const replaceAccess = async (req: Request, res: Response) => {
    const parsed = replaceAnalystAccessSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const analyst = await analystService.replaceAccess(req.params.id as string, parsed.data.tenantIds);

    return res.status(200).json({ success: true, data: analyst });
};

const remove = async (req: Request, res: Response) => {
    await analystService.deleteAnalyst(req.params.id as string);

    return res.status(204).send();
};

export const analystController = {
    create,
    list,
    replaceAccess,
    remove,
};
