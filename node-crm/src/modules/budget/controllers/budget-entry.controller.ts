import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { budgetEntryService } from "../services/budget-entry.service";
import {
    createBudgetEntrySchema,
    monthQuerySchema,
    updateBudgetEntrySchema,
} from "../validators/budget-entry.validator";

const list = async (req: Request, res: Response) => {
    const parsedQuery = monthQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
        const details = parsedQuery.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "month"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const entries = await budgetEntryService.list(req.auth.tenantId as string, parsedQuery.data.month);

    return res.status(200).json({ success: true, data: entries });
};

const upsert = async (req: Request, res: Response) => {
    const parsed = createBudgetEntrySchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const entry = await budgetEntryService.upsert({
        tenantId: req.auth.tenantId as string,
        ...parsed.data,
    });

    return res.status(201).json({ success: true, data: entry });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateBudgetEntrySchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const entry = await budgetEntryService.update(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: entry });
};

const remove = async (req: Request, res: Response) => {
    await budgetEntryService.remove(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

export const budgetEntryController = {
    list,
    upsert,
    update,
    remove,
};
