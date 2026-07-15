# Padrão de Tratamento de Erros

## Objetivo

Este documento define o padrão oficial para tratamento de erros do CRM.

Todos os módulos deverão utilizar as mesmas estruturas para geração, propagação, registro e resposta de erros.

O objetivo é garantir consistência, previsibilidade e facilitar a manutenção da aplicação.

---

# Princípios

O tratamento de erros deve seguir os seguintes princípios:

- simplicidade;
- padronização;
- rastreabilidade;
- segurança;
- clareza para o usuário;
- informações úteis para o desenvolvedor.

---

# Responsabilidade

Cada camada possui uma responsabilidade específica.

Controller

Receber exceções e retornar a resposta HTTP.

Service

Gerar exceções relacionadas às regras de negócio.

Repository

Propagar erros relacionados ao acesso aos dados.

Middleware

Centralizar o tratamento das exceções.

---

# Middleware Global

A aplicação deverá possuir um middleware global responsável por tratar todas as exceções.

Nenhum Controller deverá implementar tratamento específico de erros.

Todo erro deverá passar obrigatoriamente pelo middleware central.

---

# Estrutura da Resposta

Toda resposta de erro deverá seguir o mesmo formato.

```json
{
    "success": false,
    "message": "Lead não encontrado.",
    "errors": [],
    "requestId": "4d8d7d2e..."
}
```

Campos:

success

Sempre false.

message

Mensagem principal do erro.

errors

Lista opcional de erros detalhados.

requestId

Identificador da requisição para rastreamento.

---

# Tipos de Erro

A aplicação utilizará os seguintes tipos de erro.

ValidationError

Dados inválidos.

AuthenticationError

Falha de autenticação.

AuthorizationError

Permissão insuficiente.

NotFoundError

Registro não encontrado.

ConflictError

Conflito de dados.

BusinessRuleError

Violação de regra de negócio.

IntegrationError

Falha de integração.

InternalServerError

Erro interno inesperado.

---

# ValidationError

Utilizado quando os dados enviados são inválidos.

Exemplo:

- e-mail inválido;
- campo obrigatório ausente;
- formato incorreto.

HTTP

422 Unprocessable Entity

---

# AuthenticationError

Utilizado quando:

- token inválido;
- token expirado;
- login inválido.

HTTP

401 Unauthorized

---

# AuthorizationError

Utilizado quando o usuário não possui permissão.

HTTP

403 Forbidden

---

# NotFoundError

Utilizado quando um registro não existe.

Exemplos:

- usuário inexistente;
- empresa inexistente;
- lead inexistente.

HTTP

404 Not Found

---

# ConflictError

Utilizado quando ocorre conflito de dados.

Exemplos:

- e-mail duplicado;
- domínio já utilizado;
- registro já existente.

HTTP

409 Conflict

---

# BusinessRuleError

Utilizado quando uma regra de negócio é violada.

Exemplos:

- Lead já convertido.
- Tenant inativo.
- Usuário inativo.

HTTP

400 Bad Request

---

# IntegrationError

Utilizado quando uma integração externa falha.

Exemplos:

- Meta Lead Ads indisponível.
- Webhook inválido.

HTTP

502 Bad Gateway

---

# InternalServerError

Utilizado apenas para erros inesperados.

Nunca expor detalhes internos.

HTTP

500 Internal Server Error

---

# Mensagens

As mensagens deverão ser:

- objetivas;
- claras;
- compreensíveis.

Evitar mensagens técnicas.

Correto

"Usuário não encontrado."

Errado

"PrismaClientKnownRequestError P2025"

---

# Informações Sensíveis

Nunca retornar:

- stack trace;
- SQL;
- tokens;
- credenciais;
- caminhos internos;
- variáveis de ambiente.

Essas informações deverão permanecer apenas nos logs.

---

# Logs

Todos os erros deverão ser registrados.

Os logs deverão conter:

- requestId;
- usuário;
- tenant;
- endpoint;
- método HTTP;
- data;
- mensagem;
- stack trace.

---

# Stack Trace

A stack deverá ser registrada apenas nos logs internos.

Nunca deverá ser enviada ao Frontend.

---

# Request ID

Toda requisição deverá possuir um identificador único.

Esse identificador deverá acompanhar:

- logs;
- auditoria;
- resposta da API.

---

# Validação

Erros de validação deverão informar exatamente quais campos são inválidos.

Exemplo:

```json
{
    "success": false,
    "message": "Dados inválidos.",
    "errors": [
        {
            "field": "email",
            "message": "E-mail inválido."
        },
        {
            "field": "name",
            "message": "Campo obrigatório."
        }
    ]
}
```

---

# Tratamento de Exceções

As exceções deverão ser propagadas até o middleware global.

Evitar blocos try/catch desnecessários.

Capturar erros apenas quando houver necessidade de tratamento específico.

---

# Erros de Banco

Erros provenientes do Prisma deverão ser convertidos para erros do domínio.

O Frontend nunca deverá conhecer erros específicos do ORM.

---

# Erros de Integração

Toda integração deverá tratar falhas de comunicação.

Quando possível, registrar informações suficientes para diagnóstico.

---

# Logs de Produção

Os logs deverão registrar apenas informações necessárias para investigação.

Dados sensíveis nunca deverão ser registrados.

---

# Auditoria

Operações críticas que resultarem em erro também deverão gerar registro de auditoria quando aplicável.

Exemplos:

- tentativa de login inválida;
- acesso negado;
- tentativa de alteração sem permissão.

---

# Consistência

Todos os módulos deverão utilizar exatamente o mesmo padrão.

Não criar formatos diferentes de resposta para módulos específicos.

---

# Objetivo Final

O tratamento de erros deve fornecer uma experiência consistente para usuários, facilitar o diagnóstico para os desenvolvedores e preservar a segurança da aplicação.

Todo erro gerado pelo CRM deverá seguir obrigatoriamente as definições deste documento.