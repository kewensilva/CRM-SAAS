import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { dealController } from "../controllers/deal.controller";

export const dealRoutes: RouterType = Router();

// permissions.md > Negociações: Tenant Admin e Manager têm controle completo,
// User pode criar/editar/visualizar mas não excluir, Owner só visualiza (gap
// cross-tenant conhecido, ver CLAUDE.md).
const fullAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const deleteAccess = authorize("TENANT_ADMIN", "MANAGER");

dealRoutes.post("/deals", authenticate, fullAccess, dealController.create);
dealRoutes.get("/deals", authenticate, fullAccess, dealController.list);
dealRoutes.get("/deals/:id", authenticate, fullAccess, dealController.get);
dealRoutes.put("/deals/:id", authenticate, fullAccess, dealController.update);
dealRoutes.delete("/deals/:id", authenticate, deleteAccess, dealController.remove);
dealRoutes.put("/deals/:id/stage", authenticate, fullAccess, dealController.changeStage);
dealRoutes.put("/deals/:id/status", authenticate, fullAccess, dealController.changeStatus);
dealRoutes.get("/deals/:id/history", authenticate, fullAccess, dealController.history);
