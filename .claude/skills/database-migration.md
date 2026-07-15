---
name: database-migration
description: Procedimento padrão para criar, revisar e executar migrations Prisma no CRM, preservando integridade e permitindo rollback quando aplicável.
---

# Skill: Criar e Executar Migration de Banco

## Objetivo

Esta skill define o procedimento padrão para criação, revisão e execução de migrations utilizando Prisma ORM.

O objetivo é garantir evolução segura do banco de dados PostgreSQL.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar uma nova tabela;
- alterar uma tabela existente;
- adicionar campos;
- remover campos;
- alterar relacionamentos;
- criar índices;
- alterar enums.

---

# Responsáveis

Esta skill deve ser utilizada principalmente pelo:

- Database Agent.

Com validação de:

- Backend Agent;
- Security Agent;
- QA Agent.

---

# Documentos Obrigatórios

Antes de criar uma migration consultar:

- database-patterns.md
- database-agent.md
- multi-tenant.md
- architecture.md
- security.md
- definition-of-done.md

---

# Princípios

Toda migration deve ser:

- previsível;
- revisável;
- reversível quando possível;
- compatível com dados existentes.

---

# Etapa 1 - Analisar Alteração

Antes de modificar o banco responder:

## O que está mudando?

Exemplo:

Adicionar campo status em Lead.

---

## Por que precisa mudar?

Validar necessidade real.

---

## Existe impacto?

Avaliar:

- dados existentes;
- APIs;
- frontend;
- integrações.

---

# Etapa 2 - Avaliar Multi-Tenant

Toda alteração deve considerar:

- tenant_id;
- isolamento;
- dados existentes.

---

# Regra

Nenhuma migration pode criar estrutura que permita mistura de dados entre clientes.

---

# Etapa 3 - Alterar Schema Prisma

Modificar:

```
prisma/schema.prisma
```

Seguindo:

- nomenclatura padrão;
- relacionamentos;
- tipos corretos.

---

# Etapa 4 - Criar Migration

Executar:

```
prisma migrate dev
```

---

# Revisar SQL Gerado

Antes de aplicar validar:

- tabelas afetadas;
- comandos destrutivos;
- índices;
- constraints.

---

# Etapa 5 - Alterações Seguras

## Adicionar Campo

Preferir:

Adicionar campo opcional.

Depois:

Migrar dados.

Depois:

Tornar obrigatório.

---

# Remover Campo

Nunca remover diretamente.

Fluxo:

1. Identificar uso.
2. Remover dependências.
3. Migrar dados.
4. Remover coluna.

---

# Alterar Tipo

Avaliar:

- compatibilidade;
- conversão;
- dados existentes.

---

# Alterar Enum

Avaliar:

- registros existentes;
- compatibilidade da aplicação.

---

# Índices

Antes de criar índice avaliar:

- necessidade;
- frequência de consulta;
- impacto de escrita.

---

# Relacionamentos

Antes de alterar:

Validar:

- registros existentes;
- integridade referencial;
- comportamento esperado.

---

# Produção

Nunca executar:

alterações manuais no banco.

Toda alteração deve passar por:

Migration.

---

# Rollback

Quando possível definir:

- estratégia de reversão;
- recuperação de dados.

---

# Testes

Antes de considerar concluída:

Validar:

## Migration

Executa corretamente.

---

## Aplicação

Backend continua funcionando.

---

## Consultas

Queries continuam válidas.

---

## Multi-Tenant

Dados permanecem isolados.

---

# Comunicação

Após criar migration informar:

## Alteração realizada

-

## Tabelas afetadas

-

## Impactos

-

## Necessidade de atualização

-

---

# Não Fazer

Não editar banco manualmente.

Não apagar dados sem aprovação.

Não criar migration sem revisão.

Não ignorar dados existentes.

Não remover tenant_id.

---

# Checklist Final

Alteração analisada?

Sim / Não

Schema atualizado?

Sim / Não

Migration criada?

Sim / Não

SQL revisado?

Sim / Não

Testes executados?

Sim / Não

Impactos documentados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

A alteração do banco deverá estar pronta para evolução segura do CRM.

---

# Objetivo Final

Garantir que o banco PostgreSQL evolua de maneira controlada, segura e compatível com o crescimento da plataforma.