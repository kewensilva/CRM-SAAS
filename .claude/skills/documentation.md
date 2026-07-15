---
name: documentation
description: Processo padrão para criar, atualizar e manter a documentação técnica e funcional do CRM sincronizada com o código.
---

# Skill: Documentação do Projeto

## Objetivo

Esta skill define o processo padrão para criação, atualização e manutenção da documentação técnica e funcional do CRM.

O objetivo é garantir que a evolução da plataforma seja documentada e compreensível.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar uma nova funcionalidade;
- alterar arquitetura;
- criar endpoints;
- modificar regras de negócio;
- alterar integrações;
- tomar decisões técnicas importantes.

---

# Responsáveis

Esta skill pode envolver:

- Master Agent;
- Backend Agent;
- Frontend Agent;
- QA Agent.

---

# Documentos Obrigatórios

Antes de documentar consultar:

- architecture.md
- business-rules.md
- api-patterns.md
- database-patterns.md
- definition-of-done.md

---

# Princípio Principal

A documentação deve explicar:

- o que existe;
- como funciona;
- por que foi criado dessa forma.

---

# Tipos de Documentação

O projeto deve possuir:

```
Documentação Arquitetural

Documentação Técnica

Documentação de API

Documentação Funcional

Documentação de Decisões
```

---

# Documentação Arquitetural

Responsável por explicar:

- estrutura geral;
- tecnologias;
- padrões;
- organização dos módulos.

Arquivo principal:

```
architecture.md
```

---

# Documentação Técnica

Deve explicar:

- módulos;
- responsabilidades;
- fluxos internos;
- integrações.

---

# Documentação de API

Toda API deve possuir documentação contendo:

- endpoint;
- método HTTP;
- parâmetros;
- resposta;
- erros possíveis.

---

# Exemplo

```
POST /api/v1/leads
```

Documentar:

Entrada:

```
LeadCreateDTO
```

Resposta:

```
LeadResponse
```

---

# Documentação Funcional

Descrever:

- objetivo da funcionalidade;
- usuários envolvidos;
- regras de negócio.

---

# Exemplos

Módulo Leads:

Documentar:

- criação;
- alteração;
- status;
- permissões.

---

# Decisões Técnicas

Decisões importantes devem ser registradas.

Exemplo:

```
ADR

Architecture Decision Record
```

---

# Quando Criar uma Decisão

Criar quando houver:

- mudança arquitetural;
- escolha tecnológica;
- alteração de padrão.

---

# Estrutura ADR

Exemplo:

```
Título:

Contexto:

Decisão:

Motivo:

Impacto:
```

---

# Atualização Obrigatória

Quando uma funcionalidade for concluída:

Atualizar:

- documentação técnica;
- endpoints;
- regras relacionadas.

---

# Código e Documentação

A documentação não deve substituir código claro.

O código deve continuar:

- legível;
- organizado;
- autoexplicativo.

---

# Módulos

Cada módulo importante deve possuir documentação contendo:

```
Objetivo

Responsabilidades

Entidades

Endpoints

Permissões

Fluxos
```

---

# Integrações

Toda integração deve documentar:

- plataforma;
- autenticação;
- payload;
- eventos;
- erros.

---

# Banco de Dados

Alterações relevantes devem documentar:

- novas tabelas;
- relacionamentos;
- motivos da alteração.

---

# Multi-Tenant

Sempre documentar:

- impacto no Tenant;
- isolamento;
- regras de acesso.

---

# Frontend Angular

Documentar:

- páginas;
- componentes importantes;
- fluxos;
- permissões.

---

# Manutenção

A documentação deve acompanhar o código.

Código alterado:

↓

Documentação avaliada.

---

# Não Fazer

Não criar documentação genérica.

Não documentar apenas o funcionamento óbvio.

Não deixar decisões importantes apenas no código.

Não criar documentos desatualizados.

---

# Checklist Final

Funcionalidade documentada?

Sim / Não

Endpoints documentados?

Sim / Não

Regras documentadas?

Sim / Não

Decisões registradas?

Sim / Não

Arquitetura atualizada?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O CRM possuirá documentação viva acompanhando sua evolução.

---

# Objetivo Final

Garantir que o conhecimento do projeto permaneça organizado e acessível durante todo o ciclo de desenvolvimento.