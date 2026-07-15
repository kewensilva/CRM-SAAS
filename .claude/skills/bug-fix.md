---
name: bug-fix
description: Processo padrão para investigar e corrigir bugs no CRM — identificar causa raiz, corrigir apenas a causa e validar impacto.
---

# Skill: Correção de Bugs

## Objetivo

Esta skill define o processo padrão para investigação e correção de bugs dentro do CRM.

O objetivo é garantir correções:

- seguras;
- rastreáveis;
- definitivas;
- alinhadas com a arquitetura existente.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- corrigir erros;
- resolver comportamentos inesperados;
- ajustar funcionalidades existentes;
- corrigir falhas de integração;
- resolver problemas de interface.

---

# Responsáveis

Esta skill pode envolver:

- Master Agent;
- Backend Agent;
- Frontend Agent;
- QA Agent;
- Security Agent.

---

# Documentos Obrigatórios

Antes de corrigir consultar:

- architecture.md
- review-code.md
- security.md
- error-patterns.md
- definition-of-done.md

---

# Princípio Principal

Nunca corrigir um bug sem entender a causa.

Fluxo:

```
Problema

↓

Investigação

↓

Causa raiz

↓

Correção

↓

Validação
```

---

# Etapa 1 - Identificação

Registrar:

## Problema

Descrição clara do erro.

---

## Ambiente

Identificar:

- desenvolvimento;
- homologação;
- produção.

---

## Impacto

Avaliar:

- usuários afetados;
- Tenants afetados;
- funcionalidades impactadas.

---

# Etapa 2 - Reprodução

Antes de corrigir:

Tentar reproduzir o problema.

Registrar:

- passos;
- entrada utilizada;
- resultado esperado;
- resultado atual.

---

# Etapa 3 - Investigação

Analisar:

## Frontend

Verificar:

- componentes;
- services;
- chamadas API;
- estados.

---

## Backend

Verificar:

- controllers;
- services;
- repositories;
- validações.

---

## Banco

Verificar:

- dados;
- migrations;
- relacionamentos.

---

## Integrações

Verificar:

- payload;
- autenticação;
- resposta externa.

---

# Etapa 4 - Encontrar Causa Raiz

Não corrigir somente:

"O erro apareceu aqui"

Investigar:

"Por que isso aconteceu?"

---

# Exemplos

Problema:

Lead duplicado.

Não corrigir apenas:

Adicionar filtro na tela.

Investigar:

- webhook duplicado;
- falta de idempotência;
- validação inexistente.

---

# Etapa 5 - Planejamento da Correção

Antes de alterar:

Definir:

- arquivos envolvidos;
- impacto;
- possíveis efeitos colaterais.

---

# Etapa 6 - Implementação

A correção deve seguir:

- arquitetura existente;
- padrões do projeto;
- segurança;
- Multi-Tenant.

---

# Backend

Não resolver problema colocando regra no Controller.

---

# Frontend

Não esconder erro apenas visualmente.

---

# Banco

Não alterar dados manualmente sem migration quando aplicável.

---

# Etapa 7 - Validação

Após corrigir:

Testar:

## Cenário original

O problema foi resolvido?

---

## Cenários relacionados

Nada foi quebrado?

---

## Segurança

Permissões continuam funcionando?

---

## Multi-Tenant

Dados continuam isolados?

---

# Etapa 8 - Revisão

Toda correção deve passar por:

```
review-code.md
```

---

# Logs e Erros

Quando necessário adicionar:

- logs;
- mensagens;
- tratamento de exceções.

---

# Não Fazer

Não alterar vários arquivos sem análise.

Não remover validações para "fazer funcionar".

Não ignorar testes.

Não criar soluções temporárias.

Não corrigir apenas sintomas.

---

# Correções Emergenciais

Em produção:

Priorizar:

1. Estabilidade.
2. Segurança.
3. Correção definitiva.

---

# Após Correção

Registrar:

## Problema

-

## Causa raiz

-

## Solução aplicada

-

## Arquivos alterados

-

## Testes realizados

-

---

# Checklist Final

Bug reproduzido?

Sim / Não

Causa raiz identificada?

Sim / Não

Correção planejada?

Sim / Não

Impactos avaliados?

Sim / Não

Testes realizados?

Sim / Não

Código revisado?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O bug estará corrigido sem comprometer a arquitetura e funcionamento existente do CRM.

---

# Objetivo Final

Garantir que correções sejam feitas de forma profissional, evitando regressões e evolução desorganizada do sistema.