import { randomBytes } from "node:crypto";

import { BusinessRuleError, NotFoundError, ValidationError } from "../../../../shared/errors";
import type { CreateConversionIntegrationDTO, SaveConversionIntegrationDTO } from "../dto/conversion-integration.dto";
import type { CreateConversionRuleDTO, SaveConversionRuleDTO } from "../dto/conversion-rule.dto";
import { conversionIntegrationRepository } from "../repositories/conversion-integration.repository";
import { conversionLogRepository } from "../repositories/conversion-log.repository";
import { conversionRuleRepository } from "../repositories/conversion-rule.repository";
import type {
    ConversionIntegration,
    ConversionIntegrationPublic,
    ConversionRule,
} from "../types/conversion-sync.types";
import { sendUpload } from "./conversion-dispatch.service";
import { buildUserIdentifiers, googleAdsDataManagerClient } from "./google-ads-data-manager.client";
import { assertRuleFitsSource } from "./conversion-rule-policy";

const WEBHOOK_TOKEN_BYTES = 24;
const TEST_EMAIL = "teste-integrador@crm-cmb.com.br";

const newWebhookToken = (): string => randomBytes(WEBHOOK_TOKEN_BYTES).toString("base64url");

const toPublic = (integration: ConversionIntegration, rules: ConversionRule[]): ConversionIntegrationPublic => {
    const { sourceApiUrl, sourceApiToken, webhookSecret, deletedAt: _deletedAt, ...rest } = integration;

    return {
        ...rest,
        hasSourceApiUrl: Boolean(sourceApiUrl),
        hasSourceApiToken: Boolean(sourceApiToken),
        hasWebhookSecret: Boolean(webhookSecret),
        rules: rules.filter((rule) => rule.integrationId === integration.id),
    };
};

const getOwned = async (tenantId: string, id: string): Promise<ConversionIntegration> => {
    const integration = await conversionIntegrationRepository.findByIdAndTenant(id, tenantId);

    if (!integration) {
        throw new NotFoundError("Conexão não encontrada.");
    }

    return integration;
};

const getOwnedRule = async (integrationId: string, ruleId: string): Promise<ConversionRule> => {
    const rule = await conversionRuleRepository.findByIdAndIntegration(ruleId, integrationId);

    if (!rule) {
        throw new NotFoundError("Regra não encontrada.");
    }

    return rule;
};

// Ativar exige o mínimo para conseguir enviar: conta Google Ads e, no Bitrix, a URL de REST.
const assertCanEnable = (integration: ConversionIntegration): void => {
    if (!integration.enabled) {
        return;
    }

    if (!integration.googleAdsCustomerId) {
        throw new ValidationError("Para ativar, informe o ID da conta Google Ads do cliente.");
    }

    if (integration.source === "BITRIX24" && !integration.sourceApiUrl) {
        throw new ValidationError("Para ativar, informe a URL de webhook de entrada do Bitrix24.");
    }
};

const list = async (tenantId: string): Promise<ConversionIntegrationPublic[]> => {
    const integrations = await conversionIntegrationRepository.listByTenant(tenantId);
    const rules = await conversionRuleRepository.listByIntegrations(integrations.map((item) => item.id));

    return integrations.map((integration) => toPublic(integration, rules));
};

const create = async (tenantId: string, data: CreateConversionIntegrationDTO): Promise<ConversionIntegrationPublic> => {
    assertCanEnable({ ...(data as ConversionIntegration), enabled: Boolean(data.enabled) });

    return toPublic(await conversionIntegrationRepository.create(tenantId, newWebhookToken(), data), []);
};

const update = async (tenantId: string, id: string, data: SaveConversionIntegrationDTO): Promise<ConversionIntegrationPublic> => {
    const current = await getOwned(tenantId, id);

    assertCanEnable({ ...current, ...(data as Partial<ConversionIntegration>) } as ConversionIntegration);

    const updated = await conversionIntegrationRepository.update(id, data);

    return toPublic(updated, await conversionRuleRepository.listByIntegrations([id]));
};

const remove = async (tenantId: string, id: string): Promise<void> => {
    await getOwned(tenantId, id);
    await conversionIntegrationRepository.softDelete(id);
};

// Gera uma URL nova (a antiga para de funcionar) — se a URL vazou ou foi colada no lugar errado.
const regenerateToken = async (tenantId: string, id: string): Promise<ConversionIntegrationPublic> => {
    await getOwned(tenantId, id);

    const updated = await conversionIntegrationRepository.update(id, { webhookToken: newWebhookToken() });

    return toPublic(updated, await conversionRuleRepository.listByIntegrations([id]));
};

const createRule = async (tenantId: string, integrationId: string, data: CreateConversionRuleDTO): Promise<ConversionRule> => {
    const integration = await getOwned(tenantId, integrationId);

    assertRuleFitsSource(integration.source, {
        trigger: data.trigger,
        triggerValue: data.triggerValue ?? null,
        sendValue: data.sendValue ?? false,
    });

    return conversionRuleRepository.create(tenantId, integrationId, data);
};

const updateRule = async (tenantId: string, integrationId: string, ruleId: string, data: SaveConversionRuleDTO) => {
    const integration = await getOwned(tenantId, integrationId);
    const current = await getOwnedRule(integrationId, ruleId);

    assertRuleFitsSource(integration.source, {
        trigger: data.trigger ?? current.trigger,
        triggerValue: data.triggerValue === undefined ? current.triggerValue : data.triggerValue,
        sendValue: data.sendValue ?? current.sendValue,
    });

    return conversionRuleRepository.update(ruleId, data);
};

const removeRule = async (tenantId: string, integrationId: string, ruleId: string): Promise<void> => {
    await getOwned(tenantId, integrationId);
    await getOwnedRule(integrationId, ruleId);
    await conversionRuleRepository.softDelete(ruleId);
};

// Validação completa no Google (acesso do MCC à conta, ação de conversão, formato) sem
// registrar conversão nenhuma (validateOnly).
const testRule = async (tenantId: string, integrationId: string, ruleId: string): Promise<{ ok: true }> => {
    const integration = await getOwned(tenantId, integrationId);
    const rule = await getOwnedRule(integrationId, ruleId);

    if (!integration.googleAdsCustomerId) {
        throw new BusinessRuleError("Informe o ID da conta Google Ads do cliente antes de testar.");
    }

    await googleAdsDataManagerClient.ingestConversion(
        {
            customerId: integration.googleAdsCustomerId,
            conversionActionId: rule.conversionActionId,
            transactionId: `teste-${Date.now()}`,
            occurredAt: new Date(),
            gclid: null,
            userIdentifiers: buildUserIdentifiers(TEST_EMAIL, null),
            value: rule.sendValue ? 1 : null,
            currency: integration.currencyCode,
        },
        true,
    );

    return { ok: true };
};

const listLogs = async (tenantId: string, integrationId: string) => {
    await getOwned(tenantId, integrationId);

    const [uploads, webhooks] = await Promise.all([
        conversionLogRepository.listUploadsByIntegration(integrationId),
        conversionLogRepository.listWebhookLogsByIntegration(integrationId),
    ]);

    // Hashes ficam no servidor — a tela só precisa saber se havia e-mail/telefone.
    return { uploads: uploads.map(({ userIdentifiers: _hashes, ...upload }) => upload), webhooks };
};

const retryUpload = async (tenantId: string, uploadId: string): Promise<{ sent: boolean }> => {
    const upload = await conversionLogRepository.findUploadByIdAndTenant(uploadId, tenantId);

    if (!upload) {
        throw new NotFoundError("Envio não encontrado.");
    }

    if (upload.status === "SENT") {
        throw new BusinessRuleError("Esta conversão já foi enviada ao Google Ads.");
    }

    const integration = await getOwned(tenantId, upload.integrationId);
    const rule = await getOwnedRule(upload.integrationId, upload.ruleId);

    return { sent: await sendUpload(upload, rule, integration) };
};

export const conversionIntegrationService = {
    list,
    create,
    update,
    remove,
    regenerateToken,
    createRule,
    updateRule,
    removeRule,
    testRule,
    listLogs,
    retryUpload,
};
