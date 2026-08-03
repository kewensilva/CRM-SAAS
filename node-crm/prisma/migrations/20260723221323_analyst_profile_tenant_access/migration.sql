-- AlterEnum
ALTER TYPE "UserProfile" ADD VALUE 'ANALYST';

-- CreateTable
CREATE TABLE "analyst_tenant_access" (
    "id" UUID NOT NULL,
    "analyst_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyst_tenant_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analyst_tenant_access_analyst_id_idx" ON "analyst_tenant_access"("analyst_id");

-- CreateIndex
CREATE INDEX "analyst_tenant_access_tenant_id_idx" ON "analyst_tenant_access"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "analyst_tenant_access_analyst_id_tenant_id_key" ON "analyst_tenant_access"("analyst_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "analyst_tenant_access" ADD CONSTRAINT "analyst_tenant_access_analyst_id_fkey" FOREIGN KEY ("analyst_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyst_tenant_access" ADD CONSTRAINT "analyst_tenant_access_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
