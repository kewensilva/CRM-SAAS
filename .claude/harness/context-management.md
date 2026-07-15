# Gerenciamento de Contexto

## Objetivo

Este documento define como os agentes deverão gerenciar, consumir e preservar contexto durante o desenvolvimento do CRM.

O objetivo é garantir continuidade, consistência e preservação das decisões arquiteturais durante todo o ciclo de desenvolvimento.

---

# Princípio Fundamental

O contexto oficial do projeto está armazenado nos documentos do Harness.

Nenhum agente deverá depender apenas da memória da conversa atual.

Os documentos do projeto são a fonte oficial de verdade.

---

# Fonte de Verdade

A ordem de prioridade das informações deverá ser:

1. Documentação do Harness.
2. Código existente.
3. Documentação técnica complementar.
4. Solicitação atual do desenvolvedor.

Caso exista conflito entre informações, a documentação oficial possui prioridade.

---

# Leitura Obrigatória

Antes de iniciar qualquer tarefa, o agente deverá analisar os documentos relacionados ao contexto da alteração.

Exemplo:

Criar endpoint de Lead:

Ler:

- business-rules.md
- api-patterns.md
- database-patterns.md
- permissions.md
- security.md

---

# Não Assumir Contexto

O agente nunca deverá assumir:

- arquitetura;
- biblioteca;
- estrutura de pastas;
- regra de negócio;
- comportamento esperado.

Caso não exista definição, deverá solicitar esclarecimento.

---

# Contexto por Camadas

O projeto possui níveis de contexto.

## Contexto Global

Contém regras que afetam todo o projeto.

Exemplos:

- arquitetura;
- stack;
- segurança;
- padrões de código.

Local:

.claude/harness/

---

## Contexto de Módulo

Contém regras específicas de uma funcionalidade.

Exemplos:

- autenticação;
- leads;
- empresas;
- negociações.

Local:

modules/

---

## Contexto de Implementação

Contém informações específicas da tarefa atual.

Exemplos:

- arquivos envolvidos;
- objetivo;
- alterações esperadas.

---

# Ordem de Análise

O agente deverá seguir:

1. Entender a solicitação.
2. Identificar o módulo.
3. Consultar regras globais.
4. Consultar regras específicas.
5. Avaliar código existente.
6. Planejar alteração.
7. Implementar.

---

# Memória de Decisões

Decisões importantes deverão ser registradas.

Exemplos:

- mudança arquitetural aprovada;
- alteração de biblioteca;
- nova regra de negócio.

Local:

docs/decisions/

---

# Architecture Decision Records (ADR)

Decisões arquiteturais relevantes deverão utilizar ADR.

Formato:

ADR-001-titulo.md

Exemplo:

ADR-001-authentication-strategy.md

---

# Conteúdo de um ADR

Cada decisão deverá possuir:

Título

Data

Contexto

Problema

Alternativas avaliadas

Decisão escolhida

Consequências

---

# Alterações de Direção

Quando uma decisão antiga precisar ser alterada:

Não apagar a decisão anterior.

Criar uma nova decisão documentando a mudança.

---

# Sessões Longas

Em sessões extensas, o agente deverá manter um resumo atualizado contendo:

- objetivo atual;
- decisões tomadas;
- arquivos alterados;
- próximos passos.

---

# Evitar Perda de Contexto

Antes de continuar uma implementação interrompida:

O agente deverá verificar:

- estado atual do código;
- últimos arquivos alterados;
- documentação relacionada.

Nunca continuar assumindo que a implementação anterior terminou corretamente.

---

# Alteração de Documentação

Quando uma implementação alterar uma regra oficial:

A documentação deverá ser atualizada.

Código e documentação devem permanecer sincronizados.

---

# Contexto do Código

Antes de modificar um arquivo:

O agente deverá compreender:

- responsabilidade do arquivo;
- dependências;
- impacto da alteração.

---

# Contexto do Banco

Antes de alterar modelos:

Verificar:

- relacionamentos existentes;
- migrations anteriores;
- impacto nos dados.

---

# Contexto da API

Antes de criar ou alterar endpoints:

Verificar:

- padrões existentes;
- autenticação;
- permissões;
- formato de resposta.

---

# Contexto do Frontend

Antes de criar telas:

Verificar:

- componentes existentes;
- padrões visuais;
- serviços disponíveis;
- gerenciamento de estado.

---

# Proibição de Fragmentação

Não criar soluções isoladas que ignorem padrões existentes.

Toda implementação deve pertencer à arquitetura atual.

---

# Evolução Controlada

O projeto poderá evoluir.

Porém, toda evolução deverá ser registrada e incorporada ao contexto oficial.

---

# Objetivo Final

O conhecimento do projeto deve permanecer independente da sessão, ferramenta ou desenvolvedor.

O Harness representa a memória permanente do CRM.

Todo agente deverá consultar, respeitar e manter essa memória durante o desenvolvimento.