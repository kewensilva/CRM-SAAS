import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { userService } from "../services/user.service";
import { changePasswordSchema, createUserSchema } from "../validators/user.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const user = await userService.createUser({
        ...parsed.data,
        tenantId: req.auth.tenantId,
    });

    return res.status(201).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            status: user.status,
        },
    });
};

const list = async (req: Request, res: Response) => {
    const users = await userService.listUsersByTenant(req.auth.tenantId as string);

    return res.status(200).json({
        success: true,
        data: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            status: user.status,
        })),
    });
};

const changePassword = async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    await userService.changePasswordInTenant(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data.newPassword,
    );

    return res.status(204).send();
};

export const userController = {
    create,
    list,
    changePassword,
};
