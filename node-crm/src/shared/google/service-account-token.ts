import { createSign } from "node:crypto";

import { BusinessRuleError, IntegrationError } from "../errors";
import { logger } from "../logger/logger";

// Fluxo "JWT bearer" de conta de serviço do Google, com crypto nativo (sem googleapis):
// assina um JWT RS256 com a chave privada e troca por um access token de 1 hora. Usado pelas
// integrações que falam com APIs do Google (Analytics Data API, Data Manager API), cada uma
// com o próprio escopo.
// https://developers.google.com/identity/protocols/oauth2/service-account#httprest
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const TOKEN_LIFETIME_SECONDS = 3600;
// Renova um pouco antes de expirar para não usar um token que vence no meio da chamada.
const RENEW_MARGIN_MS = 60 * 1000;

export type ServiceAccountCredentials = {
    email: string | null;
    privateKey: string | null;
    scope: string;
    // Nome das variáveis de ambiente, para a mensagem de "não configurado" dizer o que falta.
    envNames: string;
};

// Um token por conta + escopo.
const cachedTokens = new Map<string, { value: string; expiresAt: number }>();

const base64Url = (value: string | Buffer): string => Buffer.from(value).toString("base64url");

const buildSignedAssertion = (email: string, privateKey: string, scope: string, nowSeconds: number): string => {
    const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64Url(
        JSON.stringify({ iss: email, scope, aud: TOKEN_URL, iat: nowSeconds, exp: nowSeconds + TOKEN_LIFETIME_SECONDS }),
    );
    const unsigned = `${header}.${claims}`;
    const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey);

    return `${unsigned}.${base64Url(signature)}`;
};

const requestAccessToken = async (
    assertion: string,
    envNames: string,
): Promise<{ access_token: string; expires_in: number }> => {
    let response: Response;

    try {
        response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com o Google: ${message}`);
    }

    if (!response.ok) {
        const body = await response.text();

        logger.warn({ status: response.status, body }, "[google] Falha ao obter token da conta de serviço.");

        throw new IntegrationError(`O Google recusou as credenciais da conta de serviço. Confira ${envNames}.`);
    }

    return response.json() as Promise<{ access_token: string; expires_in: number }>;
};

export const hasCredentials = (credentials: ServiceAccountCredentials): boolean =>
    Boolean(credentials.email && credentials.privateKey);

export const getServiceAccountToken = async (credentials: ServiceAccountCredentials): Promise<string> => {
    const { email, privateKey, scope, envNames } = credentials;

    if (!email || !privateKey) {
        throw new BusinessRuleError(`Integração com o Google não configurada no servidor (defina ${envNames}).`);
    }

    const cacheKey = `${email}|${scope}`;
    const cached = cachedTokens.get(cacheKey);

    if (cached && cached.expiresAt - RENEW_MARGIN_MS > Date.now()) {
        return cached.value;
    }

    let assertion: string;

    try {
        assertion = buildSignedAssertion(email, privateKey, scope, Math.floor(Date.now() / 1000));
    } catch {
        throw new BusinessRuleError(
            `Chave privada da conta de serviço inválida (${envNames}) — use o campo private_key do JSON.`,
        );
    }

    const token = await requestAccessToken(assertion, envNames);

    cachedTokens.set(cacheKey, { value: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 });

    return token.access_token;
};
