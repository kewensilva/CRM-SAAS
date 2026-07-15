import { comparePassword } from "../../../shared/auth/password";
import { jwtService } from "../../../shared/auth/jwt";
import { AuthenticationError } from "../../../shared/errors";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { LoginDTO, LoginResult } from "../dto/login.dto";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos.";

const login = async (data: LoginDTO): Promise<LoginResult> => {
    let tenantId: string | null = null;

    if (data.tenantSlug) {
        const tenant = await tenantRepository.findByDomain(data.tenantSlug);

        if (!tenant || tenant.status !== "ACTIVE") {
            throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
        }

        tenantId = tenant.id;
    }

    const user = await userRepository.findByTenantAndEmail(tenantId, data.email);

    if (!user || user.status !== "ACTIVE") {
        throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    const payload = { sub: user.id, tenantId: user.tenantId, profile: user.profile };

    return {
        accessToken: jwtService.signAccessToken(payload),
        refreshToken: jwtService.signRefreshToken(payload),
    };
};

const refresh = async (refreshToken: string): Promise<LoginResult> => {
    let payload;

    try {
        payload = jwtService.verifyRefreshToken(refreshToken);
    } catch {
        throw new AuthenticationError("Refresh token inválido ou expirado.");
    }

    const user = await userRepository.findById(payload.sub);

    if (!user || user.status !== "ACTIVE") {
        throw new AuthenticationError("Refresh token inválido ou expirado.");
    }

    const newPayload = { sub: user.id, tenantId: user.tenantId, profile: user.profile };

    return {
        accessToken: jwtService.signAccessToken(newPayload),
        refreshToken: jwtService.signRefreshToken(newPayload),
    };
};

export const authService = {
    login,
    refresh,
};
