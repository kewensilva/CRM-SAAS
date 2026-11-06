import type { Request, Response } from "express";
import type { ZodType } from "zod";

import { ValidationError } from "../../../../shared/errors";
import { conversionIntegrationService } from "../services/conversion-integration.service";
import { conversionWebhookService } from "../services/conversion-webhook.service";
import {
    createConversionIntegrationSchema,
    createConversionRuleSchema,
    updateConversionIntegrationSchema,
    updateConversionRuleSchema,
} from "../validators/conversion-sync.validator";

const parse = <T>(schema: ZodType<T>, input: unknown): T => {
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    return parsed.data;
};

// tenantId sempre do token — nunca do corpo nem da URL.
const tenantOf = (req: Request): string => req.auth.tenantId as string;
const param = (req: Request, name: string): string => req.params[name] as string;

const list = async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await conversionIntegrationService.list(tenantOf(req)) });
};

const create = async (req: Request, res: Response) => {
    const data = parse(createConversionIntegrationSchema, req.body);

    res.status(201).json({ success: true, data: await conversionIntegrationService.create(tenantOf(req), data) });
};

const update = async (req: Request, res: Response) => {
    const data = parse(updateConversionIntegrationSchema, req.body);

    res.status(200).json({
        success: true,
        data: await conversionIntegrationService.update(tenantOf(req), param(req, "id"), data),
    });
};

const remove = async (req: Request, res: Response) => {
    await conversionIntegrationService.remove(tenantOf(req), param(req, "id"));

    res.status(204).send();
};

const regenerateToken = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: await conversionIntegrationService.regenerateToken(tenantOf(req), param(req, "id")),
    });
};

const createRule = async (req: Request, res: Response) => {
    const data = parse(createConversionRuleSchema, req.body);

    res.status(201).json({
        success: true,
        data: await conversionIntegrationService.createRule(tenantOf(req), param(req, "id"), data),
    });
};

const updateRule = async (req: Request, res: Response) => {
    const data = parse(updateConversionRuleSchema, req.body);

    res.status(200).json({
        success: true,
        data: await conversionIntegrationService.updateRule(tenantOf(req), param(req, "id"), param(req, "ruleId"), data),
    });
};

const removeRule = async (req: Request, res: Response) => {
    await conversionIntegrationService.removeRule(tenantOf(req), param(req, "id"), param(req, "ruleId"));

    res.status(204).send();
};

const testRule = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: await conversionIntegrationService.testRule(tenantOf(req), param(req, "id"), param(req, "ruleId")),
    });
};

const listLogs = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: await conversionIntegrationService.listLogs(tenantOf(req), param(req, "id")),
    });
};

const retryUpload = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: await conversionIntegrationService.retryUpload(tenantOf(req), param(req, "uploadId")),
    });
};

const reprocessWebhook = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: await conversionWebhookService.reprocess(tenantOf(req), param(req, "id"), param(req, "logId")),
    });
};

export const conversionIntegrationController = {
    list,
    create,
    update,
    remove,
    regenerateToken,
    createRule,
    updateRule,
    removeRule,
    testRule,
    listLogs,
    retryUpload,
    reprocessWebhook,
};
