---
name: create-crud
description: Procedimento padrão para criar uma funcionalidade CRUD completa no CRM, cobrindo banco, backend (repository/service/controller) e frontend Angular.
---

# Skill: Criar CRUD Completo

## Objetivo

Esta skill define o procedimento padrão para criação de funcionalidades CRUD completas dentro do CRM.

O objetivo é garantir que operações de:

- criação;
- consulta;
- atualização;
- exclusão lógica;

sigam os padrões arquiteturais definidos.

---

# Quando Utilizar

Utilizar esta skill quando for necessário criar gerenciamento completo de uma entidade.

Exemplos:

- Empresas;
- Usuários;
- Leads;
- Contatos;
- Configurações.

---

# Pré-requisitos

Antes de iniciar consultar:

- create-module.md
- create-prisma-model.md
- create-endpoint.md
- create-angular-page.md
- business-rules.md
- permissions.md
- security.md

---

# Estrutura do CRUD

Um CRUD completo deverá possuir:

## Banco

- Model Prisma;
- Migration;
- Relacionamentos;
- Índices.

---

## Backend

- Repository;
- Service;
- Validators;
- DTOs;
- Controllers;
- Routes.

---

## API

Endpoints:

- Listar;
- Buscar por ID;
- Criar;
- Atualizar;
- Excluir.

---

## Frontend

- Página de listagem;
- Página de criação;
- Página de edição;
- Componentes reutilizáveis;
- Formulários.

---

# Etapa 1 - Análise da Entidade

Antes de criar o CRUD definir:

Nome da entidade.

Responsabilidade.

Campos.

Relacionamentos.

Permissões.

Tenant.

---

# Etapa 2 - Modelagem Banco

Criar ou validar:

Model Prisma.

Campos obrigatórios.

Relacionamentos.

Índices.

---

# Etapa 3 - Criar Migration

Executar:

Alteração schema.

↓

Migration.

↓

Validação.

---

# Etapa 4 - Backend

Criar estrutura:

```
modules/

entidade/

├── controllers/
├── services/
├── repositories/
├── validators/
├── dto/
├── routes/
└── types/
```

---

# Operações Obrigatórias

## Create

Criar registro.

Validar:

- campos obrigatórios;
- permissões;
- Tenant.

---

## Read

Listar registros.

Implementar:

- paginação;
- filtros;
- ordenação.

---

## Find By ID

Buscar registro específico.

Validar:

- existência;
- Tenant.

---

## Update

Atualizar registro.

Validar:

- permissão;
- dados enviados;
- Tenant.

---

## Delete

Utilizar exclusão lógica.

Não remover fisicamente sem aprovação.

---

# Etapa 5 - Endpoints

Criar:

## Listar

```
GET /api/v1/recurso
```

---

## Buscar

```
GET /api/v1/recurso/:id
```

---

## Criar

```
POST /api/v1/recurso
```

---

## Atualizar

```
PATCH /api/v1/recurso/:id
```

---

## Excluir

```
DELETE /api/v1/recurso/:id
```

---

# Etapa 6 - Segurança

Validar:

## Autenticação

Usuário possui sessão válida.

---

## Autorização

Usuário possui permissão.

---

## Multi-Tenant

Todas operações utilizam:

```
tenant_id
```

---

# Etapa 7 - Frontend

Criar:

## Listagem

Deve possuir:

- tabela;
- filtros;
- paginação;
- ações.

---

## Formulário

Deve possuir:

- criação;
- edição;
- validação;
- mensagens.

---

# Estados da Interface

Obrigatório tratar:

Loading.

Empty State.

Error.

Success.

---

# Componentização

Reutilizar:

- tabelas;
- inputs;
- botões;
- modais.

---

# Etapa 8 - Testes

Validar:

## Criação

Registro criado corretamente.

---

## Consulta

Dados retornados corretamente.

---

## Atualização

Alterações persistidas.

---

## Exclusão

Registro removido logicamente.

---

## Segurança

Usuário sem permissão bloqueado.

---

## Multi-Tenant

Tenant isolado.

---

# Validação Final

Antes de concluir verificar:

Banco criado?

Sim / Não

Migration criada?

Sim / Não

Endpoints criados?

Sim / Não

Permissões aplicadas?

Sim / Não

Frontend criado?

Sim / Não

Testes realizados?

Sim / Não

---

# Não Fazer

Não criar CRUD sem validar regras.

Não duplicar componentes.

Não remover dados fisicamente.

Não ignorar paginação.

Não permitir acesso entre Tenants.

---

# Resultado Esperado

Ao finalizar esta skill:

A entidade deverá possuir um CRUD completo, seguro e integrado ao CRM.

---

# Objetivo Final

Garantir que todas as entidades administrativas do CRM sejam desenvolvidas com o mesmo padrão de qualidade e organização.