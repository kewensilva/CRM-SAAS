import { randomBytes } from "node:crypto";

import { metaConfig } from "../../../../config/meta";
import {
    AuthenticationError,
    BusinessRuleError,
    IntegrationError,
    NotFoundError,
} from "../../../../shared/errors";
import { metaIntegrationRepository } from "../repositories/meta-integration.repository";
import type { MetaIntegration } from "../types/meta-integration.types";
import { metaGraphApiClient } from "./meta-graph-api.client";
import { createOAuthState, verifyOAuthState } from "./meta-oauth-state";

// Páginas e tokens ficam SÓ no servidor, em memória, entre "autorizou no Facebook" e
// "escolheu a Página" (poucos minutos). O navegador recebe apenas id e nome das Páginas —
// nunca os tokens. Limitação conhecida: se o servidor reiniciar nesse intervalo, o usuário
// precisa clicar em "Conectar com o Facebook" de novo (e com mais de uma instância da API
// seria preciso trocar por Redis/banco).
type PendingPage = { id: string; name: string; accessToken: string };
type PendingSession = { tenantId: string; userId: string; pages: PendingPage[]; expiresAt: number };

const SESSION_TTL_MS = 10 * 60 * 1000;
const pendingSessions = new Map<string, PendingSession>();

const purgeExpiredSessions = (): void => {
    const now = Date.now();

    for (const [id, session] of pendingSessions) {
        if (session.expiresAt <= now) {
            pendingSessions.delete(id);
        }
    }
};

const requireOAuthConfig = (): { appId: string; redirectUri: string } => {
    if (!metaConfig.appId || !metaConfig.oauthRedirectUri) {
        throw new BusinessRuleError(
            "Login com Facebook não configurado no servidor (defina META_APP_ID e META_OAUTH_REDIRECT_URI).",
        );
    }

    return { appId: metaConfig.appId, redirectUri: metaConfig.oauthRedirectUri };
};

// URL da tela de autorização da Meta, para onde o front redireciona o usuário.
const buildAuthorizationUrl = (tenantId: string, userId: string): string => {
    const { appId, redirectUri } = requireOAuthConfig();

    const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        state: createOAuthState(tenantId, userId, metaConfig.appSecret),
        scope: metaConfig.oauthScopes.join(","),
        response_type: "code",
    });

    return `${metaConfig.oauthDialogUrl}?${params.toString()}`;
};

// Passo 1: troca o code por token de longa duração, lista as Páginas do usuário e guarda
// tudo no servidor sob um sessionId. Devolve só id e nome das Páginas.
const exchangeCode = async (
    tenantId: string,
    userId: string,
    code: string,
    state: string,
): Promise<{ sessionId: string; pages: { id: string; name: string }[] }> => {
    const { appId, redirectUri } = requireOAuthConfig();

    if (!verifyOAuthState(state, tenantId, userId, metaConfig.appSecret)) {
        throw new AuthenticationError(
            "Autorização inválida ou expirada. Clique em \"Conectar com o Facebook\" novamente.",
        );
    }

    const shortLived = await metaGraphApiClient.exchangeCodeForUserToken(code, appId, redirectUri);
    const longLived = await metaGraphApiClient.extendUserToken(shortLived.access_token, appId);
    const managedPages = await metaGraphApiClient.listManagedPages(longLived.access_token);

    purgeExpiredSessions();

    if (managedPages.length === 0) {
        return { sessionId: "", pages: [] };
    }

    const sessionId = randomBytes(24).toString("hex");

    pendingSessions.set(sessionId, {
        tenantId,
        userId,
        pages: managedPages.map((page) => ({
            id: page.id,
            name: page.name,
            accessToken: page.access_token,
        })),
        expiresAt: Date.now() + SESSION_TTL_MS,
    });

    return {
        sessionId,
        pages: managedPages.map((page) => ({ id: page.id, name: page.name })),
    };
};

// Passo 2: assina a Página escolhida no webhook e grava a integração.
const connectPage = async (
    tenantId: string,
    userId: string,
    sessionId: string,
    pageId: string,
): Promise<MetaIntegration> => {
    purgeExpiredSessions();

    const session = pendingSessions.get(sessionId);

    if (!session || session.tenantId !== tenantId || session.userId !== userId) {
        throw new NotFoundError(
            "Sessão de conexão expirada. Clique em \"Conectar com o Facebook\" novamente.",
        );
    }

    const page = session.pages.find((candidate) => candidate.id === pageId);

    if (!page) {
        throw new NotFoundError("Página não encontrada entre as autorizadas.");
    }

    const subscription = await metaGraphApiClient.subscribePageToLeadgen(page.id, page.accessToken);

    if (!subscription.success) {
        throw new IntegrationError("A Meta não confirmou a assinatura da Página no webhook.");
    }

    const current = await metaIntegrationRepository.findByTenant(tenantId);

    // Trocou de Página: remove a assinatura da anterior (melhor esforço — se falhar, não
    // impede a conexão da nova).
    if (current?.pageId && current.pageId !== page.id && current.pageAccessToken) {
        await metaGraphApiClient
            .unsubscribePage(current.pageId, current.pageAccessToken)
            .catch(() => undefined);
    }

    const integration = await metaIntegrationRepository.upsertByTenant(tenantId, {
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.accessToken,
        // A integração só liga sozinha se já existir responsável padrão — sem ele os leads
        // não teriam dono. Caso contrário o usuário escolhe o responsável e ativa na tela.
        enabled: Boolean(current?.defaultResponsibleUserId),
    });

    pendingSessions.delete(sessionId);

    return integration;
};

// Remove a assinatura do webhook (melhor esforço) e apaga Página e token do CRM.
const disconnect = async (tenantId: string): Promise<MetaIntegration> => {
    const current = await metaIntegrationRepository.findByTenant(tenantId);

    if (!current) {
        throw new NotFoundError("Integração Meta Lead Ads ainda não configurada para este tenant.");
    }

    if (current.pageId && current.pageAccessToken) {
        await metaGraphApiClient
            .unsubscribePage(current.pageId, current.pageAccessToken)
            .catch(() => undefined);
    }

    return metaIntegrationRepository.upsertByTenant(tenantId, {
        enabled: false,
        pageId: null,
        pageName: null,
        pageAccessToken: null,
    });
};

export const metaOAuthService = {
    buildAuthorizationUrl,
    exchangeCode,
    connectPage,
    disconnect,
};