# Padrões da API

## Objetivo

Este documento define o padrão oficial para desenvolvimento da API REST do CRM.

Todos os endpoints deverão seguir estas convenções.

O objetivo é garantir consistência, previsibilidade e facilidade de integração.

---

# Arquitetura

A API seguirá o padrão REST.

Características:

- Stateless
- JSON
- UTF-8
- HTTPS
- Versionamento por URL

---

# URL Base

Todas as rotas deverão utilizar versionamento.

Exemplo:

/api/v1

Exemplos completos:

GET /api/v1/users

POST /api/v1/leads

PUT /api/v1/companies/:id

DELETE /api/v1/contacts/:id

---

# Convenção das Rotas

Utilizar sempre:

- letras minúsculas
- plural
- kebab-case quando necessário

Correto:

/users

/user-roles

/pipeline-stages

Errado:

/Users

/User

/GetUsers

/createLead

---

# Métodos HTTP

GET

Consultar informações.

Nunca alterar dados.

---

POST

Criar novos registros.

---

PUT

Atualizar completamente um registro.

---

PATCH

Atualizar parcialmente um registro.

---

DELETE

Realizar exclusão lógica.

Nunca remover registros fisicamente, salvo exceções definidas pela arquitetura.

---

# Estrutura das URLs

Coleções

GET /users

GET /companies

GET /leads

---

Registro específico

GET /users/:id

GET /companies/:id

GET /leads/:id

---

Relacionamentos

GET /companies/:id/contacts

GET /leads/:id/activities

GET /deals/:id/history

---

Ações específicas

Quando necessário utilizar recursos que não representam CRUD, utilizar um verbo após o identificador.

Exemplos:

POST /leads/:id/convert

POST /users/:id/reset-password

POST /auth/login

POST /auth/logout

POST /auth/refresh-token

---

# Estrutura das Requisições

Corpo da requisição

Sempre JSON.

Exemplo:

{
    "name": "Empresa Exemplo",
    "email": "contato@empresa.com"
}

---

Parâmetros de rota

Utilizar sempre identificadores.

Exemplo:

/users/:id

---

Query Parameters

Utilizar para:

- filtros;
- paginação;
- ordenação;
- pesquisa.

Exemplo:

GET /users?page=1&pageSize=20

GET /companies?search=content

GET /leads?status=new

---

# Paginação

Padrão oficial.

page

Número da página.

pageSize

Quantidade de registros.

Exemplo:

GET /users?page=1&pageSize=20

---

Resposta da Paginação

{
    "success": true,
    "data": [],
    "pagination": {
        "page": 1,
        "pageSize": 20,
        "totalItems": 125,
        "totalPages": 7
    }
}

---

# Ordenação

Utilizar:

sortBy

sortOrder

Exemplo:

GET /users?sortBy=name&sortOrder=asc

Valores permitidos:

asc

desc

---

# Pesquisa

Utilizar:

search

Exemplo:

GET /companies?search=marketing

---

# Filtros

Cada módulo poderá possuir filtros específicos.

Exemplo:

GET /leads?status=new

GET /activities?responsible=123

GET /users?profile=manager

---

# Estrutura das Respostas

Todas as respostas deverão seguir o mesmo formato.

Sucesso

{
    "success": true,
    "data": {}
}

Lista

{
    "success": true,
    "data": []
}

Sem conteúdo

HTTP 204

Sem corpo.

---

# Estrutura de Erros

Formato oficial.

{
    "success": false,
    "message": "Lead não encontrado.",
    "errors": []
}

---

# Erros de Validação

{
    "success": false,
    "message": "Dados inválidos.",
    "errors": [
        {
            "field": "email",
            "message": "E-mail inválido."
        }
    ]
}

---

# Códigos HTTP

200

Consulta realizada.

201

Registro criado.

204

Operação concluída sem conteúdo.

400

Requisição inválida.

401

Usuário não autenticado.

403

Acesso negado.

404

Registro não encontrado.

409

Conflito de dados.

422

Erro de validação.

500

Erro interno.

---

# Autenticação

Todos os endpoints protegidos deverão utilizar:

Authorization

Bearer Token

Exemplo:

Authorization: Bearer JWT_TOKEN

---

# Versionamento

A API utilizará versionamento na URL.

Exemplo:

/api/v1

Novas versões serão criadas apenas quando houver quebra de compatibilidade.

---

# Idempotência

GET

Idempotente.

PUT

Idempotente.

DELETE

Idempotente.

POST

Não idempotente.

---

# Upload de Arquivos

Uploads deverão utilizar:

multipart/form-data

Os arquivos deverão ser enviados juntamente com os metadados necessários.

---

# Datas

Toda data enviada pela API deverá utilizar o padrão ISO 8601.

Exemplo:

2026-07-14T10:30:00Z

---

# Identificadores

Todas as entidades utilizarão UUID.

Os UUIDs serão gerados pelo Backend.

---

# Soft Delete

Endpoints DELETE realizarão exclusão lógica.

Os registros permanecerão disponíveis para auditoria.

---

# Logs

Toda requisição deverá possuir um identificador único para rastreamento.

Esse identificador poderá ser utilizado para auditoria e diagnóstico.

---

# Auditoria

Operações críticas deverão registrar:

- usuário;
- Tenant;
- data;
- operação;
- entidade afetada.

---

# Consistência

Todos os módulos deverão seguir exatamente este padrão.

Nenhum módulo poderá criar formatos diferentes para respostas, paginação, erros ou rotas.

---

# Objetivo Final

A API do CRM deve ser previsível.

Qualquer desenvolvedor ou agente de IA deverá conseguir implementar novos endpoints sem necessidade de criar novos padrões.

A consistência da API é considerada um requisito obrigatório do projeto.