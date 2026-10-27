import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { supportTicketService } from "../services/support-ticket.service";
import { createSupportTicketSchema } from "../validators/support-ticket.validator";

// tenantId e autor vêm sempre do token — nunca do corpo da requisição.
const requesterOf = (req: Request) => ({
    userId: req.auth.userId,
    tenantId: req.auth.tenantId as string,
    profile: req.auth.profile,
});

const list = async (req: Request, res: Response) => {
    const tickets = await supportTicketService.list(requesterOf(req));

    return res.status(200).json({ success: true, data: tickets });
};

const create = async (req: Request, res: Response) => {
    const parsed = createSupportTicketSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const ticket = await supportTicketService.create(requesterOf(req), parsed.data);

    return res.status(201).json({ success: true, data: ticket });
};

const resend = async (req: Request, res: Response) => {
    const ticket = await supportTicketService.resend(requesterOf(req), req.params.id as string);

    return res.status(200).json({ success: true, data: ticket });
};

export const supportTicketController = {
    list,
    create,
    resend,
};
