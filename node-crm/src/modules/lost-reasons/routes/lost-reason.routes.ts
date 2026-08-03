import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { lostReasonController } from "../controllers/lost-reason.controller";

export const lostReasonRoutes: RouterType = Router();

lostReasonRoutes.get(
    "/lost-reasons",
    authenticate,
    authorize("OWNER", "TENANT_ADMIN", "MANAGER", "USER"),
    lostReasonController.list,
);
lostReasonRoutes.post(
    "/lost-reasons",
    authenticate,
    authorize("OWNER", "TENANT_ADMIN"),
    lostReasonController.create,
);
lostReasonRoutes.delete(
    "/lost-reasons/:id",
    authenticate,
    authorize("OWNER", "TENANT_ADMIN"),
    lostReasonController.remove,
);
