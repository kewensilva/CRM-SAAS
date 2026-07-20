import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { widgetController } from "../controllers/widget.controller";

export const widgetRoutes: RouterType = Router();

// Configuração: só o Owner define o widget de cada tenant (ver plano — não é
// self-service do Tenant Admin, diferente de Configurações/Meta Lead Ads).
const ownerAccess = authorize("OWNER");

widgetRoutes.get("/tenants/:tenantId/widget", authenticate, ownerAccess, widgetController.get);
widgetRoutes.put("/tenants/:tenantId/widget", authenticate, ownerAccess, widgetController.update);

// Submissão: pública por natureza — é o site do tenant chamando, não um usuário logado.
// CORS permissivo específico desta rota é configurado em app.ts.
widgetRoutes.post("/widget/:tenantId/leads", widgetController.submit);
