import { leadService } from "../../../leads/services/lead.service";
import { googleAdsConnectionRepository } from "../repositories/google-ads-connection.repository";
import { googleAdsRuleRepository } from "../repositories/google-ads-rule.repository";
import { googleAdsUploadRepository } from "../repositories/google-ads-upload.repository";
import type { GoogleAdsConversionRule } from "../types/google-ads.types";
import { sendUpload } from "./conversion-dispatch.service";
import { conversionTriggerService, triggerOf } from "./conversion-trigger.service";

jest.mock("../../../leads/services/lead.service", () => ({ leadService: { getConversionData: jest.fn() } }));
jest.mock("../repositories/google-ads-connection.repository");
jest.mock("../repositories/google-ads-rule.repository");
jest.mock("../repositories/google-ads-upload.repository");
jest.mock("./conversion-dispatch.service");

const leads = jest.mocked(leadService);
const connections = jest.mocked(googleAdsConnectionRepository);
const rules = jest.mocked(googleAdsRuleRepository);
const uploads = jest.mocked(googleAdsUploadRepository);
const send = jest.mocked(sendUpload);

const rule = (overrides: Partial<GoogleAdsConversionRule>): GoogleAdsConversionRule => ({
    id: "rule-1",
    tenantId: "t1",
    connectionId: "conn-1",
    name: "Venda",
    trigger: "LEAD_WON",
    originFilter: null,
    conversionActionId: "777",
    conversionActionName: null,
    sendValue: true,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const wonEvent = { type: "LeadStatusChanged" as const, tenantId: "t1", leadId: "lead-1", status: "VENDIDO", value: 1500 };

beforeEach(() => {
    jest.resetAllMocks();
    connections.findByTenant.mockResolvedValue({ id: "conn-1", refreshToken: "rt", customerId: "1234567890" } as never);
    leads.getConversionData.mockResolvedValue({
        id: "lead-1",
        tenantId: "t1",
        email: "Ana@Gmail.com",
        phone: "(11) 98888-7777",
        gclid: "Cj0KCQ",
        source: "Site",
        dealValue: 1500,
    });
    uploads.createPending.mockImplementation(async (data) => ({ id: "up-1", ...data }) as never);
});

describe("triggerOf", () => {
    it("Lead criado, Em andamento e Vendido viram gatilhos; os demais status não", () => {
        expect(triggerOf({ type: "LeadCreated", tenantId: "t1", leadId: "l" })).toBe("LEAD_CREATED");
        expect(triggerOf({ ...wonEvent, status: "EM_ANDAMENTO" })).toBe("LEAD_QUALIFIED");
        expect(triggerOf(wonEvent)).toBe("LEAD_WON");
        expect(triggerOf({ ...wonEvent, status: "PERDIDO" })).toBeNull();
        expect(triggerOf({ ...wonEvent, status: "NAO_ATENDE" })).toBeNull();
    });
});

describe("conversionTriggerService.handleLeadEvent", () => {
    it("Lead vendido: envia com GCLID, e-mail/telefone em hash e o valor da venda", async () => {
        rules.listEnabledByTrigger.mockResolvedValue([rule({})]);

        await conversionTriggerService.handleLeadEvent(wonEvent);

        const data = uploads.createPending.mock.calls[0]?.[0];

        expect(data).toMatchObject({ ruleId: "rule-1", leadId: "lead-1", gclid: "Cj0KCQ", hasEmail: true, hasPhone: true, conversionValue: 1500 });
        expect(JSON.stringify(data?.userIdentifiers)).not.toContain("gmail");
        expect(send).toHaveBeenCalledWith(expect.objectContaining({ id: "up-1" }), "777");
    });

    it("respeita o filtro de Origem da regra", async () => {
        rules.listEnabledByTrigger.mockResolvedValue([rule({ id: "so-meta", originFilter: "META" }), rule({ id: "so-site", originFilter: "SITE" })]);

        await conversionTriggerService.handleLeadEvent(wonEvent);

        expect(uploads.createPending.mock.calls.map(([data]) => data.ruleId)).toEqual(["so-site"]);
    });

    it("sem 'enviar valor', a conversão vai sem valor", async () => {
        rules.listEnabledByTrigger.mockResolvedValue([rule({ sendValue: false })]);

        await conversionTriggerService.handleLeadEvent(wonEvent);

        expect(uploads.createPending.mock.calls[0]?.[0].conversionValue).toBeNull();
    });

    it("mesma regra para o mesmo Lead de novo: não envia outra vez", async () => {
        rules.listEnabledByTrigger.mockResolvedValue([rule({})]);
        uploads.createPending.mockResolvedValue(null);

        await conversionTriggerService.handleLeadEvent(wonEvent);

        expect(send).not.toHaveBeenCalled();
    });

    it("sem regra ligada para o momento, nem consulta o Lead", async () => {
        rules.listEnabledByTrigger.mockResolvedValue([]);

        await conversionTriggerService.handleLeadEvent(wonEvent);

        expect(leads.getConversionData).not.toHaveBeenCalled();
    });

    it("status que não é gatilho é ignorado", async () => {
        await conversionTriggerService.handleLeadEvent({ ...wonEvent, status: "PERDIDO" });

        expect(rules.listEnabledByTrigger).not.toHaveBeenCalled();
    });
});
