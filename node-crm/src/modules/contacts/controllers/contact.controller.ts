import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { contactService } from "../services/contact.service";
import { createContactSchema, updateContactSchema } from "../validators/contact.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createContactSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const contact = await contactService.createContact({
        ...parsed.data,
        tenantId: req.auth.tenantId as string,
    });

    return res.status(201).json({ success: true, data: contact });
};

const get = async (req: Request, res: Response) => {
    const contact = await contactService.getContact(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: contact });
};

const list = async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const companyId = typeof req.query.companyId === "string" ? req.query.companyId : undefined;

    const { items, pagination } = await contactService.listContacts(
        req.auth.tenantId as string,
        page,
        pageSize,
        companyId,
        search,
    );

    return res.status(200).json({ success: true, data: items, pagination });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateContactSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const contact = await contactService.updateContact(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: contact });
};

const remove = async (req: Request, res: Response) => {
    await contactService.deleteContact(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

export const contactController = {
    create,
    get,
    list,
    update,
    remove,
};
