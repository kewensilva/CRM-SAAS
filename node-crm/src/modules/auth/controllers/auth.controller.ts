import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { logger } from "../../../shared/logger/logger";
import { authService } from "../services/auth.service";
import {
    changeOwnPasswordSchema,
    forgotPasswordSchema,
    loginSchema,
    refreshTokenSchema,
    resetPasswordSchema,
    switchTenantSchema,
} from "../validators/auth.validator";

const GENERIC_FORGOT_PASSWORD_MESSAGE =
    "Se esse e-mail estiver cadastrado, enviamos um link de redefinição.";

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

const changeOwnPassword = async (req: Request, res: Response) => {
    const parsed = changeOwnPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    await authService.changeOwnPassword(
        req.auth.userId,
        parsed.data.currentPassword,
        parsed.data.newPassword,
    );

    return res.status(204).send();
};

// Sempre responde a mesma mensagem genérica, exista ou não o e-mail — não dá pra vazar
// se uma conta existe. Erros de envio (ex.: provedor de e-mail fora do ar ou não
// configurado) são logados, nunca expostos ao chamador — mesmo princípio de
// business-rules.md > Integração Meta ("nenhum evento é descartado sem registro"),
// aplicado aqui: a falha fica visível pra nós nos logs, não pro atacante em potencial.
const forgotPassword = async (req: Request, res: Response) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    try {
        await authService.forgotPassword(parsed.data.email);
    } catch (error) {
        logger.error({ error }, "[auth] Falha ao processar pedido de redefinição de senha.");
    }

    return res.status(200).json({ success: true, data: { message: GENERIC_FORGOT_PASSWORD_MESSAGE } });
};

const resetPassword = async (req: Request, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    await authService.resetPassword(parsed.data.token, parsed.data.newPassword);

    return res.status(204).send();
};

export const authController = {
    login,
    refreshToken,
    myTenantAccess,
    switchTenant,
    changeOwnPassword,
    forgotPassword,
    resetPassword,
};
