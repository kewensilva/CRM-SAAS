---
name: create-prisma-model
description: Procedimento padrão para criar ou alterar modelos Prisma seguindo database-patterns.md (UUID, snake_case, tenant_id, auditoria, soft delete).
---

# Skill: Criar Modelo Prisma

## Objetivo

Esta skill define o procedimento padrão para criação ou alteração de modelos utilizando Prisma ORM.

O objetivo é garantir que todas as entidades do CRM possuam:

- modelagem correta;
- isolamento Multi-Tenant;
- relacionamentos consistentes;
- migrations seguras;
- estrutura preparada para evolução.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar uma nova entidade;
- alterar uma entidade existente;
- adicionar campos;
- criar relacionamentos;
- criar enums;
- ajustar índices.

Exemplos:

- Lead;
- Empresa;
- Usuário;
- Pipeline;
- Negociação.

---

# Pré-requisitos

Antes de iniciar consultar:

- database-patterns.md
- architecture.md
- multi-tenant.md
- business-rules.md
- database-agent.md

---

# Etapa 1 - Análise da Entidade

Antes de criar um model definir:

Nome da entidade.

Responsabilidade.

Relacionamentos.

Campos necessários.

Regras associadas.

---

# Etapa 2 - Avaliação Multi-Tenant

Toda entidade relacionada ao negócio deverá avaliar:

Possui dados específicos de cliente?

Se sim:

Adicionar:

```
tenant_id
```

---

# Regra

Dados de um Tenant nunca podem existir sem identificação de origem.

---

# Etapa 3 - Definição dos Campos

Cada campo deve possuir:

Nome.

Tipo.

Obrigatoriedade.

Valor padrão.

Índice quando necessário.

---

# Convenções

Utilizar:

snake_case

Exemplo:

Correto:

```
created_at
updated_at
tenant_id
```

Evitar:

```
createdAt
tenantId
```

---

# Campos Padrão

Avaliar inclusão:

```
id

tenant_id

created_at

updated_at

deleted_at
```

---

# Identificador

Utilizar:

UUID

Exemplo:

```prisma
id String @id @default(uuid())
```

---

# Soft Delete

Quando aplicável utilizar:

```
deleted_at
```

Nunca remover registros importantes sem análise.

---

# Etapa 4 - Relacionamentos

Antes de criar relacionamentos avaliar:

Cardinalidade.

Obrigatoriedade.

Dependência.

---

# Exemplos

Um Tenant possui vários Leads:

```
Tenant 1:N Lead
```

Uma Empresa possui vários Usuários:

```
Company 1:N User
```

---

# Etapa 5 - Índices

Criar índices quando existir necessidade.

Avaliar:

- buscas frequentes;
- filtros;
- ordenações;
- relacionamentos.

---

# Multi-Tenant Index

Quando aplicável utilizar índice composto:

Exemplo:

```
tenant_id + email
```

---

# Campos Únicos

Antes de criar UNIQUE analisar contexto.

Exemplo:

Evitar:

```
email UNIQUE global
```

quando o correto é:

```
tenant_id + email
```

---

# Etapa 6 - Enums

Criar enums quando:

- valores são limitados;
- representam estados fixos.

Exemplo:

```
LeadStatus

NEW
CONTACTED
CONVERTED
LOST
```

---

# Evitar Enums

Não criar enums para valores que podem mudar frequentemente.

---

# Etapa 7 - Atualização Prisma

Após definir o model:

Atualizar:

```
schema.prisma
```

---

# Etapa 8 - Migration

Criar migration:

```
prisma migrate dev
```

Validar:

- SQL gerado;
- alterações;
- impacto.

---

# Etapa 9 - Validação

Verificar:

Relacionamentos corretos?

Sim / Não

Tenant aplicado?

Sim / Não

Índices avaliados?

Sim / Não

Migration criada?

Sim / Não

---

# Alteração de Modelo Existente

Antes de alterar:

Avaliar:

- dados existentes;
- impacto;
- compatibilidade.

---

# Remoção de Campos

Nunca remover diretamente.

Antes:

- verificar utilização;
- migrar dados;
- documentar.

---

# Testes

Validar:

- migration executa;
- consultas funcionam;
- relacionamentos funcionam;
- isolamento Tenant funciona.

---

# Não Fazer

Não criar tabela sem análise.

Não remover dados automaticamente.

Não ignorar tenant_id.

Não criar relacionamento sem necessidade.

Não alterar produção manualmente.

---

# Resultado Esperado

Ao finalizar esta skill:

O modelo deverá possuir:

- estrutura correta;
- migration criada;
- relacionamentos definidos;
- segurança Multi-Tenant;
- compatibilidade com arquitetura.

---

# Objetivo Final

Garantir que toda evolução do banco do CRM aconteça de forma segura, organizada e sustentável.