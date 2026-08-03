import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { analystController } from "../controllers/analyst.controller";

export const analystRoutes: RouterType = Router();

// Analistas são cadastrados e geridos só pelo Owner (multi-tenant.md — o Owner administra
// a plataforma, não opera dentro dos tenants; o Analista é quem faz isso em nome dele).
const ownerOnly = authorize("OWNER");

analystRoutes.post("/analysts", authenticate, ownerOnly, analystController.create);
analystRoutes.get("/analysts", authenticate, ownerOnly, analystController.list);
analystRoutes.put("/analysts/:id/access", authenticate, ownerOnly, analystController.replaceAccess);
analystRoutes.delete("/analysts/:id", authenticate, ownerOnly, analystController.remove);
