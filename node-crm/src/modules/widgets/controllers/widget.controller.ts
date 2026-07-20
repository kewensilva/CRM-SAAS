import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { widgetService } from "../services/widget.service";
import { updateWidgetSchema, widgetSubmissionSchema } from "../validators/widget.validator";

const get = async (req: Request, res: Response) => {
    const widget = await widgetService.getByTenant(req.params.tenantId as string);

    return res.status(200).json({ success: true, data: widget });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateWidgetSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const widget = await widgetService.updateByTenant(req.params.tenantId as string, parsed.data);

    return res.status(200).json({ success: true, data: widget });
};

const submit = async (req: Request, res: Response) => {
    const parsed = widgetSubmissionSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const lead = await widgetService.submitLead(req.params.tenantId as string, parsed.data);

    return res.status(201).json({ success: true, data: { id: lead.id } });
};

export const widgetController = {
    get,
    update,
    submit,
};
