import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { activityController } from "../controllers/activity.controller";

export const activityRoutes: RouterType = Router();

// permissions.md > Atividades: Tenant Admin e Manager têm controle completo; User pode
// criar, editar e concluir, mas não cancelar nem excluir.
const fullAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const elevatedAccess = authorize("TENANT_ADMIN", "MANAGER");

activityRoutes.post("/activities", authenticate, fullAccess, activityController.create);
activityRoutes.get("/activities", authenticate, fullAccess, activityController.list);
activityRoutes.get("/activities/:id", authenticate, fullAccess, activityController.get);
activityRoutes.put("/activities/:id", authenticate, fullAccess, activityController.update);
activityRoutes.delete("/activities/:id", authenticate, elevatedAccess, activityController.remove);
activityRoutes.put(
    "/activities/:id/complete",
    authenticate,
    fullAccess,
    activityController.complete,
);
activityRoutes.put(
    "/activities/:id/cancel",
    authenticate,
    elevatedAccess,
    activityController.cancel,
);
