import type { NextFunction, Request, Response } from "express";

import { jwtService } from "../auth/jwt";
import { AuthenticationError } from "../errors";

declare global {
    namespace Express {
        interface Request {
            auth: {
                userId: string;
                tenantId: string | null;
                profile: string;
            };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        throw new AuthenticationError("Token de autenticação ausente.");
    }

    const token = header.slice("Bearer ".length);

    try {
        const payload = jwtService.verifyAccessToken(token);

        req.auth = {
            userId: payload.sub,
            tenantId: payload.tenantId,
            profile: payload.profile,
        };

        next();
    } catch {
        throw new AuthenticationError("Token de autenticação inválido ou expirado.");
    }
};
