import { googleAnalyticsConfig } from "../../../../config/google-analytics";
import { getServiceAccountToken, hasCredentials } from "../../../../shared/google/service-account-token";
import type { ServiceAccountCredentials } from "../../../../shared/google/service-account-token";

const credentials = (): ServiceAccountCredentials => ({
    email: googleAnalyticsConfig.serviceAccountEmail,
    privateKey: googleAnalyticsConfig.serviceAccountPrivateKey,
    scope: googleAnalyticsConfig.scope,
    envNames: "GA_SERVICE_ACCOUNT_EMAIL e GA_SERVICE_ACCOUNT_PRIVATE_KEY",
});

export const hasServiceAccountCredentials = (): boolean => hasCredentials(credentials());

export const getServiceAccountAccessToken = (): Promise<string> => getServiceAccountToken(credentials());
