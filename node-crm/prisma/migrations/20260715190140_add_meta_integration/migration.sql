-- CreateEnum
CREATE TYPE "DuplicateLeadStrategy" AS ENUM ('IGNORE', 'UPDATE');

-- CreateEnum
CREATE TYPE "MetaIntegrationLogStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'DUPLICATE', 'FAILED');

-- CreateTable
CREATE TABLE "meta_integrations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "page_id" TEXT,
    "page_access_token" TEXT,
    "default_responsible_user_id" UUID,
    "duplicate_strategy" "DuplicateLeadStrategy" NOT NULL DEFAULT 'IGNORE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "meta_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_integration_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "lead_id" UUID,
    "leadgen_id" TEXT NOT NULL,
    "page_id" TEXT,
    "form_id" TEXT,
    "ad_id" TEXT,
    "status" "MetaIntegrationLogStatus" NOT NULL DEFAULT 'RECEIVED',
    "error_message" TEXT,
    "raw_payload" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "meta_integration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meta_integrations_tenant_id_key" ON "meta_integrations"("tenant_id");

-- CreateIndex
CREATE INDEX "meta_integrations_page_id_idx" ON "meta_integrations"("page_id");

-- CreateIndex
CREATE INDEX "meta_integration_logs_tenant_id_idx" ON "meta_integration_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "meta_integration_logs_leadgen_id_idx" ON "meta_integration_logs"("leadgen_id");

-- CreateIndex
CREATE INDEX "meta_integration_logs_status_idx" ON "meta_integration_logs"("status");

-- AddForeignKey
ALTER TABLE "meta_integrations" ADD CONSTRAINT "meta_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_integrations" ADD CONSTRAINT "meta_integrations_default_responsible_user_id_fkey" FOREIGN KEY ("default_responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_integration_logs" ADD CONSTRAINT "meta_integration_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_integration_logs" ADD CONSTRAINT "meta_integration_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
