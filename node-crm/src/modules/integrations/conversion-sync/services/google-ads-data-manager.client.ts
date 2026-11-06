import { googleAdsConfig } from "../../../../config/google-ads";
import { BusinessRuleError, IntegrationError } from "../../../../shared/errors";
import { getServiceAccountToken } from "../../../../shared/google/service-account-token";
import { logger } from "../../../../shared/logger/logger";
import { normalizeEmail, normalizePhone, sha256Hex } from "./user-identifiers";

// Envio de conversão offline pela Data Manager API (events:ingest). Um evento por chamada: a
// API rejeita a requisição inteira se um evento falhar, e o integrador precisa do resultado
// por conversão. O aceite (requestId) não garante o processamento final no Google Ads — o
// processamento leva até 24 h.
// https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/send-events

export type HashedUserIdentifier = { emailAddress: string } | { phoneNumber: string };

export type OfflineConversion = {
    customerId: string;
    conversionActionId: string;
    transactionId: string;
    occurredAt: Date;
    gclid: string | null;
    // Já normalizados e em hash — ver buildUserIdentifiers.
    userIdentifiers: HashedUserIdentifier[];
    value: number | null;
    currency: string;
};

const CLIENT_SETUP_STATUSES = [400, 403, 404];

const credentials = () => ({
    email: googleAdsConfig.serviceAccountEmail,
    privateKey: googleAdsConfig.serviceAccountPrivateKey,
    scope: googleAdsConfig.scope,
    envNames: "GOOGLE_ADS_SERVICE_ACCOUNT_EMAIL e GOOGLE_ADS_SERVICE_ACCOUNT_PRIVATE_KEY (ou as do Google Analytics)",
});

const googleAccount = (accountId: string) => ({ accountType: "GOOGLE_ADS", accountId });

// Identificadores em hash (SHA-256 hex) — o CRM nunca envia e-mail/telefone em texto puro.
export const buildUserIdentifiers = (email: string | null, phone: string | null): HashedUserIdentifier[] => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    return [
        ...(normalizedEmail ? [{ emailAddress: sha256Hex(normalizedEmail) }] : []),
        ...(normalizedPhone ? [{ phoneNumber: sha256Hex(normalizedPhone) }] : []),
    ];
};

export const buildIngestBody = (conversion: OfflineConversion, validateOnly: boolean) => {
    if (!googleAdsConfig.managerAccountId) {
        throw new BusinessRuleError("MCC do Google Ads não configurado no servidor (defina GOOGLE_ADS_MANAGER_ACCOUNT_ID).");
    }

    const { userIdentifiers } = conversion;

    if (!conversion.gclid && userIdentifiers.length === 0) {
        throw new BusinessRuleError("Sem GCLID, e-mail ou telefone válido — o Google Ads não teria como atribuir a conversão.");
    }

    return {
        destinations: [
            {
                operatingAccount: googleAccount(conversion.customerId),
                loginAccount: googleAccount(googleAdsConfig.managerAccountId),
                productDestinationId: conversion.conversionActionId,
            },
        ],
        encoding: "HEX",
        validateOnly,
        events: [
            {
                eventTimestamp: conversion.occurredAt.toISOString(),
                eventSource: "WEB",
                transactionId: conversion.transactionId,
                ...(conversion.gclid ? { adIdentifiers: { gclid: conversion.gclid } } : {}),
                ...(userIdentifiers.length > 0 ? { userData: { userIdentifiers } } : {}),
                ...(conversion.value !== null ? { conversionValue: conversion.value, currency: conversion.currency } : {}),
            },
        ],
    };
};

const toGoogleError = async (response: Response): Promise<Error> => {
    const body = await response.text();

    logger.warn({ status: response.status, body }, "[google-ads] Data Manager API retornou erro.");

    let message: string | undefined;

    try {
        message = (JSON.parse(body) as { error?: { message?: string } }).error?.message;
    } catch {
        // corpo não-JSON: fica só o status
    }

    return CLIENT_SETUP_STATUSES.includes(response.status)
        ? new BusinessRuleError(`O Google Ads recusou a conversão: ${message ?? `erro ${response.status}`}`)
        : new IntegrationError(`Data Manager API retornou ${response.status}.`);
};

// validateOnly = true: o Google valida tudo (acesso à conta, ação de conversão, formato) sem
// registrar a conversão — usado pelo botão "Testar" das regras.
const ingestConversion = async (conversion: OfflineConversion, validateOnly = false): Promise<{ requestId: string | null }> => {
    const body = buildIngestBody(conversion, validateOnly);
    const accessToken = await getServiceAccountToken(credentials());

    let response: Response;

    try {
        response = await fetch(googleAdsConfig.ingestUrl, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com o Google Ads: ${message}`);
    }

    if (!response.ok) {
        throw await toGoogleError(response);
    }

    const result = (await response.json()) as { requestId?: string };

    return { requestId: result.requestId ?? null };
};

export const googleAdsDataManagerClient = {
    ingestConversion,
};
