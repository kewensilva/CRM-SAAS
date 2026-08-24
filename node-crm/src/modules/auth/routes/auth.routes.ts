import { Router } from "express";
import type { Router as RouterType } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { createRateLimiter } from "../../../shared/middleware/rate-limit";
import { authController } from "../controllers/auth.controller";

export const authRoutes: RouterType = Router();

// 10 tentativas/min por IP — alvo natural de força bruta de credenciais
// (security.md > Rate limiting em login, recuperação de senha e autenticação).
const authRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 10,
    message: "Muitas tentativas em pouco tempo. Tente novamente em instantes.",
});

// Mais restrito que o geral (5/hora, não 10/min) — cada chamada dispara um e-mail de
// verdade via Resend; sem isso alguém poderia usar o endpoint pra spammar a caixa de
// entrada de qualquer e-mail cadastrado.
const forgotPasswordRateLimiter = createRateLimiter({
    windowMs: 60 * 60_000,
    max: 5,
    message: "Muitas tentativas em pouco tempo. Tente novamente mais tarde.",
});

authRoutes.post("/auth/login", authRateLimiter, authController.login);
authRoutes.post("/auth/refresh-token", authRateLimiter, authController.refreshToken);
authRoutes.post("/auth/forgot-password", forgotPasswordRateLimiter, authController.forgotPassword);
authRoutes.post("/auth/reset-password", authRateLimiter, authController.resetPassword);

// Sem authorize() por perfil fixo — o próprio service valida que quem chama é um
// Analista (perfil ANALYST de base ou já com claim "analystId" de uma troca anterior).
authRoutes.get("/auth/my-tenant-access", authenticate, authController.myTenantAccess);
authRoutes.post("/auth/switch-tenant", authenticate, authController.switchTenant);

// Owner acessando/saindo diretamente da base de um cliente — mesmo sem authorize() fixo
// por perfil, o service (enterTenant/exitTenant) rejeita quem não é Owner (ou não tem a
// claim ownerId de uma sessão de acesso já ativa).
authRoutes.post("/auth/enter-tenant", authenticate, authController.enterTenant);
authRoutes.post("/auth/exit-tenant", authenticate, authController.exitTenant);

authRoutes.put("/auth/change-password", authenticate, authController.changeOwnPassword);
