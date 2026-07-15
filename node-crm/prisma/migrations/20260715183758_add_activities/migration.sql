-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "deal_id" UUID,
    "lead_id" UUID,
    "responsible_user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMPTZ NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_tenant_id_idx" ON "activities"("tenant_id");

-- CreateIndex
CREATE INDEX "activities_deal_id_idx" ON "activities"("deal_id");

-- CreateIndex
CREATE INDEX "activities_lead_id_idx" ON "activities"("lead_id");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- CreateIndex
CREATE INDEX "activities_due_date_idx" ON "activities"("due_date");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
