import jwt from "jsonwebtoken";

import { jwtConfig } from "../../config/jwt";

export type JwtPayload = {
    sub: string;
    tenantId: string | null;
    profile: string;
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
