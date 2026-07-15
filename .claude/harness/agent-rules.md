# Regras Gerais dos Agentes

## Objetivo

Este documento define as regras obrigatórias que todos os agentes do projeto deverão seguir.

Nenhum agente poderá ignorar estas regras.

Estas diretrizes possuem prioridade sobre qualquer estratégia individual de implementação.

---

# Princípio Fundamental

O objetivo do agente é desenvolver o CRM respeitando integralmente a arquitetura oficial do projeto.

O agente nunca deverá improvisar uma nova arquitetura.

---

# Antes de Implementar

Antes de escrever qualquer código, o agente deverá:

1. compreender completamente a solicitação;
2. identificar o módulo afetado;
3. consultar os documentos do Harness relacionados;
4. verificar se já existe implementação semelhante;
5. identificar possíveis impactos.

Somente após essas etapas a implementação poderá começar.

---

# Não Fazer Suposições

Caso alguma informação não exista na documentação oficial, o agente não deverá inventar uma solução.

Quando necessário, deverá solicitar definição ao desenvolvedor.

---

# Seguir a Arquitetura

Toda implementação deverá seguir:

- arquitetura oficial;
- estrutura de pastas;
- padrões da API;
- padrões do banco;
- padrões de código;
- padrões de segurança.

Nenhum agente poderá criar exceções.

---

# Escopo

O agente deverá implementar apenas o que foi solicitado.

Não adicionar funcionalidades extras.

Não remover funcionalidades existentes.

Não alterar comportamento sem solicitação.

---

# Código Existente

Antes de modificar qualquer código existente, o agente deverá compreender sua responsabilidade.

Nunca substituir implementações apenas porque existe outra forma de fazer.

---

# Reutilização

Antes de criar uma nova função, verificar se já existe implementação equivalente.

Evitar duplicação.

---

# Clareza

Priorizar código simples.

Evitar soluções excessivamente sofisticadas.

O código deverá ser facilmente compreendido por outro desenvolvedor.

---

# Refatoração

Refatorações somente deverão ocorrer quando:

- fizerem parte da tarefa;
- corrigirem um problema;
- reduzirem duplicação.

Nunca refatorar por preferência pessoal.

---

# Comentários

Evitar comentários desnecessários.

O código deverá ser autoexplicativo.

---

# Dependências

Não adicionar bibliotecas sem necessidade.

Antes de sugerir uma nova dependência verificar:

- existe solução nativa?
- existe biblioteca já utilizada?
- realmente é necessária?

---

# Segurança

Nunca reduzir requisitos de segurança para facilitar a implementação.

---

# Multi-Tenant

Toda implementação deverá respeitar o isolamento entre Tenants.

Nenhuma consulta poderá ignorar o contexto do Tenant autenticado.

---

# Backend

Toda regra de negócio pertence ao Backend.

O Frontend nunca deverá assumir responsabilidades do Backend.

---

# Frontend

O Frontend deverá preocupar-se apenas com:

- interface;
- experiência do usuário;
- comunicação com API.

---

# Banco de Dados

Toda alteração estrutural deverá ocorrer através de Migration.

Nunca modificar diretamente o banco.

---

# Testes

Sempre validar:

- fluxo principal;
- erros;
- permissões;
- regras de negócio.

---

# Erros

Todos os erros deverão utilizar o padrão oficial definido no projeto.

---

# Organização

O agente deverá manter:

- nomes consistentes;
- pastas corretas;
- módulos independentes;
- baixo acoplamento.

---

# Comunicação

Ao concluir uma tarefa, o agente deverá informar objetivamente:

- o que foi implementado;
- arquivos alterados;
- impacto da alteração;
- próximos passos, quando aplicável.

---

# Alterações Arquiteturais

O agente nunca poderá alterar a arquitetura oficial sem aprovação explícita.

---

# Critério de Qualidade

Antes de concluir uma implementação, o agente deverá verificar:

- atende à regra de negócio;
- segue o Harness;
- segue os padrões do projeto;
- mantém compatibilidade com o restante do sistema.

---

# Objetivo Final

Todo agente deverá atuar como um membro da equipe de desenvolvimento da Content Marketing Brasil, mantendo consistência, previsibilidade e qualidade em todas as implementações.