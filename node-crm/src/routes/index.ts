import { Router } from "express";
import type { Router as RouterType } from "express";

import { activityRoutes } from "../modules/activities";
import { authRoutes } from "../modules/auth";
import { companyRoutes } from "../modules/companies";
import { contactRoutes } from "../modules/contacts";
import { dashboardRoutes } from "../modules/dashboard";
import { dealRoutes } from "../modules/deals";
import { metaRoutes } from "../modules/integrations/meta";
import { leadRoutes } from "../modules/leads";
import { pipelineRoutes } from "../modules/pipelines";
import { settingsRoutes } from "../modules/settings";
import { tenantRoutes } from "../modules/tenants";
import { userRoutes } from "../modules/users";

export const apiRouter: RouterType = Router();

apiRouter.use(authRoutes);
apiRouter.use(tenantRoutes);
apiRouter.use(userRoutes);
apiRouter.use(settingsRoutes);
apiRouter.use(companyRoutes);
apiRouter.use(contactRoutes);
apiRouter.use(pipelineRoutes);
apiRouter.use(leadRoutes);
apiRouter.use(dealRoutes);
apiRouter.use(activityRoutes);
apiRouter.use(dashboardRoutes);
apiRouter.use(metaRoutes);
