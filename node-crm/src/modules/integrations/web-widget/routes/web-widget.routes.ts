import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { createRateLimiter } from "../../../../shared/middleware/rate-limit";
import { webWidgetConfigController } from "../controllers/web-widget-config.controller";
import { webWidgetPublicController } from "../controllers/web-widget-public.controller";

export const webWidgetRoutes: RouterType = Router();

// Mesma política de acesso do Meta Lead Ads: "Integrações" não tem linha própria em
// permissions.md, usei a de Configurações por analogia (Tenant Admin gerencia o próprio
// tenant, Manager/User sem acesso).
const adminAccess = authorize("TENANT_ADMIN");

// 20 req/min por IP — única rota pública de escrita do módulo, alvo natural de abuso por
// não ter nenhum segredo real (publicKey é deliberadamente não-secreta, ver schema.prisma).
const widgetSubmissionRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 20,
    message: "Muitas submissões em pouco tempo. Tente novamente em instantes.",
});

webWidgetRoutes.get("/integrations/web-widget", authenticate, adminAccess, webWidgetConfigController.get);
webWidgetRoutes.put("/integrations/web-widget", authenticate, adminAccess, webWidgetConfigController.update);
webWidgetRoutes.post(
    "/integrations/web-widget/regenerate-key",
    authenticate,
    adminAccess,
    webWidgetConfigController.regenerateKey,
);
webWidgetRoutes.get(
    "/integrations/web-widget/logs",
    authenticate,
    adminAccess,
    webWidgetConfigController.listLogs,
);

// Rotas públicas — chamadas pelo widget.js embutido em sites de terceiros, sem JWT.
// CORS aberto só aqui (ver web-widget-public.controller.ts), resto da API sem CORS.
webWidgetRoutes.get("/webhooks/web-widget/widget.js", webWidgetPublicController.serveScript);
webWidgetRoutes.options("/webhooks/web-widget/leads", webWidgetPublicController.corsPreflight);
webWidgetRoutes.post(
    "/webhooks/web-widget/leads",
    widgetSubmissionRateLimiter,
    webWidgetPublicController.submitLead,
);
