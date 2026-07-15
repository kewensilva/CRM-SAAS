# Estrutura de Pastas

## Objetivo

Este documento define a organização oficial dos diretórios do CRM.

Toda funcionalidade implementada deverá respeitar esta estrutura.

Nenhuma pasta deverá ser criada sem um propósito claro.

---

# Estrutura Geral

O projeto será dividido em dois repositórios independentes:

- Frontend
- Backend

A documentação permanecerá separada da implementação.

---

# Backend

backend/

```text
backend/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── app/
│   ├── config/
│   ├── modules/
│   ├── shared/
│   ├── middlewares/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── server.ts
│   └── app.ts
│
├── tests/
│
├── .env
├── package.json
└── tsconfig.json
```

---

# Frontend

frontend/

```text
frontend/
│
├── src/
│   ├── app/
│   ├── assets/
│   ├── environments/
│   ├── styles/
│   ├── themes/
│   └── shared/
│
├── angular.json
├── package.json
└── tsconfig.json
```

---

# Estrutura dos Módulos (Backend)

Todos os módulos seguirão exatamente a mesma organização.

Exemplo:

```text
modules/

auth/
users/
companies/
contacts/
leads/
pipelines/
deals/
activities/
dashboard/
settings/
integrations/
```

Cada módulo possuirá a seguinte estrutura.

```text
users/

├── controllers/
├── services/
├── repositories/
├── validators/
├── dto/
├── routes/
├── types/
├── utils/
├── constants/
└── index.ts
```

---

# Controllers

Responsabilidade:

- receber requisições;
- validar contexto;
- chamar services;
- retornar respostas HTTP.

Controllers nunca implementam regra de negócio.

---

# Services

Responsabilidade:

- implementar regras de negócio.

Services nunca acessam o banco diretamente.

Toda persistência deverá ocorrer através dos repositories.

---

# Repositories

Responsabilidade:

- acesso ao banco de dados.

Toda interação com o Prisma ocorrerá nesta camada.

---

# Validators

Responsabilidade:

- validar entrada de dados.

As validações utilizarão Zod.

---

# DTO

Responsabilidade:

- definir estrutura dos dados de entrada e saída.

Nenhum endpoint deverá utilizar objetos sem tipagem.

---

# Routes

Responsabilidade:

- registrar endpoints do módulo.

As rotas deverão apenas conectar a URL ao Controller correspondente.

---

# Types

Responsabilidade:

- tipos compartilhados do módulo.

---

# Utils

Responsabilidade:

- funções auxiliares específicas do módulo.

---

# Constants

Responsabilidade:

- constantes utilizadas exclusivamente pelo módulo.

---

# Shared

A pasta Shared conterá recursos reutilizados por toda a aplicação.

Estrutura:

```text
shared/

├── database/
├── logger/
├── errors/
├── validators/
├── middleware/
├── auth/
├── constants/
├── helpers/
└── types/
```

Nenhum código específico de um módulo deverá ser colocado em Shared.

---

# Config

A pasta Config armazenará toda configuração da aplicação.

Exemplo:

```text
config/

database.ts

jwt.ts

cors.ts

env.ts

swagger.ts
```

---

# Routes

A pasta Routes conterá apenas o registro principal das rotas.

Cada módulo será responsável por registrar suas próprias rotas.

---

# Middlewares

A pasta Middlewares conterá apenas middlewares globais.

Exemplos:

- autenticação;
- tratamento de erros;
- auditoria;
- logs;
- rate limit.

---

# Utils

A pasta Utils conterá funções genéricas reutilizadas por vários módulos.

Exemplos:

- formatação;
- datas;
- máscaras;
- UUID;
- conversões.

---

# Types

A pasta Types conterá tipos globais.

Exemplo:

Request

Response

JWT

Pagination

Audit

---

# Tests

A estrutura de testes deverá refletir a estrutura da aplicação.

Exemplo:

```text
tests/

users/

companies/

leads/

activities/
```

---

# Frontend

O Frontend utilizará a seguinte estrutura.

```text
app/

core/

layout/

pages/

shared/

features/

guards/

interceptors/

services/

models/

pipes/

directives/
```

---

# Core

Responsabilidade:

Recursos carregados uma única vez.

Exemplo:

- autenticação;
- configuração;
- interceptors;
- guards;
- providers.

---

# Layout

Responsabilidade:

Estrutura visual da aplicação.

Exemplo:

- Header
- Sidebar
- Footer
- Toolbar

---

# Pages

Responsabilidade:

Páginas principais.

Cada página representa uma rota.

---

# Features

Responsabilidade:

Módulos do sistema.

Exemplo:

```text
features/

users/

companies/

leads/

dashboard/

settings/
```

Cada Feature deverá possuir seus próprios componentes.

---

# Shared

Componentes reutilizados.

Exemplo:

- botões;
- tabelas;
- formulários;
- modais;
- inputs;
- loaders.

---

# Assets

Arquivos estáticos.

Exemplo:

- imagens;
- ícones;
- fontes.

---

# Styles

Arquivos SCSS globais.

---

# Themes

Responsável pelos temas utilizados pelo sistema.

As cores dos Tenants serão aplicadas através deste mecanismo.

---

# Organização

Nenhum módulo poderá acessar arquivos internos de outro módulo.

Toda comunicação deverá ocorrer através das interfaces públicas definidas.

---

# Criação de Novos Módulos

Todo novo módulo deverá seguir exatamente esta estrutura.

A organização deverá permanecer consistente durante toda a evolução do CRM.

---

# Objetivo Final

A estrutura de pastas deve permitir que qualquer desenvolvedor ou agente de IA encontre rapidamente qualquer arquivo do projeto.

A previsibilidade da organização é considerada um requisito da arquitetura.