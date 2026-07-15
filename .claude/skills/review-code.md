---
name: review-code
description: Procedimento padrão para revisar código no CRM quanto a arquitetura, padrões, segurança e qualidade antes de considerar uma entrega concluída.
---

# Skill: Revisar Código

## Objetivo

Esta skill define o procedimento padrão para revisão de código dentro do CRM.

O objetivo é garantir que toda implementação siga:

- arquitetura definida;
- padrões técnicos;
- segurança;
- qualidade;
- manutenção futura.

---

# Quando Utilizar

Utilizar esta skill quando:

- uma funcionalidade foi implementada;
- um módulo foi criado;
- um endpoint foi alterado;
- uma integração foi adicionada;
- um refactor foi realizado.

---

# Responsáveis

Esta skill pode ser utilizada por:

- Master Agent;
- QA Agent;
- Security Agent;
- Backend Agent;
- Frontend Agent.

---

# Documentos Obrigatórios

Antes da revisão consultar:

- architecture.md
- code-style.md
- security.md
- permissions.md
- api-patterns.md
- database-patterns.md
- definition-of-done.md

---

# Processo de Revisão

A revisão deve seguir:

1. Entender objetivo da alteração.
2. Analisar arquitetura.
3. Avaliar implementação.
4. Identificar riscos.
5. Solicitar ajustes quando necessário.

---

# 1. Revisão Arquitetural

Validar:

A implementação segue a arquitetura definida?

Sim / Não

---

Verificar:

- responsabilidades separadas;
- baixo acoplamento;
- organização correta;
- ausência de atalhos.

---

# 2. Estrutura de Código

Avaliar:

## Backend

Verificar:

- Controller separado;
- Service responsável pela regra;
- Repository responsável pelo banco.

---

## Frontend

Verificar:

- componentes organizados;
- services separados;
- models tipados.

---

# 3. Regras de Negócio

Validar:

As regras estão no local correto?

Exemplo:

Errado:

Controller contendo regras.

Correto:

Service contendo regras.

---

# 4. Multi-Tenant

Requisito obrigatório.

Verificar:

Toda operação considera:

```
tenant_id
```

---

Validar:

Usuário de um Tenant não consegue acessar dados de outro.

---

# 5. Segurança

Avaliar:

## Autenticação

Existe proteção quando necessária?

---

## Autorização

Permissões foram aplicadas?

---

## Dados

Informações sensíveis estão protegidas?

---

# 6. Banco de Dados

Verificar:

- migrations;
- relacionamentos;
- índices;
- consultas.

---

Avaliar:

Existe risco de:

- duplicidade;
- perda de dados;
- baixa performance.

---

# 7. API

Validar:

- padrão REST;
- nomes de endpoints;
- respostas;
- códigos HTTP;
- tratamento de erros.

---

# 8. Código Duplicado

Identificar:

- funções repetidas;
- componentes duplicados;
- regras copiadas.

---

Quando encontrar duplicação:

Avaliar criação de:

- helper;
- service;
- componente compartilhado.

---

# 9. Complexidade

Evitar:

- código excessivamente complexo;
- abstrações prematuras;
- soluções difíceis de entender.

---

# 10. TypeScript

Validar:

Evitar:

```
any
```

Preferir:

- interfaces;
- tipos;
- contratos explícitos.

---

# 11. Tratamento de Erros

Verificar:

- erros tratados;
- mensagens claras;
- logs adequados.

---

# 12. Performance

Avaliar:

Backend:

- consultas desnecessárias;
- N+1 queries;
- falta de índices.

Frontend:

- renderizações excessivas;
- chamadas duplicadas.

---

# 13. Testes

Verificar:

Existe cobertura para:

- fluxo principal;
- erros;
- permissões;
- Tenant.

---

# Resultado da Revisão

A revisão deve retornar:

## Status

Aprovado

ou

Necessita ajustes

---

# Relatório

Formato:

```
Status:

Aprovado / Necessita ajustes


Pontos positivos:

-


Problemas encontrados:

-


Ajustes necessários:

-
```

---

# Bloqueadores

A implementação não deve ser aprovada quando existir:

- falha de segurança;
- quebra de Multi-Tenant;
- perda de dados;
- arquitetura comprometida;
- código impossível de manter.

---

# Não Fazer

Não aprovar apenas porque:

- compilou;
- passou no teste básico;
- funciona localmente.

---

# Critério de Conclusão

O código pode ser aprovado quando:

- arquitetura respeitada;
- segurança validada;
- padrões seguidos;
- testes executados;
- manutenção futura garantida.

---

# Objetivo Final

Garantir que o CRM evolua rapidamente através do Codex sem perder qualidade, organização e segurança.