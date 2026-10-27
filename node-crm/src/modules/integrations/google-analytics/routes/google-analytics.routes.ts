import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { googleAnalyticsController } from "../controllers/google-analytics.controller";

export const googleAnalyticsRoutes: RouterType = Router();

// Configuração: mesma política da integração Meta (Tenant Admin do próprio tenant).
const adminAccess = authorize("TENANT_ADMIN");

googleAnalyticsRoutes.get(
    "/integrations/google-analytics",
    authenticate,
    adminAccess,
    googleAnalyticsController.getSettings,
);
googleAnalyticsRoutes.put(
    "/integrations/google-analytics",
    authenticate,
    adminAccess,
    googleAnalyticsController.updateSettings,
);

// Leitura dos dados no Relatórios: mesmo acesso de /reports/summary.
googleAnalyticsRoutes.get(
    "/reports/google-analytics",
    authenticate,
    authorize("TENANT_ADMIN", "MANAGER", "USER"),
    googleAnalyticsController.getReport,
);
