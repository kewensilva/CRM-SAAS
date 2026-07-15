---
name: authentication-flow
description: Procedimento para implementar, manter e evoluir o fluxo de autenticação do CRM (login, JWT, refresh token, recuperação de senha).
---

# Skill: Fluxo de Autenticação

## Objetivo

Esta skill define o procedimento padrão para implementação, manutenção e evolução do fluxo de autenticação do CRM.

O objetivo é garantir um fluxo seguro e consistente envolvendo:

- login;
- JWT;
- sessão;
- usuários;
- permissões;
- Multi-Tenant.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar login;
- alterar autenticação;
- criar sessão;
- implementar refresh token;
- alterar permissões;
- modificar controle de acesso.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Backend Agent;
- Frontend Agent;
- Security Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de implementar consultar:

- security.md
- permissions.md
- multi-tenant.md
- architecture.md
- api-patterns.md

---

# Princípios

A autenticação deve seguir:

- segurança;
- simplicidade;
- rastreabilidade;
- menor privilégio.

---

# Conceitos

## Usuário

Pessoa que acessa o sistema.

---

## Tenant

Empresa cliente dentro do CRM.

---

## Owner

Empresa proprietária da plataforma.

Exemplo:

CMB.

---

## Usuário

Sempre deve estar associado ao contexto correto.

---

# Fluxo Geral

```
Usuário

↓

Login

↓

Validação de credenciais

↓

Identificação Tenant

↓

Geração Token

↓

Acesso ao CRM
```

---

# Login

Endpoint esperado:

```
POST /api/v1/auth/login
```

---

# Dados de Entrada

Exemplo:

```json
{
    "email": "usuario@email.com",
    "password": "senha"
}
```

---

# Validações

Antes do login validar:

- email informado;
- senha informada;
- usuário existente;
- usuário ativo.

---

# Senha

Nunca:

- armazenar senha pura;
- retornar senha;
- registrar senha em logs.

---

# Hash

Utilizar mecanismo seguro de hash.

Exemplo:

bcrypt.

---

# JWT

O token deverá possuir informações necessárias para identificar:

- usuário;
- Tenant;
- permissões básicas.

---

# Payload JWT

Exemplo:

```json
{
    "sub": "user-id",
    "tenant_id": "tenant-id",
    "role": "admin"
}
```

---

# Nunca colocar no JWT

Não armazenar:

- dados sensíveis;
- informações que mudam constantemente;
- permissões complexas.

---

# Expiração

Tokens devem possuir tempo de validade definido.

---

# Refresh Token

Quando implementado:

Deve permitir renovação segura da sessão.

---

# Logout

O fluxo deve permitir encerramento de sessão.

Validar:

- remoção de sessão;
- invalidação quando aplicável.

---

# Backend

Responsabilidades:

- validar credenciais;
- gerar tokens;
- validar sessão;
- proteger endpoints.

---

# Middleware de Autenticação

Rotas protegidas devem validar:

- token existente;
- token válido;
- usuário ativo.

---

# Frontend Angular

Responsabilidades:

- armazenar sessão;
- enviar token;
- controlar navegação;
- proteger rotas.

---

# Interceptor

O Angular deverá utilizar interceptor para:

Adicionar:

```
Authorization: Bearer TOKEN
```

---

# Guards

Utilizar guards para:

- rotas privadas;
- permissões;
- perfil.

---

# Expiração de Sessão

Quando token expirar:

O frontend deverá:

- limpar sessão;
- redirecionar usuário;
- informar necessidade de login.

---

# Multi-Tenant

Durante autenticação sempre validar:

Usuário pertence ao Tenant correto.

---

# Regra Crítica

Um usuário nunca pode:

- trocar tenant manualmente;
- acessar outro cliente;
- alterar contexto pelo frontend.

---

# Permissões

Após autenticação validar:

- perfil;
- permissões;
- funcionalidades disponíveis.

---

# Controle de Acesso

A autenticação responde:

"Quem é o usuário?"

A autorização responde:

"O que ele pode fazer?"

---

# Segurança

Validar:

- tentativas inválidas;
- sessão expirada;
- tokens inválidos;
- acessos suspeitos.

---

# Logs

Registrar:

- login realizado;
- falha de autenticação;
- logout.

Nunca registrar:

- senha;
- token completo.

---

# Testes

Validar:

## Login válido

Usuário acessa corretamente.

---

## Login inválido

Acesso bloqueado.

---

## Token inválido

Rejeitado.

---

## Token expirado

Sessão encerrada.

---

## Multi-Tenant

Usuário não acessa outro cliente.

---

# Não Fazer

Não confiar no frontend.

Não colocar senha em logs.

Não criar autenticação paralela.

Não ignorar Tenant.

---

# Checklist Final

Login implementado?

Sim / Não

JWT funcionando?

Sim / Não

Permissões aplicadas?

Sim / Não

Tenant validado?

Sim / Não

Frontend protegido?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O fluxo de autenticação deverá estar seguro, integrado e preparado para o modelo Multi-Tenant.

---

# Objetivo Final

Garantir que todos os usuários acessem somente os recursos permitidos dentro do seu contexto correto no CRM.