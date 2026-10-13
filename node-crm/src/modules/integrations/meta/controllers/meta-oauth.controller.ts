import type { Request, Response } from "express";
import type { ZodType } from "zod";

import { ValidationError } from "../../../../shared/errors";
import { toPublicIntegration } from "../services/meta-integration.mapper";
import { metaOAuthService } from "../services/meta-oauth.service";
import {
    metaOAuthConnectSchema,
    metaOAuthExchangeSchema,
} from "../validators/meta-integration.validator";

const parseBody = <T>(schema: ZodType<T>, body: unknown): T => {
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    return parsed.data;
};

const getAuthorizationUrl = (req: Request, res: Response) => {
    const url = metaOAuthService.buildAuthorizationUrl(
        req.auth.tenantId as string,
        req.auth.userId,
    );

    return res.status(200).json({ success: true, data: { url } });
};

const exchange = async (req: Request, res: Response) => {
    const { code, state } = parseBody(metaOAuthExchangeSchema, req.body);

    const result = await metaOAuthService.exchangeCode(
        req.auth.tenantId as string,
        req.auth.userId,
        code,
        state,
    );

    return res.status(200).json({ success: true, data: result });
};

const connect = async (req: Request, res: Response) => {
    const { sessionId, pageId } = parseBody(metaOAuthConnectSchema, req.body);

    const integration = await metaOAuthService.connectPage(
        req.auth.tenantId as string,
        req.auth.userId,
        sessionId,
        pageId,
    );

    return res.status(200).json({ success: true, data: toPublicIntegration(integration) });
};

const disconnect = async (req: Request, res: Response) => {
    const integration = await metaOAuthService.disconnect(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: toPublicIntegration(integration) });
};

export const metaOAuthController = {
    getAuthorizationUrl,
    exchange,
    connect,
    disconnect,
};