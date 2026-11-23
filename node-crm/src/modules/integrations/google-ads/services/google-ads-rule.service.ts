import { BusinessRuleError, NotFoundError } from "../../../../shared/errors";
import type { SaveGoogleAdsRuleDTO, UpdateGoogleAdsRuleDTO } from "../dto/google-ads.dto";
import { googleAdsConnectionRepository } from "../repositories/google-ads-connection.repository";
import { googleAdsRuleRepository } from "../repositories/google-ads-rule.repository";
import { googleAdsUploadRepository } from "../repositories/google-ads-upload.repository";
import type { GoogleAdsConversionRule } from "../types/google-ads.types";
import { sendUpload } from "./conversion-dispatch.service";
import { dataManagerClient } from "./data-manager.client";
import { requireConnection } from "./google-ads-connection.service";
import { sha256Hex } from "./user-identifiers";

// E-mail fictício só para o "Testar": com validateOnly o Google confere acesso, conta e ação
// de conversão, mas não registra nada.
const TEST_EMAIL_HASH = sha256Hex("teste@exemplo.com.br");

const findRule = async (tenantId: string, ruleId: string): Promise<GoogleAdsConversionRule> => {
    const rule = await googleAdsRuleRepository.findByIdAndTenant(ruleId, tenantId);

    if (!rule) {
        throw new NotFoundError("Integração não encontrada.");
    }

    return rule;
};

const list = (tenantId: string): Promise<GoogleAdsConversionRule[]> => googleAdsRuleRepository.listByTenant(tenantId);

const create = async (tenantId: string, data: SaveGoogleAdsRuleDTO): Promise<GoogleAdsConversionRule> => {
    const connection = await googleAdsConnectionRepository.findByTenant(tenantId);

    if (!connection?.refreshToken) {
        throw new BusinessRuleError("Conecte a conta do Google Ads antes de criar integrações.");
    }

    return googleAdsRuleRepository.create(tenantId, connection.id, data);
};

const update = async (tenantId: string, ruleId: string, data: UpdateGoogleAdsRuleDTO): Promise<GoogleAdsConversionRule> => {
    const rule = await findRule(tenantId, ruleId);
    const trigger = data.trigger ?? rule.trigger;
    // Valor só existe no Vendido: trocar o gatilho desliga o "enviar valor".
    const sendValue = trigger === "LEAD_WON" ? data.sendValue : false;

    return googleAdsRuleRepository.update(rule.id, { ...data, sendValue });
};

const remove = async (tenantId: string, ruleId: string): Promise<void> => {
    await googleAdsRuleRepository.softDelete((await findRule(tenantId, ruleId)).id);
};

const test = async (tenantId: string, ruleId: string): Promise<{ ok: true }> => {
    const rule = await findRule(tenantId, ruleId);
    const { connection, accessToken } = await requireConnection(tenantId, true);
    const customerId = connection.customerId as string;

    await dataManagerClient.ingestConversion(
        accessToken,
        {
            customerId,
            loginCustomerId: connection.loginCustomerId ?? customerId,
            conversionActionId: rule.conversionActionId,
            transactionId: `teste-${rule.id}-${Date.now()}`,
            occurredAt: new Date(),
            gclid: null,
            userIdentifiers: [{ emailAddress: TEST_EMAIL_HASH }],
            value: null,
            currency: connection.currencyCode,
        },
        true,
    );

    return { ok: true };
};

const listHistory = async (tenantId: string, ruleId?: string) => {
    const uploads = await googleAdsUploadRepository.listRecent(tenantId, ruleId);

    return uploads.map((upload) => ({
        id: upload.id,
        ruleId: upload.ruleId,
        ruleName: upload.rule.name,
        leadId: upload.leadId,
        leadName: upload.lead.name,
        status: upload.status,
        hasGclid: Boolean(upload.gclid),
        hasEmail: upload.hasEmail,
        hasPhone: upload.hasPhone,
        conversionValue: upload.conversionValue === null ? null : Number(upload.conversionValue),
        errorMessage: upload.errorMessage,
        createdAt: upload.createdAt,
    }));
};

const retryUpload = async (tenantId: string, uploadId: string) => {
    const upload = await googleAdsUploadRepository.findByIdAndTenant(uploadId, tenantId);

    if (!upload) {
        throw new NotFoundError("Envio não encontrado.");
    }

    if (upload.status !== "FAILED") {
        throw new BusinessRuleError("Só envios com falha podem ser reenviados.");
    }

    const rule = await googleAdsRuleRepository.findByIdAndTenant(upload.ruleId, tenantId);

    if (!rule) {
        throw new BusinessRuleError("A integração deste envio foi excluída.");
    }

    const result = await sendUpload(upload, rule.conversionActionId);

    return { id: result.id, status: result.status, errorMessage: result.errorMessage };
};

export const googleAdsRuleService = { list, create, update, remove, test, listHistory, retryUpload };
