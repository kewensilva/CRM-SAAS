import { leadRepository } from "../../../leads/repositories/lead.repository";
import { webWidgetIntegrationRepository } from "../repositories/web-widget-integration.repository";
import { webWidgetLogRepository } from "../repositories/web-widget-log.repository";
import { webWidgetLeadService } from "./web-widget-lead.service";
import type { WebWidgetIntegration, WebWidgetSubmissionPayload } from "../types/web-widget-integration.types";

jest.mock("../../../leads/repositories/lead.repository");
jest.mock("../repositories/web-widget-integration.repository");
jest.mock("../repositories/web-widget-log.repository");

const mockedLeadRepository = jest.mocked(leadRepository);
const mockedIntegrationRepository = jest.mocked(webWidgetIntegrationRepository);
const mockedLogRepository = jest.mocked(webWidgetLogRepository);

const basePayload: WebWidgetSubmissionPayload = {
    publicKey: "abc123",
    name: "João Silva",
    email: "joao@example.com",
    phone: "11999999999",
};

const baseIntegration: WebWidgetIntegration = {
    id: "integration-1",
    tenantId: "tenant-1",
    enabled: true,
    publicKey: "abc123",
    defaultResponsibleUserId: "user-1",
    duplicateStrategy: "IGNORE",
    showEmailField: true,
    showPhoneField: true,
    showMessageField: true,
    buttonLabel: "Fale conosco",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

describe("webWidgetLeadService.processSubmission", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedLogRepository.createReceived.mockResolvedValue({
            id: "log-1",
            tenantId: "tenant-1",
            leadId: null,
            status: "RECEIVED",
            errorMessage: null,
            pageUrl: null,
            referrer: null,
            utmSource: null,
            utmMedium: null,
            utmCampaign: null,
            utmTerm: null,
            utmContent: null,
            message: null,
            rawPayload: "{}",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    });

    it("cria o Lead e marca o log como PROCESSED em uma submissão válida", async () => {
        mockedIntegrationRepository.findByPublicKey.mockResolvedValue(baseIntegration);
        mockedLeadRepository.findByTenantAndEmail.mockResolvedValue(null);
        mockedLeadRepository.create.mockResolvedValue({ id: "lead-1" } as never);

        await webWidgetLeadService.processSubmission(basePayload);

        expect(mockedLeadRepository.create).toHaveBeenCalledWith({
            tenantId: "tenant-1",
            responsibleUserId: "user-1",
            name: "João Silva",
            email: "joao@example.com",
            phone: "11999999999",
        });
        expect(mockedLogRepository.markProcessed).toHaveBeenCalledWith("log-1", "lead-1");
    });

    it("mantém o Lead existente e marca DUPLICATE quando duplicateStrategy é IGNORE", async () => {
        mockedIntegrationRepository.findByPublicKey.mockResolvedValue(baseIntegration);
        mockedLeadRepository.findByTenantAndEmail.mockResolvedValue({ id: "lead-existing" } as never);

        await webWidgetLeadService.processSubmission(basePayload);

        expect(mockedLeadRepository.updateContactInfo).not.toHaveBeenCalled();
        expect(mockedLeadRepository.create).not.toHaveBeenCalled();
        expect(mockedLogRepository.markDuplicate).toHaveBeenCalledWith("log-1", "lead-existing");
    });

    it("atualiza o Lead existente quando duplicateStrategy é UPDATE", async () => {
        mockedIntegrationRepository.findByPublicKey.mockResolvedValue({
            ...baseIntegration,
            duplicateStrategy: "UPDATE",
        });
        mockedLeadRepository.findByTenantAndEmail.mockResolvedValue({ id: "lead-existing" } as never);

        await webWidgetLeadService.processSubmission(basePayload);

        expect(mockedLeadRepository.updateContactInfo).toHaveBeenCalledWith("lead-existing", {
            name: "João Silva",
            email: "joao@example.com",
            phone: "11999999999",
        });
        expect(mockedLogRepository.markDuplicate).toHaveBeenCalledWith("log-1", "lead-existing");
    });

    it("registra FAILED com tenantId nulo quando a publicKey não resolve nenhuma integração", async () => {
        mockedIntegrationRepository.findByPublicKey.mockResolvedValue(null);

        await webWidgetLeadService.processSubmission(basePayload);

        expect(mockedLogRepository.createReceived).toHaveBeenCalledWith(
            expect.objectContaining({ tenantId: null }),
        );
        expect(mockedLogRepository.markFailed).toHaveBeenCalled();
        expect(mockedLeadRepository.create).not.toHaveBeenCalled();
    });

    it("descarta silenciosamente e marca FAILED quando o honeypot está preenchido", async () => {
        mockedIntegrationRepository.findByPublicKey.mockResolvedValue(baseIntegration);

        await webWidgetLeadService.processSubmission({ ...basePayload, website: "http://bot.example" });

        expect(mockedLogRepository.markFailed).toHaveBeenCalledWith(
            "log-1",
            expect.stringContaining("honeypot"),
        );
        expect(mockedLeadRepository.create).not.toHaveBeenCalled();
    });

    it("marca FAILED e não cria Lead quando a integração está desabilitada (findByPublicKey só retorna enabled)", async () => {
        mockedIntegrationRepository.findByPublicKey.mockResolvedValue(null);

        await webWidgetLeadService.processSubmission(basePayload);

        expect(mockedLogRepository.markFailed).toHaveBeenCalled();
        expect(mockedLeadRepository.create).not.toHaveBeenCalled();
    });
});
