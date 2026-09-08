-- CreateTable
CREATE TABLE "budget_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "channel_name" TEXT NOT NULL,
    "month" TIMESTAMPTZ NOT NULL,
    "budget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "investment" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "budget_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_entries_tenant_id_month_idx" ON "budget_entries"("tenant_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "budget_entries_tenant_id_channel_name_month_key" ON "budget_entries"("tenant_id", "channel_name", "month");

-- AddForeignKey
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
