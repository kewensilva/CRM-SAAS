import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { metaIntegrationController } from "../controllers/meta-integration.controller";
import { metaOAuthController } from "../controllers/meta-oauth.controller";
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
// "Conectar com o Facebook" (OAuth): url -> exchange (code vira lista de Páginas) ->
// connect (Página escolhida é assinada no webhook e salva). disconnect desfaz tudo.
metaRoutes.get("/integrations/meta/oauth/url", authenticate, adminAccess, metaOAuthController.getAuthorizationUrl);
metaRoutes.post("/integrations/meta/oauth/exchange", authenticate, adminAccess, metaOAuthController.exchange);
metaRoutes.post("/integrations/meta/oauth/connect", authenticate, adminAccess, metaOAuthController.connect);
metaRoutes.post("/integrations/meta/disconnect", authenticate, adminAccess, metaOAuthController.disconnect);
// Rotas do webhook: públicas por natureza — é a Meta chamando, não um usuário logado.
// Autenticidade é garantida pela assinatura HMAC (X-Hub-Signature-256), não por JWT.
metaRoutes.get("/webhooks/meta", metaWebhookController.verify);
metaRoutes.post("/webhooks/meta", metaWebhookController.receive);
