import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { googleAdsController } from "../controllers/google-ads.controller";

export const googleAdsRoutes: RouterType = Router();

// Mesma política das demais integrações (Configurações em permissions.md): só o Tenant Admin.
const admin = [authenticate, authorize("TENANT_ADMIN")];
const BASE = "/integrations/google-ads";

googleAdsRoutes.get(BASE, ...admin, googleAdsController.getConnection);
googleAdsRoutes.get(`${BASE}/oauth/url`, ...admin, googleAdsController.getAuthorizationUrl);
googleAdsRoutes.post(`${BASE}/oauth/exchange`, ...admin, googleAdsController.exchange);
googleAdsRoutes.post(`${BASE}/disconnect`, ...admin, googleAdsController.disconnect);
googleAdsRoutes.get(`${BASE}/accounts`, ...admin, googleAdsController.listAccounts);
googleAdsRoutes.put(`${BASE}/account`, ...admin, googleAdsController.selectAccount);
googleAdsRoutes.get(`${BASE}/conversion-actions`, ...admin, googleAdsController.listConversionActions);

googleAdsRoutes.get(`${BASE}/rules`, ...admin, googleAdsController.listRules);
googleAdsRoutes.post(`${BASE}/rules`, ...admin, googleAdsController.createRule);
googleAdsRoutes.put(`${BASE}/rules/:id`, ...admin, googleAdsController.updateRule);
googleAdsRoutes.delete(`${BASE}/rules/:id`, ...admin, googleAdsController.removeRule);
googleAdsRoutes.post(`${BASE}/rules/:id/test`, ...admin, googleAdsController.testRule);

googleAdsRoutes.get(`${BASE}/uploads`, ...admin, googleAdsController.listHistory);
googleAdsRoutes.post(`${BASE}/uploads/:id/retry`, ...admin, googleAdsController.retryUpload);
