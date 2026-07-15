---
name: feature-development
description: Processo padrão de ponta a ponta para criar novas funcionalidades no CRM, do entendimento da necessidade até a validação final.
---

# Skill: Desenvolvimento de Funcionalidades

## Objetivo

Esta skill define o processo padrão para criação de novas funcionalidades dentro do CRM.

O objetivo é garantir que qualquer nova funcionalidade siga o mesmo fluxo:

- análise;
- arquitetura;
- banco;
- backend;
- frontend;
- testes;
- documentação.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar uma nova funcionalidade;
- criar um novo módulo;
- adicionar uma regra de negócio;
- evoluir uma área existente do CRM.

---

# Responsáveis

Esta skill envolve:

- Master Agent;
- Backend Agent;
- Frontend Agent;
- Database Agent;
- QA Agent.

---

# Documentos Obrigatórios

Antes de iniciar consultar:

- architecture.md
- database-patterns.md
- api-patterns.md
- security.md
- tenant-management.md
- definition-of-done.md

---

# Princípio Principal

Nenhuma funcionalidade deve ser criada diretamente no código.

Primeiro deve existir entendimento:

```
Problema

↓

Regra de negócio

↓

Arquitetura

↓

Implementação

↓

Validação
```

---

# Etapa 1 - Entendimento

Antes de desenvolver definir:

## Objetivo

Qual problema a funcionalidade resolve?

---

## Usuários Impactados

Quem utilizará?

Exemplo:

- Owner;
- Tenant Admin;
- Usuário.

---

## Regras de Negócio

Definir:

- comportamentos;
- validações;
- permissões.

---

# Etapa 2 - Análise de Arquitetura

Avaliar:

A funcionalidade pertence a qual módulo?

Exemplos:

```
Leads

Users

Integrations

Reports
```

---

Definir:

- entidades envolvidas;
- relacionamentos;
- permissões necessárias.

---

# Etapa 3 - Banco de Dados

Avaliar necessidade de:

- novos models;
- novos campos;
- relacionamentos;
- índices.

---

Quando necessário utilizar:

```
database-migration.md
```

---

# Etapa 4 - Backend

Implementar seguindo:

```
Controller

↓

Service

↓

Repository
```

---

# Controller

Responsável por:

- receber requisição;
- validar entrada;
- retornar resposta.

---

# Service

Responsável por:

- regras de negócio;
- validações;
- fluxo principal.

---

# Repository

Responsável por:

- acesso ao banco;
- consultas.

---

# Etapa 5 - API

Definir:

- endpoints;
- payloads;
- respostas;
- erros.

---

Utilizar:

```
create-endpoint.md
```

---

# Etapa 6 - Segurança

Validar:

- autenticação;
- autorização;
- Tenant;
- permissões.

---

Toda funcionalidade deve responder:

Usuário possui acesso?

Tenant está correto?

---

# Etapa 7 - Frontend Angular

Criar:

- páginas;
- componentes;
- services;
- models;
- guards.

---

Utilizar:

```
create-angular-page.md
```

---

# Interface

Considerar:

- loading;
- erro;
- sucesso;
- estados vazios.

---

# Etapa 8 - Integrações

Quando envolver plataformas externas:

Utilizar:

```
integration-management.md

create-webhook.md
```

---

# Etapa 9 - Testes

Toda funcionalidade deve validar:

## Fluxo principal

Funciona conforme esperado.

---

## Erros

Entradas inválidas são tratadas.

---

## Segurança

Usuários sem permissão são bloqueados.

---

## Multi-Tenant

Dados permanecem isolados.

---

# Etapa 10 - Revisão

Antes de concluir executar:

```
review-code.md
```

---

# Critérios de Aprovação

A funcionalidade somente é considerada pronta quando:

- arquitetura respeitada;
- banco validado;
- backend implementado;
- frontend implementado;
- permissões aplicadas;
- testes realizados;
- código revisado.

---

# Documentação

Toda funcionalidade deve atualizar:

Quando necessário:

- documentação técnica;
- endpoints;
- regras de negócio.

---

# Não Fazer

Não iniciar código sem análise.

Não criar atalhos arquiteturais.

Não ignorar Tenant.

Não ignorar permissões.

Não duplicar funcionalidades existentes.

---

# Checklist Final

Objetivo definido?

Sim / Não

Arquitetura analisada?

Sim / Não

Banco validado?

Sim / Não

Backend criado?

Sim / Não

Frontend criado?

Sim / Não

Segurança aplicada?

Sim / Não

Testes realizados?

Sim / Não

Código revisado?

Sim / Não

Documentação atualizada?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

A funcionalidade estará integrada corretamente ao CRM seguindo todos os padrões definidos.

---

# Objetivo Final

Permitir evolução rápida do CRM utilizando Codex sem comprometer arquitetura, segurança e qualidade.