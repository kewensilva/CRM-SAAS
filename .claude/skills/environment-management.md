---
name: environment-management
description: Padrões para criar, configurar e manter os ambientes (dev, homologação, produção) e variáveis de ambiente usados pelo CRM.
---

# Skill: Gerenciamento de Ambientes

## Objetivo

Esta skill define os padrões para criação, configuração e manutenção dos ambientes utilizados pelo CRM.

O objetivo é garantir que desenvolvimento, homologação e produção sejam ambientes:

- organizados;
- seguros;
- isolados;
- reproduzíveis.

---

# Quando Utilizar

Utilizar esta skill quando for necessário:

- criar ambiente;
- adicionar configuração;
- alterar variáveis;
- configurar serviços externos;
- preparar execução local;
- ajustar produção.

---

# Responsáveis

Esta skill deve ser utilizada principalmente por:

- Backend Agent;
- Frontend Agent;
- Deployment Agent.

Com validação do:

- Security Agent.

---

# Documentos Obrigatórios

Antes de alterar ambientes consultar:

- deployment.md
- security.md
- architecture.md
- integration-management.md

---

# Princípio Principal

Configurações pertencem ao ambiente.

Não pertencem ao código.

---

# Ambientes Oficiais

O CRM deve possuir:

```
Development

Homologation

Production
```

---

# Development

Objetivo:

Desenvolvimento local.

Características:

- debug habilitado;
- logs detalhados;
- banco local;
- dados de teste.

---

# Homologation

Objetivo:

Validação antes da produção.

Características:

- configuração semelhante à produção;
- banco separado;
- integrações controladas.

---

# Production

Objetivo:

Uso real pelos clientes.

Características:

- segurança ativa;
- debug desabilitado;
- logs controlados.

---

# Variáveis de Ambiente

Toda configuração variável deve utilizar:

```
.env
```

ou mecanismo equivalente.

---

# Nunca Armazenar no Código

Não colocar diretamente:

- URLs;
- senhas;
- tokens;
- chaves;
- credenciais.

---

# Backend Environment

Exemplos:

```
DATABASE_URL

JWT_SECRET

API_PORT

NODE_ENV

CORS_ORIGIN
```

---

# Frontend Environment

Exemplos:

```
API_URL

APP_NAME

ENVIRONMENT
```

---

# Separação de Configurações

Cada ambiente deve possuir seus próprios valores.

Exemplo:

Development:

```
DATABASE_LOCAL
```

Production:

```
DATABASE_PRODUCTION
```

---

# Banco de Dados

Cada ambiente deve possuir banco independente.

Nunca utilizar:

Banco de produção em desenvolvimento.

---

# Prisma

As migrations devem funcionar em todos os ambientes.

Fluxo:

```
Migration criada

↓

Aplicada Development

↓

Validada Homologation

↓

Aplicada Production
```

---

# Integrações Externas

Cada ambiente deve possuir configurações próprias.

Exemplo:

Development:

Conta de teste.

Production:

Conta real.

---

# Meta Integration

Credenciais devem ser separadas por ambiente.

Nunca compartilhar:

- tokens;
- IDs;
- configurações.

---

# Segurança

Variáveis sensíveis devem ser protegidas.

Nunca:

- enviar para Git;
- colocar em documentação pública;
- expor no frontend.

---

# Controle de Acesso

Somente pessoas autorizadas devem acessar:

- produção;
- credenciais;
- bancos.

---

# Configuração Multi-Tenant

Configurações de Tenant não devem ser confundidas com configurações de ambiente.

---

# Ambiente

Define:

```
Como a aplicação executa
```

---

# Tenant

Define:

```
Como o cliente utiliza a aplicação
```

---

# Exemplo

Ambiente:

```
DATABASE_URL
```

Tenant:

```
logo_cliente
```

---

# Frontend

Nunca colocar segredo no Angular.

Tudo enviado ao frontend é público.

---

# Build

Cada ambiente deve possuir build próprio.

Exemplo:

```
build development

build production
```

---

# Logs

Configurar conforme ambiente.

Development:

Mais detalhes.

Production:

Somente informações necessárias.

---

# Debug

Nunca deixar:

```
DEBUG=true
```

em produção.

---

# Backup

Produção deve possuir:

- backup;
- recuperação;
- validação periódica.

---

# Alterações de Ambiente

Toda alteração deve ser registrada.

Exemplo:

Nova variável:

```
META_CLIENT_ID
```

Registrar:

- motivo;
- ambiente;
- impacto.

---

# Não Fazer

Não utilizar produção localmente.

Não versionar arquivos .env.

Não colocar segredo no código.

Não misturar configuração de Tenant com ambiente.

Não criar comportamento diferente sem documentação.

---

# Checklist Final

Ambientes separados?

Sim / Não

Variáveis protegidas?

Sim / Não

Banco separado?

Sim / Não

Integrações separadas?

Sim / Não

Segurança validada?

Sim / Não

Documentação atualizada?

Sim / Não

---

# Resultado Esperado

Ao finalizar esta skill:

Todos os ambientes do CRM estarão configurados de forma segura e previsível.

---

# Objetivo Final

Garantir que o CRM possa evoluir entre desenvolvimento, homologação e produção sem riscos de configuração ou segurança.