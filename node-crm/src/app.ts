import express from "express";

import { apiRouter } from "./routes";
import { errorHandler } from "./shared/middleware/error-handler";
import { notFoundHandler } from "./shared/middleware/not-found-handler";
import { requestId } from "./shared/middleware/request-id";

export const app: express.Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
