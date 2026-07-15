import { Router } from "express";
import type { Router as RouterType } from "express";

import { leadController } from "../controllers/lead.controller";

export const leadRoutes: RouterType = Router();

leadRoutes.post("/leads", leadController.create);
leadRoutes.get("/leads", leadController.list);
