-- CreateEnum
CREATE TYPE "GoogleAdsConversionTrigger" AS ENUM ('LEAD_CREATED', 'LEAD_QUALIFIED', 'LEAD_WON');

-- CreateEnum
CREATE TYPE "GoogleAdsLeadOrigin" AS ENUM ('SITE', 'META', 'MANUAL');

-- CreateEnum
CREATE TYPE "GoogleAdsUploadStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- DropForeignKey
ALTER TABLE "conversion_integrations" DROP CONSTRAINT "conversion_integrations_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "conversion_rules" DROP CONSTRAINT "conversion_rules_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "conversion_webhook_logs" DROP CONSTRAINT "conversion_webhook_logs_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "conversion_uploads" DROP CONSTRAINT "conversion_uploads_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "conversion_uploads" DROP CONSTRAINT "conversion_uploads_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "conversion_uploads" DROP CONSTRAINT "conversion_uploads_webhook_log_id_fkey";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "gclid" TEXT;

-- DropTable
DROP TABLE "conversion_integrations";

-- DropTable
DROP TABLE "conversion_rules";

-- DropTable
DROP TABLE "conversion_webhook_logs";

-- DropTable
DROP TABLE "conversion_uploads";

-- DropEnum
DROP TYPE "ConversionSource";

-- DropEnum
DROP TYPE "ConversionTrigger";

-- DropEnum
DROP TYPE "ConversionWebhookStatus";

-- DropEnum
DROP TYPE "ConversionUploadStatus";

-- CreateTable
CREATE TABLE "google_ads_connections" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "google_email" TEXT,
    "refresh_token" TEXT,
    "customer_id" TEXT,
    "customer_name" TEXT,
    "login_customer_id" TEXT,
    "currency_code" TEXT NOT NULL DEFAULT 'BRL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "google_ads_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_ads_conversion_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "GoogleAdsConversionTrigger" NOT NULL,
    "origin_filter" "GoogleAdsLeadOrigin",
    "conversion_action_id" TEXT NOT NULL,
    "conversion_action_name" TEXT,
    "send_value" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "google_ads_conversion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_ads_conversion_uploads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "rule_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "gclid" TEXT,
    "has_email" BOOLEAN NOT NULL DEFAULT false,
    "has_phone" BOOLEAN NOT NULL DEFAULT false,
    "user_identifiers" JSONB,
    "conversion_value" DECIMAL(14,2),
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "status" "GoogleAdsUploadStatus" NOT NULL DEFAULT 'PENDING',
    "google_request_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "google_ads_conversion_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_connections_tenant_id_key" ON "google_ads_connections"("tenant_id");

-- CreateIndex
CREATE INDEX "google_ads_conversion_rules_tenant_id_idx" ON "google_ads_conversion_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "google_ads_conversion_rules_connection_id_idx" ON "google_ads_conversion_rules"("connection_id");

-- CreateIndex
CREATE INDEX "google_ads_conversion_uploads_connection_id_created_at_idx" ON "google_ads_conversion_uploads"("connection_id", "created_at");

-- CreateIndex
CREATE INDEX "google_ads_conversion_uploads_tenant_id_idx" ON "google_ads_conversion_uploads"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_conversion_uploads_rule_id_lead_id_key" ON "google_ads_conversion_uploads"("rule_id", "lead_id");

-- AddForeignKey
ALTER TABLE "google_ads_connections" ADD CONSTRAINT "google_ads_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_ads_conversion_rules" ADD CONSTRAINT "google_ads_conversion_rules_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "google_ads_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_ads_conversion_uploads" ADD CONSTRAINT "google_ads_conversion_uploads_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "google_ads_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_ads_conversion_uploads" ADD CONSTRAINT "google_ads_conversion_uploads_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "google_ads_conversion_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_ads_conversion_uploads" ADD CONSTRAINT "google_ads_conversion_uploads_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

