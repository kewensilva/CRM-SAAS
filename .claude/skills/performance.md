---
name: performance
description: Padrões para analisar e melhorar performance do CRM, medindo antes de otimizar e evitando otimização prematura.
---

# Skill: Performance e Otimização

## Objetivo

Esta skill define os padrões para desenvolvimento, análise e melhoria de performance do CRM.

O objetivo é garantir uma aplicação:

- rápida;
- eficiente;
- previsível;
- sustentável.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar funcionalidades;
- otimizar consultas;
- melhorar carregamento;
- analisar lentidão;
- revisar código.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Backend Agent;
- Frontend Agent;
- Database Agent.

Com validação do:

- QA Agent.

---

# Documentos Obrigatórios

Antes de realizar otimizações consultar:

- architecture.md
- database-patterns.md
- api-patterns.md
- testing-strategy.md
- review-code.md

---

# Princípio Principal

Performance deve ser planejada desde a criação.

Não esperar problemas para otimizar.

---

# Fluxo de Avaliação

```
Identificar problema

↓

Medir impacto

↓

Encontrar causa

↓

Aplicar melhoria

↓

Validar resultado
```

---

# Backend Performance

Priorizar:

- APIs rápidas;
- baixo processamento desnecessário;
- consultas eficientes.

---

# Controllers

Controllers devem ser leves.

Não colocar:

- consultas complexas;
- processamento pesado;
- regras extensas.

---

# Services

Responsáveis por organizar processamento.

Avaliar:

- complexidade;
- chamadas repetidas;
- operações desnecessárias.

---

# Repository

Priorizar:

- queries eficientes;
- filtros adequados;
- uso correto do ORM.

---

# Prisma

Evitar:

Consultas retornando dados desnecessários.

---

# Exemplo

Evitar:

Buscar todos os campos.

Preferir:

Selecionar apenas necessários.

---

# Paginação

Toda listagem com possibilidade de crescimento deve utilizar paginação.

Exemplo:

```
page

limit
```

---

# Casos Obrigatórios

Aplicar paginação em:

- Leads;
- Usuários;
- Auditoria;
- Relatórios.

---

# Banco de Dados

Avaliar:

- índices;
- relacionamentos;
- filtros frequentes.

---

# Índices

Criar índices quando houver:

- busca frequente;
- filtros recorrentes;
- ordenações.

---

# Multi-Tenant

Considerar consultas:

```
tenant_id
```

---

# Performance por Tenant

Consultas devem sempre filtrar corretamente:

```
WHERE tenant_id = X
```

---

# Evitar

Consultar todos os Tenants quando apenas um é necessário.

---

# Frontend Angular

Priorizar:

- carregamento rápido;
- componentes leves;
- poucas chamadas.

---

# Componentes

Evitar:

- componentes gigantes;
- lógica excessiva;
- múltiplas responsabilidades.

---

# Lazy Loading

Aplicar quando necessário.

Exemplo:

Módulos administrativos.

---

# Requisições HTTP

Evitar:

- chamadas duplicadas;
- chamadas desnecessárias;
- carregamentos repetidos.

---

# Estados de Interface

Sempre tratar:

- loading;
- vazio;
- erro.

---

# Listagens

Telas com muitos dados devem possuir:

- paginação;
- filtros;
- busca.

---

# APIs

Evitar respostas grandes.

---

# Respostas devem conter:

Somente dados necessários.

---

# Cache

Avaliar quando necessário.

Exemplos:

- configurações do Tenant;
- informações pouco alteradas.

---

# Não Aplicar Cache Sem Avaliação

Cache incorreto pode gerar:

- dados antigos;
- inconsistências.

---

# Integrações Externas

Controlar:

- tempo de resposta;
- falhas;
- tentativas.

---

# Logs

Não gerar excesso de logs em produção.

Registrar:

- erros;
- eventos importantes.

---

# Monitoramento

Quando necessário acompanhar:

- tempo de resposta;
- erros;
- consultas lentas.

---

# Testes de Performance

Realizar quando houver:

- mudanças críticas;
- alterações de banco;
- grandes consultas.

---

# Métricas Importantes

Avaliar:

## API

Tempo de resposta.

---

## Banco

Tempo das queries.

---

## Frontend

Tempo de carregamento.

---

# Não Fazer

Não otimizar sem medir.

Não criar complexidade prematura.

Não remover validações por performance.

Não ignorar segurança.

---

# Checklist Final

Consultas avaliadas?

Sim / Não

Paginação aplicada?

Sim / Não

Tenant considerado?

Sim / Não

Frontend validado?

Sim / Não

Impacto medido?

Sim / Não

Testes realizados?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

O CRM manterá boa performance mesmo com evolução da plataforma.

---

# Objetivo Final

Garantir uma aplicação rápida, estável e preparada para crescimento sem criar complexidade desnecessária.