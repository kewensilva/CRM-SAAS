import { createSign } from "node:crypto";

import { googleAnalyticsConfig } from "../../../../config/google-analytics";
import { BusinessRuleError, IntegrationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";

// Fluxo "JWT bearer" de conta de serviço do Google, com crypto nativo (sem googleapis):
// assina um JWT RS256 com a chave privada e troca por um access token de 1 hora.
// https://developers.google.com/identity/protocols/oauth2/service-account#httprest
const TOKEN_LIFETIME_SECONDS = 3600;
// Renova um pouco antes de expirar para não usar um token que vence no meio da chamada.
const RENEW_MARGIN_MS = 60 * 1000;

let cachedToken: { value: string; expiresAt: number } | null = null;

const base64Url = (value: string | Buffer): string => Buffer.from(value).toString("base64url");

export const hasServiceAccountCredentials = (): boolean =>
    Boolean(googleAnalyticsConfig.serviceAccountEmail && googleAnalyticsConfig.serviceAccountPrivateKey);

const buildSignedAssertion = (email: string, privateKey: string, nowSeconds: number): string => {
    const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64Url(
        JSON.stringify({
            iss: email,
            scope: googleAnalyticsConfig.scope,
            aud: googleAnalyticsConfig.tokenUrl,
            iat: nowSeconds,
            exp: nowSeconds + TOKEN_LIFETIME_SECONDS,
        }),
    );
    const unsigned = `${header}.${claims}`;
    const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey);

    return `${unsigned}.${base64Url(signature)}`;
};

const requestAccessToken = async (assertion: string): Promise<{ access_token: string; expires_in: number }> => {
    let response: Response;

    try {
        response = await fetch(googleAnalyticsConfig.tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion,
            }).toString(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com o Google: ${message}`);
    }

    if (!response.ok) {
        const body = await response.text();

        logger.warn({ status: response.status, body }, "[google-analytics] Falha ao obter token da conta de serviço.");

        throw new IntegrationError(
            "O Google recusou as credenciais da conta de serviço. Confira GA_SERVICE_ACCOUNT_EMAIL e GA_SERVICE_ACCOUNT_PRIVATE_KEY.",
        );
    }

    return response.json() as Promise<{ access_token: string; expires_in: number }>;
};

export const getServiceAccountAccessToken = async (): Promise<string> => {
    const { serviceAccountEmail, serviceAccountPrivateKey } = googleAnalyticsConfig;

    if (!serviceAccountEmail || !serviceAccountPrivateKey) {
        throw new BusinessRuleError(
            "Google Analytics não configurado no servidor (defina GA_SERVICE_ACCOUNT_EMAIL e GA_SERVICE_ACCOUNT_PRIVATE_KEY).",
        );
    }

    if (cachedToken && cachedToken.expiresAt - RENEW_MARGIN_MS > Date.now()) {
        return cachedToken.value;
    }

    let assertion: string;

    try {
        assertion = buildSignedAssertion(serviceAccountEmail, serviceAccountPrivateKey, Math.floor(Date.now() / 1000));
    } catch {
        throw new BusinessRuleError(
            "GA_SERVICE_ACCOUNT_PRIVATE_KEY inválida — use o campo private_key do JSON da conta de serviço.",
        );
    }

    const token = await requestAccessToken(assertion);

    cachedToken = { value: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 };

    return token.access_token;
};
