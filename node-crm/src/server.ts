import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger/logger";

app.listen(env.port, () => {
    logger.info(`server running on port ${env.port}`);
});
