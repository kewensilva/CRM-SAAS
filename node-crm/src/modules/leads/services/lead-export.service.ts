import { readFileSync } from "fs";
import path from "path";

import ExcelJS from "exceljs";

import { leadRepository } from "../repositories/lead.repository";

const LOGO_PATH = path.join(__dirname, "..", "..", "..", "shared", "assets", "cmb-logo.png");

const STATUS_LABELS: Record<string, string> = {
    SEM_CONTATO: "Sem contato",
    NAO_ATENDE: "Não atende",
    EM_ANDAMENTO: "Em andamento",
    VENDIDO: "Vendido",
    PERDIDO: "Perdido",
};

// DD/MM/YYYY HH:mm:ss sem vírgula, igual ao formato do modelo de exportação de referência
// (toLocaleString com essas opções insere ", " entre data e hora em pt-BR).
const pad = (value: number): string => String(value).padStart(2, "0");

const formatDate = (date: Date): string =>
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const formatCurrency = (value: unknown): string => {
    const numeric = value === null || value === undefined ? 0 : Number(value);
    return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export type ExportContext = {
    tenantName: string;
    exportedByName: string;
    filterSummary: string;
};

// Layout inspirado no modelo de exportação de referência do usuário (mesmo bloco de
// cabeçalho "Data:/Cliente:/Usuário:/Filtros:" e a mesma linha de colunas) — só com o
// subconjunto de colunas que o nosso CRM realmente tem dado pra preencher (CPF/CNPJ,
// ClickId, Campanha/Anúncio e perguntas dinâmicas de formulário do modelo não existem
// nos nossos Leads, então ficaram de fora em vez de exportadas vazias).
const buildWorkbook = async (
    leads: Awaited<ReturnType<typeof leadRepository.listByIdsAndTenantForExport>>,
    context: ExportContext,
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CRM CMB";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("CRM");

    // Logo no canto (célula E1, ao lado do bloco Data/Cliente/Usuário/Filtros) — não
    // desloca nenhuma célula existente, só desenha por cima da planilha numa área que
    // já ficava em branco no layout de referência do usuário.
    const logoImageId = workbook.addImage({
        buffer: readFileSync(LOGO_PATH) as unknown as ExcelJS.Buffer,
        extension: "png",
    });
    sheet.addImage(logoImageId, { tl: { col: 4, row: 0 }, ext: { width: 64, height: 64 } });

    sheet.getCell("A1").value = "Data:";
    sheet.getCell("B1").value = formatDate(new Date());
    sheet.getCell("A2").value = "Cliente:";
    sheet.getCell("B2").value = context.tenantName;
    sheet.getCell("A3").value = "Usuário:";
    sheet.getCell("B3").value = context.exportedByName;
    sheet.getCell("A4").value = "Filtros:";
    sheet.getCell("B4").value = context.filterSummary;

    ["A1", "A2", "A3", "A4"].forEach((ref) => {
        sheet.getCell(ref).font = { bold: true };
    });

    const headerRowNumber = 6;
    const headers = [
        "Email",
        "Nome",
        "Telefone",
        "Data",
        "Comentário",
        "Usuário Atribuído",
        "Status",
        "Data do Ganho/Perda",
        "Valor",
        "Origem",
    ];

    const headerRow = sheet.getRow(headerRowNumber);
    headers.forEach((title, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = title;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF9521" } };
    });
    headerRow.commit();

    leads.forEach((lead, index) => {
        const rowNumber = headerRowNumber + 1 + index;
        const source = lead.webWidgetLogs.length > 0 ? "Site" : lead.metaLogs.length > 0 ? "Meta" : "Manual";
        const value = lead.deal?.value ?? lead.budgetValue ?? null;

        const row = sheet.getRow(rowNumber);
        row.values = [
            lead.email ?? "",
            lead.name,
            lead.phone ?? "",
            formatDate(lead.createdAt),
            lead.notes ?? "",
            lead.responsible.name,
            STATUS_LABELS[lead.status] ?? lead.status,
            lead.deal ? formatDate(lead.deal.createdAt) : "",
            value !== null ? formatCurrency(value) : "",
            source,
        ];
    });

    sheet.columns = [
        { width: 28 },
        { width: 28 },
        { width: 18 },
        { width: 20 },
        { width: 40 },
        { width: 24 },
        { width: 16 },
        { width: 20 },
        { width: 16 },
        { width: 12 },
    ];

    return workbook.xlsx.writeBuffer();
};

const exportLeads = async (
    tenantId: string,
    leadIds: string[],
    context: ExportContext,
): Promise<ExcelJS.Buffer> => {
    const leads = await leadRepository.listByIdsAndTenantForExport(tenantId, leadIds);

    return buildWorkbook(leads, context);
};

export const leadExportService = {
    exportLeads,
};
