# Arquitetura do Sistema

## Objetivo

Este documento define a arquitetura técnica oficial do CRM.

Toda implementação deverá seguir os padrões aqui descritos.

Nenhuma funcionalidade poderá ser desenvolvida fora desta arquitetura.

---

# Visão Geral

O CRM é uma aplicação SaaS Multi-Tenant White Label.

A plataforma será composta por um Frontend Angular, uma API REST desenvolvida em Node.js e um banco de dados PostgreSQL.

Toda comunicação entre Frontend e Backend será realizada através de HTTPS utilizando JSON.

---

# Arquitetura Geral

                    Usuário
                        │
                        │
                Angular Frontend
                        │
                  HTTP / HTTPS
                        │
                    REST API
                        │
               Node.js + Express
                        │
               Camada de Serviços
                        │
              Camada de Repositórios
                        │
                    Prisma ORM
                        │
                   PostgreSQL

---

# Arquitetura da Aplicação

A aplicação será dividida em duas partes principais.

Frontend

Responsável por:

- Interface
- Navegação
- Componentes
- Consumo da API
- Experiência do usuário

Backend

Responsável por:

- Regras de negócio
- Validações
- Segurança
- Persistência
- Integrações

---

# Frontend

O Frontend será desenvolvido utilizando:

- Angular
- TypeScript
- Angular Material
- RxJS

Responsabilidades:

- renderizar telas;
- consumir API;
- controlar navegação;
- validar formulários para experiência do usuário.

O Frontend nunca será responsável por regras de negócio.

---

# Backend

O Backend será desenvolvido utilizando:

- Node.js
- TypeScript
- Express
- Prisma ORM

Responsabilidades:

- executar regras de negócio;
- autenticar usuários;
- autorizar operações;
- validar dados;
- acessar banco de dados;
- disponibilizar API REST.

---

# Banco de Dados

O banco oficial do projeto será:

PostgreSQL

O acesso ao banco será realizado exclusivamente através do Prisma ORM.

Nenhuma consulta SQL deverá ser executada diretamente na aplicação, salvo quando houver necessidade comprovada de desempenho.

---

# Organização em Camadas

O Backend será organizado nas seguintes camadas:

Controller

Responsável por receber requisições e retornar respostas.

---

Service

Responsável por executar regras de negócio.

---

Repository

Responsável pelo acesso ao banco de dados.

---

Validator

Responsável por validar dados de entrada.

---

DTO

Responsável pela estrutura de entrada e saída de dados.

---

Prisma

Responsável pela persistência.

---

# Fluxo de uma Requisição

Toda requisição deverá seguir o fluxo abaixo.

Cliente

↓

Router

↓

Middleware

↓

Controller

↓

Validator

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Resposta

Nenhuma camada poderá acessar diretamente uma camada inferior sem respeitar esse fluxo.

---

# Organização por Módulos

Cada funcionalidade será organizada em um módulo independente.

Exemplo:

Auth

Users

Companies

Contacts

Leads

Deals

Pipeline

Activities

Dashboard

Settings

Integrations

Cada módulo deverá possuir sua própria estrutura interna.

---

# Comunicação entre Módulos

Os módulos deverão ser independentes.

Sempre que possível, um módulo conhecerá apenas sua própria responsabilidade.

A reutilização deverá ocorrer através de serviços compartilhados e contratos bem definidos.

---

# Comunicação Frontend x Backend

Toda comunicação ocorrerá através de API REST.

Formato:

JSON

Codificação:

UTF-8

Protocolo:

HTTPS

---

# Multi-Tenant

Toda informação pertence a um Tenant.

Toda entidade do sistema deverá possuir referência ao Tenant responsável.

Todas as consultas deverão considerar o Tenant autenticado.

O isolamento dos dados é obrigatório.

---

# Identificação do Tenant

O Tenant será identificado durante o processo de autenticação.

Após autenticado, todas as operações ocorrerão dentro do contexto desse Tenant.

O Frontend nunca escolherá qual Tenant utilizar.

---

# White Label

Cada Tenant poderá possuir:

- nome;
- logotipo;
- cores;
- domínio personalizado.

Essas informações serão carregadas dinamicamente durante o acesso ao sistema.

---

# API

A API seguirá o padrão REST.

Métodos suportados:

GET

POST

PUT

PATCH

DELETE

Todas as respostas deverão possuir estrutura padronizada.

---

# Autenticação

A autenticação utilizará:

JWT

Refresh Token

Todo endpoint protegido deverá exigir autenticação válida.

---

# Controle de Acesso

O sistema utilizará RBAC.

Perfis iniciais:

Owner

Tenant Admin

Manager

User

Toda operação deverá verificar permissões antes de ser executada.

---

# Tratamento de Erros

Todos os erros deverão ser tratados.

Respostas padronizadas.

Mensagens claras.

Nenhuma informação sensível deverá ser enviada ao Frontend.

---

# Logs

O sistema deverá registrar logs das operações importantes.

Os logs deverão auxiliar diagnóstico e auditoria.

---

# Auditoria

Operações críticas deverão ser registradas.

Exemplos:

- login;
- alteração de usuário;
- exclusão de registros;
- alterações de configurações.

---

# Integrações

Inicialmente existirão apenas duas formas de integração.

Meta Lead Ads.

Webhooks.

Novas integrações deverão ser implementadas como módulos independentes.

---

# Escalabilidade

A arquitetura foi planejada para atender o cenário atual do negócio.

Não serão utilizadas soluções complexas como microserviços ou processamento distribuído.

Caso o crescimento do produto exija mudanças estruturais, uma nova arquitetura poderá ser definida.

---

# Qualidade

Todo código deverá seguir os padrões definidos pelo projeto.

A prioridade será:

- simplicidade;
- organização;
- legibilidade;
- manutenção.

---

# Documentação

Toda alteração estrutural deverá atualizar este documento.

Este arquivo representa a arquitetura oficial do CRM.

Qualquer decisão técnica deverá respeitar as definições aqui estabelecidas.