---
name: tenant-management
description: Procedimento padrão para criar, manter e evoluir o gerenciamento de Tenants do CRM (cadastro, status, identidade visual, domínio).
---

# Skill: Gerenciamento de Tenant

## Objetivo

Esta skill define o procedimento padrão para criação, manutenção e evolução do gerenciamento de Tenants dentro do CRM.

O objetivo é garantir que cada cliente da plataforma possua um ambiente isolado, seguro e configurável.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar novos clientes;
- alterar configurações de Tenant;
- gerenciar domínios;
- configurar identidade visual;
- ativar ou desativar clientes;
- alterar isolamento.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Master Agent;
- Backend Agent;
- Database Agent;
- Security Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de implementar consultar:

- multi-tenant.md
- security.md
- authorization-flow.md
- database-patterns.md
- architecture.md

---

# Conceito de Tenant

Tenant representa uma empresa cliente utilizando a plataforma CRM.

Cada Tenant possui:

- usuários;
- dados;
- configurações;
- permissões;
- integrações.

---

# Regra Principal

Dados de Tenants diferentes nunca podem se misturar.

---

# Estrutura Conceitual

```
Tenant

├── Users
├── Leads
├── Settings
├── Integrations
└── Audit Logs
```

---

# Criação de Tenant

Ao criar um Tenant definir:

- nome;
- identificador;
- domínio;
- status;
- configurações iniciais.

---

# Identificador

Todo Tenant deve possuir identificador único.

Exemplo:

```
tenant_id
```

---

# Status

Controlar estado do Tenant.

Exemplo:

```
ACTIVE

INACTIVE

SUSPENDED
```

---

# Domínio

O Tenant poderá possuir domínio próprio.

Exemplo:

```
cliente.com.br
```

---

# Identificação pelo Domínio

Fluxo:

```
Usuário acessa domínio

↓

Sistema identifica Tenant

↓

Carrega configurações

↓

Usuário autentica
```

---

# Personalização Visual

Cada Tenant poderá possuir:

- logo;
- cores;
- nome exibido;
- configurações visuais.

---

# Regra

Personalizações devem ser armazenadas como configuração.

Nunca criar código específico por cliente.

---

# Usuários

Todo usuário deverá estar associado ao Tenant correto.

---

# Regra de Associação

Usuário:

Pertence a um Tenant.

Tenant:

Possui vários usuários.

---

# Isolamento de Dados

Toda consulta relacionada ao Tenant deve considerar:

```
tenant_id
```

---

# Backend

Toda operação deve validar:

- usuário autenticado;
- Tenant atual;
- permissão.

---

# Banco de Dados

Entidades pertencentes ao cliente devem possuir:

```
tenant_id
```

---

# Índices

Avaliar índices compostos:

Exemplo:

```
tenant_id + created_at
```

---

# Configurações do Tenant

Informações específicas devem ficar separadas.

Exemplo:

```
TenantSettings
```

---

# Não Fazer

Não espalhar configurações diretamente nas tabelas principais.

Não criar lógica específica por cliente.

Exemplo proibido:

```
if(cliente === "empresaA")
```

---

# Integrações por Tenant

Quando existir integração externa:

Ela deve pertencer ao Tenant.

Exemplo:

Cliente A:

Meta Account A.

Cliente B:

Meta Account B.

---

# Segurança

Nunca permitir:

- alterar tenant pelo frontend;
- enviar tenant_id manualmente;
- acessar dados externos.

---

# Owner

O Owner da plataforma possui visão administrativa sobre Tenants.

Exemplo:

CMB.

Pode:

- criar clientes;
- ativar clientes;
- gerenciar configurações gerais.

---

# Tenant Admin

Pode:

- administrar usuários internos;
- acessar configurações permitidas.

Não pode:

- acessar outros Tenants.

---

# Auditoria

Registrar ações importantes:

- criação de Tenant;
- alteração de domínio;
- alteração de configurações;
- ativação/desativação.

---

# Testes

Validar:

## Criação

Tenant criado corretamente.

---

## Isolamento

Tenant A não acessa Tenant B.

---

## Domínio

Domínio identifica Tenant correto.

---

## Usuários

Usuários pertencem ao Tenant correto.

---

## Permissões

Usuário não ultrapassa seu escopo.

---

# Checklist Final

Tenant possui identificação?

Sim / Não

Dados isolados?

Sim / Não

Usuários vinculados?

Sim / Não

Configurações separadas?

Sim / Não

Domínio validado?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O Tenant estará corretamente criado, configurado e isolado dentro da plataforma.

---

# Objetivo Final

Garantir que o CRM funcione como uma plataforma SaaS Multi-Tenant segura, permitindo múltiplos clientes utilizando a mesma aplicação sem mistura de dados.