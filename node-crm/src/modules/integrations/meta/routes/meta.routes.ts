import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { metaIntegrationController } from "../controllers/meta-integration.controller";
import { metaWebhookController } from "../controllers/meta-webhook.controller";

export const metaRoutes: RouterType = Router();

// Rotas de configuração: mesma política de acesso de Configurações em permissions.md
// (Owner controle completo — gap cross-tenant conhecido, ver CLAUDE.md — Tenant Admin
// altera o próprio tenant, Manager/User sem acesso). "Integrações" não tem linha própria
// na matriz de permissions.md; usei a de Configurações por analogia, é o módulo mais
// próximo em natureza (configuração administrativa do tenant).
const adminAccess = authorize("TENANT_ADMIN");

metaRoutes.get("/integrations/meta", authenticate, adminAccess, metaIntegrationController.get);
metaRoutes.put("/integrations/meta", authenticate, adminAccess, metaIntegrationController.update);
metaRoutes.get(
    "/integrations/meta/logs",
    authenticate,
    adminAccess,
    metaIntegrationController.listLogs,
);

// Rotas do webhook: públicas por natureza — é a Meta chamando, não um usuário logado.
// Autenticidade é garantida pela assinatura HMAC (X-Hub-Signature-256), não por JWT.
metaRoutes.get("/webhooks/meta", metaWebhookController.verify);
metaRoutes.post("/webhooks/meta", metaWebhookController.receive);
