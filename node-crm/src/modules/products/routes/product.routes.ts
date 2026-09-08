import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { productController } from "../controllers/product.controller";

export const productRoutes: RouterType = Router();

// Leitura liberada pra quem move Leads pra Vendido (precisa do catálogo pro seletor de
// produto). Escrita só TENANT_ADMIN — na prática só o Analista usa (sessão trocada pro
// tenant assume esse profile), a UI de cadastro nem aparece pro Tenant Admin real, mesmo
// padrão já usado pra parametrização do widget (ver configuracoes.component.ts no front).
const viewAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const writeAccess = authorize("TENANT_ADMIN");

productRoutes.get("/products", authenticate, viewAccess, productController.list);
productRoutes.post("/products", authenticate, writeAccess, productController.create);
productRoutes.put("/products/:id", authenticate, writeAccess, productController.update);
productRoutes.delete("/products/:id", authenticate, writeAccess, productController.remove);
