import ExcelJS from "exceljs";

import { createLeadSchema } from "../validators/lead.validator";
import { leadRepository } from "../repositories/lead.repository";

export type ImportRowError = { row: number; message: string };

export type ImportLeadsResult = {
    createdCount: number;
    errors: ImportRowError[];
};

// Cabeçalhos aceitos por coluna — case/acento-insensível, já que o usuário pode reabrir
// o próprio arquivo exportado pelo CRM (mesmos nomes de coluna) ou editar manualmente.
const COLUMN_ALIASES: Record<"name" | "email" | "phone", string[]> = {
    name: ["nome"],
    email: ["email", "e-mail"],
    phone: ["telefone", "fone"],
};

const normalize = (value: string): string =>
    value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim()
        .toLowerCase();

const buildColumnMap = (headerRow: ExcelJS.Row): Partial<Record<"name" | "email" | "phone", number>> => {
    const map: Partial<Record<"name" | "email" | "phone", number>> = {};

    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = normalize(String(cell.value ?? ""));

        for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (aliases.includes(header)) {
                map[field as "name" | "email" | "phone"] = colNumber;
            }
        }
    });

    return map;
};

const cellText = (row: ExcelJS.Row, column: number | undefined): string | undefined => {
    if (!column) {
        return undefined;
    }

    const value = row.getCell(column).value;

    if (value === null || value === undefined) {
        return undefined;
    }

    return String(value).trim() || undefined;
};

// Importação em massa via Excel: aceita o mesmo layout de colunas exportado pelo CRM
// (ver lead-export.service.ts) — procura o cabeçalho pelo NOME da coluna, não pela
// posição, então funciona mesmo se o usuário reordenar/remover colunas que não usa.
// companyId não é aceito aqui (não faz parte do layout de exportação/importação) — leads
// importados chegam sem empresa vinculada, igual aos leads recebidos por integração.
const importLeads = async (
    tenantId: string,
    responsibleUserId: string,
    fileBuffer: Buffer,
): Promise<ImportLeadsResult> => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as unknown as ExcelJS.Buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
        return { createdCount: 0, errors: [{ row: 0, message: "Planilha vazia ou inválida." }] };
    }

    const headerRow = worksheet.getRow(1);
    const columnMap = buildColumnMap(headerRow);

    if (!columnMap.name) {
        return {
            createdCount: 0,
            errors: [{ row: 1, message: 'Coluna "Nome" não encontrada na primeira linha da planilha.' }],
        };
    }

    let createdCount = 0;
    const errors: ImportRowError[] = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);

        if (row.cellCount === 0) {
            continue;
        }

        const candidate = {
            name: cellText(row, columnMap.name),
            email: cellText(row, columnMap.email),
            phone: cellText(row, columnMap.phone),
        };

        if (!candidate.name && !candidate.email && !candidate.phone) {
            continue;
        }

        const parsed = createLeadSchema.safeParse(candidate);

        if (!parsed.success) {
            const message = parsed.error.issues.map((issue) => issue.message).join(" ");
            errors.push({ row: rowNumber, message });
            continue;
        }

        await leadRepository.create({ ...parsed.data, tenantId, responsibleUserId }, responsibleUserId);
        createdCount += 1;
    }

    return { createdCount, errors };
};

export const leadImportService = {
    importLeads,
};
