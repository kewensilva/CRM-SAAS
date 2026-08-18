-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT true;

-- Contas que já existiam antes desta feature já passaram pelo "primeiro acesso" há muito
-- tempo — sem isso, o DEFAULT true acima marcaria todo mundo de uma vez e forçaria troca
-- de senha no próximo login de usuários que já usam o sistema normalmente.
UPDATE "users" SET "must_change_password" = false;
