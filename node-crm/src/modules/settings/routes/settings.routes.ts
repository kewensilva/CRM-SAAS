import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { settingsController } from "../controllers/settings.controller";

export const settingsRoutes: RouterType = Router();

settingsRoutes.get(
    "/settings",
    authenticate,
    authorize("TENANT_ADMIN"),
    settingsController.get,
);
settingsRoutes.put(
    "/settings",
    authenticate,
    authorize("TENANT_ADMIN"),
    settingsController.update,
);
