---
name: deployment
description: Procedimento padrão para configurar, preparar e publicar o CRM nos ambientes de desenvolvimento, homologação e produção.
---

# Skill: Deployment e Ambientes

## Objetivo

Esta skill define o procedimento padrão para configuração, preparação e publicação do CRM nos ambientes de desenvolvimento, homologação e produção.

O objetivo é garantir deploys seguros, previsíveis e repetíveis.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- configurar ambiente;
- preparar produção;
- criar pipeline;
- publicar versão;
- alterar infraestrutura;
- atualizar dependências.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Master Agent;
- Backend Agent;
- Frontend Agent.

Com validação do:

- Security Agent;
- QA Agent.

---

# Documentos Obrigatórios

Antes de realizar deploy consultar:

- architecture.md
- security.md
- database-migration.md
- review-code.md
- definition-of-done.md

---

# Ambientes

O CRM deve possuir ambientes separados.

---

# Desenvolvimento

Objetivo:

Ambiente utilizado pelos desenvolvedores.

Características:

- dados locais;
- logs detalhados;
- ferramentas de debug.

---

# Homologação

Objetivo:

Validar funcionalidades antes da produção.

Características:

- configuração próxima da produção;
- banco separado;
- testes finais.

---

# Produção

Objetivo:

Ambiente utilizado pelos clientes.

Características:

- segurança ativada;
- logs controlados;
- sem debug.

---

# Estrutura Geral

```
Frontend Angular

        ↓

Backend Node.js API

        ↓

PostgreSQL

        ↓

Serviços externos
```

---

# Backend

Antes do deploy validar:

- build TypeScript;
- variáveis configuradas;
- migrations aplicadas;
- dependências instaladas.

---

# Processo

Fluxo:

```
Código

↓

Build

↓

Testes

↓

Migration

↓

Deploy

↓

Validação
```

---

# Frontend Angular

Antes do deploy validar:

- build de produção;
- variáveis de ambiente;
- URLs da API;
- assets.

---

# Banco de Dados

Antes de atualizar:

Validar:

- migrations pendentes;
- impacto;
- backup.

---

# Prisma

Toda alteração de banco deve ocorrer através de migration.

Nunca alterar produção manualmente.

---

# Variáveis de Ambiente

Nunca versionar:

- senhas;
- tokens;
- credenciais.

---

# Exemplos

Backend:

```
DATABASE_URL

JWT_SECRET

API_URL
```

Frontend:

```
API_URL
```

---

# Segurança

Produção deve possuir:

- HTTPS;
- CORS configurado;
- headers seguros;
- logs protegidos.

---

# Secrets

Credenciais devem ser armazenadas utilizando mecanismo seguro.

Nunca:

- dentro do código;
- dentro do Git;
- dentro de arquivos públicos.

---

# Docker

Quando utilizado:

Garantir:

- imagens versionadas;
- containers isolados;
- configuração reproduzível.

---

# Banco

O container do banco deve possuir:

- persistência;
- backup;
- controle de acesso.

---

# Logs

Produção deve registrar:

- erros;
- eventos importantes;
- falhas de integração.

Não registrar:

- senha;
- tokens;
- dados sensíveis.

---

# Rollback

Todo deploy deve possuir estratégia de retorno.

Considerar:

- versão anterior;
- migration;
- compatibilidade.

---

# Versionamento

Toda alteração publicada deve possuir:

- versão;
- histórico;
- descrição.

---

# Deploy do Backend

Checklist:

Build executado?

Sim / Não

Testes executados?

Sim / Não

Variáveis configuradas?

Sim / Não

Migration aplicada?

Sim / Não

---

# Deploy Frontend

Checklist:

Build realizado?

Sim / Não

API configurada?

Sim / Não

Rotas funcionando?

Sim / Não

---

# Validação Pós Deploy

Testar:

- login;
- autenticação;
- carregamento do sistema;
- criação de Lead;
- integração externa;
- permissões.

---

# Multi-Tenant

Após deploy validar:

Tenant A funciona.

Tenant B funciona.

Dados permanecem isolados.

---

# Não Fazer

Não publicar sem testes.

Não executar migration manual.

Não utilizar credenciais no código.

Não ignorar rollback.

Não misturar ambientes.

---

# Checklist Final

Ambiente correto?

Sim / Não

Build aprovado?

Sim / Não

Banco atualizado?

Sim / Não

Segurança validada?

Sim / Não

Testes realizados?

Sim / Não

Rollback definido?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O CRM deverá estar preparado para publicação segura e manutenção contínua.

---

# Objetivo Final

Garantir que novas versões sejam entregues com segurança, previsibilidade e baixo risco para os clientes da plataforma.