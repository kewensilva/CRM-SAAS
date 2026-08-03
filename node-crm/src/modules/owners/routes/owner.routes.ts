import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { ownerController } from "../controllers/owner.controller";

export const ownerRoutes: RouterType = Router();

// Só Owner cria Owner — nunca um usuário convencional (Tenant Admin/Manager/User/Analista).
const ownerOnly = authorize("OWNER");

ownerRoutes.post("/owners", authenticate, ownerOnly, ownerController.create);
ownerRoutes.get("/owners", authenticate, ownerOnly, ownerController.list);
ownerRoutes.delete("/owners/:id", authenticate, ownerOnly, ownerController.remove);
