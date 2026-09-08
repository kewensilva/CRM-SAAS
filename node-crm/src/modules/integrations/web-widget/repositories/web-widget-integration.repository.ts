import { randomBytes } from "crypto";

import type { Prisma } from "../../../../../generated/prisma/client";
import { prisma } from "../../../../shared/database/prisma-client";
import { stripUndefined } from "../../../../shared/helpers/nullable-fields";
import type { UpdateWebWidgetIntegrationDTO } from "../dto/update-web-widget-integration.dto";
import type { WebWidgetIntegration } from "../types/web-widget-integration.types";

// messageFields é Json no Prisma (Prisma.JsonValue) — cast pro tipo estruturado
// WebWidgetMessageField[] que o resto do módulo usa, mesmo padrão de
// lead.repository.ts > listByTenantWithLogs pra campos que o Prisma não tipa
// automaticamente como o shape real gravado.
const findByTenant = (tenantId: string): Promise<WebWidgetIntegration | null> => {
    return prisma.webWidgetIntegration.findFirst({
        where: { tenantId, deletedAt: null },
    }) as unknown as Promise<WebWidgetIntegration | null>;
};

const findByPublicKey = (publicKey: string): Promise<WebWidgetIntegration | null> => {
    return prisma.webWidgetIntegration.findFirst({
        where: { publicKey, enabled: true, deletedAt: null },
    }) as unknown as Promise<WebWidgetIntegration | null>;
};

const generatePublicKey = (): string => randomBytes(24).toString("hex");

// Upsert: o registro só existe a partir do momento em que o Tenant Admin configura o
// widget pela primeira vez, mesmo padrão do MetaIntegration. A publicKey é gerada uma
// única vez na criação e nunca muda em updates subsequentes (só via regenerateKey).
const upsertByTenant = async (
    tenantId: string,
    data: UpdateWebWidgetIntegrationDTO,
): Promise<WebWidgetIntegration> => {
    const updateData = stripUndefined(data) as unknown as Prisma.WebWidgetIntegrationUpdateInput;
    const createData = {
        tenantId,
        publicKey: generatePublicKey(),
        ...stripUndefined(data),
    } as unknown as Prisma.WebWidgetIntegrationUncheckedCreateInput;

    return prisma.webWidgetIntegration.upsert({
        where: { tenantId },
        update: updateData,
        create: createData,
    }) as unknown as Promise<WebWidgetIntegration>;
};

const regenerateKey = async (tenantId: string): Promise<WebWidgetIntegration> => {
    return prisma.webWidgetIntegration.update({
        where: { tenantId },
        data: { publicKey: generatePublicKey() },
    }) as unknown as Promise<WebWidgetIntegration>;
};

export const webWidgetIntegrationRepository = {
    findByTenant,
    findByPublicKey,
    upsertByTenant,
    regenerateKey,
};
