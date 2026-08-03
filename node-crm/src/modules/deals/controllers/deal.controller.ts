import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { dealService } from "../services/deal.service";
import {
    changeStageSchema,
    changeStatusSchema,
    createDealSchema,
    moveLeadStatusSchema,
    updateDealSchema,
} from "../validators/deal.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createDealSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const deal = await dealService.createDeal(
        { ...parsed.data, tenantId: req.auth.tenantId as string },
        req.auth.userId,
    );

    return res.status(201).json({ success: true, data: deal });
};

const get = async (req: Request, res: Response) => {
    const deal = await dealService.getDeal(req.params.id as string, req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: deal });
};

const list = async (req: Request, res: Response) => {
    const deals = await dealService.listDeals(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: deals });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateDealSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const deal = await dealService.updateDeal(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: deal });
};

const remove = async (req: Request, res: Response) => {
    await dealService.deleteDeal(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

const changeStage = async (req: Request, res: Response) => {
    const parsed = changeStageSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const deal = await dealService.changeStage(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
        req.auth.userId,
    );

    return res.status(200).json({ success: true, data: deal });
};

const changeStatus = async (req: Request, res: Response) => {
    const parsed = changeStatusSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const deal = await dealService.changeStatus(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: deal });
};

const history = async (req: Request, res: Response) => {
    const entries = await dealService.listHistory(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: entries });
};

const moveLeadStatus = async (req: Request, res: Response) => {
    const parsed = moveLeadStatusSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const result = await dealService.moveLeadStatus(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: result });
};

export const dealController = {
    create,
    get,
    list,
    update,
    remove,
    changeStage,
    changeStatus,
    history,
    moveLeadStatus,
};
