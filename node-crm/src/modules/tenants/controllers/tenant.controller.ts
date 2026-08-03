import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { createUserSchema, updateUserSchema } from "../../users/validators/user.validator";
import { userService } from "../../users/services/user.service";
import { tenantService } from "../services/tenant.service";
import { createTenantSchema, updateTenantSchema } from "../validators/tenant.validator";

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

const update = async (req: Request, res: Response) => {
    const parsed = updateTenantSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const tenant = await tenantService.updateTenant(req.params.id as string, parsed.data);

    return res.status(200).json({ success: true, data: tenant });
};

const remove = async (req: Request, res: Response) => {
    await tenantService.deleteTenant(req.params.id as string);

    return res.status(204).send();
};

const listUsers = async (req: Request, res: Response) => {
    await tenantService.getTenant(req.params.id as string);
    const users = await userService.listUsersByTenant(req.params.id as string);

    return res.status(200).json({
        success: true,
        data: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            status: user.status,
        })),
    });
};

const createUserForTenant = async (req: Request, res: Response) => {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    await tenantService.getTenant(req.params.id as string);

    const user = await userService.createUser({ ...parsed.data, tenantId: req.params.id as string });

    return res.status(201).json({
        success: true,
        data: { id: user.id, name: user.name, email: user.email, profile: user.profile, status: user.status },
    });
};

const updateUserForTenant = async (req: Request, res: Response) => {
    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const user = await userService.updateUserInTenant(
        req.params.userId as string,
        req.params.id as string,
        parsed.data,
    );

    return res.status(200).json({
        success: true,
        data: { id: user.id, name: user.name, email: user.email, profile: user.profile, status: user.status },
    });
};

const removeUserForTenant = async (req: Request, res: Response) => {
    await userService.deleteUserInTenant(req.params.userId as string, req.params.id as string);

    return res.status(204).send();
};

export const tenantController = {
    create,
    list,
    update,
    remove,
    listUsers,
    createUserForTenant,
    updateUserForTenant,
    removeUserForTenant,
};
