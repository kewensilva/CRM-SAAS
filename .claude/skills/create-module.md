---
name: create-module
description: Procedimento padrão para criar um novo módulo de backend no CRM respeitando a estrutura de pastas oficial (controllers/services/repositories/validators/dto/routes).
---

# Skill: Criar Novo Módulo

## Objetivo

Esta skill define o procedimento padrão para criação de novos módulos dentro do CRM.

O objetivo é garantir que todos os módulos sigam a mesma arquitetura, organização e padrões técnicos.

---

# Quando Utilizar

Utilizar esta skill quando for necessário criar:

- novo domínio;
- nova funcionalidade principal;
- novo conjunto de regras de negócio.

Exemplos:

- Leads;
- Empresas;
- Usuários;
- Pipeline;
- Negociações.

---

# Pré-requisitos

Antes de iniciar:

Consultar:

- architecture.md
- folder-structure.md
- business-rules.md
- database-patterns.md
- api-patterns.md
- backend-agent.md

---

# Etapa 1 - Análise do Módulo

Definir:

Nome do módulo.

Responsabilidade.

Entidades envolvidas.

Regras de negócio.

Relacionamentos.

Permissões necessárias.

---

# Etapa 2 - Modelagem

Avaliar necessidade de:

- novas tabelas;
- novos relacionamentos;
- novos enums;
- novos campos.

Validar:

- tenant_id;
- timestamps;
- soft delete;
- índices.

---

# Etapa 3 - Banco de Dados

Criar:

```
schema.prisma
```

Depois:

Executar migration.

Validar:

- relacionamentos;
- constraints;
- índices.

---

# Etapa 4 - Estrutura Backend

Criar:

```
modules/

nome-do-modulo/

├── controllers/
├── services/
├── repositories/
├── validators/
├── dto/
├── routes/
├── types/
├── constants/
└── index.ts
```

---

# Etapa 5 - Repository

Criar camada responsável pelo acesso aos dados.

Responsabilidades:

- consultas Prisma;
- criação;
- atualização;
- busca;
- exclusão lógica.

Não adicionar:

- regras de negócio.

---

# Etapa 6 - Service

Implementar:

- regras de negócio;
- validações;
- fluxos internos.

O Service deve ser independente de HTTP.

---

# Etapa 7 - Validators

Criar validações utilizando:

Zod

Validar:

- criação;
- atualização;
- filtros.

---

# Etapa 8 - Controllers

Criar controllers responsáveis por:

- receber requisição;
- validar entrada;
- chamar service;
- retornar resposta.

---

# Etapa 9 - Routes

Registrar endpoints:

Exemplo:

```
/api/v1/recurso
```

Validar:

- autenticação;
- autorização;
- Tenant.

---

# Etapa 10 - Eventos

Avaliar se o módulo gera eventos.

Exemplo:

Lead criado:

```
LeadCreated
```

---

# Etapa 11 - Frontend

Quando existir interface:

Criar:

```
features/

nome-do-modulo/

├── pages/
├── components/
├── services/
├── models/
└── routes.ts
```

---

# Etapa 12 - Testes

Criar testes para:

- regras de negócio;
- endpoints;
- permissões;
- isolamento Tenant.

---

# Validação Final

Antes de concluir verificar:

## Arquitetura

Segue padrão?

---

## Banco

Migration criada?

---

## Backend

Repository criado?

Service criado?

Controller criado?

---

## API

Endpoints documentados?

---

## Segurança

Tenant validado?

Permissões aplicadas?

---

## Frontend

Integração funcionando?

---

# Não Fazer

Durante criação de módulo:

Não criar funcionalidades extras.

Não alterar arquitetura.

Não modificar módulos existentes sem necessidade.

Não criar atalhos fora do padrão.

---

# Resultado Esperado

Ao finalizar esta skill, o novo módulo deverá possuir:

- banco estruturado;
- backend funcional;
- API disponível;
- frontend integrado quando aplicável;
- testes realizados;
- documentação atualizada.

---

# Objetivo Final

Garantir que todos os módulos do CRM sejam criados seguindo uma arquitetura consistente, previsível e escalável.