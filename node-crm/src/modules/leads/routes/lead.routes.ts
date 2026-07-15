import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { leadController } from "../controllers/lead.controller";

export const leadRoutes: RouterType = Router();

leadRoutes.post(
    "/leads",
    authenticate,
    authorize("TENANT_ADMIN", "MANAGER", "USER"),
    leadController.create,
);
leadRoutes.get(
    "/leads",
    authenticate,
    authorize("TENANT_ADMIN", "MANAGER", "USER"),
    leadController.list,
);
