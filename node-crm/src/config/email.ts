// Diferente de jwt.ts (requireEnv, derruba o processo se faltar) — e-mail é opcional na
// inicialização de propósito: sem RESEND_API_KEY configurada, o resto da API (login,
// leads, etc.) continua funcionando normalmente, só o fluxo de "esqueci minha senha"
// falha com erro claro no momento do envio (ver shared/email/email.service.ts).
export const emailConfig = {
    resendApiKey: process.env["RESEND_API_KEY"],
    emailFrom: process.env["EMAIL_FROM"] ?? "CRM CMB <onboarding@resend.dev>",
    frontendUrl: process.env["FRONTEND_URL"] ?? "https://crm-cmb.com.br",
};
