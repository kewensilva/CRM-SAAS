import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { lostReasonService } from "../services/lost-reason.service";
import { createLostReasonSchema } from "../validators/lost-reason.validator";

const list = async (req: Request, res: Response) => {
    const reasons = await lostReasonService.list(req.auth.tenantId);

    return res.status(200).json({ success: true, data: reasons });
};

const create = async (req: Request, res: Response) => {
    const parsed = createLostReasonSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const reason = await lostReasonService.create(req.auth.tenantId, parsed.data.label);

    return res.status(201).json({ success: true, data: reason });
};

const remove = async (req: Request, res: Response) => {
    await lostReasonService.remove(req.params.id as string, req.auth.tenantId);

    return res.status(204).send();
};

export const lostReasonController = {
    list,
    create,
    remove,
};
