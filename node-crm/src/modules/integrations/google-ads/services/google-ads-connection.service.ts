import { googleAdsConfig } from "../../../../config/google-ads";
import { createOAuthState, verifyOAuthState } from "../../../../shared/auth/oauth-state";
import { AuthenticationError, BusinessRuleError } from "../../../../shared/errors";
import type { SelectGoogleAdsAccountDTO } from "../dto/google-ads.dto";
import { googleAdsConnectionRepository } from "../repositories/google-ads-connection.repository";
import type {
    GoogleAdsAccount,
    GoogleAdsConnection,
    GoogleAdsConnectionPublic,
    GoogleAdsConversionAction,
} from "../types/google-ads.types";
import { googleAdsApiClient, isListingAvailable } from "./google-ads-api.client";
import { googleOAuthClient, isOAuthConfigured } from "./google-oauth.client";

export const toPublicConnection = (connection: GoogleAdsConnection | null): GoogleAdsConnectionPublic => ({
    connected: Boolean(connection?.refreshToken),
    googleEmail: connection?.refreshToken ? connection.googleEmail : null,
    customerId: connection?.customerId ?? null,
    customerName: connection?.customerName ?? null,
    loginCustomerId: connection?.loginCustomerId ?? null,
    oauthConfigured: isOAuthConfigured(),
    listingAvailable: isListingAvailable(),
});

const stateSecret = (): string => {
    if (!googleAdsConfig.oauthClientSecret) {
        throw new BusinessRuleError("Conexão com o Google Ads não configurada no servidor (defina GOOGLE_ADS_OAUTH_CLIENT_SECRET).");
    }

    return googleAdsConfig.oauthClientSecret;
};

const getConnection = async (tenantId: string): Promise<GoogleAdsConnectionPublic> =>
    toPublicConnection(await googleAdsConnectionRepository.findByTenant(tenantId));

const buildAuthorizationUrl = (tenantId: string, userId: string): string =>
    googleOAuthClient.buildAuthorizationUrl(createOAuthState(tenantId, userId, stateSecret()));

// Volta do Google com ?code&state: guarda o refresh token. Reconectar com outra conta Google
// mantém a conta de anúncios escolhida — o cliente confere na tela.
const completeAuthorization = async (
    tenantId: string,
    userId: string,
    code: string,
    state: string,
): Promise<GoogleAdsConnectionPublic> => {
    if (!verifyOAuthState(state, tenantId, userId, stateSecret())) {
        throw new AuthenticationError("Autorização inválida ou expirada. Clique em \"Conectar com o Google Ads\" novamente.");
    }

    const { refreshToken, email } = await googleOAuthClient.exchangeCode(code);
    const previous = await googleAdsConnectionRepository.findByTenant(tenantId);

    if (previous?.refreshToken && previous.refreshToken !== refreshToken) {
        await googleOAuthClient.revoke(previous.refreshToken).catch(() => undefined);
    }

    return toPublicConnection(await googleAdsConnectionRepository.upsertByTenant(tenantId, { refreshToken, googleEmail: email }));
};

// Conexão pronta para falar com o Google: conta Google conectada (+ conta de anúncios, quando
// exigido).
export const requireConnection = async (tenantId: string, needsAccount: boolean) => {
    const connection = await googleAdsConnectionRepository.findByTenant(tenantId);

    if (!connection?.refreshToken) {
        throw new BusinessRuleError("Conecte a conta do Google Ads primeiro.");
    }

    if (needsAccount && !connection.customerId) {
        throw new BusinessRuleError("Escolha a conta de anúncios do Google Ads primeiro.");
    }

    return { connection, accessToken: await googleOAuthClient.getAccessToken(connection.refreshToken) };
};

const listAccounts = async (tenantId: string): Promise<GoogleAdsAccount[]> => {
    const { accessToken } = await requireConnection(tenantId, false);

    return googleAdsApiClient.listAccounts(accessToken);
};

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

const selectAccount = async (tenantId: string, data: SelectGoogleAdsAccountDTO): Promise<GoogleAdsConnectionPublic> => {
    await requireConnection(tenantId, false);

    const customerId = digitsOnly(data.customerId);
    const updated = await googleAdsConnectionRepository.upsertByTenant(tenantId, {
        customerId,
        loginCustomerId: data.loginCustomerId ? digitsOnly(data.loginCustomerId) : customerId,
        customerName: data.customerName?.trim() || null,
    });

    return toPublicConnection(updated);
};

const listConversionActions = async (tenantId: string): Promise<GoogleAdsConversionAction[]> => {
    const { connection, accessToken } = await requireConnection(tenantId, true);
    const customerId = connection.customerId as string;

    return googleAdsApiClient.listConversionActions(accessToken, customerId, connection.loginCustomerId ?? customerId);
};

// Desconectar: avisa o Google (melhor esforço) e apaga o token. Regras e histórico ficam —
// voltam a funcionar ao reconectar.
const disconnect = async (tenantId: string): Promise<GoogleAdsConnectionPublic> => {
    const connection = await googleAdsConnectionRepository.findByTenant(tenantId);

    if (connection?.refreshToken) {
        await googleOAuthClient.revoke(connection.refreshToken).catch(() => undefined);
    }

    return toPublicConnection(
        await googleAdsConnectionRepository.upsertByTenant(tenantId, { refreshToken: null, googleEmail: null }),
    );
};

export const googleAdsConnectionService = {
    getConnection,
    buildAuthorizationUrl,
    completeAuthorization,
    listAccounts,
    selectAccount,
    listConversionActions,
    disconnect,
};
