import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { reportController } from "../controllers/report.controller";

export const reportRoutes: RouterType = Router();

// Mesmo acesso do Dashboard (Painel) — leitura pra TENANT_ADMIN/MANAGER/USER.
reportRoutes.get(
    "/reports/summary",
    authenticate,
    authorize("TENANT_ADMIN", "MANAGER", "USER"),
    reportController.getSummary,
);
