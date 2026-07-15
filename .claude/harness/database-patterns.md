# Padrões do Banco de Dados

## Objetivo

Este documento define os padrões oficiais para modelagem, organização e manutenção do banco de dados do CRM.

Toda entidade criada deverá seguir estas convenções.

O objetivo é garantir consistência, legibilidade, integridade e facilidade de evolução da estrutura do banco.

---

# Banco Oficial

Banco de Dados

PostgreSQL

ORM

Prisma ORM

Todo acesso ao banco deverá ocorrer através do Prisma.

Consultas SQL diretas deverão ser utilizadas apenas quando houver necessidade técnica comprovada.

---

# Convenções Gerais

Todas as tabelas deverão seguir o mesmo padrão de nomenclatura.

Utilizar:

- letras minúsculas;
- snake_case;
- nomes no plural.

Exemplos:

users

companies

contacts

leads

pipelines

pipeline_stages

deals

activities

---

# Chave Primária

Toda tabela deverá possuir uma chave primária chamada:

id

Tipo:

UUID

A geração do UUID será responsabilidade da aplicação.

---

# Chaves Estrangeiras

Toda chave estrangeira deverá utilizar o padrão:

<entidade>_id

Exemplos:

tenant_id

user_id

company_id

lead_id

pipeline_id

stage_id

---

# Auditoria

Toda entidade de negócio deverá possuir os seguintes campos:

created_at

updated_at

deleted_at

Regras:

created_at

Data de criação do registro.

updated_at

Última atualização.

deleted_at

Utilizado para Soft Delete.

Quando NULL, o registro é considerado ativo.

---

# Soft Delete

A exclusão lógica será o padrão oficial do sistema.

Nenhuma entidade de negócio deverá ser removida fisicamente.

Exceções deverão ser documentadas.

---

# Tenant

Toda entidade pertencente ao negócio deverá possuir:

tenant_id

Exemplos:

users

companies

contacts

leads

deals

activities

pipelines

settings

Isso garante o isolamento entre empresas.

---

# Campos Obrigatórios

Toda tabela deverá conter apenas os campos realmente necessários.

Evitar colunas não utilizadas.

A inclusão de novos campos deverá ser justificada pela regra de negócio.

---

# Tipos de Dados

Texto curto

VARCHAR

Texto longo

TEXT

Booleano

BOOLEAN

Datas

TIMESTAMP WITH TIME ZONE

Valores monetários

NUMERIC

Identificadores

UUID

Inteiros

INTEGER

---

# Relacionamentos

Utilizar chaves estrangeiras para garantir integridade referencial.

Evitar duplicação de informações.

Sempre que possível, normalizar os dados.

---

# Índices

Criar índices apenas quando houver benefício para consultas frequentes.

Índices deverão ser utilizados em:

- tenant_id
- email
- status
- created_at
- relacionamentos

Evitar excesso de índices.

---

# Valores Monetários

Valores financeiros deverão utilizar:

NUMERIC

Nunca utilizar FLOAT ou DOUBLE.

---

# Datas

Todas as datas serão armazenadas em UTC.

A conversão para o fuso horário do usuário será responsabilidade do Frontend.

---

# Status

Sempre que possível utilizar ENUMs do Prisma para representar estados conhecidos.

Exemplos:

UserStatus

LeadStatus

DealStatus

ActivityStatus

TenantStatus

---

# Relacionamentos Obrigatórios

User

↓

Tenant

Company

↓

Tenant

Contact

↓

Company

Lead

↓

Company

↓

Tenant

Deal

↓

Lead

↓

Pipeline

↓

User

Activity

↓

Deal

↓

User

PipelineStage

↓

Pipeline

---

# Exclusão em Cascata

Excluir registros automaticamente somente quando fizer sentido para o domínio.

Antes de utilizar CASCADE, avaliar o impacto na auditoria e na integridade histórica.

---

# Nome dos Campos

Todos os campos deverão utilizar snake_case.

Exemplos:

first_name

last_name

created_at

updated_at

tenant_id

---

# Valores Padrão

Sempre que possível definir valores padrão no banco.

Exemplos:

created_at

CURRENT_TIMESTAMP

deleted_at

NULL

status

ACTIVE

---

# Constraints

Utilizar constraints para garantir integridade.

Exemplos:

NOT NULL

UNIQUE

FOREIGN KEY

CHECK

Toda regra que puder ser protegida pelo banco deverá ser considerada.

---

# E-mail

E-mails deverão ser armazenados em formato normalizado.

A validação será responsabilidade da aplicação.

---

# Telefone

Os números deverão ser armazenados apenas com dígitos.

A formatação será responsabilidade do Frontend.

---

# Endereços

Os endereços serão armazenados em campos separados.

Exemplo:

street

number

district

city

state

zip_code

country

---

# Observações

Campos destinados a observações deverão utilizar:

TEXT

---

# Histórico

Sempre que necessário manter histórico, criar tabelas específicas de histórico.

Evitar sobrescrever informações importantes do negócio.

---

# Migrações

Toda alteração estrutural deverá ser realizada através de migrations do Prisma.

Nenhuma alteração manual deverá ser realizada diretamente no banco de produção.

---

# Seeds

O projeto poderá possuir seeds para:

- perfis padrão;
- configurações iniciais;
- dados de desenvolvimento.

Seeds nunca deverão conter informações sensíveis.

---

# Backup

O banco deverá permitir backup completo da plataforma.

A restauração deverá preservar a integridade dos relacionamentos.

---

# Performance

Antes de otimizar consultas, medir o desempenho real.

Evitar otimizações prematuras.

Priorizar consultas simples e legíveis.

---

# Consistência

Toda entidade deverá seguir os mesmos padrões de nomenclatura, auditoria, relacionamentos e identificação.

A consistência do banco é considerada um requisito obrigatório do projeto.

---

# Objetivo Final

O banco de dados deve representar o domínio do CRM de forma clara, consistente e preparada para evolução.

Toda modelagem futura deverá respeitar as definições estabelecidas neste documento.