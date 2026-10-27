import { metaConfig } from "../../../../config/meta";
import { IntegrationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";
import type { MetaLeadFieldData } from "../types/meta-integration.types";

type GraphErrorBody = { error?: { message?: string; code?: number; error_subcode?: number } };

// Resposta de erro da Graph API: corpo completo só no log; para quem chamou, a mensagem da
// própria Meta + código, que é o que permite diagnosticar (permissão faltando, token
// expirado, app em modo desenvolvimento...). Mensagens da Meta não contêm tokens.
const toGraphError = async (response: Response, path: string): Promise<IntegrationError> => {
    const body = await response.text();

    logger.warn({ path, status: response.status, body }, "[meta] Graph API retornou erro.");

    let parsed: GraphErrorBody = {};

    try {
        parsed = JSON.parse(body) as GraphErrorBody;
    } catch {
        // corpo não-JSON: fica só o status
    }

    const { message, code, error_subcode: subcode } = parsed.error ?? {};
    const codes = [code, subcode].filter((value) => value !== undefined).join("/");

    return new IntegrationError(
        message
            ? `Meta recusou a requisição: ${message}${codes ? ` (código ${codes})` : ""}`
            : `Graph API da Meta retornou ${response.status}.`,
    );
};

// Além dos campos do formulário, pede de onde o lead veio — platform ("fb"/"ig") e se foi
// orgânico ou de anúncio —, que viram a Fonte do Lead no CRM.
const LEAD_FIELDS = "field_data,platform,is_organic";
// "(#100) Tried accessing nonexisting field": a Meta recusou um campo extra.
const GRAPH_UNKNOWN_FIELD_CODE = 100;

const requestLead = async (leadgenId: string, pageAccessToken: string, fields?: string): Promise<Response> => {
    const params = new URLSearchParams({ access_token: pageAccessToken, ...(fields ? { fields } : {}) });

    try {
        return await fetch(`${metaConfig.graphApiBaseUrl}/${leadgenId}?${params.toString()}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com a Graph API da Meta: ${message}`);
    }
};

const isUnknownFieldError = async (response: Response): Promise<boolean> => {
    try {
        const body = (await response.clone().json()) as GraphErrorBody;

        return body.error?.code === GRAPH_UNKNOWN_FIELD_CODE;
    } catch {
        return false;
    }
};

// Busca os dados completos do lead na Graph API — o webhook só avisa que um lead chegou
// (leadgen_id), os campos do formulário (nome, e-mail, telefone) vêm daqui. Se a Meta
// recusar os campos extras de origem, repete só com os padrões: perder a Fonte é aceitável,
// perder o Lead não (business-rules.md).
// https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving
const fetchLeadFieldData = async (leadgenId: string, pageAccessToken: string): Promise<MetaLeadFieldData> => {
    let response = await requestLead(leadgenId, pageAccessToken, LEAD_FIELDS);

    if (!response.ok && (await isUnknownFieldError(response))) {
        logger.warn({ leadgenId }, "[meta] Graph API recusou platform/is_organic — buscando o lead sem a Fonte.");
        response = await requestLead(leadgenId, pageAccessToken);
    }

    if (!response.ok) {
        throw await toGraphError(response, "leadgen");
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
        throw await toGraphError(response, path);
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