-- Renomeia os valores existentes do enum LeadStatus para bater com as colunas do Kanban
-- de Leads, preservando os dados já existentes (RENAME VALUE, não drop+add).
ALTER TYPE "LeadStatus" RENAME VALUE 'NEW' TO 'SEM_CONTATO';
ALTER TYPE "LeadStatus" RENAME VALUE 'IN_PROGRESS' TO 'EM_ANDAMENTO';
ALTER TYPE "LeadStatus" RENAME VALUE 'CONVERTED' TO 'VENDIDO';
ALTER TYPE "LeadStatus" RENAME VALUE 'LOST' TO 'PERDIDO';

-- Novo valor sem equivalente anterior.
ALTER TYPE "LeadStatus" ADD VALUE 'NAO_ATENDE';

-- Novo default da coluna (era 'NEW', agora 'SEM_CONTATO' pelo rename acima).
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'SEM_CONTATO';

-- Campos novos em Deal: preenchidos ao mover um Lead pra Vendido (value opcional) ou
-- Perdido (ambos obrigatórios) no Kanban.
ALTER TABLE "deals" ADD COLUMN "value" DECIMAL(14,2);
ALTER TABLE "deals" ADD COLUMN "lost_reason" TEXT;
