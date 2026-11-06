-- CreateEnum
CREATE TYPE "ConversionSource" AS ENUM ('RD_STATION_MARKETING', 'RD_STATION_CRM', 'BITRIX24');

-- CreateEnum
CREATE TYPE "ConversionTrigger" AS ENUM ('NEW_CONVERSION', 'OPPORTUNITY', 'LIFECYCLE_STAGE', 'DEAL_STAGE', 'DEAL_WON');

-- CreateEnum
CREATE TYPE "ConversionWebhookStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConversionUploadStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "conversion_integrations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "source" "ConversionSource" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "webhook_token" TEXT NOT NULL,
    "google_ads_customer_id" TEXT,
    "gclid_field" TEXT,
    "source_api_url" TEXT,
    "source_api_token" TEXT,
    "webhook_secret" TEXT,
    "currency_code" TEXT NOT NULL DEFAULT 'BRL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "conversion_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "integration_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "ConversionTrigger" NOT NULL,
    "trigger_value" TEXT,
    "conversion_action_id" TEXT NOT NULL,
    "send_value" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "conversion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_webhook_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "integration_id" UUID,
    "status" "ConversionWebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "error_message" TEXT,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversion_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_uploads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "integration_id" UUID NOT NULL,
    "rule_id" UUID NOT NULL,
    "webhook_log_id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "gclid" TEXT,
    "has_email" BOOLEAN NOT NULL DEFAULT false,
    "has_phone" BOOLEAN NOT NULL DEFAULT false,
    "user_identifiers" JSONB,
    "conversion_value" DECIMAL(14,2),
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "status" "ConversionUploadStatus" NOT NULL DEFAULT 'PENDING',
    "google_request_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversion_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversion_integrations_webhook_token_key" ON "conversion_integrations"("webhook_token");

-- CreateIndex
CREATE INDEX "conversion_integrations_tenant_id_idx" ON "conversion_integrations"("tenant_id");

-- CreateIndex
CREATE INDEX "conversion_rules_integration_id_idx" ON "conversion_rules"("integration_id");

-- CreateIndex
CREATE INDEX "conversion_rules_tenant_id_idx" ON "conversion_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "conversion_webhook_logs_integration_id_created_at_idx" ON "conversion_webhook_logs"("integration_id", "created_at");

-- CreateIndex
CREATE INDEX "conversion_uploads_integration_id_created_at_idx" ON "conversion_uploads"("integration_id", "created_at");

-- CreateIndex
CREATE INDEX "conversion_uploads_tenant_id_idx" ON "conversion_uploads"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversion_uploads_rule_id_transaction_id_key" ON "conversion_uploads"("rule_id", "transaction_id");

-- AddForeignKey
ALTER TABLE "conversion_integrations" ADD CONSTRAINT "conversion_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_rules" ADD CONSTRAINT "conversion_rules_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "conversion_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_webhook_logs" ADD CONSTRAINT "conversion_webhook_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "conversion_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_uploads" ADD CONSTRAINT "conversion_uploads_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "conversion_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_uploads" ADD CONSTRAINT "conversion_uploads_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "conversion_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_uploads" ADD CONSTRAINT "conversion_uploads_webhook_log_id_fkey" FOREIGN KEY ("webhook_log_id") REFERENCES "conversion_webhook_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
