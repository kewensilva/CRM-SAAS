import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { userController } from "../controllers/user.controller";

export const userRoutes: RouterType = Router();

userRoutes.post("/users", authenticate, authorize("TENANT_ADMIN"), userController.create);
userRoutes.get(
    "/users",
    authenticate,
    authorize("TENANT_ADMIN", "MANAGER", "USER"),
    userController.list,
);
