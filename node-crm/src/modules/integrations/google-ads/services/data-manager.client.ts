import { googleAdsConfig } from "../../../../config/google-ads";
import { BusinessRuleError } from "../../../../shared/errors";
import { googleFetch } from "./google-http";
import { normalizeEmail, normalizePhone, sha256Hex } from "./user-identifiers";

// Envio de conversão offline pela Data Manager API (events:ingest), com o token da conta Google
// do próprio cliente. Um evento por chamada: a API rejeita a requisição inteira se um evento
// falhar. O aceite (requestId) não é o processamento final — o Google Ads leva até 24 h.
// https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/send-events

export type HashedUserIdentifier = { emailAddress: string } | { phoneNumber: string };

export type OfflineConversion = {
    customerId: string;
    // Conta por onde o usuário da conexão acessa a conta (ela mesma ou o MCC acima).
    loginCustomerId: string;
    conversionActionId: string;
    transactionId: string;
    occurredAt: Date;
    gclid: string | null;
    userIdentifiers: HashedUserIdentifier[];
    value: number | null;
    currency: string;
};

// Identificadores em hash (SHA-256 hex) — o CRM nunca envia e-mail/telefone em texto puro.
export const buildUserIdentifiers = (email: string | null, phone: string | null): HashedUserIdentifier[] => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    return [
        ...(normalizedEmail ? [{ emailAddress: sha256Hex(normalizedEmail) }] : []),
        ...(normalizedPhone ? [{ phoneNumber: sha256Hex(normalizedPhone) }] : []),
    ];
};

const googleAccount = (accountId: string) => ({ accountType: "GOOGLE_ADS", accountId });

export const buildIngestBody = (conversion: OfflineConversion, validateOnly: boolean) => {
    const { userIdentifiers } = conversion;

    if (!conversion.gclid && userIdentifiers.length === 0) {
        throw new BusinessRuleError("Lead sem GCLID, e-mail ou telefone válido — o Google Ads não teria como atribuir a conversão.");
    }

    return {
        destinations: [
            {
                operatingAccount: googleAccount(conversion.customerId),
                loginAccount: googleAccount(conversion.loginCustomerId),
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

// validateOnly = true: o Google confere acesso, conta e ação de conversão sem registrar nada
// — é o botão "Testar" da integração.
const ingestConversion = async (
    accessToken: string,
    conversion: OfflineConversion,
    validateOnly = false,
): Promise<{ requestId: string | null }> => {
    const result = await googleFetch<{ requestId?: string }>("O Google Ads recusou a conversão", googleAdsConfig.ingestUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(buildIngestBody(conversion, validateOnly)),
    });

    return { requestId: result.requestId ?? null };
};

export const dataManagerClient = { ingestConversion };
