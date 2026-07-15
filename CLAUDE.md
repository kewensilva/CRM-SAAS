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
- **Tenants**: `POST/GET /api/v1/tenants`, restrito a `OWNER`. Criação de tenant gera numa
  única transação Prisma: o Tenant, o Tenant Admin e o registro inicial de Settings.
- **Users**: `POST/GET /api/v1/users`, restrito a `TENANT_ADMIN`/`MANAGER`, escopado ao
  `tenantId` do token.
- **Settings**: `GET/PUT /api/v1/settings`, restrito a `TENANT_ADMIN` (Manager/User sem
  acesso, conforme permissions.md). Model separado do Tenant — guarda só o que é editável
  pelo próprio cliente (logoUrl, primaryColor, secondaryColor); nome legal e domínio de login
  continuam em Tenant para não duplicar informação (database-patterns.md > Relacionamentos).
- **Companies**: CRUD completo em `/api/v1/companies` com paginação (`page`/`pageSize`) e
  `search` por nome. `TENANT_ADMIN`/`MANAGER` criam e editam, `USER` só visualiza, exclusão
  (soft delete) só `TENANT_ADMIN`, conforme a matriz de permissions.md.
- **Contacts**: CRUD completo em `/api/v1/contacts`, `companyId` obrigatório na criação
  (business-rules.md: "todo contato pertence obrigatoriamente a uma empresa" — diferente do
  Lead, aqui é mandatório mesmo) e validado contra o tenant atual (404 se a empresa não
  existir). Sem campo `status` — o harness não define esse campo para Contato, só Nome
  (obrigatório), Cargo, E-mail, Telefone, Celular, Observações. `TENANT_ADMIN`/`MANAGER`/`USER`
  criam e editam, só `TENANT_ADMIN` exclui. Suporta filtro `?companyId=` na listagem.
- **Leads**: `POST/GET /api/v1/leads`, `tenantId` e `responsibleUserId` vêm sempre do
  `req.auth` (nunca do payload) — responsável assume-se como o próprio usuário autenticado
  até o módulo Pipeline permitir reatribuição. `companyId` é opcional na criação: leads
  chegam sem empresa conhecida (ex.: integração Meta Lead Ads) e são vinculados depois —
  database-patterns.md lista Lead→Company como relacionamento obrigatório, mas
  business-rules.md não exige isso na criação, então a FK ficou nullable para não travar
  o fluxo de integração. Se `companyId` for enviado, o backend valida que a empresa existe
  no mesmo tenant (404 caso contrário).
- **Pipelines**: CRUD em `/api/v1/pipelines` + sub-rotas `/pipelines/:id/stages` para as
  etapas. Restrito a `TENANT_ADMIN` para escrita (Owner/Manager/User só visualizam, conforme
  permissions.md). Etapa tem `order` sequencial com constraint única `(pipelineId, order)` —
  criação com ordem repetida dá 409; `PUT /pipelines/:id/stages/reorder` recebe a lista
  completa de `{id, order}` e faz um reorder atômico em duas fases (primeiro desloca todas as
  ordens para um intervalo alto fora de colisão, depois aplica os valores finais) dentro de
  uma transação Prisma, evitando violar a constraint única no meio do caminho ao trocar
  posições. O reorder exige a lista **completa** das etapas ativas do pipeline (não parcial),
  senão retorna `BusinessRuleError`. Etapa sem campo de status documentado com valores
  próprios — usei o mesmo enum `ACTIVE`/`INACTIVE` das demais entidades, já que
  business-rules.md só diz que a etapa "deverá possuir Status" sem especificar os valores.
- **Deals**: `/api/v1/deals` — toda negociação exige leadId + companyId + responsibleUserId +
  pipelineId + stageId (business-rules.md). Criar uma negociação **converte o Lead** em uma
  transação Prisma atômica: usa `updateMany` com filtro `status != CONVERTED` e checa
  `count === 0` para detectar e rejeitar conversão duplicada mesmo sob concorrência (não é só
  uma checagem de aplicação antes do insert — a garantia é no banco). `leadId` é `@unique` no
  schema como segunda camada de proteção. `PUT /deals/:id/stage` grava uma entrada em
  `DealStageHistory` a cada mudança, atomicamente com a atualização do deal; a etapa precisa
  pertencer ao mesmo pipeline do deal, senão 400. `DealStageHistory` é a única entidade sem
  `updated_at`/`deleted_at` — é log imutável (business-rules.md: "o histórico nunca deverá ser
  removido"), documentado como exceção no schema. Negociação `WON`/`LOST` trava novas
  mudanças de etapa (`BusinessRuleError`). Deletar (soft delete) é só `TENANT_ADMIN`/`MANAGER`;
  criar/editar/mudar etapa/status é liberado pra `USER` também, conforme permissions.md
  ("Controle completo" para Admin/Manager, "Criar, editar e visualizar" para User).
- **Activities**: `/api/v1/activities`, campos título + responsável + data prevista + status
  (business-rules.md). Vínculo exclusivo — a mesma "Regras Gerais" de business-rules.md diz
  "toda atividade pertence a uma negociação **ou** a um Lead": schema permite `dealId` e
  `leadId` ambos nulos porque Prisma não expressa XOR sem SQL bruto, mas o validator Zod
  (`.refine`) exige exatamente um dos dois — testei os três casos (nenhum, os dois, só um) e
  só o último passa. `PUT /activities/:id/complete` liberado pra `USER` também (permissions.md:
  "User: Criar, editar e concluir atividades" — é a única ação de fechamento que ele tem);
  `/cancel` e `DELETE` ficam restritos a `TENANT_ADMIN`/`MANAGER`. Atividade já
  concluída/cancelada não aceita novo complete/cancel (`BusinessRuleError`).
- **Dashboard**: `GET /api/v1/dashboard` — só os 5 indicadores que business-rules.md lista
  (leads cadastrados, negociações em andamento/ganhas/perdidas, atividades pendentes), via
  `COUNT` no banco (não fetch da lista inteira + `.length`). Sem model, sem migration, sem
  repository/validator/dto próprios — só um service que agrega `leadRepository`,
  `dealRepository` e `activityRepository` já existentes, exatamente como product.md manda
  ("O Dashboard não possui regras de negócio... não armazena dados próprios").
- **Integração Meta Lead Ads** (`modules/integrations/meta/`): fluxo real de dois passos —
  o webhook (`POST /api/v1/webhooks/meta`) só avisa que um lead chegou (`leadgen_id`); os
  dados de fato vêm de uma chamada real à Graph API (`fetch` nativo, sem lib extra, conforme
  tech-stack.md) usando o `pageAccessToken` configurado por tenant. Rotas do webhook são
  **públicas** (sem JWT — quem chama é a Meta, não um usuário logado); autenticidade vem da
  assinatura `X-Hub-Signature-256` (HMAC-SHA256 do corpo bruto com `META_APP_SECRET`,
  comparação em tempo constante via `timingSafeEqual`). Isso exigiu capturar o raw body no
  `express.json({ verify })` em `app.ts`, porque depois de parseado os bytes originais somem.
  GET no mesmo path faz o handshake de assinatura do webhook (`hub.mode`/`hub.verify_token`/
  `hub.challenge`) que a Meta chama uma vez ao configurar a URL.
  - **"Nenhum Lead deverá ser descartado sem registro"** (business-rules.md) é a regra mais
    importante do módulo: `MetaIntegrationLog` é criado com status `RECEIVED` **antes** de
    qualquer tentativa de processar o evento, e todo o processamento (`meta-webhook.service.ts`)
    nunca lança — captura toda falha (Graph API fora do ar, token inválido, nenhum tenant
    configurado pra aquela página) e atualiza o log para `FAILED` com a mensagem real, sempre
    respondendo 200 pra Meta (retornar erro faria a Meta desativar a inscrição do webhook).
    Testei isso de propósito: configurei um `pageAccessToken` falso, mandei um evento assinado
    corretamente, e a chamada real pra `graph.facebook.com` (o ambiente tem saída de rede)
    voltou 400 "Invalid OAuth access token" — o log ficou `FAILED` com essa mensagem exata, o
    evento não desapareceu. Também testei `page_id` que nenhum tenant configurou: o log é
    criado com `tenant_id` nulo (única entidade além de `MetaIntegrationLog`/`User` global que
    permite isso) em vez de ser descartado por falta de dono.
  - `defaultResponsibleUserId` na config existe porque `Lead.responsibleUserId` é obrigatório
    no schema, mas leads da integração não têm um usuário autenticado os criando — precisa de
    um responsável padrão definido pelo Tenant Admin ao habilitar a integração (bloqueado por
    `ValidationError` se faltar `pageId`/`pageAccessToken`/`defaultResponsibleUserId` ao tentar
    habilitar).
  - Deduplicação por e-mail dentro do tenant, comportamento configurável (`IGNORE` mantém o
    lead existente e só registra `DUPLICATE`; `UPDATE` atualiza nome/e-mail/telefone do lead
    existente) — "o comportamento será definido pela configuração da integração"
    (business-rules.md).
  - `permissions.md` não tem uma linha própria para "Integrações"; apliquei por analogia a
    mesma política de Configurações (Tenant Admin gerencia o próprio tenant, Manager/User sem
    acesso) por ser o módulo administrativo mais parecido.

Decisão deliberada: **não construí o barramento de eventos genérico** (`shared/events/`) que
events.md descreve, mesmo o Deal sendo o primeiro caso real de `StageChanged`. O histórico de
etapas é gravado direto no repository porque é requisito de negócio (não opcional), mas não
existe hoje nenhum consumidor real (notificação, auditoria, integração) que justifique um
pub/sub — construir isso agora violaria project-philosophy.md ("cada padrão adotado deve
resolver um problema real"). Reavaliar quando o módulo Auditoria ou Integração Meta Lead Ads
precisar reagir a eventos de fato.

Helpers novos em `shared/helpers/nullable-fields.ts` (`undefinedToNull`, `stripUndefined`) —
Prisma exige que campos opcionais ausentes sejam omitidos (update parcial) ou `null`
explícito (create), nunca `undefined`; esse padrão se repete em todo módulo com campos
opcionais e agora está centralizado em vez de duplicado por repository.

Gap conhecido e recorrente: o harness dá ao `Owner` acesso de leitura a recursos de qualquer
tenant (Tenants, Leads, Settings, Dashboard) mas não define o padrão de URL para isso — como
o JWT do Owner tem `tenantId` nulo, essas rotas hoje só atendem usuários já escopados a um
tenant. Precisa de uma decisão de rota tipo `/tenants/:id/leads` antes de implementar.

Seed (`pnpm run db:seed`) cria o Owner bootstrap (`owner@cmb.dev` / senha em `SEED_OWNER_PASSWORD`
ou `Owner@123` por padrão) — é o único jeito de logar antes de existir qualquer Tenant.

Segredos novos em `node-crm/.env` (gitignored): `META_APP_SECRET` (valida a assinatura do
webhook) e `META_WEBHOOK_VERIFY_TOKEN` (handshake de configuração da URL na Meta) — ambos
platform-level, não por tenant, porque o webhook é uma única URL de callback compartilhada
por toda a plataforma; o roteamento pro tenant certo acontece via `page_id` no payload.

Pendente, na ordem oficial: Auditoria — provavelmente onde a decisão de não construir
`shared/events/` finalmente precisa ser revisitada, já que auditoria é o consumidor óbvio de
eventos como `LeadCreated`/`DealWon`/`UserCreated` que a esta altura já têm origem real.

`angular-crm/` está vazio — frontend ainda não iniciado.
