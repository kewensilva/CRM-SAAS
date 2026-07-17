import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { stageService } from "../services/stage.service";
import {
    createStageSchema,
    reorderStagesSchema,
    updateStageSchema,
} from "../validators/pipeline.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createStageSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const stage = await stageService.createStage(
        req.params.pipelineId as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(201).json({ success: true, data: stage });
};

const list = async (req: Request, res: Response) => {
    const stages = await stageService.listStages(
        req.params.pipelineId as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: stages });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateStageSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const stage = await stageService.updateStage(
        req.params.stageId as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: stage });
};

const remove = async (req: Request, res: Response) => {
    await stageService.deleteStage(req.params.stageId as string, req.auth.tenantId as string);

    return res.status(204).send();
};

const reorder = async (req: Request, res: Response) => {
    const parsed = reorderStagesSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const stages = await stageService.reorderStages(
        req.params.pipelineId as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: stages });
};

export const stageController = {
    create,
    list,
    update,
    remove,
    reorder,
};
