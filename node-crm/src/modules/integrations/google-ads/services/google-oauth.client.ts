import { createHash } from "node:crypto";

import { googleAdsConfig } from "../../../../config/google-ads";
import { BusinessRuleError } from "../../../../shared/errors";
import { googleFetch } from "./google-http";

// OAuth 2.0 do Google para apps web: o cliente autoriza na tela do Google, o CRM troca o
// code por um refresh token (guardado criptografado) e, a cada envio, pede um access token.
// https://developers.google.com/identity/protocols/oauth2/web-server

const TOKEN_EXPIRY_MARGIN_MS = 60 * 1000;
const MS_PER_SECOND = 1000;
const accessTokenCache = new Map<string, { value: string; expiresAt: number }>();

const requireOAuthConfig = () => {
    const { oauthClientId, oauthClientSecret, oauthRedirectUri } = googleAdsConfig;

    if (!oauthClientId || !oauthClientSecret || !oauthRedirectUri) {
        throw new BusinessRuleError(
            "Conexão com o Google Ads não configurada no servidor (defina GOOGLE_ADS_OAUTH_CLIENT_ID, GOOGLE_ADS_OAUTH_CLIENT_SECRET e GOOGLE_ADS_OAUTH_REDIRECT_URI).",
        );
    }

    return { clientId: oauthClientId, clientSecret: oauthClientSecret, redirectUri: oauthRedirectUri };
};

export const isOAuthConfigured = (): boolean =>
    Boolean(googleAdsConfig.oauthClientId && googleAdsConfig.oauthClientSecret && googleAdsConfig.oauthRedirectUri);

// prompt=consent + access_type=offline: garante que o Google devolva o refresh token mesmo
// quando a pessoa já autorizou o app antes (ex.: ao reconectar).
const buildAuthorizationUrl = (state: string): string => {
    const { clientId, redirectUri } = requireOAuthConfig();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: googleAdsConfig.scopes.join(" "),
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
        state,
    });

    return `${googleAdsConfig.authorizeUrl}?${params.toString()}`;
};

type TokenResponse = { access_token: string; expires_in: number; refresh_token?: string; id_token?: string };

const postToken = (params: Record<string, string>): Promise<TokenResponse> =>
    googleFetch<TokenResponse>("Autorização do Google", googleAdsConfig.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params).toString(),
    });

// E-mail da conta Google, lido do id_token. Veio direto do Google por HTTPS nesta mesma troca,
// então basta decodificar (é só para mostrar "Conectado como ...").
const emailFromIdToken = (idToken: string | undefined): string | null => {
    const payload = idToken?.split(".")[1];

    if (!payload) {
        return null;
    }

    try {
        return (JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string }).email ?? null;
    } catch {
        return null;
    }
};

const exchangeCode = async (code: string): Promise<{ refreshToken: string; email: string | null }> => {
    const { clientId, clientSecret, redirectUri } = requireOAuthConfig();
    const tokens = await postToken({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    if (!tokens.refresh_token) {
        throw new BusinessRuleError(
            "O Google não liberou o acesso contínuo à conta. Clique em \"Conectar com o Google Ads\" de novo e aceite todas as permissões.",
        );
    }

    return { refreshToken: tokens.refresh_token, email: emailFromIdToken(tokens.id_token) };
};

const cacheKey = (refreshToken: string): string => createHash("sha256").update(refreshToken).digest("hex");

// Access token de ~1 h, em cache por conexão.
const getAccessToken = async (refreshToken: string): Promise<string> => {
    const key = cacheKey(refreshToken);
    const cached = accessTokenCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    const { clientId, clientSecret } = requireOAuthConfig();
    let tokens: TokenResponse;

    try {
        tokens = await postToken({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
        });
    } catch (error) {
        if (error instanceof BusinessRuleError) {
            throw new BusinessRuleError(
                "A conexão com o Google Ads expirou ou foi removida. Clique em \"Reconectar com o Google Ads\".",
            );
        }

        throw error;
    }

    accessTokenCache.set(key, {
        value: tokens.access_token,
        expiresAt: Date.now() + tokens.expires_in * MS_PER_SECOND - TOKEN_EXPIRY_MARGIN_MS,
    });

    return tokens.access_token;
};

// Melhor esforço: ao desconectar, avisa o Google para invalidar o acesso.
const revoke = async (refreshToken: string): Promise<void> => {
    accessTokenCache.delete(cacheKey(refreshToken));
    await fetch(googleAdsConfig.revokeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: refreshToken }).toString(),
    });
};

export const googleOAuthClient = { buildAuthorizationUrl, exchangeCode, getAccessToken, revoke };
