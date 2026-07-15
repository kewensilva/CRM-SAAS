import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { leadService } from "../services/lead.service";
import { createLeadSchema } from "../validators/lead.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createLeadSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    // Responsável assume-se como o próprio usuário autenticado até o Pipeline
    // permitir reatribuição (ver business-rules.md — Leads > Responsável).
    const lead = await leadService.createLead({
        ...parsed.data,
        tenantId: req.auth.tenantId as string,
        responsibleUserId: req.auth.userId,
    });

    return res.status(201).json({ success: true, data: lead });
};

const list = async (req: Request, res: Response) => {
    const leads = await leadService.listLeadsByTenant(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: leads });
};

export const leadController = {
    create,
    list,
};
