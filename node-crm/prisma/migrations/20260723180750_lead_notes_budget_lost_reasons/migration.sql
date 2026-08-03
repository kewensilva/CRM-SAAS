-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "budget_value" DECIMAL(14,2),
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "lost_reasons" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "lost_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lost_reasons_tenant_id_idx" ON "lost_reasons"("tenant_id");

-- AddForeignKey
ALTER TABLE "lost_reasons" ADD CONSTRAINT "lost_reasons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
