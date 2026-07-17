import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { contactController } from "../controllers/contact.controller";

export const contactRoutes: RouterType = Router();

const fullAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const deleteAccess = authorize("TENANT_ADMIN");

contactRoutes.post("/contacts", authenticate, fullAccess, contactController.create);
contactRoutes.get("/contacts", authenticate, fullAccess, contactController.list);
contactRoutes.get("/contacts/:id", authenticate, fullAccess, contactController.get);
contactRoutes.put("/contacts/:id", authenticate, fullAccess, contactController.update);
contactRoutes.delete("/contacts/:id", authenticate, deleteAccess, contactController.remove);
