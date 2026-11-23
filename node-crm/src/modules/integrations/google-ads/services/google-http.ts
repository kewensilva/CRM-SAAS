import { BusinessRuleError, IntegrationError } from "../../../../shared/errors";
import { logger } from "../../../../shared/logger/logger";

// 4xx do Google = algo a acertar na conta do cliente (acesso, ID errado, permissão) e vira
// mensagem para a tela com o motivo do próprio Google; o resto é falha de integração.
const CLIENT_ERROR_MIN = 400;
const CLIENT_ERROR_MAX = 499;

type GoogleErrorBody = { error?: { message?: string } | string; error_description?: string };

const googleMessage = (body: string): string | undefined => {
    try {
        const parsed = JSON.parse(body) as GoogleErrorBody;

        if (typeof parsed.error === "object") {
            return parsed.error.message;
        }

        return parsed.error_description ?? parsed.error;
    } catch {
        return undefined;
    }
};

export const googleFetch = async <T>(label: string, url: string, init: RequestInit): Promise<T> => {
    let response: Response;

    try {
        response = await fetch(url, init);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha de rede desconhecida.";

        throw new IntegrationError(`Falha ao conectar com o Google: ${message}`);
    }

    if (!response.ok) {
        const body = await response.text();

        logger.warn({ label, status: response.status, body }, "[google-ads] Google retornou erro.");

        const message = googleMessage(body);
        const isClientError = response.status >= CLIENT_ERROR_MIN && response.status <= CLIENT_ERROR_MAX;

        throw isClientError
            ? new BusinessRuleError(`${label}: ${message ?? `erro ${response.status}`}`)
            : new IntegrationError(`${label}: o Google respondeu ${response.status}.`);
    }

    return response.json() as Promise<T>;
};
