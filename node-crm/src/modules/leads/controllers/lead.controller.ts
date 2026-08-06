import type { Request, Response } from "express";

import { ValidationError } from "../../../shared/errors";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import { leadExportService } from "../services/lead-export.service";
import { leadImportService } from "../services/lead-import.service";
import { leadImportTemplateService } from "../services/lead-import-template.service";
import { leadService } from "../services/lead.service";
import { createLeadSchema, exportLeadsSchema, updateLeadSchema } from "../validators/lead.validator";

const create = async (req: Request, res: Response) => {
    const parsed = createLeadSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    // Responsável assume-se como o próprio usuário autenticado até o Pipeline
    // permitir reatribuição (ver business-rules.md — Leads > Responsável).
    const lead = await leadService.createLead({
        ...parsed.data,
        tenantId: req.auth.tenantId as string,
        responsibleUserId: req.auth.userId,
    });

    return res.status(201).json({ success: true, data: lead });
};

const list = async (req: Request, res: Response) => {
    const leads = await leadService.listWithDetails(req.auth.tenantId as string);

    return res.status(200).json({ success: true, data: leads });
};

const update = async (req: Request, res: Response) => {
    const parsed = updateLeadSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const lead = await leadService.updateLead(
        req.params.id as string,
        req.auth.tenantId as string,
        parsed.data,
    );

    return res.status(200).json({ success: true, data: lead });
};

const importFile = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new ValidationError("Arquivo obrigatório.", [
            { field: "file", message: "Envie um arquivo .xlsx." },
        ]);
    }

    const result = await leadImportService.importLeads(
        req.auth.tenantId as string,
        req.auth.userId,
        req.file.buffer,
    );

    return res.status(200).json({ success: true, data: result });
};

const exportFile = async (req: Request, res: Response) => {
    const parsed = exportLeadsSchema.safeParse(req.body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            field: String(issue.path[0] ?? "body"),
            message: issue.message,
        }));

        throw new ValidationError("Dados inválidos.", details);
    }

    const tenantId = req.auth.tenantId as string;
    const [tenant, exportedBy] = await Promise.all([
        tenantRepository.findById(tenantId),
        userRepository.findById(req.auth.userId),
    ]);

    const buffer = await leadExportService.exportLeads(tenantId, parsed.data.leadIds, {
        tenantName: tenant?.name ?? "",
        exportedByName: exportedBy?.name ?? "",
        filterSummary: parsed.data.filterSummary ?? "Nenhum filtro aplicado",
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", 'attachment; filename="leads.xlsx"');

    return res.status(200).send(Buffer.from(buffer));
};

const importTemplate = async (_req: Request, res: Response) => {
    const buffer = await leadImportTemplateService.buildTemplateWorkbook();

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", 'attachment; filename="modelo-importacao-leads.xlsx"');

    return res.status(200).send(Buffer.from(buffer));
};

export const leadController = {
    create,
    list,
    update,
    importFile,
    importTemplate,
    exportFile,
};
