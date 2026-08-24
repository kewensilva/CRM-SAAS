import jwt from "jsonwebtoken";

import { jwtConfig } from "../../config/jwt";

export type JwtPayload = {
    sub: string;
    tenantId: string | null;
    profile: string;
    // Presente só em tokens emitidos via POST /auth/switch-tenant: o id do usuário
    // ANALYST original, mesmo com profile "TENANT_ADMIN" no restante do token (opera com
    // o mesmo poder de um Tenant Admin dentro do tenant escolhido).
    analystId?: string;
    // Mesma ideia de analystId, mas para o Owner acessando diretamente a base de um
    // cliente (POST /auth/enter-tenant) — preserva quem ele realmente é, pra permitir
    // voltar à visão de plataforma depois (POST /auth/exit-tenant).
    ownerId?: string;
};

const signAccessToken = (payload: JwtPayload): string => {
    const options = { expiresIn: jwtConfig.accessExpiresIn } as unknown as jwt.SignOptions;

    return jwt.sign(payload, jwtConfig.accessSecret, options);
};

const signRefreshToken = (payload: JwtPayload): string => {
    const options = { expiresIn: jwtConfig.refreshExpiresIn } as unknown as jwt.SignOptions;

    return jwt.sign(payload, jwtConfig.refreshSecret, options);
};

const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;
};

const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
};

export const jwtService = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
