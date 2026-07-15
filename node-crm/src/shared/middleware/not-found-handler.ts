import type { Request, Response } from "express";

import type { ErrorResponse } from "../types/api-response";

export const notFoundHandler = (req: Request, res: Response) => {
    const response: ErrorResponse = {
        success: false,
        message: "Rota não encontrada.",
        errors: [],
        requestId: req.requestId,
    };

    return res.status(404).json(response);
};
