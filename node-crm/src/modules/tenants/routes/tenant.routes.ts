import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { tenantController } from "../controllers/tenant.controller";

export const tenantRoutes: RouterType = Router();

const ownerAccess = authorize("OWNER");

tenantRoutes.post("/tenants", authenticate, ownerAccess, tenantController.create);
tenantRoutes.get("/tenants", authenticate, ownerAccess, tenantController.list);
tenantRoutes.put("/tenants/:id", authenticate, ownerAccess, tenantController.update);
tenantRoutes.delete("/tenants/:id", authenticate, ownerAccess, tenantController.remove);
tenantRoutes.get("/tenants/:id/users", authenticate, ownerAccess, tenantController.listUsers);
tenantRoutes.post("/tenants/:id/users", authenticate, ownerAccess, tenantController.createUserForTenant);
tenantRoutes.put(
    "/tenants/:id/users/:userId",
    authenticate,
    ownerAccess,
    tenantController.updateUserForTenant,
);
tenantRoutes.delete(
    "/tenants/:id/users/:userId",
    authenticate,
    ownerAccess,
    tenantController.removeUserForTenant,
);
