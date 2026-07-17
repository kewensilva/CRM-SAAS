import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { pipelineService } from "../services/pipeline.service";
import { createPipelineSchema, updatePipelineSchema } from "../validators/pipeline.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createPipelineSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const pipeline = await pipelineService.createPipeline({
        ...parsed.data,
        tenantId: req.auth.tenantId as string,
    });

    return res.status(201).json({ success: true, data: pipeline });
};

const get = async (req: Request, res: Response) => {
    const pipeline = await pipelineService.getPipeline(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: pipeline });
};

const list = async (req: Request, res: Response) => {
    const pipelines = await pipelineService.listPipelines(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: pipelines });
};

const update = async (req: Request, res: Response) => {
    const parsed = updatePipelineSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const pipeline = await pipelineService.updatePipeline(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: pipeline });
};

const remove = async (req: Request, res: Response) => {
    await pipelineService.deletePipeline(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

export const pipelineController = {
    create,
    get,
    list,
    update,
    remove,
};
