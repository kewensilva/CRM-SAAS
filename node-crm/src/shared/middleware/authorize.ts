import type { NextFunction, Request, Response } from "express";

import { AuthorizationError } from "../errors";

export const authorize = (...profiles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!profiles.includes(req.auth.profile)) {
            throw new AuthorizationError("Permissão insuficiente.");
        }

        next();
    };
};
