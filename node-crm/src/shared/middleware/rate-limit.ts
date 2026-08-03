import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

type RateLimitOptions = {
    windowMs: number;
    max: number;
    message: string;
};

// Fábrica genérica para uso em qualquer rota que precise de limite de requisições
// (security.md > Rate Limiting) — aplicada à submissão pública do widget e às rotas de
// autenticação (login/refresh-token).
export const createRateLimiter = (options: RateLimitOptions): RequestHandler => {
    return rateLimit({
        windowMs: options.windowMs,
        limit: options.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: options.message, errors: [] },
    });
};
