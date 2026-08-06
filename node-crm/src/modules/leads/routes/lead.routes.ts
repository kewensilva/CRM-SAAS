import { Router } from "express";
import type { Router as RouterType } from "express";
import multer from "multer";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { leadController } from "../controllers/lead.controller";

export const leadRoutes: RouterType = Router();

// Memória (não disco) — o arquivo é lido e descartado na mesma requisição, nunca
// persistido; 5MB é generoso pra uma planilha de leads (bem acima do maior caso real).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const tenantWrite = authorize("TENANT_ADMIN", "MANAGER", "USER");

leadRoutes.post("/leads", authenticate, tenantWrite, leadController.create);
leadRoutes.get("/leads", authenticate, tenantWrite, leadController.list);
leadRoutes.put("/leads/:id", authenticate, tenantWrite, leadController.update);
leadRoutes.post(
    "/leads/import",
    authenticate,
    tenantWrite,
    upload.single("file"),
    leadController.importFile,
);
leadRoutes.get("/leads/import-template", authenticate, tenantWrite, leadController.importTemplate);
leadRoutes.post("/leads/export", authenticate, tenantWrite, leadController.exportFile);
