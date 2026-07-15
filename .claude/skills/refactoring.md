---
name: refactoring
description: Processo padrão para realizar refatorações no CRM apenas quando fizerem parte da tarefa, corrigirem um problema ou reduzirem duplicação — nunca por preferência pessoal.
---

# Skill: Refatoração de Código

## Objetivo

Esta skill define o processo padrão para realizar refatorações dentro do CRM.

O objetivo é melhorar:

- organização;
- manutenção;
- legibilidade;
- performance;
- escalabilidade;

sem alterar o comportamento esperado do sistema.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- remover código duplicado;
- reorganizar módulos;
- melhorar estrutura;
- reduzir complexidade;
- melhorar performance;
- atualizar padrões internos.

---

# Responsáveis

Esta skill pode envolver:

- Master Agent;
- Backend Agent;
- Frontend Agent;
- Database Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de iniciar consultar:

- architecture.md
- code-style.md
- review-code.md
- definition-of-done.md
- security.md

---

# Princípio Principal

Refatoração não deve alterar comportamento.

Fluxo:

```
Código Atual

↓

Análise

↓

Plano

↓

Refatoração

↓

Testes

↓

Validação
```

---

# Etapa 1 - Identificação

Antes de refatorar definir:

## Problema

Exemplo:

Serviço possui muitas responsabilidades.

---

## Objetivo

Exemplo:

Separar responsabilidades mantendo resultado atual.

---

# Etapa 2 - Análise de Impacto

Avaliar:

- arquivos envolvidos;
- dependências;
- APIs;
- banco;
- frontend.

---

# Etapa 3 - Criar Plano

Antes de alterar código definir:

- o que será movido;
- o que será removido;
- o que será criado.

---

# Refatorações Permitidas

## Backend

Exemplos:

- separar services;
- criar helpers;
- melhorar repositories;
- organizar módulos.

---

## Frontend Angular

Exemplos:

- dividir componentes;
- criar componentes reutilizáveis;
- organizar services;
- melhorar estado.

---

## Banco

Exemplos:

- melhorar consultas;
- adicionar índices;
- reorganizar queries.

---

# Separação de Responsabilidades

Evitar:

```
Controller gigante

Service gigante

Component gigante
```

---

Preferir:

```
Responsabilidade única

Código previsível

Baixo acoplamento
```

---

# SOLID

Durante refatoração avaliar:

## Single Responsibility

Cada parte possui uma responsabilidade.

---

## Open/Closed

Código preparado para extensão.

---

## Dependency Inversion

Evitar dependências rígidas.

---

# Multi-Tenant

Toda refatoração deve preservar:

- isolamento;
- tenant_id;
- regras de acesso.

---

# API

Nunca alterar contratos externos sem análise.

Avaliar:

- endpoints;
- payloads;
- respostas.

---

# Banco de Dados

Antes de alterar:

Avaliar:

- migrations;
- dados existentes;
- impacto.

---

# Não Fazer

Não refatorar e adicionar funcionalidade ao mesmo tempo.

Não alterar comportamento.

Não remover validações existentes.

Não criar abstrações desnecessárias.

---

# Testes

Antes:

Executar testes existentes.

---

Depois:

Validar:

## Funcionamento

Sistema continua funcionando.

---

## APIs

Contratos mantidos.

---

## Frontend

Fluxos continuam funcionando.

---

## Multi-Tenant

Isolamento preservado.

---

# Performance

Quando refatorar por performance avaliar:

Backend:

- consultas;
- processamento.

Frontend:

- renderização;
- chamadas.

Banco:

- índices;
- queries.

---

# Documentação

Atualizar quando necessário:

- arquitetura;
- decisões técnicas;
- padrões.

---

# Revisão

Toda refatoração deve passar por:

```
review-code.md
```

---

# Checklist Final

Objetivo definido?

Sim / Não

Impacto analisado?

Sim / Não

Plano criado?

Sim / Não

Comportamento mantido?

Sim / Não

Testes executados?

Sim / Não

Código revisado?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O código estará mais organizado, sustentável e preparado para evolução.

---

# Objetivo Final

Permitir crescimento contínuo do CRM mantendo qualidade técnica, sem criar dívida arquitetural.