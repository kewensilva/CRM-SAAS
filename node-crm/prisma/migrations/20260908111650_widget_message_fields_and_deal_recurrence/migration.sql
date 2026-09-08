-- CreateEnum
CREATE TYPE "DealPaymentType" AS ENUM ('UNICO', 'RECORRENTE');

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "payment_type" "DealPaymentType" NOT NULL DEFAULT 'UNICO';

-- AlterTable: nova coluna message_fields substitui show_message_field (booleano único)
-- por uma lista parametrizável de perguntas. Backfill antes de derrubar a coluna antiga:
-- quem tinha o campo de mensagem ligado ganha um único campo "Mensagem" (comportamento
-- equivalente ao anterior); quem tinha desligado fica com lista vazia.
ALTER TABLE "web_widget_integrations" ADD COLUMN "message_fields" JSONB NOT NULL DEFAULT '[]';

UPDATE "web_widget_integrations"
SET "message_fields" = CASE
    WHEN "show_message_field" THEN '[{"key":"mensagem","label":"Mensagem"}]'::jsonb
    ELSE '[]'::jsonb
END;

ALTER TABLE "web_widget_integrations" DROP COLUMN "show_message_field";
