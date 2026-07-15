---
name: integration-management
description: Procedimento padrão para criar, manter e evoluir integrações externas do CRM (Meta Lead Ads e futuras integrações) como módulos independentes.
---

# Skill: Gerenciamento de Integrações

## Objetivo

Esta skill define o procedimento padrão para criação, manutenção e evolução das integrações externas do CRM.

O objetivo é garantir que integrações sejam implementadas de forma:

- segura;
- isolada por Tenant;
- rastreável;
- organizada;
- desacoplada do domínio principal.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar uma nova integração;
- alterar uma integração existente;
- configurar credenciais externas;
- adicionar nova origem de Leads;
- corrigir sincronizações;
- modificar processamento externo.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Integration Agent;
- Backend Agent;
- Security Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de implementar consultar:

- create-webhook.md
- lead-management.md
- tenant-management.md
- security.md
- database-patterns.md
- events.md

---

# Princípios

Toda integração deve ser:

- independente;
- configurável;
- segura;
- monitorável;
- específica por Tenant.

---

# Integrações Previstas

Inicialmente:

```
Meta

├── Facebook Lead Ads

└── Instagram Leads
```

---

# Arquitetura

O fluxo deve seguir:

```
Plataforma Externa

↓

Integration Layer

↓

Normalização

↓

Domínio CRM

↓

Persistência
```

---

# Separação de Responsabilidades

A integração externa não deve conhecer regras internas do CRM.

---

# Exemplo

Meta envia:

```
MetaLeadPayload
```

Sistema transforma em:

```
LeadCreateDTO
```

---

# Configuração por Tenant

Cada Tenant poderá possuir suas próprias configurações.

Exemplo:

```
TenantIntegration
```

---

# Dados de Integração

Podem existir:

- account_id;
- tokens;
- identificadores externos;
- status.

---

# Segurança das Credenciais

Credenciais externas nunca devem:

- aparecer em respostas da API;
- aparecer em logs;
- ser armazenadas sem proteção.

---

# Status da Integração

Controlar estado.

Exemplo:

```
ACTIVE

INACTIVE

ERROR
```

---

# Conexão da Integração

Toda integração deve permitir identificar:

- Tenant;
- plataforma;
- configuração;
- status.

---

# Backend

Estrutura esperada:

```
integrations/

├── meta/
│
│   ├── controller/
│   ├── service/
│   ├── adapter/
│   ├── validator/
│   └── types/
│
└── index.ts
```

---

# Adapter Pattern

Integrações devem utilizar camada de adaptação.

Objetivo:

Evitar que o CRM dependa diretamente da plataforma externa.

---

# Exemplo

Evitar:

```
LeadService chama Meta API diretamente
```

Preferir:

```
LeadService

↓

Integration Adapter

↓

Meta API
```

---

# Webhooks

Quando receber eventos externos:

Validar:

- origem;
- assinatura;
- Tenant;
- payload.

---

# Sincronização

Quando existir sincronização:

Definir:

- frequência;
- origem principal;
- tratamento de conflito.

---

# Eventos

Integrações podem gerar eventos internos.

Exemplo:

```
ExternalLeadReceived
```

---

# Logs

Registrar:

- integração;
- Tenant;
- data;
- status;
- erro.

---

# Nunca Registrar

Não salvar em logs:

- tokens;
- senhas;
- dados sensíveis desnecessários.

---

# Tratamento de Falhas

Falhas externas devem ser tratadas.

Exemplos:

- API indisponível;
- token expirado;
- limite externo;
- payload inválido.

---

# Reprocessamento

Quando necessário permitir:

- tentativa novamente;
- análise manual;
- identificação do erro.

---

# Banco de Dados

Avaliar entidades:

Exemplo:

```
Integration

TenantIntegration

IntegrationLog
```

---

# Multi-Tenant

Toda integração deve possuir:

```
tenant_id
```

---

# Regra Crítica

Uma integração configurada para um Tenant nunca pode ser utilizada por outro.

---

# Frontend Angular

Quando existir gerenciamento:

Criar:

- tela de integrações;
- status;
- configuração;
- mensagens de erro.

---

# Permissões

Avaliar:

```
INTEGRATIONS_VIEW

INTEGRATIONS_CREATE

INTEGRATIONS_UPDATE
```

---

# Testes

Validar:

## Configuração

Integração salva corretamente.

---

## Segurança

Credenciais protegidas.

---

## Tenant

Cliente A não acessa integração do Cliente B.

---

## Webhook

Evento externo processado.

---

## Erro

Falhas tratadas corretamente.

---

# Não Fazer

Não misturar integração com regra de negócio.

Não armazenar tokens expostos.

Não criar código específico por cliente.

Não chamar APIs externas diretamente em Controllers.

---

# Checklist Final

Integração isolada?

Sim / Não

Tenant definido?

Sim / Não

Credenciais protegidas?

Sim / Não

Logs implementados?

Sim / Não

Erros tratados?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

A integração estará preparada para evolução sem comprometer a arquitetura principal do CRM.

---

# Objetivo Final

Garantir que integrações externas sejam componentes independentes, seguros e fáceis de manter dentro da plataforma SaaS.