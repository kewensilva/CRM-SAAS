# Segurança

## Objetivo

Este documento define os padrões oficiais de segurança do CRM.

Todas as funcionalidades desenvolvidas deverão respeitar estas diretrizes.

A segurança deve ser considerada desde o primeiro momento do desenvolvimento e nunca como uma etapa posterior.

---

# Princípios

A segurança da aplicação é baseada nos seguintes princípios:

- autenticação obrigatória;
- autorização baseada em perfis;
- isolamento entre Tenants;
- validação de todas as entradas;
- proteção de informações sensíveis;
- rastreabilidade das operações.

---

# Autenticação

O sistema utilizará autenticação baseada em JWT.

Após realizar o login com sucesso, o usuário receberá:

- Access Token
- Refresh Token

O Access Token será utilizado para acessar os endpoints protegidos.

O Refresh Token será utilizado para renovar a sessão sem exigir um novo login.

---

# Sessão

Toda sessão pertence a um único usuário.

Toda sessão pertence a um único Tenant.

As informações da sessão deverão conter:

- Identificador do usuário
- Identificador do Tenant
- Perfil do usuário
- Data de expiração

Nenhuma regra de negócio deverá depender de informações enviadas pelo Frontend.

---

# Login

O login será realizado utilizando:

- E-mail
- Senha

Antes de autenticar um usuário, o sistema deverá verificar:

- usuário existente;
- usuário ativo;
- Tenant ativo;
- senha válida.

Caso qualquer validação falhe, a autenticação deverá ser negada.

---

# Senhas

As senhas nunca serão armazenadas em texto puro.

Todas as senhas deverão ser criptografadas utilizando bcrypt.

O sistema nunca deverá retornar a senha em respostas da API.

---

# Política de Senhas

A senha deverá possuir no mínimo:

- 8 caracteres;
- uma letra maiúscula;
- uma letra minúscula;
- um número.

Caracteres especiais são recomendados, mas não obrigatórios na primeira versão.

---

# Recuperação de Senha

A recuperação de senha deverá utilizar um token temporário.

Esse token deverá possuir tempo de expiração.

Após redefinir a senha, o token deverá ser invalidado.

---

# Proteção de Endpoints

Todos os endpoints privados deverão exigir autenticação.

Nenhum endpoint deverá confiar em informações enviadas pelo Frontend para identificar o usuário ou o Tenant.

Essas informações deverão ser obtidas a partir do token autenticado.

---

# Controle de Acesso

Toda operação deverá validar:

- usuário autenticado;
- perfil do usuário;
- Tenant da operação;
- permissões necessárias.

A ausência de qualquer requisito deverá impedir a execução da operação.

---

# Validação de Dados

Todos os dados recebidos pela API deverão ser validados antes do processamento.

As validações deverão ocorrer no Backend.

O Frontend poderá realizar validações apenas para melhorar a experiência do usuário.

---

# Variáveis de Ambiente

Informações sensíveis deverão ser armazenadas exclusivamente em variáveis de ambiente.

Exemplos:

- credenciais do banco;
- chave JWT;
- chave do Refresh Token;
- URLs privadas;
- credenciais de integração.

Essas informações nunca deverão ser armazenadas no código-fonte.

---

# CORS

A API deverá permitir acesso apenas aos domínios autorizados.

O ambiente de desenvolvimento poderá possuir regras específicas.

O ambiente de produção deverá utilizar uma lista explícita de domínios permitidos.

---

# Cabeçalhos de Segurança

A aplicação deverá utilizar Helmet para adicionar cabeçalhos HTTP de segurança.

As configurações deverão seguir as recomendações oficiais da biblioteca.

---

# HTTPS

Em ambiente de produção, toda comunicação deverá ocorrer exclusivamente através de HTTPS.

Conexões inseguras não deverão ser utilizadas.

---

# Upload de Arquivos

Todos os arquivos enviados ao sistema deverão ser validados antes do armazenamento.

Deverão ser verificados:

- tipo do arquivo;
- tamanho máximo;
- extensão permitida.

Arquivos inválidos deverão ser rejeitados.

---

# SQL Injection

O acesso ao banco será realizado exclusivamente através do Prisma ORM.

Consultas SQL diretas deverão ser evitadas.

Sempre que possível, utilizar métodos seguros fornecidos pelo ORM.

---

# Cross-Site Scripting (XSS)

Informações exibidas na interface deverão ser tratadas adequadamente para evitar execução de código malicioso.

Conteúdos fornecidos pelos usuários não deverão ser interpretados como código executável.

---

# Cross-Site Request Forgery (CSRF)

Caso a autenticação utilize cookies em futuras versões, deverão ser implementadas proteções contra CSRF.

Na versão atual, a autenticação baseada em JWT reduz esse risco.

---

# Rate Limiting

A API deverá limitar a quantidade de requisições por cliente para evitar abuso.

Especial atenção deverá ser dada aos endpoints de:

- login;
- recuperação de senha;
- autenticação.

---

# Logs de Segurança

As seguintes operações deverão ser registradas:

- login realizado;
- tentativa de login inválida;
- recuperação de senha;
- alteração de senha;
- criação de usuário;
- alteração de permissões.

Os logs não deverão armazenar senhas ou informações sensíveis.

---

# Auditoria

Toda operação crítica deverá registrar:

- usuário;
- Tenant;
- data e hora;
- operação executada.

Os registros de auditoria deverão permanecer disponíveis para consulta administrativa.

---

# Exclusão de Dados

O sistema utilizará Soft Delete para preservar a rastreabilidade dos registros.

A exclusão física será utilizada apenas quando necessária por exigência legal ou manutenção controlada.

---

# Exposição de Informações

Mensagens de erro não deverão revelar detalhes internos da aplicação.

Exemplos de informações que nunca deverão ser expostas:

- consultas SQL;
- stack traces;
- caminhos internos do servidor;
- credenciais;
- tokens.

---

# Dependências

Todas as dependências utilizadas deverão ser mantidas atualizadas.

Atualizações deverão ser avaliadas antes da implantação em produção.

---

# Segurança no Frontend

O Frontend nunca deverá:

- armazenar senhas;
- executar regras de autorização;
- definir o Tenant da operação;
- confiar em dados manipulados pelo usuário.

O Frontend é responsável apenas pela interface e pela comunicação com a API.

---

# Segurança no Backend

O Backend é responsável por:

- autenticar usuários;
- validar permissões;
- validar dados;
- aplicar isolamento entre Tenants;
- proteger informações sensíveis.

Toda decisão relacionada à segurança deverá ocorrer no Backend.

---

# Conclusão

A segurança é uma responsabilidade compartilhada entre toda a arquitetura do CRM.

Cada módulo desenvolvido deverá respeitar as diretrizes estabelecidas neste documento para garantir a proteção dos dados da Content Marketing Brasil e de seus clientes.