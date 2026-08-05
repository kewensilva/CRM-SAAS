import cors from "cors";
import express from "express";
import type { Request } from "express";

import { apiRouter } from "./routes";
import { errorHandler } from "./shared/middleware/error-handler";
import { notFoundHandler } from "./shared/middleware/not-found-handler";
import { requestId } from "./shared/middleware/request-id";

declare global {
    namespace Express {
        interface Request {
            rawBody?: Buffer;
        }
    }
}

export const app: express.Application = express();

// Lista explícita de domínios autorizados (security.md > CORS) — nunca "*". Um padrão
// "http://*.cmb.com" (prefixo curinga) autoriza qualquer subdomínio de tenant
// (crm.cmb.<slug>.com) sem precisar listar cada um — continua sendo uma allowlist
// fechada por domínio base, não um "*" solto.
const allowedOriginPatterns = (process.env.CORS_ORIGIN ?? "http://localhost:4200,http://*.localhost:4200")
    .split(",")
    .map((origin) => origin.trim());

const isOriginAllowed = (origin: string): boolean => {
    return allowedOriginPatterns.some((pattern) => {
        if (!pattern.includes("*.")) {
            return pattern === origin;
        }

        const [protocol, rest] = pattern.split("://");
        const baseDomain = (rest ?? "").replace("*.", "");

        return origin.startsWith(`${protocol}://`) && origin.endsWith(`.${baseDomain}`);
    });
};

const WEB_WIDGET_PATH_PREFIX = "/api/v1/webhooks/web-widget";

// Um único middleware de CORS, decidido por requisição — não dois `app.use(cors(...))`
// em sequência. Antes, a política restritiva global rodava sempre primeiro e já
// respondia com erro (via callback(new Error(...))) pra qualquer origem fora da
// allowlist, então a rota do widget nunca alcançava seu próprio `cors({ origin: true })`
// mais permissivo — o widget, chamado do site do cliente do tenant (domínio arbitrário,
// não dá pra usar a allowlist fixa da SPA), sempre falhava com "Origem não autorizada.".
app.use(
    cors((req, callback) => {
        if (req.path.startsWith(WEB_WIDGET_PATH_PREFIX)) {
            callback(null, { origin: true });
            return;
        }

        callback(null, {
            origin: (origin, originCallback) => {
                // Requisições sem header Origin (curl, health checks) não são navegador — libera.
                if (!origin || isOriginAllowed(origin)) {
                    originCallback(null, true);
                    return;
                }

                originCallback(new Error("Origem não autorizada."));
            },
        });
    }),
);

// Guarda o corpo bruto da requisição — necessário para validar a assinatura
// HMAC (X-Hub-Signature-256) do webhook da Meta, que precisa dos bytes exatos
// enviados, não do objeto já parseado.
const captureRawBody = (req: Request, _res: express.Response, buf: Buffer) => {
    req.rawBody = buf;
};

app.use(express.json({ verify: captureRawBody }));
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

// Sem autenticação — só pra health check de infraestrutura (Fly.io, load balancer)
// confirmar que o processo está de pé. Checagens de infra não mandam Origin, então
// passam pela política de CORS acima sem problema.
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
