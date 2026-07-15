---
name: lead-management
description: Procedimento padrão para criar, manter e evoluir o módulo de Leads do CRM (cadastro, responsável, status, conversão).
---

# Skill: Gerenciamento de Leads

## Objetivo

Esta skill define o procedimento padrão para criação, manutenção e evolução do gerenciamento de Leads dentro do CRM.

O objetivo é garantir que Leads sejam tratados de forma:

- organizada;
- rastreável;
- segura;
- isolada por Tenant;
- integrada às origens externas.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar funcionalidades relacionadas a Leads;
- alterar fluxo de Lead;
- adicionar novos status;
- criar filtros;
- integrar novas origens;
- alterar regras comerciais.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Backend Agent;
- Frontend Agent;
- Integration Agent;
- Database Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de implementar consultar:

- tenant-management.md
- create-crud.md
- create-webhook.md
- create-endpoint.md
- database-patterns.md
- api-patterns.md

---

# Conceito de Lead

Lead representa um potencial cliente capturado através de uma origem externa ou criado manualmente dentro do CRM.

---

# Origem dos Leads

As origens previstas:

- Instagram;
- Facebook;
- Meta Lead Ads;
- Cadastro manual.

---

# Regra Principal

Todo Lead pertence obrigatoriamente a um Tenant.

---

# Estrutura Conceitual

```
Lead

├── Tenant
├── Source
├── Status
├── Contact Data
├── History
└── Metadata
```

---

# Dados Principais

Um Lead poderá possuir:

- nome;
- email;
- telefone;
- origem;
- campanha;
- status;
- observações;
- datas importantes.

---

# Multi-Tenant

Todo Lead deve possuir:

```
tenant_id
```

---

# Regra Crítica

Nenhum usuário pode visualizar Leads de outro Tenant.

---

# Identificação Externa

Leads provenientes de integrações externas devem possuir:

```
external_id
```

---

# Objetivo

Evitar:

- duplicidade;
- processamento repetido;
- criação duplicada.

---

# Status do Lead

Os status devem representar etapas comerciais.

Exemplo:

```
NEW

CONTACTED

QUALIFIED

CONVERTED

LOST
```

---

# Alteração de Status

Toda alteração importante deve considerar:

- usuário responsável;
- data;
- histórico.

---

# Histórico do Lead

Alterações relevantes devem ser registradas.

Exemplos:

- mudança de status;
- alteração de dados;
- inclusão de observação.

---

# Distribuição de Leads

Quando existir responsável pelo atendimento:

Registrar:

- usuário responsável;
- data da atribuição.

---

# Origem do Lead

A origem deve ser preservada.

Exemplo:

```
META_INSTAGRAM
```

---

# Não Alterar Origem

A origem representa como o Lead entrou no CRM.

Ela não deve ser sobrescrita posteriormente.

---

# Backend

Implementação deve seguir:

```
Controller

↓

Service

↓

Repository
```

---

# Repository

Responsável por:

- consultas;
- filtros;
- persistência.

Não deve conter:

- regras comerciais.

---

# Service

Responsável por:

- criação;
- validações;
- alteração de status;
- regras comerciais.

---

# API

Endpoints esperados:

## Criar Lead

```
POST /api/v1/leads
```

---

## Listar Leads

```
GET /api/v1/leads
```

---

## Buscar Lead

```
GET /api/v1/leads/:id
```

---

## Atualizar Lead

```
PATCH /api/v1/leads/:id
```

---

## Alterar Status

```
PATCH /api/v1/leads/:id/status
```

---

# Filtros

Listagem deve considerar:

- status;
- origem;
- período;
- responsável;
- busca textual.

---

# Paginação

Toda listagem deve possuir paginação.

Exemplo:

```
page

limit
```

---

# Frontend Angular

A interface deve possuir:

## Lista de Leads

Com:

- tabela;
- filtros;
- paginação;
- ações.

---

## Detalhe do Lead

Exibir:

- informações;
- histórico;
- origem;
- status.

---

## Atualização

Permitir:

- alterar informações;
- mudar status;
- adicionar observações.

---

# Integração com Webhook

Quando um Lead chegar externamente:

Fluxo:

```
Webhook

↓

Validar origem

↓

Identificar Tenant

↓

Normalizar dados

↓

Criar Lead

↓

Registrar evento
```

---

# Duplicidade

Antes de criar Lead externo validar:

- external_id;
- origem;
- Tenant.

---

# Auditoria

Registrar:

- criação;
- alterações;
- mudanças de status.

---

# Segurança

Validar:

- usuário autenticado;
- permissão;
- Tenant.

---

# Permissões Possíveis

Exemplo:

```
LEADS_VIEW

LEADS_CREATE

LEADS_UPDATE

LEADS_DELETE

LEADS_ASSIGN
```

---

# Testes

Validar:

## Criação

Lead criado corretamente.

---

## Integração

Webhook cria Lead.

---

## Duplicidade

Mesmo Lead externo não duplica.

---

## Isolamento

Tenant A não acessa Tenant B.

---

## Permissões

Usuário sem acesso é bloqueado.

---

# Não Fazer

Não criar Lead sem Tenant.

Não confiar em dados externos.

Não alterar origem automaticamente.

Não colocar regra comercial no Controller.

Não permitir acesso sem validação.

---

# Checklist Final

Lead possui Tenant?

Sim / Não

Origem registrada?

Sim / Não

Duplicidade tratada?

Sim / Não

Histórico implementado?

Sim / Não

Permissões aplicadas?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O módulo de Leads deverá estar preparado para receber, organizar e acompanhar oportunidades comerciais dentro do CRM.

---

# Objetivo Final

Garantir que Leads sejam tratados como o principal ativo comercial do CRM, mantendo organização, segurança e rastreabilidade.