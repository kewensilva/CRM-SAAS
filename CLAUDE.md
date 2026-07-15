# CRM-SAAS — Guia do Projeto

> Este arquivo é o índice compacto do Harness. Os documentos completos vivem em
> `.claude/harness/`, `.claude/agents/` e `.claude/skills/` — consulte o arquivo-fonte
> para o detalhe completo de qualquer regra citada aqui. Em caso de dúvida ou conflito,
> `.claude/harness/project-philosophy.md` tem prioridade sobre todos os outros documentos.

## O que é o produto

CRM SaaS **multi-tenant white label** desenvolvido pela Content Marketing Brasil (CMB)
para seus clientes gerenciarem leads, contatos, negociações e atividades comerciais.
Não é um ERP, não faz automação de marketing, não tem IA, não substitui WhatsApp.
Escala alvo: ~30–50 empresas, até 7 usuários cada — priorizar simplicidade sobre
escalabilidade extrema. Detalhes: [vision.md](.claude/harness/vision.md), [product.md](.claude/harness/product.md), [project-philosophy.md](.claude/harness/project-philosophy.md).

Módulos (nesta ordem de implementação): Autenticação → Tenants → Usuários →
Configurações → Empresas → Contatos → Leads → Pipeline → Negociações → Atividades →
Dashboard → Integração Meta Lead Ads → Auditoria.
([development-workflow.md](.claude/harness/development-workflow.md))

## Stack oficial (não substituir sem aprovação explícita)

| Camada | Tecnologia |
|---|---|
| Frontend | Angular + TypeScript + Angular Material + RxJS + Signal Forms + SCSS |
| Backend | Node.js + TypeScript + Express + Prisma ORM + Zod + JWT + bcrypt + Multer |
| Banco | PostgreSQL, chaves UUID, soft delete padrão |
| Logs | Pino — **nunca `console.log` em produção** |
| Testes | Jest |
| Qualidade | ESLint + Prettier + Husky + Conventional Commits |

Só um ORM (Prisma), um framework HTTP (Express), um framework frontend (Angular).
Antes de adicionar dependência: existe solução nativa? já existe lib equivalente no
projeto? tem manutenção ativa? Detalhes: [tech-stack.md](.claude/harness/tech-stack.md).

## Arquitetura

```
Cliente → Router → Middleware → Controller → Validator → Service → Repository → Prisma → PostgreSQL
```

- **Controller**: recebe requisição, valida contexto, chama Service, retorna resposta HTTP. Nunca contém regra de negócio.
- **Service**: implementa regra de negócio. Nunca acessa o banco diretamente.
- **Repository**: única camada que fala com o Prisma.
- **Validator**: valida entrada usando Zod.
- **DTO**: estrutura de entrada/saída tipada — nenhum endpoint usa objetos sem tipo.

Nenhuma camada pula a camada abaixo. Módulos são independentes e só se comunicam por
interfaces bem definidas — nunca acessando arquivos internos de outro módulo.
Detalhes: [architecture.md](.claude/harness/architecture.md), [folder-structure.md](.claude/harness/folder-structure.md).

### Estrutura de pastas (backend)

```
backend/src/modules/<modulo>/
  controllers/  services/  repositories/  validators/  dto/  routes/  types/  utils/  constants/
backend/src/shared/
  database/  logger/  errors/  validators/  middleware/  auth/  constants/  helpers/  types/
```

Frontend Angular: `core/ layout/ pages/ shared/ features/ guards/ interceptors/ services/ models/ pipes/ directives/`.

> ⚠️ **O código atual em `node-crm/src` ainda não segue esta estrutura** — ver seção
> "Estado atual do código" abaixo.

## Multi-tenancy (regra inegociável)

- Todo registro de negócio pertence a exatamente um `tenant_id`, ou é global (só o Owner acessa).
- Toda query deve considerar o tenant autenticado — nenhuma pode vazar dados de outro tenant.
- O tenant vem do token JWT autenticado. **O Frontend nunca envia o tenant** — se um payload
  tentar informar tenant/scope manualmente, isso deve ser ignorado/rejeitado pelo Backend.
- Um usuário pertence a exatamente um tenant (nunca múltiplos).
- Tenant inativo bloqueia login de todos os seus usuários.

Owner administra a plataforma inteira mas não opera dentro dos tenants (só visualiza).
Detalhes: [multi-tenant.md](.claude/harness/multi-tenant.md).

## Permissões (RBAC)

4 perfis: **Owner** (plataforma) → **Tenant Admin** (empresa) → **Manager** (comercial) →
**User** (operacional). Toda checagem de permissão ocorre no Backend — o Frontend só
pode ocultar UI, nunca é fonte de verdade de autorização. Matriz completa por módulo em
[permissions.md](.claude/harness/permissions.md).

## Segurança

- Senhas: bcrypt, nunca texto puro, nunca retornadas pela API. Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número.
- JWT com Access Token + Refresh Token. Sessão carrega userId + tenantId + perfil + expiração.
- Toda entrada da API é validada no Backend com Zod (frontend valida só por UX).
- Segredos só em variáveis de ambiente, nunca no código-fonte.
- Helmet para headers HTTP, CORS com lista explícita de domínios em produção.
- Upload: validar tipo, tamanho e extensão antes de armazenar.
- Rate limiting em login, recuperação de senha e autenticação.
- Nunca expor stack trace, SQL, tokens, caminhos internos ou credenciais nas respostas.
Detalhes: [security.md](.claude/harness/security.md).

## Padrões de banco de dados

- Tabelas: `snake_case`, plural (`users`, `pipeline_stages`).
- PK sempre `id` (UUID, gerado pela aplicação). FK sempre `<entidade>_id`.
- Toda entidade de negócio tem `created_at`, `updated_at`, `deleted_at` (soft delete — `deleted_at IS NULL` = ativo).
- Valores monetários: `NUMERIC`, nunca `FLOAT`/`DOUBLE`. Datas: `TIMESTAMP WITH TIME ZONE`, sempre UTC.
- Toda alteração estrutural via migration Prisma — nunca alterar o banco de produção manualmente.
- Índices em `tenant_id`, `email`, `status`, `created_at` e relacionamentos frequentes — sem excesso.
Detalhes: [database-patterns.md](.claude/harness/database-patterns.md).

## Padrões de API

- Base `/api/v1`, REST, JSON, stateless. Rotas em minúsculas, plural (`/pipeline-stages`, nunca `/PipelineStages`).
- Paginação: `page`/`pageSize`. Ordenação: `sortBy`/`sortOrder`. Busca: `search`.
- Sucesso: `{ "success": true, "data": ... }`. Erro: `{ "success": false, "message": "...", "errors": [] }`.
- DELETE é sempre soft delete (exclusão lógica), nunca físico, salvo exceção documentada.
- Auth: header `Authorization: Bearer <JWT>`.
Códigos HTTP e exemplos completos em [api-patterns.md](.claude/harness/api-patterns.md).

## Tratamento de erros

Tipos oficiais e HTTP correspondente: `ValidationError`(422), `AuthenticationError`(401),
`AuthorizationError`(403), `NotFoundError`(404), `ConflictError`(409), `BusinessRuleError`(400),
`IntegrationError`(502), `InternalServerError`(500). Middleware global centraliza todo o
tratamento — controllers não implementam try/catch específico. Toda resposta de erro inclui
`requestId` para rastreamento. Mensagens claras para o usuário, detalhes técnicos só no log.
Detalhes: [error-patterns.md](.claude/harness/error-patterns.md).

## Eventos

Nome = `Entidade + Ação` (`LeadCreated`, `DealWon`). Publicados **depois** da persistência
bem-sucedida, nunca antes. Centralizados em `shared/events/`. Falha de um consumidor de evento
nunca deve derrubar a operação principal. Lista completa em [events.md](.claude/harness/events.md).

## Regras de negócio essenciais

- Tenant só é criado pelo Owner; criação gera automaticamente config inicial + admin.
- Usuário: e-mail único **dentro do tenant**; criado só por Owner/Tenant Admin.
- Lead sempre tem responsável; status: Novo/Em Atendimento/Convertido/Perdido; conversão é única (não reversível).
- Negociação vincula Lead + Empresa + responsável + Pipeline + Etapa; histórico de mudança de etapa nunca é apagado.
- Integração Meta Lead Ads: nenhum lead recebido pode ser descartado sem registro.
Regras completas: [business-rules.md](.claude/harness/business-rules.md).

## Código

- Funcional, sem classes (exceto exigência de lib externa). TypeScript em tudo, nada de JS novo.
- Arquivo: até ~300 linhas. Função: até ~50 linhas, uma responsabilidade.
- Nomenclatura: pastas/arquivos em `kebab-case`, funções/variáveis `camelCase`, constantes globais `UPPER_SNAKE_CASE`.
- Interfaces **sem** prefixo `I` (`User`, não `IUser`).
- Named exports preferidos; **evitar `export default`**.
- Imports: bibliotecas externas → shared → módulo atual → arquivos locais.
- `async/await`, não `.then()`. Try/catch só quando há tratamento real a fazer.
- Sem comentários óbvios, sem código morto/comentado, sem números mágicos soltos.
Detalhes: [code-style.md](.claude/harness/code-style.md).

## Fluxo de trabalho e regras de escopo

1. Uma funcionalidade por vez, do início ao fim, antes de iniciar a próxima.
2. Alteração de banco: schema Prisma → migration → executar → validar → atualizar código.
3. Novo endpoint: validação → controller → service → repository → teste → documentação.
4. Implementar **apenas** o solicitado — sem features extra, sem trocar libs, sem mudar arquitetura por conta própria.
5. Decisão arquitetural necessária → parar e perguntar, nunca decidir sozinho.
6. Problema fora do escopo da tarefa atual → registrar, não corrigir automaticamente.
Detalhes: [development-workflow.md](.claude/harness/development-workflow.md), [task-execution.md](.claude/harness/task-execution.md), [agent-rules.md](.claude/harness/agent-rules.md).

## Definition of Done

Uma entrega só está pronta quando: segue a arquitetura e o Harness; a regra de negócio
está correta; há validação de dados; erros são tratados no padrão oficial; autenticação e
permissões foram checadas; isolamento multi-tenant foi validado; testes cobrem fluxo
positivo, negativo, permissões e isolamento; sem código morto ou débito técnico não
registrado. Checklist completo: [definition-of-done.md](.claude/harness/definition-of-done.md).

## Agentes especialistas (`.claude/agents/`)

| Agente | Quando consultar |
|---|---|
| [master-agent](.claude/agents/master-agent.md) | Coordenar tarefas grandes, decidir qual agente acionar |
| [backend-agent](.claude/agents/backend-agent.md) | Implementação Node/Express/Prisma, regra de negócio |
| [frontend-agent](.claude/agents/frontend-agent.md) | Telas e componentes Angular |
| [database-agent](.claude/agents/database-agent.md) | Schema, migrations, relacionamentos |
| [api-agent](.claude/agents/api-agent.md) | Contratos REST, formato de rotas/respostas |
| [security-agent](.claude/agents/security-agent.md) | Auth, JWT, permissões, isolamento de tenant |
| [integration-agent](.claude/agents/integration-agent.md) | Meta Lead Ads, webhooks, integrações externas |
| [qa-agent](.claude/agents/qa-agent.md) | Validar qualidade antes de dar tarefa por concluída |

## Skills (`.claude/skills/`)

**Scaffolding/CRUD**: [create-module](.claude/skills/create-module.md), [create-crud](.claude/skills/create-crud.md), [create-endpoint](.claude/skills/create-endpoint.md), [create-prisma-model](.claude/skills/create-prisma-model.md), [create-angular-page](.claude/skills/create-angular-page.md), [create-webhook](.claude/skills/create-webhook.md)

**Auth/segurança**: [authentication-flow](.claude/skills/authentication-flow.md), [authorization-flow](.claude/skills/authorization-flow.md), [audit-log](.claude/skills/audit-log.md)

**Dados/infra**: [database-migration](.claude/skills/database-migration.md), [environment-management](.claude/skills/environment-management.md), [deployment](.claude/skills/deployment.md), [performance](.claude/skills/performance.md)

**Produto (domínio)**: [lead-management](.claude/skills/lead-management.md), [tenant-management](.claude/skills/tenant-management.md), [integration-management](.claude/skills/integration-management.md)

**Qualidade/processo**: [feature-development](.claude/skills/feature-development.md), [bug-fix](.claude/skills/bug-fix.md), [refactoring](.claude/skills/refactoring.md), [review-code](.claude/skills/review-code.md), [testing-strategy](.claude/skills/testing-strategy.md), [documentation](.claude/skills/documentation.md)

> Nota: estes arquivos são `.md` soltos com frontmatter `name`/`description`, não o formato
> `SKILL.md` em diretório próprio que o Claude Code descobre automaticamente como skill
> invocável via `/nome`. Trate-os como playbooks de referência a consultar manualmente ou
> via subagente — não espere que apareçam na lista de skills do sistema.

## Estado atual do código

`node-crm/` já segue a arquitetura em camadas (`modules/<modulo>/{controllers,services,repositories,validators,dto,routes,types}`
+ `shared/{errors,logger,middleware,auth,database,types}`). Prisma conectado a um PostgreSQL
real via `@prisma/adapter-pg` (Prisma 7 exige driver adapter explícito — client gerado em
`generated/prisma`, fora de `src/`, e regenerado com `npx prisma generate` a cada mudança de
schema). Segredos em `node-crm/.env` (gitignored; `.env.example` documenta as chaves).

Módulos implementados e testados ponta a ponta (login, RBAC, isolamento multi-tenant):
- **Auth**: `POST /api/v1/auth/login` (recebe `tenantSlug` opcional + email/senha — necessário
  porque e-mail só é único *dentro* do tenant, não globalmente; Owner loga sem `tenantSlug`),
  `POST /api/v1/auth/refresh-token`. JWT access+refresh via `shared/auth/jwt.ts`.
- **Tenants**: `POST/GET /api/v1/tenants`, restrito a `OWNER`. Criação de tenant já gera o
  Tenant Admin automaticamente numa transação Prisma — falta a "configuração inicial" citada
  em business-rules.md (módulo Settings ainda não existe).
- **Users**: `POST/GET /api/v1/users`, restrito a `TENANT_ADMIN`/`MANAGER`, escopado ao
  `tenantId` do token.
- **Leads**: `POST/GET /api/v1/leads`, `tenantId` e `responsibleUserId` vêm sempre do
  `req.auth` (nunca do payload) — responsável assume-se como o próprio usuário autenticado
  até o módulo Pipeline permitir reatribuição. Falta a rota de visualização cross-tenant do
  Owner (permissions.md diz "Owner: Visualizar" mas não especifica o padrão de URL).

Seed (`pnpm run db:seed`) cria o Owner bootstrap (`owner@cmb.dev` / senha em `SEED_OWNER_PASSWORD`
ou `Owner@123` por padrão) — é o único jeito de logar antes de existir qualquer Tenant.

Pendente, na ordem oficial: Configurações (Settings), Empresas, Contatos, Pipeline,
Negociações, Atividades, Dashboard, Integração Meta Lead Ads, Auditoria.

`angular-crm/` está vazio — frontend ainda não iniciado.
