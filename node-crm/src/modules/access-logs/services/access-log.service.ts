import type { UserAccessType } from "../../../../generated/prisma/enums";
import { logger } from "../../../shared/logger/logger";
import { accessLogRepository } from "../repositories/access-log.repository";

// Registra um acesso SEM bloquear nem derrubar o fluxo de quem chamou: se a gravação falhar
// (banco oscilando, migration ainda não aplicada), o login continua funcionando — só deixa de
// contar naquele acesso, e o motivo aparece nos logs.
const record = (data: { userId: string; tenantId: string | null; type: UserAccessType }): void => {
    accessLogRepository.create(data).catch((error: unknown) => {
        logger.warn({ error, userId: data.userId, type: data.type }, "[access-log] Falha ao registrar acesso.");
    });
};

export const accessLogService = {
    record,
};
