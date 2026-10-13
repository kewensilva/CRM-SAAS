import type { Prisma } from "../../../../../generated/prisma/client";
import { decryptToken, encryptToken } from "../../../../shared/crypto/token-cipher";
import { prisma } from "../../../../shared/database/prisma-client";
import { stripUndefined } from "../../../../shared/helpers/nullable-fields";
import type { UpdateMetaIntegrationDTO } from "../dto/update-meta-integration.dto";
import type { MetaIntegration } from "../types/meta-integration.types";

// O token fica criptografado no banco; quem lê pelo repositório recebe o valor já em texto
// puro (uso interno: chamar a Graph API). Nunca devolva isso ao navegador — use
// toPublicIntegration() antes de responder.
const withPlainToken = (record: MetaIntegration | null): MetaIntegration | null => {
    if (!record || !record.pageAccessToken) {
        return record;
    }

    return { ...record, pageAccessToken: decryptToken(record.pageAccessToken) };
};

const findByTenant = async (tenantId: string): Promise<MetaIntegration | null> => {
    const record = await prisma.metaIntegration.findFirst({
        where: { tenantId, deletedAt: null },
    });

    return withPlainToken(record);
};

const findByPageId = async (pageId: string): Promise<MetaIntegration | null> => {
    const record = await prisma.metaIntegration.findFirst({
        where: { pageId, enabled: true, deletedAt: null },
    });

    return withPlainToken(record);
};

// Upsert: a integração nasce desabilitada e sem página vinculada assim que o Tenant é
// criado seria complexidade sem uso real (nem todo Tenant vai usar Meta Lead Ads) — em vez
// disso o registro só é criado na primeira vez que o Tenant Admin configura algo.
const upsertByTenant = async (
    tenantId: string,
    data: UpdateMetaIntegrationDTO,
): Promise<MetaIntegration> => {
    const protectedData: UpdateMetaIntegrationDTO =
        typeof data.pageAccessToken === "string"
            ? { ...data, pageAccessToken: encryptToken(data.pageAccessToken) }
            : data;

    const updateData = stripUndefined(protectedData) as unknown as Prisma.MetaIntegrationUpdateInput;
    const createData = {
        tenantId,
        ...stripUndefined(protectedData),
    } as unknown as Prisma.MetaIntegrationUncheckedCreateInput;

    const record = await prisma.metaIntegration.upsert({
        where: { tenantId },
        update: updateData,
        create: createData,
    });

    return withPlainToken(record) as MetaIntegration;
};

export const metaIntegrationRepository = {
    findByTenant,
    findByPageId,
    upsertByTenant,
};