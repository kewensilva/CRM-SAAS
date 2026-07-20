-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "referral_source" TEXT;

-- CreateTable
CREATE TABLE "tenant_widgets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "button_color" TEXT,
    "icon" TEXT,
    "default_responsible_user_id" UUID,
    "requested_fields" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tenant_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_widgets_tenant_id_key" ON "tenant_widgets"("tenant_id");

-- AddForeignKey
ALTER TABLE "tenant_widgets" ADD CONSTRAINT "tenant_widgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_widgets" ADD CONSTRAINT "tenant_widgets_default_responsible_user_id_fkey" FOREIGN KEY ("default_responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
