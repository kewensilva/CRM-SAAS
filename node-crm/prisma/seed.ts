import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

import { PrismaClient } from "../generated/prisma/client";

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "owner@cmb.dev";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "Owner@123";

const seed = async () => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });

    const existingOwner = await prisma.user.findFirst({
        where: { tenantId: null, email: OWNER_EMAIL, deletedAt: null },
    });

    if (existingOwner) {
        console.log(`Owner já existe: ${OWNER_EMAIL}`);
        await prisma.$disconnect();
        return;
    }

    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 10);

    await prisma.user.create({
        data: {
            tenantId: null,
            name: "Owner",
            email: OWNER_EMAIL,
            passwordHash,
            profile: "OWNER",
        },
    });

    console.log(`Owner criado: ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
    await prisma.$disconnect();
};

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
