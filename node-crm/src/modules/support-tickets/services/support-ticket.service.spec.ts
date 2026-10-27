import { emailService } from "../../../shared/email/email.service";
import { IntegrationError } from "../../../shared/errors";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import { supportTicketRepository } from "../repositories/support-ticket.repository";
import { supportTicketService } from "./support-ticket.service";

jest.mock("../../../shared/email/email.service");
jest.mock("../../tenants/repositories/tenant.repository");
jest.mock("../../users/repositories/user.repository");
jest.mock("../repositories/support-ticket.repository");

const email = jest.mocked(emailService);
const tickets = jest.mocked(supportTicketRepository);

const ADMIN = { userId: "admin-1", tenantId: "tenant-1", profile: "TENANT_ADMIN" };
const SELLER = { userId: "seller-1", tenantId: "tenant-1", profile: "USER" };

const ticket = (overrides: Record<string, unknown> = {}) =>
    ({
        id: "ticket-1",
        tenantId: "tenant-1",
        createdByUserId: "seller-1",
        title: "Erro ao exportar",
        message: "A planilha vem vazia desde ontem.",
        emailSentAt: null,
        emailError: null,
        createdAt: new Date("2026-10-27T15:00:00Z"),
        updatedAt: new Date(),
        deletedAt: null,
        ...overrides,
    }) as never;

beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(tenantRepository.findById).mockResolvedValue({ name: "Agência Delta" } as never);
    jest.mocked(userRepository.findById).mockResolvedValue({ name: "Vendedor", email: "v@delta.com" } as never);
    tickets.create.mockResolvedValue(ticket());
    tickets.markEmailSent.mockImplementation(async () => ticket({ emailSentAt: new Date() }));
    tickets.markEmailFailed.mockImplementation(async (_id, error) => ticket({ emailError: error }));
});

describe("supportTicketService.create", () => {
    it("salva o chamado com tenant/autor do token e envia o e-mail ao atendimento", async () => {
        const result = await supportTicketService.create(SELLER, { title: "Erro ao exportar", message: "A planilha vem vazia." });

        expect(tickets.create).toHaveBeenCalledWith("tenant-1", "seller-1", expect.any(Object));
        expect(email.sendSupportTicketEmail).toHaveBeenCalledWith(
            expect.objectContaining({ tenantName: "Agência Delta", userEmail: "v@delta.com", title: "Erro ao exportar" }),
        );
        expect(tickets.markEmailSent).toHaveBeenCalledWith("ticket-1");
        expect((result as { emailSentAt: Date | null }).emailSentAt).not.toBeNull();
    });

    it("falha no e-mail não perde o chamado: grava o motivo e não lança", async () => {
        email.sendSupportTicketEmail.mockRejectedValue(new IntegrationError("Serviço de e-mail não configurado."));

        const result = await supportTicketService.create(SELLER, { title: "Erro", message: "Algo deu errado aqui." });

        expect(tickets.create).toHaveBeenCalled();
        expect(tickets.markEmailFailed).toHaveBeenCalledWith("ticket-1", "Serviço de e-mail não configurado.");
        expect((result as { emailError: string | null }).emailError).toBe("Serviço de e-mail não configurado.");
    });
});

describe("supportTicketService.list", () => {
    it("Vendedor vê só os próprios chamados", async () => {
        await supportTicketService.list(SELLER);

        expect(tickets.listByTenant).toHaveBeenCalledWith("tenant-1", "seller-1");
    });

    it("Tenant Admin vê todos os chamados do tenant", async () => {
        await supportTicketService.list(ADMIN);

        expect(tickets.listByTenant).toHaveBeenCalledWith("tenant-1", undefined);
    });
});

describe("supportTicketService.resend", () => {
    it("chamado de outro tenant (ou inexistente) dá 404", async () => {
        tickets.findByIdAndTenant.mockResolvedValue(null);

        await expect(supportTicketService.resend(ADMIN, "ticket-x")).rejects.toThrow("Chamado não encontrado.");
        expect(tickets.findByIdAndTenant).toHaveBeenCalledWith("ticket-x", "tenant-1");
    });

    it("Vendedor não reenvia chamado de outro usuário", async () => {
        tickets.findByIdAndTenant.mockResolvedValue(ticket({ createdByUserId: "other-user" }));

        await expect(supportTicketService.resend(SELLER, "ticket-1")).rejects.toThrow("só pode reenviar");
        expect(email.sendSupportTicketEmail).not.toHaveBeenCalled();
    });

    it("chamado já enviado não é reenviado", async () => {
        tickets.findByIdAndTenant.mockResolvedValue(ticket({ emailSentAt: new Date() }));

        await expect(supportTicketService.resend(ADMIN, "ticket-1")).rejects.toThrow("já foi enviado");
    });

    it("Tenant Admin reenvia chamado pendente de qualquer usuário do tenant", async () => {
        tickets.findByIdAndTenant.mockResolvedValue(ticket({ emailError: "falhou" }));

        await supportTicketService.resend(ADMIN, "ticket-1");

        expect(email.sendSupportTicketEmail).toHaveBeenCalled();
        expect(tickets.markEmailSent).toHaveBeenCalledWith("ticket-1");
    });
});
