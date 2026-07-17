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
