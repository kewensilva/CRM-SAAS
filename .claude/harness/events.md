# Eventos do Sistema

## Objetivo

Este documento define o padrão oficial para eventos internos do CRM.

Os eventos representam acontecimentos importantes da aplicação que podem ser utilizados por outros módulos sem criar dependências diretas.

Os eventos não substituem regras de negócio.

Eles apenas notificam que determinada ação ocorreu.

---

# Conceito

Um evento representa algo que já aconteceu.

Exemplos:

- Usuário criado
- Lead criado
- Lead convertido
- Negociação criada
- Negociação concluída

Eventos descrevem fatos.

Nunca comandos.

---

# Nomenclatura

Todos os eventos deverão utilizar o padrão:

Entidade + Ação

Exemplos:

UserCreated

UserUpdated

UserDeleted

LeadCreated

LeadUpdated

LeadConverted

DealCreated

DealWon

DealLost

ActivityCreated

CompanyCreated

PipelineCreated

TenantCreated

---

# Momento da Publicação

Os eventos somente poderão ser publicados após a conclusão bem-sucedida da operação principal.

Exemplo:

1. Criar Lead
2. Salvar no banco
3. Publicar LeadCreated

Nunca publicar eventos antes da persistência dos dados.

---

# Estrutura do Evento

Todo evento deverá possuir uma estrutura comum.

Exemplo:

event

Nome do evento.

entity

Entidade relacionada.

entityId

Identificador da entidade.

tenantId

Tenant responsável.

userId

Usuário responsável pela ação.

occurredAt

Data da ocorrência.

payload

Dados complementares.

---

# Payload

O payload deverá conter apenas as informações necessárias para consumidores do evento.

Evitar enviar objetos completos quando apenas alguns campos forem utilizados.

---

# Eventos Oficiais

## Tenant

TenantCreated

TenantUpdated

TenantActivated

TenantDeactivated

---

## Usuários

UserCreated

UserUpdated

UserActivated

UserDeactivated

PasswordChanged

---

## Empresas

CompanyCreated

CompanyUpdated

CompanyDeleted

---

## Contatos

ContactCreated

ContactUpdated

ContactDeleted

---

## Leads

LeadCreated

LeadUpdated

LeadConverted

LeadDeleted

LeadAssigned

---

## Pipeline

PipelineCreated

PipelineUpdated

PipelineDeleted

StageChanged

---

## Negociações

DealCreated

DealUpdated

DealWon

DealLost

DealDeleted

---

## Atividades

ActivityCreated

ActivityUpdated

ActivityCompleted

ActivityCancelled

---

## Configurações

SettingsUpdated

ThemeUpdated

DomainUpdated

---

# Eventos de Autenticação

LoginSuccess

LoginFailed

Logout

RefreshTokenGenerated

PasswordResetRequested

PasswordResetCompleted

---

# Auditoria

Eventos importantes poderão ser utilizados para alimentar o módulo de auditoria.

Exemplos:

- Login realizado
- Lead convertido
- Usuário criado
- Tenant desativado

---

# Notificações

Na versão atual, os eventos poderão ser utilizados para disparar notificações internas da aplicação.

Exemplos:

- Novo Lead recebido.
- Atividade vencida.
- Negociação ganha.
- Usuário criado.

---

# Integrações

Eventos também poderão ser utilizados pelas integrações.

Exemplo:

LeadCreated

↓

Integração Meta

↓

Registrar origem

---

# Ordem de Execução

A regra de negócio sempre possui prioridade.

Fluxo esperado:

Receber requisição

↓

Validar

↓

Executar regra de negócio

↓

Persistir dados

↓

Publicar evento

↓

Finalizar resposta

---

# Falhas

A falha na execução de um consumidor de evento não deverá comprometer a operação principal.

A criação de um Lead, por exemplo, não deverá falhar apenas porque uma notificação interna apresentou erro.

---

# Idempotência

Consumidores de eventos deverão ser preparados para evitar processamento duplicado sempre que necessário.

---

# Acoplamento

Eventos não deverão conhecer quem irá consumi-los.

O produtor publica.

Os consumidores decidem se desejam reagir.

---

# Eventos Não Permitidos

Não utilizar eventos para:

- substituir chamadas diretas entre funções;
- validar regras de negócio;
- executar lógica obrigatória antes da persistência.

Eventos representam consequências de uma ação concluída.

---

# Organização

Todos os eventos deverão permanecer centralizados em um único módulo.

Exemplo:

shared/events/

Dentro desse módulo deverão existir:

- definição dos eventos;
- publicadores;
- consumidores;
- tipos compartilhados.

---

# Evolução

Na versão atual, os eventos serão processados internamente pela aplicação.

No futuro, a implementação poderá ser adaptada para mensageria externa sem alterar as regras de negócio.

---

# Objetivo Final

Os eventos permitem desacoplar funcionalidades, facilitar futuras integrações e manter a arquitetura organizada.

Toda publicação de eventos deverá seguir as definições estabelecidas neste documento.