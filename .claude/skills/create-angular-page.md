---
name: create-angular-page
description: Procedimento padrão para criar novas páginas na aplicação Angular do CRM (model, service, componente, formulário, integração com API).
---

# Skill: Criar Página Angular

## Objetivo

Esta skill define o procedimento padrão para criação de novas páginas dentro da aplicação Angular do CRM.

O objetivo é garantir que todas as páginas sigam:

- arquitetura frontend;
- padrões Angular;
- integração correta com API;
- segurança;
- experiência consistente.

---

# Quando Utilizar

Utilizar esta skill quando for necessário criar:

- nova tela;
- novo módulo visual;
- nova área administrativa;
- nova funcionalidade de usuário.

Exemplos:

- Dashboard;
- Leads;
- Empresas;
- Usuários;
- Configurações.

---

# Pré-requisitos

Antes de iniciar consultar:

- frontend-agent.md
- architecture.md
- permissions.md
- security.md
- api-patterns.md
- folder-structure.md

---

# Etapa 1 - Análise da Página

Definir:

Nome da página.

Objetivo.

Usuários que terão acesso.

Dados necessários.

APIs utilizadas.

Permissões necessárias.

---

# Etapa 2 - Identificar Feature

Toda página deverá pertencer a uma feature.

Exemplo:

```
features/

leads/

pages/

lead-list/
```

---

# Etapa 3 - Criar Estrutura

Estrutura esperada:

```
feature/

├── pages/
│
│   └── nome-da-page/
│
│       ├── nome-da-page.component.ts
│       ├── nome-da-page.component.html
│       └── nome-da-page.component.scss
│
├── components/
├── services/
├── models/
└── routes.ts
```

---

# Etapa 4 - Criar Component

O componente deverá possuir:

- responsabilidade clara;
- baixo acoplamento;
- código simples.

Evitar:

componentes gigantes.

---

# Etapa 5 - Criar Model

Todos os dados da API devem possuir tipagem.

Exemplo:

```
Lead
Company
User
```

Evitar:

```
any
```

---

# Etapa 6 - Criar Service

Toda comunicação HTTP deverá ocorrer através de services.

Componentes não devem chamar API diretamente.

---

# Service deve:

- consumir endpoint;
- tratar comunicação;
- retornar dados tipados.

---

# Service não deve:

- controlar layout;
- manipular DOM;
- conter regras de negócio.

---

# Etapa 7 - Criar Rota

Toda página deverá possuir rota definida.

Exemplo:

```
/leads
```

---

# Rotas Protegidas

Quando necessário utilizar:

- Auth Guard;
- Permission Guard.

---

# Etapa 8 - Controle de Permissões

Antes de disponibilizar a página validar:

Quem pode acessar?

Exemplo:

Admin:

Sim

Colaborador:

Não

---

# Etapa 9 - Comunicação com API

Ao consumir dados:

Tratar:

- carregamento;
- sucesso;
- vazio;
- erro.

---

# Estados Obrigatórios

Toda página deverá considerar:

## Loading

Usuário sabe que existe processamento.

---

## Empty State

Quando não existem dados.

---

## Error State

Quando ocorre falha.

---

# Etapa 10 - Formulários

Quando existir formulário utilizar:

Reactive Forms

Implementar:

- validações;
- mensagens;
- estados;
- submit seguro.

---

# Etapa 11 - Layout

Toda página deve respeitar:

- padrão visual;
- componentes compartilhados;
- responsividade.

---

# Multi-Tenant

A página deverá respeitar:

- Tenant atual;
- permissões do usuário;
- configurações visuais.

---

# Personalização Visual

Nunca criar regras específicas:

Exemplo proibido:

```
if(cliente === "CMB")
```

---

# Utilizar:

Configuração carregada do Tenant.

Exemplos:

- logo;
- cores;
- nome;
- identidade visual.

---

# Performance

Avaliar:

- carregamento sob demanda;
- componentes reutilizáveis;
- chamadas desnecessárias.

---

# Testes

Validar:

## Acesso

Usuário autorizado acessa.

---

## Bloqueio

Usuário sem permissão não acessa.

---

## API

Dados carregados corretamente.

---

## Erros

Falhas exibidas corretamente.

---

# Checklist Final

Antes de concluir:

Página criada?

Sim / Não

Rota configurada?

Sim / Não

Guard aplicado?

Sim / Não

Service criado?

Sim / Não

Models criados?

Sim / Não

Estados tratados?

Sim / Não

Responsividade validada?

Sim / Não

---

# Não Fazer

Não criar chamada HTTP dentro do componente.

Não duplicar componentes existentes.

Não criar regra de negócio no frontend.

Não ignorar permissões.

Não criar personalização fixa por cliente.

---

# Resultado Esperado

Ao finalizar esta skill:

A página deverá possuir:

- estrutura Angular correta;
- integração com API;
- segurança aplicada;
- UX consistente;
- suporte ao modelo Multi-Tenant.

---

# Objetivo Final

Garantir que todas as telas do CRM sejam desenvolvidas de forma padronizada, reutilizável e preparada para múltiplos clientes.