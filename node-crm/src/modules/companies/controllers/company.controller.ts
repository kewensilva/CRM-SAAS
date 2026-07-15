import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { companyService } from "../services/company.service";
import { createCompanySchema, updateCompanySchema } from "../validators/company.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createCompanySchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const company = await companyService.createCompany({
        ...parsed.data,
        tenantId: req.auth.tenantId as string,
    });

    return res.status(201).json({ success: true, data: company });
};

const get = async (req: Request, res: Response) => {
    const company = await companyService.getCompany(
        req.params.id as string,
        req.auth.tenantId as string,
    );

    return res.status(200).json({ success: true, data: company });
};

const list = async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const { items, pagination } = await companyService.listCompanies(
        req.auth.tenantId as string,
        page,
        pageSize,
        search,
    );

    return res.status(200).json({ success: true, data: items, pagination });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateCompanySchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const company = await companyService.updateCompany(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: company });
};

const remove = async (req: Request, res: Response) => {
    await companyService.deleteCompany(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

export const companyController = {
    create,
    get,
    list,
    update,
    remove,
};
