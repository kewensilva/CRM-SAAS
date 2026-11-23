import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// "state" do OAuth: protege contra CSRF. É assinado com HMAC (chave = segredo do app) e
// amarrado ao tenant e ao usuário que iniciou o fluxo, com validade curta. Sem estado no
// servidor — a assinatura basta para provar que fomos nós que geramos.
const MAX_AGE_MS = 10 * 60 * 1000;

const sign = (payload: string, secret: string): string =>
    createHmac("sha256", secret).update(payload).digest("base64url");

export const createOAuthState = (
    tenantId: string,
    userId: string,
    secret: string,
    now: number = Date.now(),
): string => {
    const payload = Buffer.from(
        JSON.stringify({ t: tenantId, u: userId, i: now, n: randomBytes(8).toString("hex") }),
    ).toString("base64url");

    return `${payload}.${sign(payload, secret)}`;
};

export const verifyOAuthState = (
    state: string,
    tenantId: string,
    userId: string,
    secret: string,
    now: number = Date.now(),
): boolean => {
    const [payload, signature] = state.split(".");

    if (!payload || !signature) {
        return false;
    }

    const received = Buffer.from(signature);
    const expected = Buffer.from(sign(payload, secret));

    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
        return false;
    }

    try {
        const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
            t: string;
            u: string;
            i: number;
        };
        const age = now - data.i;

        return data.t === tenantId && data.u === userId && age >= 0 && age <= MAX_AGE_MS;
    } catch {
        return false;
    }
};