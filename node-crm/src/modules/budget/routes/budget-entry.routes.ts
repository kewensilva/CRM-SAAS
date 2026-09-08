import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { budgetEntryController } from "../controllers/budget-entry.controller";

export const budgetEntryRoutes: RouterType = Router();

// Leitura liberada pra quem vê Relatórios (TENANT_ADMIN/MANAGER/USER, mesmo acesso do
// Dashboard). Escrita só TENANT_ADMIN — na prática só o Analista usa (sessão trocada pro
// tenant assume esse profile), mesmo padrão já usado em Produtos e na parametrização do
// widget: a UI de cadastro nem aparece pro Tenant Admin real.
const viewAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const writeAccess = authorize("TENANT_ADMIN");

budgetEntryRoutes.get("/budget-entries", authenticate, viewAccess, budgetEntryController.list);
budgetEntryRoutes.post("/budget-entries", authenticate, writeAccess, budgetEntryController.upsert);
budgetEntryRoutes.put("/budget-entries/:id", authenticate, writeAccess, budgetEntryController.update);
budgetEntryRoutes.delete("/budget-entries/:id", authenticate, writeAccess, budgetEntryController.remove);
