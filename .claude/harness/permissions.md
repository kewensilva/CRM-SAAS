# Permissões

## Objetivo

Este documento define o modelo oficial de controle de acesso do CRM.

Todas as funcionalidades do sistema deverão respeitar as permissões aqui definidas.

Nenhum usuário poderá executar operações além das permitidas para seu perfil.

---

# Modelo de Controle de Acesso

O CRM utiliza o modelo RBAC (Role-Based Access Control).

As permissões são concedidas de acordo com o perfil do usuário.

Os perfis são definidos no momento do cadastro e poderão ser alterados apenas por usuários autorizados.

---

# Perfis Oficiais

O sistema possui quatro perfis principais.

- Owner
- Tenant Admin
- Manager
- User

Cada perfil possui responsabilidades específicas.

---

# Owner

O Owner representa a Content Marketing Brasil.

É o administrador da plataforma.

O Owner possui acesso completo a todos os recursos do sistema.

Principais responsabilidades:

- criar Tenants;
- editar Tenants;
- ativar ou desativar Tenants;
- visualizar todos os Tenants;
- acessar configurações globais;
- administrar a plataforma.

O Owner não participa da operação comercial dos Tenants.

---

# Tenant Admin

O Tenant Admin é o administrador da empresa cliente.

Responsabilidades:

- administrar usuários do Tenant;
- cadastrar empresas;
- cadastrar contatos;
- cadastrar Leads;
- administrar Pipelines;
- administrar negociações;
- visualizar Dashboard;
- alterar configurações do Tenant.

O Tenant Admin possui acesso apenas ao seu próprio Tenant.

---

# Manager

O Manager é responsável pela gestão comercial.

Responsabilidades:

- visualizar Dashboard;
- administrar Leads;
- administrar negociações;
- administrar atividades;
- acompanhar resultados da equipe.

O Manager não poderá alterar configurações administrativas do Tenant.

---

# User

O User representa o usuário operacional.

Responsabilidades:

- visualizar Leads;
- atualizar Leads;
- criar negociações;
- registrar atividades;
- consultar informações permitidas.

O User não poderá acessar configurações administrativas.

---

# Permissões por Módulo

## Dashboard

Owner

Acesso completo.

Tenant Admin

Visualizar.

Manager

Visualizar.

User

Visualizar.

---

## Usuários

Owner

Criar, editar, excluir e visualizar.

Tenant Admin

Criar, editar, desativar e visualizar usuários do próprio Tenant.

Manager

Visualizar.

User

Visualizar apenas o próprio perfil.

---

## Empresas

Owner

Visualizar.

Tenant Admin

Criar, editar, excluir logicamente e visualizar.

Manager

Criar, editar e visualizar.

User

Visualizar.

---

## Contatos

Owner

Visualizar.

Tenant Admin

Criar, editar, excluir logicamente e visualizar.

Manager

Criar, editar e visualizar.

User

Criar, editar e visualizar.

---

## Leads

Owner

Visualizar.

Tenant Admin

Controle completo.

Manager

Controle completo.

User

Criar, editar, atualizar status e visualizar.

---

## Pipeline

Owner

Visualizar.

Tenant Admin

Criar, editar e excluir.

Manager

Visualizar.

User

Visualizar.

---

## Negociações

Owner

Visualizar.

Tenant Admin

Controle completo.

Manager

Controle completo.

User

Criar, editar e visualizar.

---

## Atividades

Owner

Visualizar.

Tenant Admin

Controle completo.

Manager

Controle completo.

User

Criar, editar e concluir atividades.

---

## Configurações

Owner

Controle completo.

Tenant Admin

Alterar configurações do próprio Tenant.

Manager

Sem acesso.

User

Sem acesso.

---

# Regras Gerais

Nenhum usuário poderá alterar informações pertencentes a outro Tenant.

Toda verificação de permissão será realizada pelo Backend.

O Frontend poderá ocultar funcionalidades de acordo com o perfil, porém isso não substitui a validação realizada pela API.

---

# Alteração de Perfil

A alteração do perfil de um usuário somente poderá ser realizada por:

- Owner;
- Tenant Admin.

Toda alteração deverá ser registrada na auditoria.

---

# Usuário Inativo

Usuários inativos não poderão realizar login.

Caso um usuário seja desativado durante uma sessão ativa, o acesso deverá ser encerrado na próxima validação de autenticação.

---

# Tenant Inativo

Quando um Tenant estiver inativo:

- nenhum usuário poderá acessar o sistema;
- novas autenticações serão bloqueadas.

---

# Auditoria

As seguintes operações deverão gerar auditoria:

- criação de usuário;
- alteração de perfil;
- alteração de permissões;
- ativação de usuário;
- desativação de usuário.

---

# Segurança

O Backend é o único responsável por validar permissões.

O Frontend nunca deverá ser considerado fonte confiável para autorização de operações.

---

# Evolução

Novos perfis poderão ser adicionados futuramente.

Novas permissões poderão ser incluídas sem alterar a estrutura geral do sistema.

---

# Conclusão

O modelo de permissões garante que cada usuário tenha acesso apenas às funcionalidades necessárias para desempenhar seu papel dentro do CRM.

Toda implementação deverá respeitar as definições apresentadas neste documento.