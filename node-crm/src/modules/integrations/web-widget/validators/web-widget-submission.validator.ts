import { z } from "zod";

// Payload público — vem de um site de terceiros, sem autenticação, então tudo além de
// publicKey/name é opcional e tratado como melhor-esforço (não deve rejeitar submissões
// legítimas por causa de UTM ausente, por exemplo).
export const webWidgetSubmissionSchema = z.object({
    publicKey: z.string().trim().min(1, "Chave pública obrigatória."),
    name: z.string().trim().min(2, "Nome obrigatório."),
    email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional(),
    message: z.string().trim().max(2000).optional(),
    utmSource: z.string().trim().max(255).optional(),
    utmMedium: z.string().trim().max(255).optional(),
    utmCampaign: z.string().trim().max(255).optional(),
    utmTerm: z.string().trim().max(255).optional(),
    utmContent: z.string().trim().max(255).optional(),
    pageUrl: z.string().trim().max(2048).optional(),
    referrer: z.string().trim().max(2048).optional(),
    website: z.string().optional(), // honeypot
});
