export const env = {
    port: Number(process.env.PORT ?? 3333),
    nodeEnv: process.env.NODE_ENV ?? "development",
};
