import { conversionIntegrationRepository } from "../repositories/conversion-integration.repository";
import { conversionLogRepository } from "../repositories/conversion-log.repository";
import { conversionRuleRepository } from "../repositories/conversion-rule.repository";
import type { ConversionIntegration, ConversionRule } from "../types/conversion-sync.types";
import { conversionWebhookService } from "./conversion-webhook.service";
import { googleAdsDataManagerClient } from "./google-ads-data-manager.client";
import { fetchRdCrmDealContact } from "./sources/rd-crm.client";

jest.mock("../repositories/conversion-integration.repository");
jest.mock("../repositories/conversion-log.repository");
jest.mock("../repositories/conversion-rule.repository");
jest.mock("./sources/rd-crm.client");
jest.mock("./google-ads-data-manager.client", () => ({
    ...jest.requireActual("./google-ads-data-manager.client"),
    googleAdsDataManagerClient: { ingestConversion: jest.fn() },
}));

const integrations = jest.mocked(conversionIntegrationRepository);
const logs = jest.mocked(conversionLogRepository);
const rules = jest.mocked(conversionRuleRepository);
const ingest = jest.mocked(googleAdsDataManagerClient.ingestConversion);
const rdContact = jest.mocked(fetchRdCrmDealContact);

const integration = (overrides: Partial<ConversionIntegration> = {}): ConversionIntegration => ({
    id: "int-1",
    tenantId: "tenant-1",
    name: "RD CRM",
    source: "RD_STATION_CRM",
    enabled: true,
    webhookToken: "tok",
    googleAdsCustomerId: "1234567890",
    gclidField: null,
    sourceApiUrl: null,
    sourceApiToken: "rd-token",
    webhookSecret: null,
    currencyCode: "BRL",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

const wonRule: ConversionRule = {
    id: "rule-won",
    tenantId: "tenant-1",
    integrationId: "int-1",
    name: "Venda",
    trigger: "DEAL_WON",
    triggerValue: null,
    conversionActionId: "555",
    sendValue: true,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

const dealPayload = (status: string) => ({
    event_name: "crm_deal_updated",
    document: { id: "deal-1", status, amount_total: 900, closed_at: "2026-10-29T18:00:00Z", deal_stage: { name: "Fechado" } },
});

// O processamento roda em setImmediate — espera a fila de tarefas esvaziar.
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(() => {
    jest.resetAllMocks();
    logs.createWebhookLog.mockResolvedValue({ id: "log-1" } as never);
    logs.markWebhookLog.mockResolvedValue(undefined);
    logs.markUpload.mockResolvedValue(undefined);
    logs.createUpload.mockImplementation(async (data) => ({ id: "up-1", ...data, status: "PENDING" }) as never);
    rules.listByIntegrations.mockResolvedValue([wonRule]);
    rdContact.mockResolvedValue({ email: "cliente@empresa.com", phone: "(11) 98888-7777" });
    ingest.mockResolvedValue({ requestId: "req-1" });
});

describe("conversionWebhookService.receive", () => {
    it("token desconhecido: registra o webhook como FAILED e responde 404", async () => {
        integrations.findByWebhookToken.mockResolvedValue(null);

        await expect(conversionWebhookService.receive("x", {}, {})).rejects.toThrow("Webhook não encontrado.");
        expect(logs.createWebhookLog).toHaveBeenCalledWith({ tenantId: null, integrationId: null, rawPayload: {} });
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "FAILED", expect.any(String));
    });

    it("negócio ganho: busca o contato, envia com valor e marca SENT", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration());

        await conversionWebhookService.receive("tok", dealPayload("won"), {});
        await flush();

        expect(rdContact).toHaveBeenCalledWith("deal-1", "rd-token");
        expect(ingest).toHaveBeenCalledWith(
            expect.objectContaining({
                customerId: "1234567890",
                conversionActionId: "555",
                transactionId: "deal-won:deal-1",
                value: 900,
                currency: "BRL",
                userIdentifiers: [expect.objectContaining({ emailAddress: expect.any(String) }), expect.objectContaining({ phoneNumber: expect.any(String) })],
            }),
        );
        expect(logs.markUpload).toHaveBeenCalledWith("up-1", { status: "SENT", googleRequestId: "req-1" });
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "PROCESSED", expect.stringContaining("1 enviada"));
    });

    it("negócio em andamento: nenhuma regra dispara e o contato nem é buscado", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration());

        await conversionWebhookService.receive("tok", dealPayload("ongoing"), {});
        await flush();

        expect(rdContact).not.toHaveBeenCalled();
        expect(ingest).not.toHaveBeenCalled();
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "IGNORED", "Nenhuma regra disparada por este evento.");
    });

    it("mesmo negócio ganho chegando de novo não é reenviado", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration());
        logs.createUpload.mockResolvedValue(null);

        await conversionWebhookService.receive("tok", dealPayload("won"), {});
        await flush();

        expect(ingest).not.toHaveBeenCalled();
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "PROCESSED", expect.stringContaining("1 já enviada"));
    });

    it("falha no Google Ads fica no envio (FAILED) para reenviar", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration());
        ingest.mockRejectedValue(new Error("O Google Ads recusou a conversão: conta sem acesso"));

        await conversionWebhookService.receive("tok", dealPayload("won"), {});
        await flush();

        expect(logs.markUpload).toHaveBeenCalledWith("up-1", {
            status: "FAILED",
            errorMessage: "O Google Ads recusou a conversão: conta sem acesso",
        });
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "FAILED", expect.stringContaining("1 com falha"));
    });

    it("conexão desativada: registra e ignora", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration({ enabled: false }));

        await conversionWebhookService.receive("tok", dealPayload("won"), {});
        await flush();

        expect(ingest).not.toHaveBeenCalled();
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "IGNORED", "Conexão desativada.");
    });

    it("cabeçalho de verificação errado (RD CRM com segredo): 401, REJECTED e nada é enviado", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration({ webhookSecret: "segredo" }));

        await expect(
            conversionWebhookService.receive("tok", dealPayload("won"), { "x-crm-token": "outro" }),
        ).rejects.toThrow("Token de verificação do webhook inválido.");
        await flush();

        expect(ingest).not.toHaveBeenCalled();
        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "REJECTED", "Webhook com token de verificação inválido.");
    });

    it("falha ao buscar o contato fica FAILED e pode ser reprocessada depois", async () => {
        integrations.findByWebhookToken.mockResolvedValue(integration());
        rdContact.mockRejectedValueOnce(new Error("RD Station CRM retornou 401 ao buscar os contatos do negócio."));

        await conversionWebhookService.receive("tok", dealPayload("won"), {});
        await flush();

        expect(logs.markWebhookLog).toHaveBeenCalledWith("log-1", "FAILED", expect.stringContaining("401"));

        integrations.findByIdAndTenant.mockResolvedValue(integration());
        logs.findWebhookLog
            .mockResolvedValueOnce({ id: "log-1", status: "FAILED", rawPayload: dealPayload("won") } as never)
            .mockResolvedValueOnce({ id: "log-1", status: "PROCESSED" } as never);

        await expect(conversionWebhookService.reprocess("tenant-1", "int-1", "log-1")).resolves.toEqual({ status: "PROCESSED" });
        expect(ingest).toHaveBeenCalledTimes(1);
    });

    it("webhook rejeitado na verificação nunca é reprocessado", async () => {
        integrations.findByIdAndTenant.mockResolvedValue(integration());
        logs.findWebhookLog.mockResolvedValue({ id: "log-1", status: "REJECTED", rawPayload: {} } as never);

        await expect(conversionWebhookService.reprocess("tenant-1", "int-1", "log-1")).rejects.toThrow("Só é possível reprocessar");
    });
});
