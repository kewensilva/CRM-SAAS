# Padrão de Código

## Objetivo

Este documento define o padrão oficial de desenvolvimento do CRM.

Todo código produzido deverá seguir estas convenções.

O objetivo é manter consistência, facilitar manutenção e reduzir complexidade.

---

# Filosofia

O projeto adota uma arquitetura funcional.

Não serão utilizadas classes como padrão de desenvolvimento.

Toda implementação deverá priorizar:

- simplicidade;
- legibilidade;
- previsibilidade;
- baixo acoplamento;
- responsabilidade única.

---

# Linguagem

Todo o projeto será escrito em TypeScript.

Nenhum novo código deverá ser escrito em JavaScript.

---

# Organização

Cada módulo deverá possuir sua própria estrutura.

Exemplo:

auth/

users/

companies/

contacts/

leads/

deals/

activities/

dashboard/

settings/

integrations/

Nenhum módulo deverá acessar diretamente arquivos internos de outro módulo.

---

# Arquivos

Cada arquivo deverá possuir apenas uma responsabilidade.

Arquivos muito grandes deverão ser divididos.

Como regra geral:

até 300 linhas por arquivo.

Quando um arquivo ultrapassar esse tamanho, avaliar sua divisão.

---

# Funções

Toda regra de negócio deverá ser implementada utilizando funções.

Exemplo:

createLead()

updateLead()

deleteLead()

listLeads()

As funções deverão possuir nomes claros e objetivos.

---

# Classes

Classes não deverão ser utilizadas como padrão arquitetural.

Exceções somente quando exigidas por bibliotecas externas.

---

# Nomeação

Pastas

Sempre em letras minúsculas.

Exemplo:

users

companies

activities

---

Arquivos

Utilizar kebab-case.

Exemplo:

create-user.ts

update-user.ts

list-users.ts

delete-company.ts

---

Funções

Utilizar camelCase.

Exemplo:

createUser()

listCompanies()

findLead()

updateActivity()

---

Variáveis

Utilizar camelCase.

Evitar abreviações.

Errado:

usr

cmp

cfg

Correto:

user

company

configuration

---

Constantes

Utilizar UPPER_SNAKE_CASE apenas para constantes globais.

Exemplo:

MAX_FILE_SIZE

JWT_EXPIRES_IN

UPLOAD_DIRECTORY

---

Interfaces

Prefixo I não será utilizado.

Exemplo:

User

Company

Lead

Não:

IUser

ICompany

ILead

---

Tipos

Utilizar Type quando representar estruturas simples.

Utilizar Interface quando houver necessidade de extensão.

---

Imports

Imports externos primeiro.

Depois imports internos.

Depois imports relativos.

Exemplo:

Bibliotecas

↓

Shared

↓

Módulo atual

↓

Arquivos locais

---

Exports

Preferencialmente utilizar named exports.

Evitar export default.

---

Comentários

O código deve ser autoexplicativo.

Comentários somente quando realmente necessários.

Nunca comentar o óbvio.

---

Funções Grandes

Evitar funções muito extensas.

Como referência:

até 50 linhas.

Caso ultrapasse esse tamanho, avaliar extração de responsabilidades.

---

Parâmetros

Evitar funções com muitos parâmetros.

Preferir objetos quando houver mais de quatro propriedades.

---

Retornos

Toda função deverá possuir retorno explícito.

Evitar retorno implícito em funções complexas.

---

Tratamento de Erros

Não utilizar try/catch desnecessariamente.

Capturar erros apenas quando houver necessidade de tratamento.

Evitar silenciar exceções.

---

Async

Utilizar async/await.

Evitar Promise.then() em novas implementações.

---

Validação

Toda validação deverá ocorrer antes da regra de negócio.

Não misturar validação com processamento.

---

Responsabilidade

Cada função deverá possuir apenas uma responsabilidade.

Caso uma função execute muitas tarefas, ela deverá ser dividida.

---

Reutilização

Evitar duplicação.

Caso uma lógica seja reutilizada em vários módulos, ela deverá ser movida para uma biblioteca compartilhada.

---

Números Mágicos

Não utilizar valores fixos espalhados pelo código.

Preferir constantes nomeadas.

---

Strings

Evitar repetir textos.

Mensagens compartilhadas deverão ser centralizadas.

---

Datas

Utilizar sempre o padrão ISO 8601 para persistência.

Toda conversão para apresentação será responsabilidade do Frontend.

---

Logs

Nunca utilizar console.log em código de produção.

Toda geração de logs deverá utilizar a biblioteca oficial definida pelo projeto.

---

TODO

TODOs somente quando realmente necessários.

Sempre incluir descrição objetiva.

Exemplo:

TODO: Implementar integração com Meta Lead Ads.

---

Código Morto

Código comentado não deverá permanecer no projeto.

Utilizar o Git para recuperar versões antigas.

---

Refatoração

Toda refatoração deverá preservar comportamento.

Antes de alterar uma implementação existente, compreender completamente sua responsabilidade.

---

Boas Práticas

Sempre preferir:

- funções pequenas;
- baixo acoplamento;
- nomes claros;
- módulos independentes;
- tipagem forte;
- legibilidade.

---

Más Práticas

Evitar:

- funções gigantes;
- arquivos enormes;
- lógica duplicada;
- dependências circulares;
- comentários desnecessários;
- código não utilizado;
- abreviações excessivas.

---

Objetivo Final

Todo desenvolvedor ou agente de IA deverá conseguir compreender qualquer módulo do sistema sem necessidade de conhecimento prévio.

A simplicidade e a clareza do código possuem prioridade sobre qualquer otimização prematura.