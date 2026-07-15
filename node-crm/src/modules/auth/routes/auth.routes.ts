import { Router } from "express";
import type { Router as RouterType } from "express";

import { authController } from "../controllers/auth.controller";

export const authRoutes: RouterType = Router();

authRoutes.post("/auth/login", authController.login);
authRoutes.post("/auth/refresh-token", authController.refreshToken);
