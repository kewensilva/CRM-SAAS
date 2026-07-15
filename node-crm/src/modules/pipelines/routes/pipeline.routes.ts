import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { pipelineController } from "../controllers/pipeline.controller";
import { stageController } from "../controllers/stage.controller";

export const pipelineRoutes: RouterType = Router();

const viewAccess = authorize("TENANT_ADMIN", "MANAGER", "USER");
const writeAccess = authorize("TENANT_ADMIN");

pipelineRoutes.post("/pipelines", authenticate, writeAccess, pipelineController.create);
pipelineRoutes.get("/pipelines", authenticate, viewAccess, pipelineController.list);
pipelineRoutes.get("/pipelines/:id", authenticate, viewAccess, pipelineController.get);
pipelineRoutes.put("/pipelines/:id", authenticate, writeAccess, pipelineController.update);
pipelineRoutes.delete("/pipelines/:id", authenticate, writeAccess, pipelineController.remove);

pipelineRoutes.post(
    "/pipelines/:pipelineId/stages",
    authenticate,
    writeAccess,
    stageController.create,
);
pipelineRoutes.get(
    "/pipelines/:pipelineId/stages",
    authenticate,
    viewAccess,
    stageController.list,
);
pipelineRoutes.put(
    "/pipelines/:pipelineId/stages/reorder",
    authenticate,
    writeAccess,
    stageController.reorder,
);
pipelineRoutes.put(
    "/pipelines/:pipelineId/stages/:stageId",
    authenticate,
    writeAccess,
    stageController.update,
);
pipelineRoutes.delete(
    "/pipelines/:pipelineId/stages/:stageId",
    authenticate,
    writeAccess,
    stageController.remove,
);
