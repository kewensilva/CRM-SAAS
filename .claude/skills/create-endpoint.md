---
name: create-endpoint
description: Procedimento padrão para criar um novo endpoint REST no CRM seguindo api-patterns.md (validação, controller, service, repository, autenticação, autorização).
---

# Skill: Criar Endpoint API

## Objetivo

Esta skill define o procedimento padrão para criação de novos endpoints REST dentro do CRM.

O objetivo é garantir que todos os endpoints sigam:

- arquitetura definida;
- padrões HTTP;
- segurança;
- validações;
- isolamento Multi-Tenant;
- contratos consistentes.

---

# Quando Utilizar

Utilizar esta skill quando for necessário criar:

- novos recursos da API;
- novas operações CRUD;
- novos endpoints internos;
- novos endpoints para integrações.

Exemplos:

- criar Lead;
- listar Empresas;
- atualizar Usuário;
- alterar Configuração.

---

# Pré-requisitos

Antes de iniciar:

Consultar:

- api-patterns.md
- backend-agent.md
- security.md
- permissions.md
- database-patterns.md
- error-patterns.md

---

# Etapa 1 - Definir Contrato

Antes de criar código definir:

## Recurso

Exemplo:

Lead

---

## Método HTTP

Escolher:

GET

POST

PUT

PATCH

DELETE

---

## Endpoint

Seguir padrão:

```
/api/v1/recurso
```

Exemplo:

```
POST /api/v1/leads
```

---

# Etapa 2 - Definir Entrada

Definir:

Body.

Params.

Query.

Headers.

---

# Exemplo

Request:

```json
{
    "name": "João",
    "email": "joao@email.com"
}
```

---

# Etapa 3 - Criar Validator

Toda entrada externa deverá possuir validação.

Utilizar:

Zod

Validar:

- campos obrigatórios;
- formatos;
- limites;
- regras básicas.

---

# Etapa 4 - Criar DTO

Criar tipos responsáveis pela comunicação.

Exemplo:

```
CreateLeadDTO
```

DTOs não devem possuir regras de negócio.

---

# Etapa 5 - Implementar Repository

O Repository será responsável pelo acesso ao banco.

Pode conter:

- create;
- find;
- update;
- delete lógico.

Não deve conter:

- permissões;
- regras de negócio.

---

# Etapa 6 - Implementar Service

O Service deverá:

- aplicar regras de negócio;
- validar operações;
- controlar fluxo.

Exemplo:

Criar Lead:

1. Validar Tenant.
2. Verificar duplicidade.
3. Criar registro.
4. Gerar evento.

---

# Etapa 7 - Criar Controller

O Controller deverá:

Receber:

- request;
- usuário autenticado;
- contexto Tenant.

Executar:

- validação;
- chamada do Service.

Retornar:

- resposta padronizada.

---

# Etapa 8 - Registrar Route

Registrar endpoint:

Exemplo:

```
router.post(
"/leads",
authMiddleware,
permissionMiddleware,
controller
)
```

---

# Etapa 9 - Segurança

Antes de finalizar validar:

## Autenticação

Usuário autenticado?

---

## Autorização

Possui permissão?

---

## Multi-Tenant

Está filtrando por:

```
tenant_id
```

---

# Etapa 10 - Tratamento de Erros

Nunca retornar erro diretamente.

Utilizar padrão:

error-patterns.md

---

# Respostas

Toda resposta deverá seguir:

## Sucesso

```json
{
    "success": true,
    "data": {},
    "message": ""
}
```

---

## Erro

```json
{
    "success": false,
    "message": "",
    "errors": []
}
```

---

# Etapa 11 - Documentação

Registrar:

- método;
- rota;
- parâmetros;
- body;
- respostas;
- erros possíveis.

---

# Etapa 12 - Testes

Criar testes:

## Cenário positivo

Endpoint funciona corretamente.

---

## Validação

Dados inválidos são rejeitados.

---

## Segurança

Usuário sem permissão é bloqueado.

---

## Multi-Tenant

Usuário não acessa dados de outro Tenant.

---

# Checklist Final

Antes de concluir:

Endpoint possui contrato definido?

Sim / Não

Validator criado?

Sim / Não

DTO criado?

Sim / Não

Repository criado?

Sim / Não

Service criado?

Sim / Não

Controller criado?

Sim / Não

Permissões aplicadas?

Sim / Não

Tenant validado?

Sim / Não

Testes realizados?

Sim / Não

---

# Não Fazer

Não criar endpoint sem:

- autenticação quando necessário;
- validação;
- tratamento de erro;
- isolamento Tenant.

Não colocar regra de negócio no Controller.

Não acessar Prisma diretamente.

---

# Resultado Esperado

Ao finalizar esta skill:

O endpoint deverá possuir:

- contrato definido;
- validações;
- implementação backend;
- segurança aplicada;
- documentação;
- testes.

---

# Objetivo Final

Garantir que todos os endpoints do CRM sejam consistentes, seguros e fáceis de manter.