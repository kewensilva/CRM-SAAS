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

// Contrapartes do Owner: configurar o widget de qualquer tenant (ex.: a partir da tela
// "Empresas"), não só o próprio — mesmo padrão de /tenants/:id/users e /tenants/:id/widget.
const ownerAccess = authorize("OWNER");

webWidgetRoutes.get(
    "/tenants/:tenantId/web-widget",
    authenticate,
    ownerAccess,
    webWidgetConfigController.getForTenant,
);
webWidgetRoutes.put(
    "/tenants/:tenantId/web-widget",
    authenticate,
    ownerAccess,
    webWidgetConfigController.updateForTenant,
);
webWidgetRoutes.post(
    "/tenants/:tenantId/web-widget/regenerate-key",
    authenticate,
    ownerAccess,
    webWidgetConfigController.regenerateKeyForTenant,
);
webWidgetRoutes.get(
    "/tenants/:tenantId/web-widget/logs",
    authenticate,
    ownerAccess,
    webWidgetConfigController.listLogsForTenant,
);

// Rotas públicas — chamadas pelo widget.js embutido em sites de terceiros, sem JWT.
// CORS aberto só nesse prefixo (middleware global em app.ts), resto da API usa a
// allowlist restrita da SPA.
webWidgetRoutes.get("/webhooks/web-widget/widget.js", webWidgetPublicController.serveScript);
webWidgetRoutes.post(
    "/webhooks/web-widget/leads",
    widgetSubmissionRateLimiter,
    webWidgetPublicController.submitLead,
);
