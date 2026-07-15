---
name: create-webhook
description: Procedimento padrão para criar, manter e evoluir webhooks (entrada e saída) no CRM, incluindo validação, segurança e tratamento de falhas.
---

# Skill: Criar e Evoluir Webhook

## Objetivo

Esta skill define o procedimento padrão para criação, manutenção e evolução de Webhooks dentro do CRM.

O objetivo é garantir que integrações externas sejam tratadas de forma:

- segura;
- previsível;
- desacoplada;
- rastreável;
- compatível.

---

# Contexto

O CRM possui integrações externas responsáveis principalmente pelo recebimento de Leads.

Integrações previstas:

- Meta Lead Ads;
- Instagram;
- Facebook.

Os Webhooks existentes devem ser evoluídos seguindo esta arquitetura.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar novo webhook;
- alterar webhook existente;
- adicionar novo evento;
- alterar payload recebido;
- adicionar nova origem de Leads;
- corrigir processamento de eventos externos.

---

# Pré-requisitos

Antes de alterar um webhook consultar:

- integration-agent.md
- api-patterns.md
- security.md
- events.md
- error-patterns.md
- multi-tenant.md

---

# Princípios

Todo webhook deve ser:

- independente da plataforma externa;
- validado antes do processamento;
- idempotente;
- seguro;
- monitorável.

---

# Arquitetura

O fluxo esperado:

```
Plataforma Externa

↓

Webhook Endpoint

↓

Validação

↓

Normalização Payload

↓

Processamento Interno

↓

Persistência

↓

Evento Interno
```

---

# Endpoint

Todo webhook deverá possuir rota própria.

Exemplo:

```
POST /api/v1/webhooks/meta/leads
```

---

# Validação Inicial

Antes de processar:

Validar:

- origem;
- método HTTP;
- assinatura quando disponível;
- estrutura do payload;
- Tenant relacionado.

---

# Payload Externo

Nunca persistir diretamente dados recebidos.

Fluxo:

Payload externo

↓

DTO externo

↓

Normalização

↓

Modelo interno

---

# Normalização

Cada plataforma possui formatos diferentes.

O CRM deve trabalhar com um modelo interno único.

Exemplo:

```
LeadExternalPayload

↓

Lead
```

---

# Multi-Tenant

Todo webhook deve identificar corretamente o Tenant.

Nenhum Lead poderá ser criado sem:

```
tenant_id
```

---

# Segurança

Nunca confiar nos dados recebidos.

Validar:

- tokens;
- assinaturas;
- permissões;
- origem.

---

# Idempotência

Webhooks podem ser enviados mais de uma vez.

O processamento deve evitar duplicidade.

Exemplos:

- salvar external_id;
- controlar evento processado;
- verificar existência anterior.

---

# Tratamento de Erros

Falhas externas não devem quebrar a API principal.

Registrar:

- erro;
- origem;
- Tenant;
- payload necessário para análise.

Nunca registrar:

- tokens;
- credenciais;
- dados sensíveis desnecessários.

---

# Processamento Assíncrono

Quando necessário utilizar processamento desacoplado.

Exemplo:

Webhook recebido

↓

Fila/processamento

↓

Criação do Lead

---

# Eventos Internos

Após processamento bem sucedido avaliar criação de eventos.

Exemplo:

```
LeadCreated
```

---

# Alteração de Payload

Antes de alterar:

Avaliar:

- integrações existentes;
- compatibilidade;
- impacto.

Nunca remover campos utilizados sem análise.

---

# Testes

Validar:

## Recebimento

Webhook aceita payload válido.

---

## Segurança

Payload inválido bloqueado.

---

## Duplicidade

Mesmo evento não cria registros duplicados.

---

## Multi-Tenant

Lead criado no Tenant correto.

---

## Falhas

Erro externo tratado corretamente.

---

# Logs

Registrar:

- origem;
- data;
- status;
- Tenant;
- identificador externo.

---

# Não Fazer

Não acessar banco diretamente no webhook.

Não colocar regra de negócio no controller.

Não confiar em payload externo.

Não criar integração específica misturada ao domínio principal.

---

# Checklist Final

Webhook possui validação?

Sim / Não

Tenant identificado?

Sim / Não

Payload normalizado?

Sim / Não

Idempotência aplicada?

Sim / Não

Logs implementados?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O webhook deverá estar integrado ao CRM mantendo:

- segurança;
- compatibilidade;
- isolamento Multi-Tenant;
- estabilidade.

---

# Objetivo Final

Garantir que qualquer integração externa consiga enviar informações ao CRM de maneira segura e padronizada sem comprometer a arquitetura principal.