import { comparePassword } from "../../../shared/auth/password";
import { jwtService } from "../../../shared/auth/jwt";
import { AuthenticationError, AuthorizationError } from "../../../shared/errors";
import { analystRepository } from "../../analysts/repositories/analyst.repository";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { LoginDTO, LoginResult } from "../dto/login.dto";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos.";

const issueTokens = (user: { id: string; tenantId: string | null; profile: string }): LoginResult => {
    const payload = { sub: user.id, tenantId: user.tenantId, profile: user.profile };

    return {
        accessToken: jwtService.signAccessToken(payload),
        refreshToken: jwtService.signRefreshToken(payload),
    };
};

// Login num subdomínio de tenant (crm.cmb.<slug>.com) — o front-end resolve o slug a
// partir do próprio hostname do navegador e manda aqui, sem nenhum campo visível pro
// usuário preencher. Resolve o tenant pelo domínio e busca o usuário só ali.
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

// Login no domínio base (crm.cmb.com, sem subdomínio de tenant) — só usuários da
// plataforma (tenantId nulo: Owner ou Analista) entram por aqui. Não tenta adivinhar
// tenant nenhum: cada tenant só é acessível pelo próprio subdomínio (loginWithTenantSlug).
const loginPlatformUser = async (data: LoginDTO): Promise<LoginResult> => {
    const candidate = await userRepository.findByTenantAndEmail(null, data.email);

    if (
        !candidate ||
        candidate.status !== "ACTIVE" ||
        !(await comparePassword(data.password, candidate.passwordHash))
    ) {
        throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    return issueTokens(candidate);
};

const login = (data: LoginDTO): Promise<LoginResult> => {
    if (data.tenantSlug) {
        return loginWithTenantSlug({ ...data, tenantSlug: data.tenantSlug });
    }

    return loginPlatformUser(data);
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
    };
};

export const authService = {
    login,
    refresh,
    myTenantAccess,
    switchTenant,
};
