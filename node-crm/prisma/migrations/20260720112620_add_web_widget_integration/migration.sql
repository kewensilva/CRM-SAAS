-- CreateEnum
CREATE TYPE "WebWidgetLogStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'DUPLICATE', 'FAILED');

-- CreateTable
CREATE TABLE "web_widget_integrations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "public_key" TEXT NOT NULL,
    "default_responsible_user_id" UUID,
    "duplicate_strategy" "DuplicateLeadStrategy" NOT NULL DEFAULT 'IGNORE',
    "show_email_field" BOOLEAN NOT NULL DEFAULT true,
    "show_phone_field" BOOLEAN NOT NULL DEFAULT true,
    "show_message_field" BOOLEAN NOT NULL DEFAULT true,
    "button_label" TEXT NOT NULL DEFAULT 'Fale conosco',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "web_widget_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_widget_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "lead_id" UUID,
    "status" "WebWidgetLogStatus" NOT NULL DEFAULT 'RECEIVED',
    "error_message" TEXT,
    "page_url" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "message" TEXT,
    "raw_payload" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "web_widget_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "web_widget_integrations_tenant_id_key" ON "web_widget_integrations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "web_widget_integrations_public_key_key" ON "web_widget_integrations"("public_key");

-- CreateIndex
CREATE INDEX "web_widget_integrations_public_key_idx" ON "web_widget_integrations"("public_key");

-- CreateIndex
CREATE INDEX "web_widget_logs_tenant_id_idx" ON "web_widget_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "web_widget_logs_status_idx" ON "web_widget_logs"("status");

-- AddForeignKey
ALTER TABLE "web_widget_integrations" ADD CONSTRAINT "web_widget_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_widget_integrations" ADD CONSTRAINT "web_widget_integrations_default_responsible_user_id_fkey" FOREIGN KEY ("default_responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_widget_logs" ADD CONSTRAINT "web_widget_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_widget_logs" ADD CONSTRAINT "web_widget_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
