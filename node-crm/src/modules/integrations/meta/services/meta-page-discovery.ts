import { metaConfig } from "../../../../config/meta";
import { logger } from "../../../../shared/logger/logger";
import type { MetaManagedPage, MetaTokenPermissions } from "./meta-graph-api.client";
import { metaGraphApiClient } from "./meta-graph-api.client";

// Permissões em que a Meta lista as Páginas concedidas (granular_scopes.target_ids).
const PAGE_SCOPES = ["pages_show_list", "pages_manage_metadata", "pages_read_engagement", "leads_retrieval"];

export const pageIdsFromPermissions = (permissions: MetaTokenPermissions): string[] => [
    ...new Set(
        permissions.granularScopes
            .filter((item) => PAGE_SCOPES.includes(item.scope))
            .flatMap((item) => item.target_ids ?? []),
    ),
];

export const missingPermissions = (permissions: MetaTokenPermissions): string[] =>
    metaConfig.oauthScopes.filter((scope) => !permissions.scopes.includes(scope));

// Mensagem para quando nenhuma Página chegou: diz o que faltou em vez de um aviso genérico.
export const noPagesMessage = (permissions: MetaTokenPermissions | null): string => {
    const missing = permissions ? missingPermissions(permissions) : [];

    if (missing.length > 0) {
        return `A Meta não liberou as permissões ${missing.join(", ")}. Clique em "Conectar com o Facebook" de novo e aceite todas as permissões pedidas.`;
    }

    return (
        'A Meta não liberou nenhuma Página para o CRM. Clique em "Conectar com o Facebook" de novo e, na tela da Meta, ' +
        "marque a Página do cliente (em \"Editar acesso\" / \"Escolher Páginas\"), entrando com um usuário que administra essa Página."
    );
};

// Páginas que o usuário autorizou, com o token de cada uma. Primeiro /me/accounts (login
// clássico, Páginas com papel direto); vazio — comum no Login do Facebook para Empresas com
// Páginas de portfólio empresarial — busca os IDs nas permissões granulares do token e pega
// cada Página pelo ID. Uma Página que falhar na busca é ignorada (as outras seguem).
export const discoverPages = async (
    userToken: string,
    appId: string,
): Promise<{ pages: MetaManagedPage[]; permissions: MetaTokenPermissions | null }> => {
    const managed = await metaGraphApiClient.listManagedPages(userToken);

    if (managed.length > 0) {
        return { pages: managed, permissions: null };
    }

    const permissions = await metaGraphApiClient.debugUserToken(userToken, appId);
    const pageIds = pageIdsFromPermissions(permissions);
    const results = await Promise.allSettled(pageIds.map((id) => metaGraphApiClient.fetchPageWithToken(id, userToken)));
    const pages = results.flatMap((result) =>
        result.status === "fulfilled" && result.value.access_token ? [result.value] : [],
    );

    logger.info(
        { scopes: permissions.scopes, grantedPageIds: pageIds, pagesWithToken: pages.length },
        "[meta] /me/accounts vazio — Páginas buscadas pelas permissões granulares.",
    );

    return { pages, permissions };
};
