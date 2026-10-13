import { metaConfig } from "../../../../config/meta";
import { IntegrationError } from "../../../../shared/errors";
import type { MetaLeadFieldData } from "../types/meta-integration.types";

// Busca os dados completos do lead na Graph API — o webhook só avisa que um lead chegou
// (leadgen_id), os campos do formulário (nome, e-mail, telefone) vêm daqui.
// https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving
const fetchLeadFieldData = async (
    leadgenId: string,
    pageAccessToken: string,
): Promise<MetaLeadFieldData> => {
    const url = `${metaConfig.graphApiBaseUrl}/${leadgenId}?access_token=${encodeURIComponent(pageAccessToken)}`;

    let response: Response;

    try {
        response = await fetch(url);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com a Graph API da Meta: ${message}`);
    }

    if (!response.ok) {
        const body = await response.text();

        throw new IntegrationError(`Graph API retornou ${response.status}: ${body}`);
    }

    return response.json() as Promise<MetaLeadFieldData>;
};

// Chamada genérica à Graph API. GET leva os parâmetros na query; POST/DELETE no corpo
// (form-urlencoded), para não deixar tokens e segredos em URLs de requisições de escrita.
const callGraph = async <T>(
    path: string,
    params: Record<string, string>,
    method: "GET" | "POST" | "DELETE" = "GET",
): Promise<T> => {
    const search = new URLSearchParams(params).toString();
    const url = `${metaConfig.graphApiBaseUrl}/${path}`;

    let response: Response;

    try {
        response =
            method === "GET"
                ? await fetch(`${url}?${search}`)
                : await fetch(url, {
                      method,
                      headers: { "Content-Type": "application/x-www-form-urlencoded" },
                      body: search,
                  });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com a Graph API da Meta: ${message}`);
    }

    if (!response.ok) {
        const body = await response.text();

        throw new IntegrationError(`Graph API retornou ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
};

type TokenResponse = { access_token: string };

export type MetaManagedPage = { id: string; name: string; access_token: string };

// code (devolvido pela Meta na URL de retorno) -> token de usuário de curta duração.
const exchangeCodeForUserToken = (
    code: string,
    appId: string,
    redirectUri: string,
): Promise<TokenResponse> =>
    callGraph<TokenResponse>("oauth/access_token", {
        client_id: appId,
        client_secret: metaConfig.appSecret,
        redirect_uri: redirectUri,
        code,
    });

// Token de curta duração -> token de longa duração. Os tokens de Página obtidos a partir
// de um token de usuário de longa duração não expiram.
const extendUserToken = (shortLivedToken: string, appId: string): Promise<TokenResponse> =>
    callGraph<TokenResponse>("oauth/access_token", {
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: metaConfig.appSecret,
        fb_exchange_token: shortLivedToken,
    });

// Páginas que o usuário administra, já com o token de cada uma (permissão pages_show_list).
const listManagedPages = async (userToken: string): Promise<MetaManagedPage[]> => {
    const result = await callGraph<{ data: MetaManagedPage[] }>("me/accounts", {
        fields: "id,name,access_token",
        limit: "100",
        access_token: userToken,
    });

    return result.data ?? [];
};

// Assina a Página no campo "leadgen" do nosso app — sem isso a Meta não envia os leads
// para o webhook (permissão pages_manage_metadata).
const subscribePageToLeadgen = (pageId: string, pageToken: string): Promise<{ success: boolean }> =>
    callGraph<{ success: boolean }>(
        `${pageId}/subscribed_apps`,
        { subscribed_fields: "leadgen", access_token: pageToken },
        "POST",
    );

const unsubscribePage = (pageId: string, pageToken: string): Promise<{ success: boolean }> =>
    callGraph<{ success: boolean }>(
        `${pageId}/subscribed_apps`,
        { access_token: pageToken },
        "DELETE",
    );

export const metaGraphApiClient = {
    fetchLeadFieldData,
    exchangeCodeForUserToken,
    extendUserToken,
    listManagedPages,
    subscribePageToLeadgen,
    unsubscribePage,
};