import { NotFoundError, ValidationError } from "../../../../shared/errors";
import { userRepository } from "../../../users/repositories/user.repository";
import { webWidgetIntegrationRepository } from "../repositories/web-widget-integration.repository";
import { webWidgetConfigService } from "./web-widget-config.service";
import type { WebWidgetIntegration } from "../types/web-widget-integration.types";

jest.mock("../../../users/repositories/user.repository");
jest.mock("../repositories/web-widget-integration.repository");

const mockedUserRepository = jest.mocked(userRepository);
const mockedIntegrationRepository = jest.mocked(webWidgetIntegrationRepository);

const baseIntegration: WebWidgetIntegration = {
    id: "integration-1",
    tenantId: "tenant-1",
    enabled: false,
    publicKey: "abc123",
    defaultResponsibleUserId: null,
    duplicateStrategy: "IGNORE",
    showEmailField: true,
    showPhoneField: true,
    showMessageField: true,
    buttonLabel: "Fale conosco",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

describe("webWidgetConfigService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getByTenant", () => {
        it("lança NotFoundError quando o tenant ainda não configurou o widget", async () => {
            mockedIntegrationRepository.findByTenant.mockResolvedValue(null);

            await expect(webWidgetConfigService.getByTenant("tenant-1")).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("retorna a integração existente", async () => {
            mockedIntegrationRepository.findByTenant.mockResolvedValue(baseIntegration);

            await expect(webWidgetConfigService.getByTenant("tenant-1")).resolves.toEqual(baseIntegration);
        });
    });

    describe("updateByTenant", () => {
        it("rejeita habilitar sem defaultResponsibleUserId (nem no payload, nem já configurado)", async () => {
            mockedIntegrationRepository.findByTenant.mockResolvedValue(baseIntegration);

            await expect(
                webWidgetConfigService.updateByTenant("tenant-1", { enabled: true }),
            ).rejects.toBeInstanceOf(ValidationError);
        });

        it("rejeita defaultResponsibleUserId de outro tenant", async () => {
            mockedUserRepository.findById.mockResolvedValue({
                id: "user-2",
                tenantId: "tenant-OUTRO",
                status: "ACTIVE",
            } as never);

            await expect(
                webWidgetConfigService.updateByTenant("tenant-1", { defaultResponsibleUserId: "user-2" }),
            ).rejects.toBeInstanceOf(NotFoundError);

            expect(mockedIntegrationRepository.upsertByTenant).not.toHaveBeenCalled();
        });

        it("habilita com sucesso quando defaultResponsibleUserId é válido e ativo no tenant", async () => {
            mockedUserRepository.findById.mockResolvedValue({
                id: "user-1",
                tenantId: "tenant-1",
                status: "ACTIVE",
            } as never);
            mockedIntegrationRepository.findByTenant.mockResolvedValue(baseIntegration);
            mockedIntegrationRepository.upsertByTenant.mockResolvedValue({
                ...baseIntegration,
                enabled: true,
                defaultResponsibleUserId: "user-1",
            });

            const result = await webWidgetConfigService.updateByTenant("tenant-1", {
                enabled: true,
                defaultResponsibleUserId: "user-1",
            });

            expect(result.enabled).toBe(true);
            expect(mockedIntegrationRepository.upsertByTenant).toHaveBeenCalledWith("tenant-1", {
                enabled: true,
                defaultResponsibleUserId: "user-1",
            });
        });
    });

    describe("regenerateKey", () => {
        it("lança NotFoundError se a integração ainda não existe", async () => {
            mockedIntegrationRepository.findByTenant.mockResolvedValue(null);

            await expect(webWidgetConfigService.regenerateKey("tenant-1")).rejects.toBeInstanceOf(
                NotFoundError,
            );
            expect(mockedIntegrationRepository.regenerateKey).not.toHaveBeenCalled();
        });

        it("rotaciona a publicKey de uma integração existente", async () => {
            mockedIntegrationRepository.findByTenant.mockResolvedValue(baseIntegration);
            mockedIntegrationRepository.regenerateKey.mockResolvedValue({
                ...baseIntegration,
                publicKey: "novaChave",
            });

            const result = await webWidgetConfigService.regenerateKey("tenant-1");

            expect(result.publicKey).toBe("novaChave");
        });
    });
});
