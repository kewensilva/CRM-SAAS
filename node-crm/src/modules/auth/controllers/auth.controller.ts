import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { authService } from "../services/auth.service";
import { loginSchema, refreshTokenSchema, switchTenantSchema } from "../validators/auth.validator";

const login = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const tokens = await authService.login(parsed.data);

    return res.status(200).json({ success: true, data: tokens });
};

const refreshToken = async (req: Request, res: Response) => {
    const parsed = refreshTokenSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const tokens = await authService.refresh(parsed.data.refreshToken);

    return res.status(200).json({ success: true, data: tokens });
};

const myTenantAccess = async (req: Request, res: Response) => {
    const access = await authService.myTenantAccess(req.auth);

    return res.status(200).json({ success: true, data: access });
};

const switchTenant = async (req: Request, res: Response) => {
    const parsed = switchTenantSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const tokens = await authService.switchTenant(req.auth, parsed.data.tenantId);

    return res.status(200).json({ success: true, data: tokens });
};

export const authController = {
    login,
    refreshToken,
    myTenantAccess,
    switchTenant,
};
