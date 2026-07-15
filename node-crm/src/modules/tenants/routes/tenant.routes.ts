import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { tenantController } from "../controllers/tenant.controller";

export const tenantRoutes: RouterType = Router();

tenantRoutes.post("/tenants", authenticate, authorize("OWNER"), tenantController.create);
tenantRoutes.get("/tenants", authenticate, authorize("OWNER"), tenantController.list);
