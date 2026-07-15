---
name: audit-log
description: Procedimento para criar, manter e evoluir o sistema de auditoria do CRM (registro de login, criação/alteração/exclusão de entidades, mudanças de configuração).
---

# Skill: Auditoria e Registro de Eventos

## Objetivo

Esta skill define o procedimento padrão para criação, manutenção e evolução do sistema de auditoria do CRM.

O objetivo é garantir rastreabilidade das ações realizadas dentro da plataforma.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- registrar ações de usuários;
- auditar alterações importantes;
- criar histórico administrativo;
- investigar problemas;
- acompanhar mudanças sensíveis.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Security Agent;
- Backend Agent;
- Database Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de implementar consultar:

- security.md
- tenant-management.md
- authorization-flow.md
- database-patterns.md
- events.md

---

# Conceito

Audit Log representa o histórico de ações relevantes realizadas dentro do CRM.

---

# Objetivo

Permitir responder:

Quem?

Fez o quê?

Quando?

Em qual Tenant?

Qual recurso foi alterado?

---

# Estrutura Conceitual

```
AuditLog

├── Tenant
├── User
├── Action
├── Resource
├── Old Data
├── New Data
└── Timestamp
```

---

# Eventos que Devem ser Auditados

Priorizar ações administrativas ou sensíveis.

---

# Usuários

Exemplos:

- criação;
- alteração;
- remoção;
- mudança de permissão.

---

# Leads

Exemplos:

- criação;
- alteração de status;
- alteração de responsável;
- exclusão lógica.

---

# Integrações

Exemplos:

- criação;
- alteração;
- ativação;
- desativação.

---

# Configurações

Exemplos:

- alteração de dados do Tenant;
- alteração visual;
- mudanças administrativas.

---

# Não Registrar

Não registrar:

- senha;
- tokens;
- credenciais;
- dados sensíveis desnecessários.

---

# Modelo de Evento

Exemplo:

```
{
    action: "LEAD_STATUS_CHANGED",
    resource: "LEAD",
    resource_id: "uuid",
    user_id: "uuid",
    tenant_id: "uuid"
}
```

---

# Ações

As ações devem seguir padrão.

Exemplo:

```
CREATE

UPDATE

DELETE

LOGIN

LOGOUT

STATUS_CHANGE

PERMISSION_CHANGE
```

---

# Recursos

Exemplo:

```
USER

LEAD

TENANT

INTEGRATION

SETTING
```

---

# Multi-Tenant

Todo registro de auditoria deve possuir:

```
tenant_id
```

---

# Regra Crítica

Nunca criar auditoria sem contexto do Tenant.

---

# Backend

A auditoria deve ser aplicada preferencialmente através de:

- middleware;
- service;
- eventos internos.

---

# Evitar

Não duplicar chamadas manuais em todos os controllers.

Exemplo:

Evitar:

```
controller cria log manualmente
```

em todos os endpoints.

---

# Preferir

Fluxo:

```
Ação realizada

↓

Evento interno

↓

Audit Service

↓

Persistência
```

---

# Audit Service

Responsável por:

- criar registros;
- padronizar informações;
- remover dados sensíveis.

---

# Dados Antigos e Novos

Quando necessário registrar:

Antes:

```
old_value
```

Depois:

```
new_value
```

---

# Controle de Tamanho

Evitar armazenar objetos gigantes.

Registrar somente informações relevantes.

---

# Banco de Dados

Avaliar estrutura:

```
AuditLog

id

tenant_id

user_id

action

resource

resource_id

old_value

new_value

created_at
```

---

# Índices

Avaliar índices para:

- tenant_id;
- user_id;
- resource;
- created_at.

---

# Frontend Angular

Quando necessário criar:

Tela administrativa de auditoria.

Possuir:

- filtros;
- busca;
- período;
- usuário;
- ação.

---

# Permissões

Exemplo:

```
AUDIT_VIEW
```

---

# Owner

O Owner da plataforma poderá visualizar auditorias administrativas dos Tenants conforme regras definidas.

---

# Tenant Admin

Pode visualizar somente ações do próprio Tenant quando permitido.

---

# Segurança

Logs de auditoria devem ser protegidos.

Usuários comuns não devem alterar registros.

---

# Testes

Validar:

## Criação

Evento gera registro.

---

## Segurança

Usuário sem permissão não acessa.

---

## Multi-Tenant

Auditoria não mistura clientes.

---

## Dados Sensíveis

Informações protegidas não aparecem.

---

# Não Fazer

Não permitir alteração manual de logs.

Não registrar senhas.

Não registrar tokens.

Não ignorar Tenant.

Não criar auditoria apenas no frontend.

---

# Checklist Final

Eventos críticos registrados?

Sim / Não

Tenant registrado?

Sim / Não

Usuário identificado?

Sim / Não

Dados sensíveis protegidos?

Sim / Não

Permissões aplicadas?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O CRM possuirá rastreabilidade suficiente para suporte, segurança e administração da plataforma.

---

# Objetivo Final

Garantir transparência e controle sobre todas as ações importantes realizadas dentro do CRM.