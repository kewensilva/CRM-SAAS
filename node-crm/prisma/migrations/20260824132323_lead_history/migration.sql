-- CreateTable
CREATE TABLE "lead_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "from_status" "LeadStatus",
    "to_status" "LeadStatus" NOT NULL,
    "changed_by_user_id" UUID,
    "changed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_history_tenant_id_idx" ON "lead_history"("tenant_id");

-- CreateIndex
CREATE INDEX "lead_history_lead_id_idx" ON "lead_history"("lead_id");

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: leads que já existiam antes desta feature não têm histórico granular de
-- cada transição de status, então cada um ganha uma única entrada de "criação"
-- representando o estado atual conhecido (from_status nulo, to_status = status atual,
-- changed_at = created_at do lead) — melhor um registro aproximado do que nenhum.
INSERT INTO "lead_history" ("id", "tenant_id", "lead_id", "from_status", "to_status", "changed_by_user_id", "changed_at")
SELECT gen_random_uuid(), "tenant_id", "id", NULL, "status", "responsible_user_id", "created_at"
FROM "leads";
