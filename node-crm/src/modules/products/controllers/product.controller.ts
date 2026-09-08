import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { productService } from "../services/product.service";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";

const list = async (req: Request, res: Response) => {
    const products = await productService.list(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: products });
};

const create = async (req: Request, res: Response) => {
    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const product = await productService.create({
        tenantId: req.auth.tenantId as string,
        ...parsed.data,
    });

    return res.status(201).json({ success: true, data: product });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const product = await productService.update(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: product });
};

const remove = async (req: Request, res: Response) => {
    await productService.remove(req.params.id as string, req.auth.tenantId as string);

    return res.status(204).send();
};

export const productController = {
    list,
    create,
    update,
    remove,
};
