import ExcelJS from "exceljs";

// Modelo baixável na tela de importação — mesmas colunas que lead-import.service.ts
// reconhece (COLUMN_ALIASES), com uma linha de exemplo pra deixar claro o formato
// esperado sem o usuário precisar adivinhar.
const buildTemplateWorkbook = async (): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CRM CMB";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Leads");

    const headerRow = sheet.getRow(1);
    ["Nome", "Email", "Telefone"].forEach((title, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = title;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF9521" } };
    });
    headerRow.commit();

    sheet.getRow(2).values = ["Maria Silva", "maria.silva@exemplo.com", "(11) 91234-5678"];

    sheet.columns = [{ width: 28 }, { width: 32 }, { width: 20 }];

    return workbook.xlsx.writeBuffer();
};

export const leadImportTemplateService = {
    buildTemplateWorkbook,
};
