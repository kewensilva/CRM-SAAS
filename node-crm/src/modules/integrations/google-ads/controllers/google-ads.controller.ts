import type { Request, Response } from "express";
import type { ZodType } from "zod";

import { ValidationError } from "../../../../shared/errors";
import { googleAdsConnectionService } from "../services/google-ads-connection.service";
import { googleAdsRuleService } from "../services/google-ads-rule.service";
import {
    createRuleSchema,
    oauthExchangeSchema,
    selectAccountSchema,
    updateRuleSchema,
} from "../validators/google-ads.validator";

const parseBody = <T>(schema: ZodType<T>, body: unknown): T => {
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        throw new ValidationError(
            "Dados inválidos.",
            parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? "body"), message: issue.message })),
        );
    }

    return parsed.data;
};

const tenantOf = (req: Request): string => req.auth.tenantId as string;
const ok = (res: Response, data: unknown) => res.status(200).json({ success: true, data });

export const googleAdsController = {
    getConnection: async (req: Request, res: Response) => ok(res, await googleAdsConnectionService.getConnection(tenantOf(req))),
    getAuthorizationUrl: (req: Request, res: Response) =>
        ok(res, { url: googleAdsConnectionService.buildAuthorizationUrl(tenantOf(req), req.auth.userId) }),
    exchange: async (req: Request, res: Response) => {
        const { code, state } = parseBody(oauthExchangeSchema, req.body);

        return ok(res, await googleAdsConnectionService.completeAuthorization(tenantOf(req), req.auth.userId, code, state));
    },
    listAccounts: async (req: Request, res: Response) => ok(res, await googleAdsConnectionService.listAccounts(tenantOf(req))),
    selectAccount: async (req: Request, res: Response) =>
        ok(res, await googleAdsConnectionService.selectAccount(tenantOf(req), parseBody(selectAccountSchema, req.body))),
    listConversionActions: async (req: Request, res: Response) =>
        ok(res, await googleAdsConnectionService.listConversionActions(tenantOf(req))),
    disconnect: async (req: Request, res: Response) => ok(res, await googleAdsConnectionService.disconnect(tenantOf(req))),

    listRules: async (req: Request, res: Response) => ok(res, await googleAdsRuleService.list(tenantOf(req))),
    createRule: async (req: Request, res: Response) =>
        res.status(201).json({
            success: true,
            data: await googleAdsRuleService.create(tenantOf(req), parseBody(createRuleSchema, req.body)),
        }),
    updateRule: async (req: Request, res: Response) =>
        ok(res, await googleAdsRuleService.update(tenantOf(req), String(req.params.id), parseBody(updateRuleSchema, req.body))),
    removeRule: async (req: Request, res: Response) => {
        await googleAdsRuleService.remove(tenantOf(req), String(req.params.id));

        return ok(res, { deleted: true });
    },
    testRule: async (req: Request, res: Response) => ok(res, await googleAdsRuleService.test(tenantOf(req), String(req.params.id))),
    listHistory: async (req: Request, res: Response) => {
        const ruleId = typeof req.query.ruleId === "string" ? req.query.ruleId : undefined;

        return ok(res, await googleAdsRuleService.listHistory(tenantOf(req), ruleId));
    },
    retryUpload: async (req: Request, res: Response) =>
        ok(res, await googleAdsRuleService.retryUpload(tenantOf(req), String(req.params.id))),
};
