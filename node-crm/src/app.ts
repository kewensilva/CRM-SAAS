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

// Guarda o corpo bruto da requisição — necessário para validar a assinatura
// HMAC (X-Hub-Signature-256) do webhook da Meta, que precisa dos bytes exatos
// enviados, não do objeto já parseado.
const captureRawBody = (req: Request, _res: express.Response, buf: Buffer) => {
    req.rawBody = buf;
};

app.use(express.json({ verify: captureRawBody }));
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
