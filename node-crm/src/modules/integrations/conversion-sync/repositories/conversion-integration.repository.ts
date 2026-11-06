import type { Prisma } from "../../../../../generated/prisma/client";
import { decryptToken, encryptToken } from "../../../../shared/crypto/token-cipher";
import { prisma } from "../../../../shared/database/prisma-client";
import { stripUndefined } from "../../../../shared/helpers/nullable-fields";
import type { CreateConversionIntegrationDTO, SaveConversionIntegrationDTO } from "../dto/conversion-integration.dto";
import type { ConversionIntegration } from "../types/conversion-sync.types";

const SECRET_FIELDS = ["sourceApiUrl", "sourceApiToken", "webhookSecret"] as const;

// Segredos criptografados no banco; quem lê pelo repositório recebe em texto puro (uso
// interno). Nunca devolva isso ao navegador — use toPublicIntegration().
const decryptSecrets = (record: ConversionIntegration | null): ConversionIntegration | null => {
    if (!record) {
        return null;
    }

    const decrypted = { ...record };

    for (const field of SECRET_FIELDS) {
        decrypted[field] = record[field] ? decryptToken(record[field] as string) : null;
    }

    return decrypted;
};

// "" = apagar o segredo; undefined = não alterar.
const encryptSecrets = (data: SaveConversionIntegrationDTO): SaveConversionIntegrationDTO => {
    const encrypted = { ...data };

    for (const field of SECRET_FIELDS) {
        const value = data[field];

        if (value !== undefined) {
            encrypted[field] = value ? encryptToken(value) : null;
        }
    }

    return encrypted;
};

const create = async (
    tenantId: string,
    webhookToken: string,
    data: CreateConversionIntegrationDTO,
): Promise<ConversionIntegration> => {
    const record = await prisma.conversionIntegration.create({
        data: {
            tenantId,
            webhookToken,
            ...stripUndefined(encryptSecrets(data)),
        } as Prisma.ConversionIntegrationUncheckedCreateInput,
    });

    return decryptSecrets(record) as ConversionIntegration;
};

const update = async (
    id: string,
    data: SaveConversionIntegrationDTO & { webhookToken?: string },
): Promise<ConversionIntegration> => {
    const record = await prisma.conversionIntegration.update({
        where: { id },
        data: stripUndefined(encryptSecrets(data)) as Prisma.ConversionIntegrationUpdateInput,
    });

    return decryptSecrets(record) as ConversionIntegration;
};

const softDelete = async (id: string): Promise<void> => {
    await prisma.conversionIntegration.update({ where: { id }, data: { deletedAt: new Date(), enabled: false } });
};

const findByIdAndTenant = async (id: string, tenantId: string): Promise<ConversionIntegration | null> =>
    decryptSecrets(await prisma.conversionIntegration.findFirst({ where: { id, tenantId, deletedAt: null } }));

const findByWebhookToken = async (webhookToken: string): Promise<ConversionIntegration | null> =>
    decryptSecrets(await prisma.conversionIntegration.findFirst({ where: { webhookToken, deletedAt: null } }));

const listByTenant = async (tenantId: string): Promise<ConversionIntegration[]> => {
    const records = await prisma.conversionIntegration.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "asc" },
    });

    return records.map((record) => decryptSecrets(record) as ConversionIntegration);
};

export const conversionIntegrationRepository = {
    create,
    update,
    softDelete,
    findByIdAndTenant,
    findByWebhookToken,
    listByTenant,
};
