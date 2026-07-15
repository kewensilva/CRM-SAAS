import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors";
import { logger } from "../logger/logger";
import type { ErrorResponse } from "../types/api-response";

export const errorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const isAppError = error instanceof AppError;
    const statusCode = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : "Erro interno.";

    logger.error({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode,
        message,
        stack: error instanceof Error ? error.stack : undefined,
    });

    const response: ErrorResponse = {
        success: false,
        message,
        errors: isAppError ? error.details : [],
        requestId: req.requestId,
    };

    return res.status(statusCode).json(response);
};
