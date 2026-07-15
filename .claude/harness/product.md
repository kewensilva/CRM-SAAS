# Produto

## Objetivo

Este documento descreve o funcionamento funcional do CRM.

Seu objetivo é definir todos os módulos do sistema, suas responsabilidades e como eles se relacionam.

Este documento não descreve detalhes técnicos de implementação. Seu foco é o comportamento esperado do produto.

---

# Visão Geral

O CRM é uma plataforma SaaS Multi-Tenant White Label desenvolvida para a Content Marketing Brasil (CMB).

Cada cliente da CMB utiliza um ambiente próprio dentro da plataforma, mantendo seus dados isolados dos demais clientes.

O sistema centraliza o processo comercial desde a entrada de um Lead até a conclusão de uma negociação.

---

# Estrutura do Produto

O produto é composto pelos seguintes módulos:

- Dashboard
- Autenticação
- Usuários
- Empresas
- Contatos
- Leads
- Pipeline
- Negociações
- Atividades
- Configurações
- Integrações

Cada módulo possui responsabilidades específicas e deve funcionar de forma independente.

---

# Dashboard

## Objetivo

Apresentar uma visão geral das informações mais importantes do CRM.

## Responsabilidades

- Exibir indicadores comerciais.
- Apresentar quantidade de Leads.
- Exibir negociações em andamento.
- Mostrar atividades pendentes.
- Exibir métricas definidas pelo Tenant.

O Dashboard não possui regras de negócio. Apenas apresenta informações provenientes dos demais módulos.

---

# Autenticação

## Objetivo

Controlar o acesso ao sistema.

## Responsabilidades

- Login.
- Logout.
- Recuperação de senha.
- Renovação de sessão.
- Controle de acesso.

Todo usuário deve estar autenticado para utilizar o CRM.

---

# Usuários

## Objetivo

Gerenciar os usuários pertencentes ao Tenant.

## Responsabilidades

- Cadastro.
- Atualização.
- Ativação.
- Desativação.
- Associação de permissões.

Cada usuário pertence exclusivamente a um Tenant.

---

# Empresas

## Objetivo

Representar empresas cadastradas dentro do CRM.

Uma empresa pode possuir vários contatos.

Uma empresa pode possuir vários Leads.

Uma empresa pode possuir várias negociações.

---

# Contatos

## Objetivo

Representar pessoas vinculadas a uma empresa.

## Responsabilidades

- Nome.
- Cargo.
- E-mail.
- Telefone.
- Observações.

Um contato poderá participar de diversas negociações.

---

# Leads

## Objetivo

Registrar oportunidades comerciais.

Um Lead representa uma oportunidade de negócio.

Os Leads podem ser criados:

- manualmente;
- através da integração com Meta Lead Ads.

Cada Lead deverá possuir um responsável.

---

# Pipeline

## Objetivo

Organizar o processo comercial.

Cada Tenant poderá possuir um ou mais Pipelines.

Cada Pipeline é composto por etapas.

Exemplo:

- Novo Lead
- Primeiro Contato
- Proposta Enviada
- Negociação
- Fechado
- Perdido

---

# Negociações

## Objetivo

Representar uma oportunidade comercial em andamento.

Cada negociação deverá estar vinculada a:

- um Lead;
- uma Empresa;
- um responsável.

Uma negociação sempre pertence a uma etapa do Pipeline.

---

# Atividades

## Objetivo

Registrar ações realizadas pela equipe.

Exemplos:

- ligação;
- reunião;
- envio de proposta;
- acompanhamento;
- anotação.

Todas as atividades devem possuir:

- responsável;
- data;
- status.

---

# Configurações

## Objetivo

Permitir personalização do ambiente do Tenant.

Inicialmente poderão ser configurados:

- nome da empresa;
- logotipo;
- cores da interface;
- domínio personalizado.

---

# Integrações

## Objetivo

Permitir comunicação com serviços externos.

Inicialmente o sistema suportará:

- Meta Lead Ads.

Também disponibilizará Webhooks para integração com outros sistemas.

---

# Fluxo Principal do Produto

O fluxo esperado de utilização do CRM é:

1. Um Lead é criado.
2. O Lead recebe um responsável.
3. O responsável entra em contato.
4. Uma negociação é criada.
5. A negociação percorre as etapas do Pipeline.
6. Atividades são registradas durante o processo.
7. A negociação é concluída como ganha ou perdida.
8. O Dashboard apresenta os resultados.

---

# Fluxo Administrativo

O fluxo administrativo ocorre da seguinte forma:

1. A CMB cria um novo Tenant.
2. O Tenant recebe sua identidade visual.
3. Um usuário administrador é criado.
4. O administrador acessa o sistema.
5. O administrador cadastra os demais usuários.
6. O ambiente está pronto para utilização.

---

# Responsabilidades do Owner

O Owner possui acesso completo ao sistema.

Entre suas responsabilidades estão:

- cadastrar Tenants;
- administrar Tenants;
- acompanhar utilização da plataforma;
- prestar suporte;
- administrar configurações globais.

---

# Responsabilidades do Tenant

Cada Tenant é responsável por:

- administrar seus usuários;
- cadastrar empresas;
- cadastrar contatos;
- acompanhar Leads;
- administrar negociações;
- utilizar os recursos disponíveis.

Nenhum Tenant poderá acessar informações pertencentes a outro Tenant.

---

# Limites do Produto

O CRM não possui como objetivo:

- realizar gestão financeira;
- emitir notas fiscais;
- controlar estoque;
- substituir um ERP;
- realizar atendimento via WhatsApp;
- executar automações de marketing;
- utilizar Inteligência Artificial.

Essas funcionalidades estão fora do escopo atual do projeto.

---

# Evolução

Novos módulos poderão ser adicionados no futuro.

Toda nova funcionalidade deverá:

- respeitar a arquitetura do projeto;
- manter compatibilidade com os módulos existentes;
- possuir documentação antes da implementação.

---

# Conclusão

Este documento define a estrutura funcional oficial do CRM.

Todos os demais documentos do projeto deverão respeitar as definições apresentadas neste arquivo.