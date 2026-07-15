import { Router } from "express";
import type { Router as RouterType } from "express";

import { leadRoutes } from "../modules/leads";

export const apiRouter: RouterType = Router();

apiRouter.use(leadRoutes);
