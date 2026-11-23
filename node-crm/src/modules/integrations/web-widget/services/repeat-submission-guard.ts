// Barreira contra o mesmo formulário enviado várias vezes seguidas (cliques repetidos no
// "Enviar", ou um widget.js antigo em cache no site do cliente, sem o bloqueio do botão).
// Os envios chegam quase juntos, então a checagem por e-mail no banco não pega: todos
// consultam antes de o primeiro Lead existir. Em memória basta — a API roda numa instância só
// (mesma premissa das sessões do OAuth da Meta); com várias, trocar por Redis/banco.
const REPEAT_WINDOW_MS = 2 * 60 * 1000;
const recentSubmissions = new Map<string, number>();

type SubmissionIdentity = { tenantId: string; name: string; email?: string | undefined; phone?: string | undefined };

const normalize = (value: string | undefined): string => (value ?? "").trim().toLowerCase();

const keyOf = ({ tenantId, name, email, phone }: SubmissionIdentity): string =>
    [tenantId, normalize(name), normalize(email), (phone ?? "").replace(/\D/g, "")].join("|");

const purgeExpired = (now: number): void => {
    for (const [key, expiresAt] of recentSubmissions) {
        if (expiresAt <= now) {
            recentSubmissions.delete(key);
        }
    }
};

// true = primeiro envio dessa pessoa na janela (segue o fluxo); false = repetição.
export const claimSubmission = (identity: SubmissionIdentity, now: number = Date.now()): boolean => {
    purgeExpired(now);

    const key = keyOf(identity);

    if (recentSubmissions.has(key)) {
        return false;
    }

    recentSubmissions.set(key, now + REPEAT_WINDOW_MS);

    return true;
};
