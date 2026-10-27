import { googleAnalyticsConfig } from "../../../../config/google-analytics";
import { BusinessRuleError, IntegrationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";
import type { GaRunReportResponse } from "../types/google-analytics.types";
import { getServiceAccountAccessToken } from "./google-service-account-auth";

// Erros 403/404 são de configuração do cliente (conta de serviço sem acesso, Property ID
// errado) — viram BusinessRuleError com a mensagem do Google, que diz exatamente o motivo.
// O resto (5xx, rede) é falha da integração.
const CLIENT_SETUP_STATUSES = [400, 403, 404];

type DateRange = { startDate: string; endDate: string };

export type GaReportRequest = {
    dateRanges: DateRange[];
    metrics: { name: string }[];
    dimensions?: { name: string }[];
    orderBys?: { metric: { metricName: string }; desc: boolean }[];
    limit?: string;
};

const toGoogleError = async (response: Response, propertyId: string): Promise<Error> => {
    const body = await response.text();

    logger.warn({ propertyId, status: response.status, body }, "[google-analytics] Data API retornou erro.");

    let message: string | undefined;

    try {
        message = (JSON.parse(body) as { error?: { message?: string } }).error?.message;
    } catch {
        // corpo não-JSON: fica só o status
    }

    if (CLIENT_SETUP_STATUSES.includes(response.status)) {
        return new BusinessRuleError(
            `O Google Analytics recusou o acesso à propriedade ${propertyId}: ${message ?? `erro ${response.status}`}`,
        );
    }

    return new IntegrationError(`Google Analytics retornou ${response.status}.`);
};

// Vários relatórios numa única chamada (batchRunReports aceita até 5).
// https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/batchRunReports
const batchRunReports = async (
    propertyId: string,
    requests: GaReportRequest[],
): Promise<GaRunReportResponse[]> => {
    const accessToken = await getServiceAccountAccessToken();
    const url = `${googleAnalyticsConfig.dataApiBaseUrl}/properties/${propertyId}:batchRunReports`;

    let response: Response;

    try {
        response = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ requests }),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com o Google Analytics: ${message}`);
    }

    if (!response.ok) {
        throw await toGoogleError(response, propertyId);
    }

    const result = (await response.json()) as { reports?: GaRunReportResponse[] };

    return result.reports ?? [];
};

export const gaDataApiClient = {
    batchRunReports,
};
