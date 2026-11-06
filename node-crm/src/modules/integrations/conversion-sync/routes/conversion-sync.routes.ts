import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { createRateLimiter } from "../../../../shared/middleware/rate-limit";
import { conversionIntegrationController as controller } from "../controllers/conversion-integration.controller";
import { conversionWebhookController } from "../controllers/conversion-webhook.controller";

export const conversionSyncRoutes: RouterType = Router();

// Configuração: mesma política das demais integrações (Tenant Admin do próprio tenant — o
// Analista entra na base do cliente como Tenant Admin).
const admin = [authenticate, authorize("TENANT_ADMIN")];
const BASE = "/integrations/conversions";

conversionSyncRoutes.get(BASE, ...admin, controller.list);
conversionSyncRoutes.post(BASE, ...admin, controller.create);
conversionSyncRoutes.put(`${BASE}/:id`, ...admin, controller.update);
conversionSyncRoutes.delete(`${BASE}/:id`, ...admin, controller.remove);
conversionSyncRoutes.post(`${BASE}/:id/regenerate-token`, ...admin, controller.regenerateToken);
conversionSyncRoutes.get(`${BASE}/:id/logs`, ...admin, controller.listLogs);
conversionSyncRoutes.post(`${BASE}/:id/rules`, ...admin, controller.createRule);
conversionSyncRoutes.put(`${BASE}/:id/rules/:ruleId`, ...admin, controller.updateRule);
conversionSyncRoutes.delete(`${BASE}/:id/rules/:ruleId`, ...admin, controller.removeRule);
conversionSyncRoutes.post(`${BASE}/:id/rules/:ruleId/test`, ...admin, controller.testRule);
conversionSyncRoutes.post(`${BASE}/uploads/:uploadId/retry`, ...admin, controller.retryUpload);
conversionSyncRoutes.post(`${BASE}/:id/webhooks/:logId/reprocess`, ...admin, controller.reprocessWebhook);

// Webhook público (RD Station / Bitrix24). Limite por IP contra abuso da URL.
const webhookRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 240,
    message: "Muitas requisições ao webhook. Tente novamente em instantes.",
});

conversionSyncRoutes.post("/webhooks/conversions/:token", webhookRateLimiter, conversionWebhookController.receive);
