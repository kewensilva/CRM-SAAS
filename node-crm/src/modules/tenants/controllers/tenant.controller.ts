import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { tenantService } from "../services/tenant.service";
import { createTenantSchema } from "../validators/tenant.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createTenantSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const tenant = await tenantService.createTenant(parsed.data);

    return res.status(201).json({ success: true, data: tenant });
};

const list = async (req: Request, res: Response) => {
    const tenants = await tenantService.listTenants();

    return res.status(200).json({ success: true, data: tenants });
};

export const tenantController = {
    create,
    list,
};
