import { randomUUID } from "node:crypto";

import type { CreateLeadDTO } from "../dto/create-lead.dto";
import type { Lead } from "../types/lead.types";

// TODO: substituir por Prisma quando o PostgreSQL for configurado
// (ver database-agent.md e database-patterns.md).
const leads: Lead[] = [];

const create = (data: CreateLeadDTO): Lead => {
    const now = new Date();

    const lead: Lead = {
        id: randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: "NEW",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
    };

    leads.push(lead);

    return lead;
};

const findById = (id: string): Lead | undefined => {
    return leads.find((lead) => lead.id === id && lead.deletedAt === null);
};

const list = (): Lead[] => {
    return leads.filter((lead) => lead.deletedAt === null);
};

export const leadRepository = {
    create,
    findById,
    list,
};
