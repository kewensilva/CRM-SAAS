---
name: testing-strategy
description: Padrão de testes do CRM — cenário feliz, dados inválidos, permissões e isolamento multi-tenant devem sempre ser cobertos.
---

# Skill: Estratégia de Testes

## Objetivo

Esta skill define o padrão de testes utilizado no desenvolvimento e evolução do CRM.

O objetivo é garantir:

- qualidade;
- estabilidade;
- segurança;
- prevenção de regressões.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar uma nova funcionalidade;
- alterar código existente;
- corrigir bugs;
- realizar refatorações;
- alterar integrações.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- QA Agent.

Com apoio de:

- Backend Agent;
- Frontend Agent;
- Security Agent.

---

# Documentos Obrigatórios

Antes de criar testes consultar:

- feature-development.md
- bug-fix.md
- review-code.md
- security.md
- definition-of-done.md

---

# Princípio Principal

Código sem validação não deve ser considerado concluído.

Fluxo:

```
Implementação

↓

Testes

↓

Correção

↓

Revisão

↓

Entrega
```

---

# Tipos de Teste

O CRM deve possuir:

```
Testes Unitários

Testes de Integração

Testes End-to-End

Testes de Segurança

Testes de Regressão
```

---

# Testes Unitários

Objetivo:

Validar pequenas partes isoladas do sistema.

---

# Backend

Priorizar testes em:

- services;
- regras de negócio;
- validators;
- helpers.

---

# Exemplo

Validar:

Criação de Lead.

Entrada válida:

Resultado esperado.

Lead criado.

---

# Testes de Integração

Objetivo:

Validar comunicação entre partes do sistema.

---

# Exemplos

Backend + Banco:

```
Service

↓

Repository

↓

PostgreSQL
```

---

API:

```
Request

↓

Controller

↓

Response
```

---

# Testes End-to-End

Objetivo:

Validar fluxo completo do usuário.

---

# Exemplos

## Login

Usuário:

Entra no sistema.

↓

Recebe acesso.

---

## Lead

Usuário:

Visualiza Lead.

↓

Atualiza status.

---

# Frontend Angular

Testar:

- componentes;
- services;
- guards;
- formulários.

---

# Formulários

Validar:

- campos obrigatórios;
- mensagens;
- envio correto.

---

# Multi-Tenant

Obrigatório testar isolamento.

---

# Cenários

Tenant A:

Criar Lead.

Tenant B:

Não consegue visualizar.

---

# Segurança

Testar:

- autenticação;
- autorização;
- permissões.

---

# Exemplos

Usuário sem permissão:

Tentativa de excluir Lead.

Resultado:

Acesso bloqueado.

---

# Integrações

Testar:

- recebimento webhook;
- payload inválido;
- duplicidade;
- erros externos.

---

# Banco de Dados

Validar:

- migrations;
- relacionamentos;
- constraints.

---

# Regras de Negócio

Toda regra importante deve possuir teste.

Exemplos:

- mudança de status;
- permissões;
- distribuição de Lead.

---

# Testes de Regressão

Antes de concluir alterações:

Garantir que funcionalidades existentes continuam funcionando.

---

# Bug Fix

Toda correção de bug deve criar ou atualizar teste.

---

# Cobertura

Cobertura não é o único indicador.

Priorizar:

- regras críticas;
- segurança;
- fluxos principais.

---

# Testes Obrigatórios por Funcionalidade

Toda nova funcionalidade deve possuir:

## Backend

- regra principal;
- validações;
- erros.

---

## Frontend

- carregamento;
- interação;
- estados.

---

## Segurança

- permissões;
- Tenant.

---

# Ambiente de Teste

Testes devem utilizar:

- banco separado;
- dados controlados;
- configurações próprias.

---

# Dados de Teste

Nunca utilizar:

- dados reais de clientes;
- informações sensíveis.

---

# Execução

Antes de concluir uma tarefa:

Executar testes relacionados.

---

# Relatório

Quando finalizar:

Informar:

```
Testes executados:

-

Resultado:

-

Problemas encontrados:

-

```

---

# Não Fazer

Não considerar compilação como teste.

Não testar apenas cenário positivo.

Não ignorar permissões.

Não ignorar Multi-Tenant.

Não remover testes para facilitar implementação.

---

# Checklist Final

Testes unitários avaliados?

Sim / Não

Integrações testadas?

Sim / Não

Fluxos principais testados?

Sim / Não

Permissões testadas?

Sim / Não

Multi-Tenant validado?

Sim / Não

Regressões verificadas?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

A funcionalidade estará validada e preparada para uso dentro do CRM.

---

# Objetivo Final

Garantir evolução rápida da plataforma mantendo estabilidade e confiança no sistema.