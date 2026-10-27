import { googleAnalyticsConfig } from "../../../../config/google-analytics";
import { ValidationError } from "../../../../shared/errors";
import type { UpdateGoogleAnalyticsIntegrationDTO } from "../dto/update-google-analytics-integration.dto";
import { googleAnalyticsIntegrationRepository } from "../repositories/google-analytics-integration.repository";
import type {
    GoogleAnalyticsIntegration,
    GoogleAnalyticsMonthlyReport,
    GoogleAnalyticsSettings,
} from "../types/google-analytics.types";
import { gaDataApiClient } from "./ga-data-api.client";
import {
    EMPTY_TOTALS,
    buildMonthlyRequests,
    monthDateRange,
    parseCities,
    parseTotals,
} from "./ga-report.helpers";
import { hasServiceAccountCredentials } from "./google-service-account-auth";

const toSettings = (integration: GoogleAnalyticsIntegration | null): GoogleAnalyticsSettings => ({
    enabled: integration?.enabled ?? false,
    propertyId: integration?.propertyId ?? null,
    serviceAccountEmail: googleAnalyticsConfig.serviceAccountEmail,
    credentialsConfigured: hasServiceAccountCredentials(),
});

const getSettings = async (tenantId: string): Promise<GoogleAnalyticsSettings> => {
    return toSettings(await googleAnalyticsIntegrationRepository.findByTenant(tenantId));
};

// Consulta mínima (usuários ativos dos últimos 7 dias) só para provar que a conta de
// serviço enxerga a propriedade — falha aqui devolve ao usuário o motivo dado pelo Google.
const assertPropertyAccess = async (propertyId: string): Promise<void> => {
    await gaDataApiClient.batchRunReports(propertyId, [
        { dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "activeUsers" }] },
    ]);
};

const updateSettings = async (
    tenantId: string,
    data: UpdateGoogleAnalyticsIntegrationDTO,
): Promise<GoogleAnalyticsSettings> => {
    const current = await googleAnalyticsIntegrationRepository.findByTenant(tenantId);
    const enabled = data.enabled ?? current?.enabled ?? false;
    const propertyId = data.propertyId ?? current?.propertyId ?? null;

    if (enabled) {
        if (!propertyId) {
            throw new ValidationError("Para ativar a integração informe o Property ID da propriedade GA4.");
        }

        await assertPropertyAccess(propertyId);
    }

    return toSettings(await googleAnalyticsIntegrationRepository.upsertByTenant(tenantId, data));
};

const getMonthlyReport = async (tenantId: string, month?: Date): Promise<GoogleAnalyticsMonthlyReport> => {
    const integration = await googleAnalyticsIntegrationRepository.findByTenant(tenantId);

    if (!integration?.enabled || !integration.propertyId) {
        return { configured: false };
    }

    const requestedMonth = month ?? new Date();
    const monthLabel = requestedMonth.toISOString().slice(0, 7);
    const range = monthDateRange(requestedMonth);

    if (!range) {
        return {
            configured: true,
            propertyId: integration.propertyId,
            month: monthLabel,
            startDate: `${monthLabel}-01`,
            endDate: `${monthLabel}-01`,
            totals: EMPTY_TOTALS,
            byCity: [],
        };
    }

    const [totalsReport, citiesReport] = await gaDataApiClient.batchRunReports(
        integration.propertyId,
        buildMonthlyRequests(range),
    );

    return {
        configured: true,
        propertyId: integration.propertyId,
        month: monthLabel,
        ...range,
        totals: parseTotals(totalsReport),
        byCity: parseCities(citiesReport),
    };
};

export const googleAnalyticsService = {
    getSettings,
    updateSettings,
    getMonthlyReport,
};
