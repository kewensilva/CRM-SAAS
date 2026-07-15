import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { leadService } from "../services/lead.service";
import { createLeadSchema } from "../validators/lead.validator";

const create = (req: Request, res: Response) => {
    const parsed = createLeadSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const lead = leadService.createLead(parsed.data);

    return res.status(201).json({ success: true, data: lead });
};

const list = (req: Request, res: Response) => {
    const leads = leadService.listLeads();

    return res.status(200).json({ success: true, data: leads });
};

export const leadController = {
    create,
    list,
};
