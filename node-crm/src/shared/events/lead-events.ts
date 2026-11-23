import { logger } from "../logger/logger";

// Eventos de Lead (events.md: Entidade + Ação). Primeiro consumidor real: o Integrador Google
// Ads, que transforma momentos do Lead em conversões offline. Publicados DEPOIS da
// persistência; rodam em segundo plano — quem publica não espera, e a falha de um consumidor
// só vira log, nunca derruba a operação principal.
export type LeadEvent =
    | { type: "LeadCreated"; tenantId: string; leadId: string }
    | { type: "LeadStatusChanged"; tenantId: string; leadId: string; status: string; value: number | null };

type LeadEventHandler = (event: LeadEvent) => Promise<void>;

const handlers: LeadEventHandler[] = [];

export const subscribeLeadEvents = (handler: LeadEventHandler): void => {
    handlers.push(handler);
};

export const publishLeadEvent = (event: LeadEvent): void => {
    for (const handler of handlers) {
        setImmediate(() => {
            handler(event).catch((error: unknown) => {
                logger.error({ err: error, event }, "[events] consumidor de evento de Lead falhou.");
            });
        });
    }
};
