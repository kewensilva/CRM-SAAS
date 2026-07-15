# Definition of Done

## Objetivo

Este documento define os critérios oficiais para considerar uma tarefa, funcionalidade ou módulo como concluído.

Nenhuma implementação deverá ser considerada finalizada sem atender aos critérios definidos neste documento.

---

# Princípio

Uma tarefa concluída não significa apenas código criado.

Uma tarefa somente está pronta quando:

- funciona;
- segue a arquitetura;
- atende a regra de negócio;
- possui validações;
- possui qualidade técnica.

---

# Critérios Gerais

Toda entrega deverá obrigatoriamente atender:

- implementação realizada;
- código revisado;
- validações executadas;
- testes realizados;
- documentação atualizada quando necessário.

---

# Requisitos Funcionais

A funcionalidade deverá:

- atender ao objetivo solicitado;
- respeitar as regras de negócio;
- possuir comportamento esperado;
- tratar cenários de erro.

---

# Arquitetura

Antes de considerar concluído, verificar:

- segue a arquitetura definida;
- respeita separação de responsabilidades;
- utiliza a estrutura correta de pastas;
- não criou dependências desnecessárias.

---

# Backend

Uma funcionalidade backend somente estará concluída quando possuir:

## Banco

- schema atualizado;
- migration criada;
- relacionamentos corretos;
- índices avaliados.

---

## Repository

- acesso ao banco isolado;
- consultas utilizando Prisma;
- sem regra de negócio.

---

## Service

- regras de negócio implementadas;
- validações aplicadas;
- erros padronizados.

---

## Controller

- recebe requisição;
- valida contexto;
- chama service;
- retorna resposta padronizada.

---

## API

Verificar:

- rota criada;
- autenticação aplicada;
- permissões verificadas;
- respostas no padrão definido.

---

# Frontend

Uma funcionalidade Angular somente estará concluída quando possuir:

## Interface

- tela ou componente implementado;
- layout consistente;
- estados de carregamento tratados.

---

## Comunicação

- integração com API;
- tratamento de sucesso;
- tratamento de erro.

---

## Validação

- formulários validados;
- mensagens apresentadas ao usuário.

---

# Segurança

Antes de finalizar verificar:

- autenticação funcionando;
- permissões corretas;
- isolamento Multi-Tenant;
- informações sensíveis protegidas.

---

# Testes

Toda funcionalidade deverá possuir testes adequados.

Deverão ser considerados:

## Cenário positivo

Fluxo esperado funcionando.

---

## Cenário negativo

Dados inválidos.

---

## Permissões

Usuário sem acesso não consegue executar ação.

---

## Isolamento

Tenant não acessa dados de outro Tenant.

---

# Código

Verificar:

- segue code-style;
- possui tipagem;
- nomes claros;
- sem código morto;
- sem duplicação.

---

# Banco de Dados

Verificar:

- migrations funcionando;
- rollback possível quando aplicável;
- dados preservados;
- relacionamentos corretos.

---

# Documentação

Atualizar documentação quando houver:

- nova regra de negócio;
- mudança arquitetural;
- novo padrão;
- novo endpoint público.

---

# Integrações

Quando existir integração externa:

Verificar:

- autenticação;
- tratamento de falhas;
- logs;
- comportamento em indisponibilidade.

---

# Revisão Final

Antes de finalizar, responder:

A funcionalidade respeita o Harness?

Sim / Não

A regra de negócio está correta?

Sim / Não

O código está organizado?

Sim / Não

Os testes foram executados?

Sim / Não

Existe algum débito técnico?

Sim / Não

---

# Não Considerado Concluído

Uma tarefa não está concluída quando:

- somente parte do fluxo foi implementada;
- existe código sem validação;
- existem erros conhecidos ignorados;
- existem arquivos temporários;
- documentação necessária está desatualizada.

---

# Débitos Técnicos

Caso exista uma pendência que não impeça a entrega:

Ela deverá ser registrada.

Exemplo:

TODO:

Melhorar estratégia de cache do dashboard.

---

# Módulo Concluído

Um módulo somente será considerado concluído quando:

- todas funcionalidades internas estiverem finalizadas;
- endpoints testados;
- permissões validadas;
- integração frontend/backend funcionando;
- documentação atualizada.

---

# Objetivo Final

A Definition of Done garante que o CRM evolua com qualidade.

Uma entrega finalizada deve representar uma funcionalidade realmente pronta para utilização, não apenas código gerado.