import { Router } from "express";
import type { Router as RouterType } from "express";

import { authRoutes } from "../modules/auth";
import { leadRoutes } from "../modules/leads";
import { tenantRoutes } from "../modules/tenants";
import { userRoutes } from "../modules/users";

export const apiRouter: RouterType = Router();

apiRouter.use(authRoutes);
apiRouter.use(tenantRoutes);
apiRouter.use(userRoutes);
apiRouter.use(leadRoutes);
