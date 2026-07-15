# Execução de Tarefas

## Objetivo

Este documento define o processo oficial que todos os agentes deverão seguir ao executar qualquer tarefa dentro do CRM.

O objetivo é garantir que todas as implementações sejam realizadas de forma organizada, previsível e alinhada com a arquitetura definida.

---

# Princípio Geral

Nenhuma tarefa deverá iniciar diretamente pela implementação.

Todo trabalho deverá seguir o ciclo:

Entender

↓

Planejar

↓

Implementar

↓

Validar

↓

Finalizar

---

# Etapa 1 - Entendimento

Antes de iniciar uma tarefa, o agente deverá compreender:

- objetivo da alteração;
- módulo envolvido;
- regras de negócio relacionadas;
- documentos do Harness aplicáveis;
- impacto esperado.

---

# Análise de Contexto

O agente deverá consultar obrigatoriamente:

Quando envolver arquitetura:

- architecture.md

Quando envolver banco:

- database-patterns.md

Quando envolver API:

- api-patterns.md

Quando envolver segurança:

- security.md

Quando envolver permissões:

- permissions.md

Quando envolver negócio:

- business-rules.md

---

# Identificação do Módulo

Toda tarefa deverá ser associada a um módulo.

Exemplos:

Autenticação:

auth

Usuários:

users

Empresas:

companies

Leads:

leads

Negociações:

deals

---

# Etapa 2 - Planejamento

Antes de alterar código, o agente deverá identificar:

Arquivos que serão criados.

Arquivos que serão alterados.

Possíveis impactos.

Dependências necessárias.

---

# Plano de Implementação

O plano deverá ser simples e objetivo.

Exemplo:

1. Criar model no Prisma.
2. Criar migration.
3. Criar repository.
4. Criar service.
5. Criar controller.
6. Criar endpoint.
7. Criar testes.
8. Validar integração.

---

# Etapa 3 - Implementação

Durante a implementação:

- respeitar a estrutura de pastas;
- seguir padrões existentes;
- reutilizar componentes;
- evitar duplicação;
- manter tipagem forte.

---

# Alteração de Banco

Quando uma tarefa exigir alteração no banco:

Sempre seguir:

1. Atualizar schema Prisma.
2. Criar migration.
3. Executar migration.
4. Atualizar tipos.
5. Validar consultas.

---

# Alteração de API

Quando criar um endpoint:

Sempre implementar:

- validação;
- controller;
- service;
- repository;
- tratamento de erros;
- autenticação;
- autorização.

---

# Alteração Frontend

Quando criar uma funcionalidade Angular:

Implementar:

- model;
- service;
- component;
- formulário;
- validações;
- tratamento de estados;
- integração com API.

---

# Etapa 4 - Validação

Antes de concluir uma tarefa, o agente deverá validar:

## Código

- segue padrões;
- possui tipagem;
- não possui duplicação.

---

## Segurança

- valida autenticação;
- valida permissões;
- respeita Tenant.

---

## Banco

- migration criada;
- relacionamentos corretos;
- índices avaliados.

---

## API

- respostas seguem padrão;
- erros seguem padrão;
- códigos HTTP corretos.

---

## Frontend

- interface funciona;
- mensagens de erro existem;
- estados de carregamento tratados.

---

# Testes

Toda funcionalidade deverá possuir validação.

Os testes deverão verificar:

- cenário esperado;
- cenário inválido;
- permissões;
- regras de negócio.

---

# Quando uma tarefa está incompleta

Uma tarefa não deverá ser considerada concluída quando:

- apenas parte do backend foi criada;
- frontend não foi integrado;
- testes não foram executados;
- documentação necessária não foi atualizada.

---

# Comunicação de Resultado

Ao finalizar uma tarefa, o agente deverá informar:

## Resumo

O que foi implementado.

## Alterações

Arquivos criados.

Arquivos modificados.

## Validação

Testes executados.

Resultados encontrados.

## Pendências

Possíveis próximos passos.

---

# Problemas Encontrados

Caso encontre um problema fora do escopo:

Não corrigir automaticamente.

Registrar o problema.

Continuar apenas se não houver impacto na tarefa atual.

---

# Bloqueios

Quando uma decisão arquitetural for necessária:

O agente deverá interromper a implementação e solicitar definição.

Nunca escolher sozinho uma alteração estrutural.

---

# Escopo Controlado

Durante uma tarefa:

Permitido:

- corrigir pequenos problemas diretamente relacionados;
- ajustar código necessário para funcionamento.

Não permitido:

- refatorar módulos inteiros;
- alterar bibliotecas;
- mudar arquitetura;
- criar novas funcionalidades.

---

# Objetivo Final

Todo desenvolvimento deverá ser realizado através de um processo previsível.

A qualidade da implementação é tão importante quanto a velocidade de entrega.

O agente deve atuar como um desenvolvedor experiente seguindo os padrões definidos pelo projeto.