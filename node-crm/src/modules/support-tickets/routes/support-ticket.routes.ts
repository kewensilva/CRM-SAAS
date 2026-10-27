import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { createRateLimiter } from "../../../shared/middleware/rate-limit";
import { supportTicketController } from "../controllers/support-ticket.controller";

export const supportTicketRoutes: RouterType = Router();

// Aba Chamados: usuários do cliente (Tenant Admin, Manager e Vendedor). Owner/Analista base
// não têm tenant no token — o Analista abre chamados de dentro da base do cliente.
const clientAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");

// Cada chamado dispara um e-mail para o atendimento — limita abertura/reenvio em massa.
const ticketRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: "Muitos chamados em pouco tempo. Tente novamente mais tarde.",
});

supportTicketRoutes.get("/support-tickets", authenticate, clientAccess, supportTicketController.list);
supportTicketRoutes.post(
    "/support-tickets",
    authenticate,
    clientAccess,
    ticketRateLimiter,
    supportTicketController.create,
);
supportTicketRoutes.post(
    "/support-tickets/:id/resend",
    authenticate,
    clientAccess,
    ticketRateLimiter,
    supportTicketController.resend,
);
