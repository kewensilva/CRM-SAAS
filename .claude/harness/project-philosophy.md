# Filosofia do Projeto

## Objetivo

Este documento define a filosofia oficial de desenvolvimento do CRM.

Todas as decisões técnicas, arquiteturais e de negócio deverão respeitar os princípios definidos neste documento.

Sempre que existir dúvida entre duas soluções possíveis, deverá ser escolhida aquela que estiver mais alinhada com esta filosofia.

Este documento possui prioridade sobre qualquer outro documento do projeto.

---

# Sobre o Produto

O CRM é uma plataforma SaaS Multi-Tenant desenvolvida exclusivamente para atender a operação da Content Marketing Brasil (CMB) e seus clientes.

O sistema não pretende competir com CRMs generalistas como HubSpot, Salesforce ou Pipedrive.

O objetivo é resolver de forma eficiente as necessidades reais dos clientes da CMB, oferecendo uma solução simples, organizada, segura e fácil de manter.

---

# Filosofia de Desenvolvimento

O projeto será desenvolvido priorizando:

- Simplicidade
- Clareza
- Organização
- Manutenção
- Consistência
- Segurança

Toda implementação deverá ser facilmente compreendida por outro desenvolvedor.

Código inteligente é aquele que pode ser entendido rapidamente.

---

# Complexidade

A complexidade deve ser evitada.

Nenhuma tecnologia será utilizada apenas por ser moderna ou popular.

Toda dependência adicionada ao projeto deve possuir uma justificativa clara.

Sempre perguntar:

"Esta solução realmente resolve um problema do projeto?"

Se a resposta for não, ela não deve ser implementada.

---

# Crescimento

O sistema foi planejado para atender aproximadamente:

- 30 a 50 empresas
- até 7 usuários por empresa

A arquitetura deverá permitir crescimento futuro.

Porém, nenhuma decisão deve ser tomada pensando em milhões de usuários ou dezenas de milhares de empresas.

O projeto deve evoluir conforme a necessidade do negócio.

---

# Modularidade

O sistema será dividido em módulos independentes.

Cada módulo deverá possuir responsabilidades bem definidas.

Um módulo nunca deverá conhecer detalhes internos de outro módulo.

Toda comunicação entre módulos deverá ocorrer através de interfaces bem definidas.

---

# Regras de Negócio

Toda regra de negócio pertence ao Backend.

O Frontend nunca deverá implementar regras de negócio.

O Frontend apenas apresenta informações e envia solicitações para a API.

---

# Frontend

O Frontend será desenvolvido utilizando Angular.

Sua responsabilidade é:

- Interface
- Navegação
- Componentes
- Experiência do usuário
- Consumo da API

Nenhuma decisão de negócio deverá permanecer no Frontend.

---

# Backend

O Backend será responsável por:

- Regras de negócio
- Segurança
- Validação
- Autenticação
- Autorização
- Persistência
- Integrações

Toda decisão importante deverá ocorrer no Backend.

---

# Banco de Dados

O banco deverá refletir o domínio do negócio.

Modelagens excessivamente complexas deverão ser evitadas.

A leitura das tabelas deve ser intuitiva.

Os nomes das entidades deverão representar o negócio.

---

# Organização do Código

Todo código deverá possuir responsabilidade única.

Arquivos muito grandes deverão ser divididos.

Funções muito extensas deverão ser refatoradas.

Duplicação de código deverá ser evitada.

A legibilidade é mais importante do que reduzir linhas de código.

---

# Convenções

Todo o projeto utilizará:

- TypeScript
- ESLint
- Prettier

As convenções deverão ser respeitadas por todos os módulos.

---

# Segurança

A segurança não é opcional.

Todo dado recebido pelo sistema deverá ser validado.

Nunca confiar em informações vindas do Frontend.

Toda operação deverá verificar autenticação e autorização.

---

# Multi-Tenant

O isolamento entre empresas é um requisito obrigatório.

Nenhum Tenant poderá acessar dados pertencentes a outro Tenant.

Toda implementação deverá considerar este requisito desde o início.

---

# Integrações

O sistema possuirá apenas integrações necessárias ao negócio.

Inicialmente estão previstas:

- Meta Lead Ads
- Webhooks próprios

Novas integrações deverão ser implementadas como módulos independentes.

---

# Desenvolvimento Assistido por IA

Este projeto foi planejado para ser desenvolvido com auxílio de Inteligência Artificial.

Toda documentação deverá servir como contexto para ferramentas como Codex e ChatGPT.

Nenhuma IA deve assumir comportamentos não documentados.

Sempre que uma nova regra de negócio surgir, ela deverá ser documentada antes da implementação.

A documentação é considerada parte do código.

---

# Documentação

Toda funcionalidade relevante deverá possuir documentação.

A documentação deve permanecer sincronizada com o código.

Implementações que alterem regras de negócio devem atualizar os documentos correspondentes.

---

# Decisões Técnicas

Sempre escolher:

- soluções simples;
- baixo acoplamento;
- alta legibilidade;
- facilidade de manutenção.

Evitar abstrações desnecessárias.

Não utilizar padrões de projeto apenas por convenção.

Cada padrão adotado deve resolver um problema real.

---

# Qualidade

Antes de considerar uma funcionalidade concluída, verificar:

- atende ao requisito do negócio;
- segue os padrões definidos;
- possui código legível;
- possui validações;
- possui tratamento de erros;
- está documentada.

---

# Objetivo Final

Construir um CRM confiável, organizado e sustentável, capaz de atender os clientes da Content Marketing Brasil com qualidade, mantendo uma base de código simples de evoluir e preparada para crescer de forma controlada.

Toda decisão tomada durante o desenvolvimento deverá contribuir para esse objetivo.