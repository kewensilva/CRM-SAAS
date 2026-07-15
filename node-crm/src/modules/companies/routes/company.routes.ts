import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { companyController } from "../controllers/company.controller";

export const companyRoutes: RouterType = Router();

const viewAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const writeAccess = authorize("TENANT_ADMIN", "MANAGER");
const deleteAccess = authorize("TENANT_ADMIN");

companyRoutes.post("/companies", authenticate, writeAccess, companyController.create);
companyRoutes.get("/companies", authenticate, viewAccess, companyController.list);
companyRoutes.get("/companies/:id", authenticate, viewAccess, companyController.get);
companyRoutes.put("/companies/:id", authenticate, writeAccess, companyController.update);
companyRoutes.delete("/companies/:id", authenticate, deleteAccess, companyController.remove);
