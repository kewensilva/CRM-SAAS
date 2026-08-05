# Debian (não Alpine) de propósito: bcrypt tem binding nativo, e o binário pré-compilado
# não é compatível com musl (Alpine) sem recompilar na imagem — bookworm-slim evita isso.
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable && apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instala TODAS as dependências (incl. devDependencies) — precisa do typescript e do
# prisma CLI pra compilar e pra rodar "migrate deploy" depois do deploy.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Compila TypeScript -> dist/ (prisma generate primeiro, client gerado é código-fonte
# próprio compilado junto, não um binário pré-buildado). DATABASE_URL falso só pra
# prisma.config.ts carregar (generate lê o schema, não conecta no banco de verdade) — a
# URL real de produção só entra via variável de ambiente no runtime, nunca aqui.
FROM deps AS build
COPY . .
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN pnpm run build

# Imagem final: mesmas dependências completas (não faz prune de dev deps) — imagem um
# pouco maior, mas mantém o Prisma CLI disponível pra rodar migrations em produção sem
# precisar de uma segunda imagem.
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY package.json ./

EXPOSE 3333
CMD ["node", "dist/src/server.js"]
