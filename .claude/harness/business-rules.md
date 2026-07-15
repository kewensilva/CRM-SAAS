# Regras de Negócio

## Objetivo

Este documento define as regras oficiais de funcionamento do CRM.

Todas as funcionalidades implementadas deverão respeitar estas regras.

Caso exista conflito entre uma implementação e este documento, este documento possui prioridade.

---

# Regra Geral

Todo dado pertence obrigatoriamente a um Tenant.

Nenhuma informação poderá ser compartilhada entre Tenants.

Todo usuário autenticado sempre estará trabalhando dentro do contexto do seu Tenant.

---

# Tenant

## Cadastro

O Tenant somente poderá ser criado pelo Owner.

No momento da criação deverão ser informados no mínimo:

- Nome da empresa
- Nome fantasia (opcional)
- Domínio principal
- Status

Após o cadastro será criado automaticamente:

- Configuração inicial
- Usuário Administrador

---

## Status

Um Tenant poderá possuir os seguintes status:

- Ativo
- Inativo

Tenants inativos não poderão acessar o sistema.

---

# Usuários

## Cadastro

Usuários somente poderão ser criados por:

- Owner
- Tenant Admin

Todo usuário deverá possuir:

- Nome
- E-mail
- Senha
- Perfil
- Status

O e-mail deverá ser único dentro do Tenant.

---

## Status

Usuários poderão possuir:

- Ativo
- Inativo

Usuários inativos não poderão realizar login.

---

## Exclusão

Usuários não serão removidos fisicamente.

O sistema utilizará Soft Delete.

---

# Empresas

## Cadastro

Uma empresa representa um cliente ou potencial cliente.

Campos mínimos:

- Nome
- Status

Campos opcionais:

- Documento
- Telefone
- E-mail
- Website
- Endereço
- Observações

---

## Relacionamentos

Uma empresa poderá possuir:

- vários contatos;
- vários leads;
- várias negociações.

---

# Contatos

## Cadastro

Todo contato pertence obrigatoriamente a uma empresa.

Campos mínimos:

- Nome

Campos opcionais:

- Cargo
- E-mail
- Telefone
- Celular
- Observações

---

# Leads

## Cadastro

Um Lead representa uma oportunidade comercial.

Os Leads poderão ser criados:

- manualmente;
- pela integração Meta Lead Ads.

---

## Responsável

Todo Lead deverá possuir um usuário responsável.

Sem responsável o Lead não poderá ser considerado ativo.

---

## Status

Os status oficiais são:

- Novo
- Em Atendimento
- Convertido
- Perdido

---

## Conversão

Um Lead poderá ser convertido em negociação.

Após convertido:

- o histórico deverá permanecer disponível;
- o Lead não poderá ser convertido novamente.

---

# Pipeline

## Estrutura

Cada Tenant poderá configurar seus próprios Pipelines.

Cada Pipeline será composto por etapas.

---

## Etapas

Cada etapa deverá possuir:

- Nome
- Ordem
- Cor (opcional)
- Status

---

## Ordem

As etapas deverão possuir ordem sequencial.

A alteração da ordem não poderá gerar duplicidade.

---

# Negociações

## Cadastro

Toda negociação deverá estar vinculada a:

- um Lead;
- uma Empresa;
- um responsável;
- um Pipeline;
- uma Etapa.

---

## Situação

Uma negociação poderá possuir:

- Em andamento
- Ganha
- Perdida

---

## Histórico

Toda alteração de etapa deverá permanecer registrada.

O histórico nunca deverá ser removido.

---

# Atividades

## Cadastro

Atividades representam ações realizadas pela equipe.

Exemplos:

- ligação;
- reunião;
- visita;
- envio de proposta;
- anotação.

---

## Campos

Toda atividade deverá possuir:

- título;
- responsável;
- data prevista;
- status.

---

## Status

As atividades poderão possuir:

- Pendente
- Em andamento
- Concluída
- Cancelada

---

# Dashboard

O Dashboard sempre apresentará informações consolidadas.

Exemplos:

- Leads cadastrados;
- Negociações abertas;
- Negociações ganhas;
- Negociações perdidas;
- Atividades pendentes.

O Dashboard não armazenará dados próprios.

Todas as informações serão obtidas dos demais módulos.

---

# Configurações

Cada Tenant poderá alterar:

- Nome da empresa
- Logotipo
- Cores da interface
- Domínio personalizado

Configurações globais somente poderão ser alteradas pelo Owner.

---

# Integração Meta Lead Ads

Os Leads recebidos pela integração deverão ser criados automaticamente.

Caso um Lead já exista, o comportamento será definido pela configuração da integração.

Nenhum Lead deverá ser descartado sem registro.

---

# Auditoria

As seguintes operações deverão gerar registro de auditoria:

- Login
- Criação de usuário
- Alteração de usuário
- Exclusão lógica
- Criação de Lead
- Conversão de Lead
- Alteração de negociação
- Alteração de configurações

---

# Exclusão de Registros

O sistema utilizará Soft Delete para entidades de negócio.

Os registros permanecerão disponíveis para auditoria.

---

# Validação

Toda informação recebida pela API deverá ser validada.

Nenhum dado inválido poderá ser persistido.

---

# Consistência

O sistema deverá garantir:

- ausência de duplicidade desnecessária;
- integridade dos relacionamentos;
- isolamento entre Tenants;
- rastreabilidade das operações.

---

# Regras Gerais

- Todo usuário pertence a um único Tenant.
- Toda empresa pertence a um único Tenant.
- Todo contato pertence a uma empresa.
- Todo Lead pertence a um Tenant.
- Toda negociação pertence a um Lead.
- Toda atividade pertence a uma negociação ou a um Lead.
- Todo Pipeline pertence a um Tenant.

Estas regras deverão ser respeitadas por toda a aplicação.