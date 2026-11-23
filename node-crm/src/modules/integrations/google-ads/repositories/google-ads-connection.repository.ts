import { decryptToken, encryptToken } from "../../../../shared/crypto/token-cipher";
import { prisma } from "../../../../shared/database/prisma-client";
import type { GoogleAdsConnection } from "../types/google-ads.types";

type ConnectionChanges = {
    googleEmail?: string | null;
    refreshToken?: string | null;
    customerId?: string | null;
    customerName?: string | null;
    loginCustomerId?: string | null;
};

// O refresh token fica criptografado no banco; quem lê pelo repositório recebe o valor em texto
// puro (uso interno, para pedir access tokens ao Google). Nunca vai ao navegador.
const withPlainToken = (record: GoogleAdsConnection | null): GoogleAdsConnection | null =>
    record?.refreshToken ? { ...record, refreshToken: decryptToken(record.refreshToken) } : record;

const findByTenant = async (tenantId: string): Promise<GoogleAdsConnection | null> =>
    withPlainToken(await prisma.googleAdsConnection.findFirst({ where: { tenantId, deletedAt: null } }));

// Registro único por tenant, criado na primeira conexão.
const upsertByTenant = async (tenantId: string, changes: ConnectionChanges): Promise<GoogleAdsConnection> => {
    const data = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)) as ConnectionChanges;

    if (data.refreshToken) {
        data.refreshToken = encryptToken(data.refreshToken);
    }

    const record = await prisma.googleAdsConnection.upsert({
        where: { tenantId },
        create: { tenantId, ...data },
        update: { ...data, deletedAt: null },
    });

    return withPlainToken(record) as GoogleAdsConnection;
};

export const googleAdsConnectionRepository = { findByTenant, upsertByTenant };
