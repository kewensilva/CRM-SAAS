import { emailConfig } from "../../config/email";
import { IntegrationError } from "../errors";
import { logger } from "../logger/logger";

// Resend via fetch nativo, sem SDK — mesmo padrão já usado pra Graph API do Meta
// (tech-stack.md: "existe solução nativa?"). Único provedor de e-mail do projeto.
const RESEND_API_URL = "https://api.resend.com/emails";

const sendEmail = async (params: { to: string; subject: string; html: string }): Promise<void> => {
    if (!emailConfig.resendApiKey) {
        logger.error("[email] RESEND_API_KEY não configurada — e-mail não enviado.");
        throw new IntegrationError("Serviço de e-mail não configurado.");
    }

    const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${emailConfig.resendApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: emailConfig.emailFrom,
            to: [params.to],
            subject: params.subject,
            html: params.html,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        logger.error({ status: response.status, body }, "[email] Falha ao enviar via Resend.");
        throw new IntegrationError("Não foi possível enviar o e-mail agora.");
    }
};

const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
    await sendEmail({
        to,
        subject: "Redefinição de senha — CRM Content Marketing Brasil",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #111;">Redefinir senha</h2>
                <p>Recebemos um pedido para redefinir a senha da sua conta no CRM CMB.</p>
                <p>
                    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#FF9521;
                    color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                        Redefinir senha
                    </a>
                </p>
                <p>Esse link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail.</p>
            </div>
        `,
    });
};

export const emailService = {
    sendPasswordResetEmail,
};
