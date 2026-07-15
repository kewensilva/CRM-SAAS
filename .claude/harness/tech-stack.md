# Stack Tecnológica

## Objetivo

Este documento define a stack tecnológica oficial do CRM.

Todas as implementações deverão utilizar exclusivamente as tecnologias aprovadas neste documento.

O objetivo é manter consistência, facilitar manutenção e evitar dependências desnecessárias.

---

# Visão Geral

O CRM será desenvolvido utilizando tecnologias modernas, estáveis e amplamente adotadas pela comunidade.

As tecnologias escolhidas priorizam:

- estabilidade;
- produtividade;
- facilidade de manutenção;
- comunidade ativa;
- documentação oficial.

---

# Frontend

Framework

Angular

Linguagem

TypeScript

Interface

Angular Material

Gerenciamento de Estado

RxJS

Comunicação HTTP

HttpClient (Angular)

Formulários

Reactive Forms

Roteamento

Angular Router

Estilização

SCSS

Ícones

Angular Material Icons

---

# Backend

Runtime

Node.js

Linguagem

TypeScript

Framework

Express

ORM

Prisma

Validação

Zod

Autenticação

JWT

Criptografia de Senhas

bcrypt

Upload de Arquivos

Multer

---

# Banco de Dados

Banco Oficial

PostgreSQL

ORM Oficial

Prisma ORM

Identificadores

UUID

Soft Delete

Sim

---

# API

Arquitetura

REST API

Formato

JSON

Codificação

UTF-8

Comunicação

HTTPS

---

# Autenticação

Login

JWT

Renovação de Sessão

Refresh Token

Hash de Senhas

bcrypt

---

# Controle de Versão

Sistema

Git

Plataforma

GitHub

Fluxo

Feature Branch

Pull Request

Code Review

Merge

---

# Qualidade de Código

Linter

ESLint

Formatação

Prettier

Hooks de Commit

Husky

Padronização de Commits

Conventional Commits

---

# Testes

Testes Unitários

Jest

Testes de Integração

Jest

---

# Documentação

Markdown

Swagger (OpenAPI)

---

# Ferramentas de Desenvolvimento

Editor recomendado

Visual Studio Code

Gerenciador de Pacotes

npm

Gerenciamento de Ambiente

.env

---

# Estrutura do Projeto

Monorepo

Não

Frontend e Backend permanecerão em repositórios separados.

---

# Upload de Arquivos

Uploads serão armazenados em diretório configurável pelo ambiente.

O mecanismo de armazenamento deverá permitir futura substituição por serviços externos, sem necessidade de alterar as regras de negócio.

---

# Logs

Biblioteca oficial

Pino

Todos os logs deverão utilizar esta biblioteca.

Não utilizar console.log em código de produção.

---

# Datas

Toda manipulação de datas deverá utilizar a API nativa do JavaScript sempre que possível.

Bibliotecas adicionais somente poderão ser utilizadas quando houver necessidade comprovada.

---

# Requisições HTTP

Frontend

HttpClient

Backend

Fetch API nativa do Node.js ou Axios, conforme necessidade específica.

A escolha deverá ser consistente dentro de cada módulo.

---

# Gerenciamento de Configurações

Todas as configurações da aplicação deverão ser obtidas através de variáveis de ambiente.

Exemplos:

- Porta da aplicação
- Banco de dados
- Chaves JWT
- URLs de integração
- Ambiente de execução

Nenhuma configuração sensível deverá permanecer fixa no código.

---

# Dependências

Antes de adicionar qualquer nova biblioteca, verificar:

- existe solução nativa?
- já existe outra biblioteca no projeto que resolve o mesmo problema?
- a dependência possui manutenção ativa?
- a dependência realmente agrega valor?

Adicionar dependências somente quando necessário.

---

# Bibliotecas Não Autorizadas

Não utilizar bibliotecas que substituam tecnologias já adotadas no projeto.

Exemplos:

- Outro ORM além do Prisma.
- Outro framework HTTP além do Express.
- Outro framework frontend além do Angular.
- Múltiplas bibliotecas para validação.
- Múltiplas bibliotecas para autenticação.

Cada responsabilidade deverá possuir apenas uma solução oficial.

---

# Compatibilidade

Todo o projeto deverá utilizar versões LTS das tecnologias adotadas.

Atualizações de versão deverão ser planejadas e testadas antes da adoção.

---

# Padrão Oficial

Frontend

- Angular
- TypeScript
- Angular Material
- RxJS
- SCSS

Backend

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod
- JWT
- bcrypt
- Multer

Ferramentas

- Git
- GitHub
- ESLint
- Prettier
- Jest
- Swagger

Esta é a stack oficial do projeto e deverá ser utilizada durante todo o desenvolvimento do CRM.