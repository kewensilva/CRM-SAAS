import type { Request, Response } from "express";

import type { ActivityStatus } from "../../../../generated/prisma/enums";
import { ValidationError } from "../../../shared/errors";
import { activityService } from "../services/activity.service";
import { createActivitySchema, updateActivitySchema } from "../validators/activity.validator";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const create = async (req: Request, res: Response) => {
    const parsed = createActivitySchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const activity = await activityService.createActivity({
        ...parsed.data,
        tenantId: req.auth.tenantId as string,
    });

    return res.status(201).json({ success: true, data: activity });
};

const get = async (req: Request, res: Response) => {
    const activity = await activityService.getActivity(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: activity });
};

const list = async (req: Request, res: Response) => {
    const dealId = typeof req.query.dealId === "string" ? req.query.dealId : undefined;
    const leadId = typeof req.query.leadId === "string" ? req.query.leadId : undefined;
    const statusParam = typeof req.query.status === "string" ? req.query.status : undefined;
    const status =
        statusParam && VALID_STATUSES.includes(statusParam)
            ? (statusParam as ActivityStatus)
            : undefined;

    const activities = await activityService.listActivities(
        req.auth.tenantId as string,
        dealId,
        leadId,
        status,
    );

    return res.status(200).json({ success: true, data: activities });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateActivitySchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const activity = await activityService.updateActivity(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: activity });
};

const remove = async (req: Request, res: Response) => {
    await activityService.deleteActivity(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

const complete = async (req: Request, res: Response) => {
    const activity = await activityService.completeActivity(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: activity });
};

const cancel = async (req: Request, res: Response) => {
    const activity = await activityService.cancelActivity(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: activity });
};

export const activityController = {
    create,
    get,
    list,
    update,
    remove,
    complete,
    cancel,
};
