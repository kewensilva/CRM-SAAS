# Multi-Tenant

## Objetivo

Este documento define como funciona a arquitetura Multi-Tenant do CRM.

Todas as funcionalidades desenvolvidas deverão respeitar as regras aqui estabelecidas.

O isolamento entre Tenants é um requisito obrigatório e não poderá ser ignorado em nenhuma parte do sistema.

---

# Conceito

O CRM utiliza uma arquitetura Multi-Tenant com banco de dados compartilhado.

Existe apenas uma aplicação.

Existe apenas um banco de dados.

Todos os clientes utilizam a mesma infraestrutura.

O isolamento ocorre através do Tenant ao qual cada registro pertence.

---

# Estrutura

A plataforma possui dois níveis principais.

Owner

↓

Tenant

O Owner administra toda a plataforma.

Cada Tenant representa uma empresa cliente da Content Marketing Brasil.

---

# Owner

O Owner possui acesso administrativo completo.

Responsabilidades:

- cadastrar Tenants;
- editar Tenants;
- ativar ou desativar Tenants;
- acompanhar utilização da plataforma;
- acessar configurações globais.

O Owner não participa da operação comercial dos Tenants.

---

# Tenant

Cada Tenant representa uma empresa cliente.

Cada Tenant possui seu próprio ambiente lógico.

Cada Tenant administra exclusivamente seus próprios dados.

Os usuários de um Tenant nunca terão acesso às informações de outro Tenant.

---

# Identificação

Todo Tenant possuirá um identificador único.

Este identificador será utilizado em todas as entidades pertencentes ao Tenant.

Exemplo:

tenant_id

Esse identificador será utilizado internamente pelo sistema.

---

# Isolamento

O isolamento dos dados é obrigatório.

Toda consulta ao banco de dados deverá considerar o Tenant autenticado.

Nenhuma consulta poderá retornar registros pertencentes a outro Tenant.

Essa regra deverá ser aplicada em todas as operações:

- consulta;
- cadastro;
- atualização;
- exclusão lógica.

---

# Contexto da Requisição

Após o login, todas as requisições serão executadas dentro do contexto do Tenant autenticado.

O Tenant será identificado através do token de autenticação.

O Frontend nunca enviará manualmente o Tenant da operação.

Essa informação será obtida automaticamente pelo Backend.

---

# Entidades do Tenant

As seguintes entidades pertencem obrigatoriamente a um Tenant:

- Usuários
- Empresas
- Contatos
- Leads
- Pipelines
- Etapas
- Negociações
- Atividades
- Configurações

Nenhuma dessas entidades poderá existir sem um Tenant associado.

---

# Entidades Globais

Algumas informações pertencem à plataforma.

Essas informações não pertencem a um Tenant.

Exemplos:

- configurações globais;
- parâmetros do sistema;
- cadastro do Owner.

Essas informações somente poderão ser acessadas pelo Owner.

---

# Cadastro de Tenant

O cadastro de um novo Tenant deverá criar automaticamente:

- registro do Tenant;
- configurações iniciais;
- usuário administrador.

Após esse processo o ambiente estará pronto para utilização.

---

# Status do Tenant

Cada Tenant poderá possuir um dos seguintes status:

Ativo

O acesso ao sistema é permitido.

Inativo

O acesso ao sistema é bloqueado.

---

# Domínio Personalizado

Cada Tenant poderá possuir um domínio personalizado.

Exemplos:

crm.empresa-a.com.br

crm.empresa-b.com.br

O domínio será utilizado para acesso ao sistema.

A configuração do domínio será realizada pelo Owner.

---

# Identidade Visual

Cada Tenant poderá personalizar:

- nome da empresa;
- logotipo;
- cores da interface.

Essas configurações serão carregadas automaticamente durante o acesso ao sistema.

---

# Usuários

Todo usuário pertence exclusivamente a um Tenant.

Um usuário não poderá participar de mais de um Tenant.

Caso uma pessoa trabalhe em duas empresas diferentes, deverão existir dois usuários distintos.

---

# Autenticação

Após autenticar o usuário, o sistema deverá identificar automaticamente:

- usuário;
- perfil;
- Tenant.

Todas as permissões serão calculadas utilizando essas informações.

---

# Permissões

As permissões sempre serão avaliadas dentro do contexto do Tenant.

Exemplo:

Um Tenant Admin possui privilégios administrativos apenas dentro do seu próprio Tenant.

Ele nunca poderá administrar outro Tenant.

---

# Auditoria

Toda auditoria deverá registrar:

- Tenant;
- usuário;
- data;
- operação realizada.

Isso garante rastreabilidade das operações.

---

# Backup

Os backups serão realizados para toda a plataforma.

A recuperação de dados deverá preservar o isolamento entre Tenants.

---

# Crescimento

A arquitetura foi planejada para suportar o crescimento gradual da plataforma.

Novos Tenants poderão ser adicionados sem necessidade de alteração estrutural.

---

# Regras Obrigatórias

As seguintes regras nunca poderão ser violadas.

- Todo registro pertence a um Tenant ou à plataforma.
- Todo usuário pertence a um único Tenant.
- Toda consulta deve considerar o Tenant autenticado.
- Nenhum Tenant pode visualizar dados de outro Tenant.
- O Frontend nunca informa o Tenant da operação.
- O Backend é responsável por aplicar o isolamento dos dados.
- O Owner possui acesso administrativo global.
- Os Tenants possuem acesso apenas ao próprio ambiente.

---

# Conclusão

O modelo Multi-Tenant é a base do CRM.

Toda funcionalidade implementada deverá respeitar este documento para garantir segurança, isolamento de dados e correta separação entre os clientes da Content Marketing Brasil.