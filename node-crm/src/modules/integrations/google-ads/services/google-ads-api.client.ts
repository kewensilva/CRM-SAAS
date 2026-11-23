import { googleAdsConfig } from "../../../../config/google-ads";
import { BusinessRuleError } from "../../../../shared/errors";
import type { GoogleAdsAccount, GoogleAdsConversionAction } from "../types/google-ads.types";
import { googleFetch } from "./google-http";

// Google Ads API (só leitura): lista as contas e as ações de conversão para o cliente escolher
// em vez de digitar IDs. Exige developer token da CMB; sem ele, a tela pede os IDs à mão.
// https://developers.google.com/google-ads/api/docs/account-management/listing-accounts

// Limita as chamadas quando o usuário tem acesso a muitas contas.
const MAX_ACCESSIBLE_ACCOUNTS = 20;

type SearchRow = {
    customer?: { id: string; descriptiveName?: string; manager?: boolean };
    customerClient?: { id: string; descriptiveName?: string; manager?: boolean };
    conversionAction?: { id: string; name: string };
};

export const isListingAvailable = (): boolean => Boolean(googleAdsConfig.developerToken);

const headers = (accessToken: string, loginCustomerId?: string): Record<string, string> => {
    if (!googleAdsConfig.developerToken) {
        throw new BusinessRuleError("Listagem indisponível: GOOGLE_ADS_DEVELOPER_TOKEN não configurado. Informe os IDs manualmente.");
    }

    return {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": googleAdsConfig.developerToken,
        "Content-Type": "application/json",
        ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {}),
    };
};

const search = async (accessToken: string, customerId: string, loginCustomerId: string, query: string): Promise<SearchRow[]> => {
    const result = await googleFetch<{ results?: SearchRow[] }>(
        "Google Ads",
        `${googleAdsConfig.adsApiBaseUrl}/customers/${customerId}/googleAds:search`,
        { method: "POST", headers: headers(accessToken, loginCustomerId), body: JSON.stringify({ query }) },
    );

    return result.results ?? [];
};

const CUSTOMER_QUERY = "SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1";
const CLIENTS_QUERY =
    "SELECT customer_client.id, customer_client.descriptive_name, customer_client.manager FROM customer_client " +
    "WHERE customer_client.level = 1 AND customer_client.status = 'ENABLED'";

// Contas de anúncios que o usuário alcança: as de acesso direto e, para cada MCC, as contas
// logo abaixo dele (acessadas pelo MCC). MCCs não recebem conversões, então ficam de fora.
const listAccounts = async (accessToken: string): Promise<GoogleAdsAccount[]> => {
    const accessible = await googleFetch<{ resourceNames?: string[] }>(
        "Google Ads",
        `${googleAdsConfig.adsApiBaseUrl}/customers:listAccessibleCustomers`,
        { method: "GET", headers: headers(accessToken) },
    );
    const ids = (accessible.resourceNames ?? []).map((name) => name.replace("customers/", "")).slice(0, MAX_ACCESSIBLE_ACCOUNTS);
    const accounts = new Map<string, GoogleAdsAccount>();

    for (const id of ids) {
        const [row] = await search(accessToken, id, id, CUSTOMER_QUERY).catch(() => []);

        if (!row?.customer) {
            continue;
        }

        if (!row.customer.manager) {
            accounts.set(id, { customerId: id, name: row.customer.descriptiveName ?? null, loginCustomerId: id });
            continue;
        }

        const clients = await search(accessToken, id, id, CLIENTS_QUERY).catch(() => []);

        for (const { customerClient } of clients) {
            if (customerClient && !customerClient.manager && !accounts.has(customerClient.id)) {
                accounts.set(customerClient.id, {
                    customerId: customerClient.id,
                    name: customerClient.descriptiveName ?? null,
                    loginCustomerId: id,
                });
            }
        }
    }

    return [...accounts.values()];
};

// Só ações do tipo "Importação de cliques" ativas — as únicas que aceitam conversão offline.
const CONVERSION_ACTIONS_QUERY =
    "SELECT conversion_action.id, conversion_action.name FROM conversion_action " +
    "WHERE conversion_action.type = 'UPLOAD_CLICKS' AND conversion_action.status = 'ENABLED'";

const listConversionActions = async (
    accessToken: string,
    customerId: string,
    loginCustomerId: string,
): Promise<GoogleAdsConversionAction[]> => {
    const rows = await search(accessToken, customerId, loginCustomerId, CONVERSION_ACTIONS_QUERY);

    return rows.flatMap(({ conversionAction }) => (conversionAction ? [{ id: conversionAction.id, name: conversionAction.name }] : []));
};

export const googleAdsApiClient = { listAccounts, listConversionActions };
