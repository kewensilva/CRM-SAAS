-- CreateEnum
CREATE TYPE "UserAccessType" AS ENUM ('LOGIN', 'SWITCH_TENANT');

-- CreateTable
CREATE TABLE "user_access_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID,
    "type" "UserAccessType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_access_logs_user_id_created_at_idx" ON "user_access_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_access_logs_tenant_id_idx" ON "user_access_logs"("tenant_id");

-- AddForeignKey
ALTER TABLE "user_access_logs" ADD CONSTRAINT "user_access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_access_logs" ADD CONSTRAINT "user_access_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
