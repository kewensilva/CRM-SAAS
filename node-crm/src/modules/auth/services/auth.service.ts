import { comparePassword, hashPassword } from "../../../shared/auth/password";
import { jwtService } from "../../../shared/auth/jwt";
import { AuthenticationError, AuthorizationError } from "../../../shared/errors";
import { analystRepository } from "../../analysts/repositories/analyst.repository";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { LoginDTO, LoginResult } from "../dto/login.dto";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos.";

const issueTokens = (user: {
    id: string;
    tenantId: string | null;
    profile: string;
    mustChangePassword: boolean;
}): LoginResult => {
    const payload = { sub: user.id, tenantId: user.tenantId, profile: user.profile };

    return {
        accessToken: jwtService.signAccessToken(payload),
        refreshToken: jwtService.signRefreshToken(payload),
        mustChangePassword: user.mustChangePassword,
    };
};

// Login com tenantSlug explícito — continua funcionando nesta branch (útil se algum dia
// voltar a ter subdomínio por tenant), mas o fluxo padrão do formulário (só e-mail/senha)
// não manda isso, já que o front-end aqui é servido sempre no mesmo domínio estático.
const loginWithTenantSlug = async (data: LoginDTO & { tenantSlug: string }): Promise<LoginResult> => {
    const tenant = await tenantRepository.findByDomain(data.tenantSlug);

    if (!tenant || tenant.status !== "ACTIVE") {
        throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    const user = await userRepository.findByTenantAndEmail(tenant.id, data.email);

    if (!user || user.status !== "ACTIVE" || !(await comparePassword(data.password, user.passwordHash))) {
        throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    return issueTokens(user);
};

// BRANCH "static-domain": um único domínio (crm-cmb.com.br) serve todos os tenants, sem
// subdomínio — não há como saber de antemão a qual tenant o e-mail pertence (e-mail só é
// único DENTRO do tenant, não globalmente, ver business-rules.md). Tenta a senha em cada
// candidato plausível até achar o certo, começando pelo Owner/Analista (tenantId nulo,
// sempre único).
const loginByEmailOnly = async (data: LoginDTO): Promise<LoginResult> => {
    const platformCandidate = await userRepository.findByTenantAndEmail(null, data.email);

    if (
        platformCandidate &&
        platformCandidate.status === "ACTIVE" &&
        (await comparePassword(data.password, platformCandidate.passwordHash))
    ) {
        return issueTokens(platformCandidate);
    }

    const tenantCandidates = await userRepository.findActiveByEmailAcrossTenants(data.email);

    for (const candidate of tenantCandidates) {
        if (await comparePassword(data.password, candidate.passwordHash)) {
            return issueTokens(candidate);
        }
    }

    throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
};

const login = (data: LoginDTO): Promise<LoginResult> => {
    if (data.tenantSlug) {
        return loginWithTenantSlug({ ...data, tenantSlug: data.tenantSlug });
    }

    return loginByEmailOnly(data);
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
        mustChangePassword: user.mustChangePassword,
    };
};

// Analista base (perfil ANALYST, tenantId nulo) ou já trocado de contexto (analystId na
// claim) — em ambos os casos, o id do usuário Analista real é o que decide a que tenants
// ele tem acesso (ver AnalystTenantAccess). Qualquer outro perfil não tem acesso a isso.
const resolveAnalystId = (auth: { userId: string; profile: string; analystId?: string }): string => {
    const analystId = auth.analystId ?? (auth.profile === "ANALYST" ? auth.userId : null);

    if (!analystId) {
        throw new AuthorizationError("Somente Analistas podem trocar de base de cliente.");
    }

    return analystId;
};

const myTenantAccess = async (auth: {
    userId: string;
    profile: string;
    analystId?: string;
}): Promise<{ tenantId: string; tenantName: string }[]> => {
    const analystId = resolveAnalystId(auth);
    const analyst = await analystRepository.findByIdWithAccess(analystId);

    return analyst?.tenantAccess ?? [];
};

// Troca de contexto do Analista: emite um novo par de tokens com profile "TENANT_ADMIN" e
// o tenantId escolhido — a partir daí ele opera exatamente como um Tenant Admin nesse
// tenant, sem precisar mudar nenhuma checagem de authorize() no resto do sistema. A claim
// "analystId" preserva quem ele realmente é, pra poder trocar de novo depois.
const switchTenant = async (
    auth: { userId: string; profile: string; analystId?: string },
    tenantId: string,
): Promise<LoginResult> => {
    const analystId = resolveAnalystId(auth);
    const accessibleTenantIds = await analystRepository.listAccessibleTenantIds(analystId);

    if (!accessibleTenantIds.includes(tenantId)) {
        throw new AuthorizationError("Você não tem acesso a esta empresa.");
    }

    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant || tenant.status !== "ACTIVE") {
        throw new AuthenticationError("Empresa inválida ou inativa.");
    }

    const payload = { sub: analystId, tenantId: tenant.id, profile: "TENANT_ADMIN", analystId };

    return {
        accessToken: jwtService.signAccessToken(payload),
        refreshToken: jwtService.signRefreshToken(payload),
        // Só chega aqui quem já passou pela gate de troca de senha no login original
        // (senão nem teria token válido pra chamar isto) — nunca true aqui.
        mustChangePassword: false,
    };
};

// Troca de senha feita pelo próprio usuário autenticado (fluxo obrigatório de primeiro
// acesso, ou depois de um reset feito por um Tenant Admin) — pede a senha ATUAL, ao
// contrário do reset administrativo em user.service.ts (changePasswordInTenant), que é
// feito em nome de outra pessoa e por isso não pede senha nenhuma.
const changeOwnPassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
): Promise<void> => {
    const user = await userRepository.findById(userId);

    if (!user || !(await comparePassword(currentPassword, user.passwordHash))) {
        throw new AuthenticationError("Senha atual inválida.");
    }

    const passwordHash = await hashPassword(newPassword);

    await userRepository.updatePasswordHash(userId, passwordHash, { mustChangePassword: false });
};

export const authService = {
    login,
    refresh,
    myTenantAccess,
    switchTenant,
    changeOwnPassword,
};
