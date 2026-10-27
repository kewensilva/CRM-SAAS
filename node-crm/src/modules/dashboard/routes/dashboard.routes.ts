import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { dashboardController } from "../controllers/dashboard.controller";

export const dashboardRoutes: RouterType = Router();

dashboardRoutes.get(
    "/dashboard",
    authenticate,
    authorize("TENANT_ADMIN", "MANAGER", "USER"),
    dashboardController.get,
);

dashboardRoutes.get(
    "/dashboard/owner",
    authenticate,
    authorize("OWNER"),
    dashboardController.getPlatform,
);

// Cards por empresa e ranking de frequência dos analistas — só o Owner vê.
dashboardRoutes.get(
    "/dashboard/owner/tenants",
    authenticate,
    authorize("OWNER"),
    dashboardController.getOwnerTenantCards,
);

dashboardRoutes.get(
    "/dashboard/owner/analysts",
    authenticate,
    authorize("OWNER"),
    dashboardController.getAnalystActivity,
);
