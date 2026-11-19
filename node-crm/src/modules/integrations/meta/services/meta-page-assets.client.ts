import { metaConfig } from "../../../../config/meta";
import { callGraph } from "./meta-graph-api.client";

// Consultas sobre a Página já conectada, sempre com o token da própria Página. Servem ao
// painel de status da conexão (o "checklist" que os CRMs de mercado mostram).

export type MetaInstagramAccount = { id: string; username: string | null };
export type MetaLeadForm = { id: string; name: string; status: string };

type PageInstagramResponse = { instagram_business_account?: { id: string; username?: string } };

// Conta do Instagram vinculada à Página. Os anúncios de cadastro do Instagram usam os
// formulários da Página — por isso os leads deles chegam pelo mesmo webhook. O @ exige a
// permissão instagram_basic; sem ela, a Meta recusa o subcampo e pedimos só o ID.
const fetchInstagramAccount = async (pageId: string, pageToken: string): Promise<MetaInstagramAccount | null> => {
    let result: PageInstagramResponse;

    try {
        result = await callGraph<PageInstagramResponse>(pageId, {
            fields: "instagram_business_account{id,username}",
            access_token: pageToken,
        });
    } catch {
        result = await callGraph<PageInstagramResponse>(pageId, {
            fields: "instagram_business_account",
            access_token: pageToken,
        });
    }

    const account = result.instagram_business_account;

    return account ? { id: account.id, username: account.username ?? null } : null;
};

// O app do CRM está assinado no campo "leadgen" da Página? Sem isso a Meta não avisa o
// webhook quando um lead chega.
const isSubscribedToLeadgen = async (pageId: string, pageToken: string): Promise<boolean> => {
    const result = await callGraph<{ data?: { id: string; subscribed_fields?: string[] }[] }>(
        `${pageId}/subscribed_apps`,
        { access_token: pageToken },
    );

    return (result.data ?? []).some(
        (app) => (!metaConfig.appId || app.id === metaConfig.appId) && (app.subscribed_fields ?? []).includes("leadgen"),
    );
};

const FORMS_LIMIT = "50";

// Formulários de cadastro da Página — os mesmos usados nos anúncios do Facebook e do Instagram.
const listLeadForms = async (pageId: string, pageToken: string): Promise<MetaLeadForm[]> => {
    const result = await callGraph<{ data?: MetaLeadForm[] }>(`${pageId}/leadgen_forms`, {
        fields: "id,name,status",
        limit: FORMS_LIMIT,
        access_token: pageToken,
    });

    return result.data ?? [];
};

export const metaPageAssetsClient = {
    fetchInstagramAccount,
    isSubscribedToLeadgen,
    listLeadForms,
};
