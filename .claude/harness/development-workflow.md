# Workflow de Desenvolvimento

## Objetivo

Este documento define o fluxo oficial de desenvolvimento do CRM.

Toda nova funcionalidade deverá seguir exatamente esta sequência.

O objetivo é garantir previsibilidade, reduzir retrabalho e manter a consistência da arquitetura.

---

# Princípios

Durante o desenvolvimento deverão ser respeitados os seguintes princípios:

- desenvolver uma funcionalidade por vez;
- concluir completamente um módulo antes de iniciar outro;
- evitar mudanças desnecessárias em código já validado;
- implementar apenas o que foi solicitado;
- manter compatibilidade com a arquitetura oficial.

---

# Ordem Oficial de Desenvolvimento

Toda funcionalidade deverá seguir a sequência abaixo.

1. Compreender a necessidade.
2. Validar as regras de negócio.
3. Identificar impactos na arquitetura.
4. Atualizar documentação, quando necessário.
5. Criar ou alterar o banco de dados.
6. Criar Migration.
7. Atualizar Prisma.
8. Implementar Repository.
9. Implementar Service.
10. Implementar Controller.
11. Registrar rotas.
12. Implementar validações.
13. Implementar testes.
14. Implementar tela Angular.
15. Validar funcionamento completo.
16. Encerrar a funcionalidade.

Nenhuma etapa deverá ser ignorada.

---

# Desenvolvimento Incremental

Cada entrega deverá representar uma funcionalidade completa.

Exemplo:

Errado

Criar metade do módulo Leads e iniciar Companies.

Correto

Finalizar completamente Leads antes de iniciar Companies.

---

# Escopo

Cada tarefa deverá possuir escopo limitado.

Exemplos:

Criar cadastro de empresas.

Implementar login.

Criar dashboard.

Evitar tarefas muito grandes.

---

# Refatoração

Refatorações somente deverão ocorrer quando:

- houver erro confirmado;
- houver necessidade técnica;
- fizerem parte da tarefa atual.

Evitar refatorações paralelas.

---

# Código Existente

Código já validado não deverá ser alterado sem necessidade.

Antes de modificar qualquer implementação existente deverá ser avaliado:

- motivo da alteração;
- impacto em outros módulos;
- compatibilidade.

---

# Implementações

Antes de criar uma nova implementação verificar:

- já existe solução semelhante?
- existe função reutilizável?
- existe componente compartilhado?

Evitar duplicação.

---

# Banco de Dados

Alterações estruturais deverão seguir esta ordem:

1. Atualizar schema Prisma.
2. Criar migration.
3. Executar migration.
4. Validar estrutura.
5. Atualizar código.

Nunca alterar diretamente o banco de produção.

---

# API

Ao implementar um endpoint seguir:

1. Validação.
2. Controller.
3. Service.
4. Repository.
5. Teste.
6. Documentação.

---

# Frontend

Ao criar uma tela seguir:

1. Models.
2. Service.
3. Component.
4. Formulário.
5. Integração com API.
6. Validação.
7. Testes visuais.

---

# Testes

Sempre validar:

- fluxo feliz;
- dados inválidos;
- permissões;
- autenticação;
- regras de negócio.

---

# Correção de Bugs

Ao corrigir um erro:

1. Identificar causa.
2. Corrigir apenas a causa.
3. Validar impacto.
4. Executar testes relacionados.

Evitar alterações desnecessárias.

---

# Organização

Cada commit deverá representar uma unidade lógica de trabalho.

Evitar commits contendo múltiplas funcionalidades.

---

# Desenvolvimento Paralelo

Evitar desenvolver dois módulos simultaneamente.

A prioridade é concluir o módulo atual.

---

# Alterações Arquiteturais

Mudanças na arquitetura deverão ocorrer apenas quando aprovadas.

A implementação nunca deverá alterar a arquitetura por iniciativa própria.

---

# Mudanças de Escopo

Caso uma necessidade não esteja relacionada à tarefa atual:

Registrar.

Concluir a tarefa atual.

Retomar posteriormente.

---

# Pendências

Pendências deverão ser registradas de forma objetiva.

Exemplo:

TODO: Implementar importação de Leads via arquivo CSV.

Evitar deixar implementações incompletas.

---

# Ordem dos Módulos

A sequência oficial de implementação será:

1. Autenticação
2. Tenants
3. Usuários
4. Configurações
5. Empresas
6. Contatos
7. Leads
8. Pipeline
9. Negociações
10. Atividades
11. Dashboard
12. Integração Meta Lead Ads
13. Auditoria

Essa ordem deverá ser respeitada sempre que possível.

---

# Revisão

Antes de considerar uma funcionalidade concluída verificar:

- atende à regra de negócio;
- segue a arquitetura;
- segue os padrões da API;
- segue os padrões do banco;
- segue os padrões de código;
- segue as permissões;
- segue o isolamento Multi-Tenant.

---

# O que NÃO Fazer

Não criar funcionalidades não solicitadas.

Não alterar arquitetura.

Não trocar bibliotecas.

Não alterar padrões definidos.

Não criar código duplicado.

Não iniciar novos módulos antes de concluir o atual.

---

# Critério de Conclusão

Uma funcionalidade somente será considerada concluída quando:

- banco atualizado;
- backend concluído;
- frontend concluído;
- validações implementadas;
- testes executados;
- documentação atualizada (quando aplicável).

---

# Objetivo Final

O desenvolvimento do CRM deverá ocorrer de forma incremental, previsível e organizada.

Toda implementação deverá seguir este workflow para garantir qualidade, reduzir retrabalho e manter consistência durante toda a evolução do projeto.