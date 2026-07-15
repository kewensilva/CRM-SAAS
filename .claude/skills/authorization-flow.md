---
name: authorization-flow
description: Procedimento para implementar e evoluir o controle de autorização RBAC do CRM (perfis Owner/Tenant Admin/Manager/User, verificação de permissões por módulo).
---

# Skill: Fluxo de Autorização

## Objetivo

Esta skill define o procedimento padrão para implementação, manutenção e evolução do controle de autorização dentro do CRM.

O objetivo é garantir que usuários possam acessar somente recursos permitidos considerando:

- Tenant;
- perfil;
- permissões;
- contexto da plataforma.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar novas permissões;
- criar novos perfis;
- proteger endpoints;
- restringir funcionalidades;
- alterar regras de acesso.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Security Agent;
- Backend Agent;
- Frontend Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de implementar consultar:

- authentication-flow.md
- security.md
- permissions.md
- multi-tenant.md
- architecture.md

---

# Princípio Principal

Autenticação responde:

"Quem é o usuário?"

Autorização responde:

"O que esse usuário pode fazer?"

---

# Modelo de Acesso

O CRM possui níveis de acesso:

```
OWNER

TENANT_ADMIN

USER
```

---

# OWNER

Representa a empresa dona da plataforma.

Exemplo:

CMB.

Responsabilidades:

- gerenciar clientes;
- configurar plataforma;
- administrar Tenants.

---

# TENANT_ADMIN

Administrador de um cliente.

Responsabilidades:

- gerenciar usuários do próprio Tenant;
- acessar dados do cliente;
- configurar recursos permitidos.

---

# USER

Usuário comum do cliente.

Responsabilidades:

- utilizar funcionalidades liberadas;
- acessar somente informações permitidas.

---

# Regra Multi-Tenant

Todo usuário deve possuir contexto:

```
tenant_id
```

---

# Regra Crítica

Nenhum usuário pode acessar dados fora do próprio Tenant.

---

# Modelo de Permissão

Permissões devem representar ações.

Exemplo:

```
LEADS_VIEW

LEADS_CREATE

LEADS_UPDATE

LEADS_DELETE
```

---

# Não Criar Permissões Genéricas

Evitar:

```
ACCESS_SYSTEM
```

Preferir:

```
LEADS_VIEW
```

---

# Backend Authorization

Toda ação protegida deve validar:

1. Usuário autenticado.
2. Tenant correto.
3. Permissão necessária.

---

# Exemplo

Usuário tenta:

Excluir Lead.

Validar:

Possui:

```
LEADS_DELETE
```

?

Sim:

Permitir.

Não:

Bloquear.

---

# Middleware de Permissão

Rotas protegidas podem utilizar:

```
permissionMiddleware
```

---

# Exemplo

```
DELETE /api/v1/leads/:id
```

Necessita:

```
LEADS_DELETE
```

---

# Frontend Authorization

O Angular deve utilizar permissões para:

- esconder ações;
- bloquear telas;
- melhorar experiência.

---

# Importante

O frontend nunca substitui validação backend.

---

# Guards

Utilizar guards para:

- páginas privadas;
- módulos específicos;
- permissões.

---

# Controle Visual

Exemplo:

Botão excluir Lead:

Mostrar somente quando usuário possuir:

```
LEADS_DELETE
```

---

# Banco de Dados

Avaliar necessidade de estruturas:

Exemplo:

```
roles

permissions

role_permissions

user_roles
```

---

# Evitar

Criar permissões diretamente no código.

Exemplo proibido:

```
if(role === "admin")
```

---

# Preferir

Estrutura baseada em permissões.

Exemplo:

```
can("LEADS_CREATE")
```

---

# Owner vs Tenant

O Owner possui acesso administrativo da plataforma.

O Tenant Admin possui acesso somente ao próprio cliente.

---

# Validação de Contexto

Sempre validar:

Usuário pertence ao Tenant?

Permissão pertence ao usuário?

Recurso pertence ao Tenant?

---

# Auditoria

Alterações sensíveis devem registrar:

- usuário;
- ação;
- data;
- recurso afetado.

Exemplos:

- alteração de permissões;
- criação de usuários;
- mudanças administrativas.

---

# Testes

Validar:

## Owner

Acessa recursos administrativos.

---

## Tenant Admin

Acessa apenas seu Tenant.

---

## User

Acessa somente permissões concedidas.

---

## Bloqueios

Usuário sem permissão é impedido.

---

## Multi-Tenant

Tentativa de acesso cruzado bloqueada.

---

# Não Fazer

Não confiar no frontend.

Não utilizar somente roles fixas.

Não criar permissões sem documentação.

Não permitir acesso por ID sem validar Tenant.

---

# Checklist Final

Perfil definido?

Sim / Não

Permissões criadas?

Sim / Não

Backend protegido?

Sim / Não

Frontend protegido?

Sim / Não

Tenant validado?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O controle de acesso deverá estar seguro, previsível e preparado para evolução.

---

# Objetivo Final

Garantir que cada usuário do CRM tenha exatamente o nível de acesso necessário dentro do seu contexto correto.