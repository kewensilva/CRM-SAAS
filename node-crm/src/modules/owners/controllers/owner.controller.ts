import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { ownerService } from "../services/owner.service";
import { createOwnerSchema } from "../validators/owner.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createOwnerSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const owner = await ownerService.createOwner(parsed.data);

    return res.status(201).json({ success: true, data: owner });
};

const list = async (_req: Request, res: Response) => {
    const owners = await ownerService.listOwners();

    return res.status(200).json({ success: true, data: owners });
};

const remove = async (req: Request, res: Response) => {
    await ownerService.deleteOwner(req.params.id as string, req.auth.userId);

    return res.status(204).send();
};

export const ownerController = {
    create,
    list,
    remove,
};
