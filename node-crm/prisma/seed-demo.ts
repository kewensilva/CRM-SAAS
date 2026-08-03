import "dotenv/config";

import { prisma } from "../src/shared/database/prisma-client";
import { tenantRepository } from "../src/modules/tenants/repositories/tenant.repository";
import { tenantService } from "../src/modules/tenants/services/tenant.service";
import { userService } from "../src/modules/users/services/user.service";
import { userRepository } from "../src/modules/users/repositories/user.repository";
import { settingsService } from "../src/modules/settings/services/settings.service";
import { companyService } from "../src/modules/companies/services/company.service";
import { contactService } from "../src/modules/contacts/services/contact.service";
import { pipelineService } from "../src/modules/pipelines/services/pipeline.service";
import { stageService } from "../src/modules/pipelines/services/stage.service";
import { leadService } from "../src/modules/leads/services/lead.service";
import { dealService } from "../src/modules/deals/services/deal.service";
import { activityService } from "../src/modules/activities/services/activity.service";
import { metaIntegrationService } from "../src/modules/integrations/meta/services/meta-integration.service";

// Este script popula dados de demonstração usando os services reais (não Prisma cru),
// para garantir que tudo respeite as regras de negócio de verdade: hashing de senha,
// conversão de Lead ao criar Deal, histórico de etapas, constraints de ordem do Pipeline
// etc. É seguro rodar mais de uma vez — cada tenant é pulado se o domínio já existir.

type TenantBlueprint = {
    name: string;
    domain: string;
    adminName: string;
    adminEmail: string;
    team: { name: string; email: string; profile: "MANAGER" | "USER" }[];
    companies: {
        name: string;
        document: string;
        phone: string;
        email: string;
        website: string;
        city: string;
        state: string;
        status?: "ACTIVE" | "INACTIVE";
        contacts: { name: string; position: string; email: string; phone: string }[];
    }[];
    pipelineName: string;
    stages: { name: string; color: string }[];
    leads: { name: string; email: string; phone: string; companyIndex?: number }[];
    // índice do lead (na lista acima) que vira negociação, etapa alvo e situação final
    deals: { leadIndex: number; companyIndex: number; stageIndex: number; finalStatus: "IN_PROGRESS" | "WON" | "LOST" }[];
    activities: {
        title: string;
        dueDate: string;
        linkTo: "lead" | "deal";
        linkIndex: number;
        outcome: "PENDING" | "COMPLETED" | "CANCELLED";
    }[];
};

const PASSWORD = "Demo@1234";

const blueprints: TenantBlueprint[] = [
    {
        name: "Agência Delta Marketing",
        domain: "agencia-delta",
        adminName: "Fernanda Lima",
        adminEmail: "admin@agencia-delta.com",
        team: [
            { name: "Ricardo Alves", email: "ricardo@agencia-delta.com", profile: "MANAGER" },
            { name: "Camila Rocha", email: "camila@agencia-delta.com", profile: "USER" },
            { name: "Bruno Tavares", email: "bruno@agencia-delta.com", profile: "USER" },
        ],
        companies: [
            {
                name: "Padaria Bom Pão", document: "12345678000101", phone: "1132221001",
                email: "contato@bompao.com.br", website: "https://bompao.com.br",
                city: "São Paulo", state: "SP",
                contacts: [{ name: "José Ferreira", position: "Proprietário", email: "jose@bompao.com.br", phone: "11988880001" }],
            },
            {
                name: "Clínica Vitalle", document: "12345678000102", phone: "1132221002",
                email: "contato@vitalle.com.br", website: "https://vitalle.com.br",
                city: "São Paulo", state: "SP",
                contacts: [
                    { name: "Dra. Patrícia Nunes", position: "Diretora Clínica", email: "patricia@vitalle.com.br", phone: "11988880002" },
                    { name: "Eduardo Prado", position: "Administrador", email: "eduardo@vitalle.com.br", phone: "11988880003" },
                ],
            },
            {
                name: "Construtora Horizonte", document: "12345678000103", phone: "1132221003",
                email: "contato@horizonte.com.br", website: "https://horizonte.com.br",
                city: "Campinas", state: "SP",
                contacts: [{ name: "Marcos Vinícius", position: "Diretor Comercial", email: "marcos@horizonte.com.br", phone: "19988880004" }],
            },
            {
                name: "Studio Fit Academia", document: "12345678000104", phone: "1132221004",
                email: "contato@studiofit.com.br", website: "https://studiofit.com.br",
                city: "São Paulo", state: "SP",
                contacts: [{ name: "Larissa Mendes", position: "Gerente", email: "larissa@studiofit.com.br", phone: "11988880005" }],
            },
            {
                name: "Escritório Contábil Souza", document: "12345678000105", phone: "1132221005",
                email: "contato@souzacontabil.com.br", website: "https://souzacontabil.com.br",
                city: "Santo André", state: "SP", status: "INACTIVE",
                contacts: [{ name: "Antônio Souza", position: "Sócio", email: "antonio@souzacontabil.com.br", phone: "11988880006" }],
            },
        ],
        pipelineName: "Funil Comercial",
        stages: [
            { name: "Novo Lead", color: "#3366FF" },
            { name: "Qualificação", color: "#33AAFF" },
            { name: "Proposta Enviada", color: "#FFAA00" },
            { name: "Negociação", color: "#FF8800" },
            { name: "Fechamento", color: "#33CC66" },
        ],
        leads: [
            { name: "Renata Costa", email: "renata.costa@lead.com", phone: "11977770001", companyIndex: 0 },
            { name: "Felipe Martins", email: "felipe.martins@lead.com", phone: "11977770002", companyIndex: 1 },
            { name: "Juliana Alves", email: "juliana.alves@lead.com", phone: "11977770003", companyIndex: 2 },
            { name: "Rodrigo Pereira", email: "rodrigo.pereira@lead.com", phone: "11977770004", companyIndex: 3 },
            { name: "Aline Barbosa", email: "aline.barbosa@lead.com", phone: "11977770005" },
            { name: "Gustavo Ramos", email: "gustavo.ramos@lead.com", phone: "11977770006" },
            { name: "Beatriz Cardoso", email: "beatriz.cardoso@lead.com", phone: "11977770007" },
            { name: "Thiago Nogueira", email: "thiago.nogueira@lead.com", phone: "11977770008" },
        ],
        deals: [
            { leadIndex: 0, companyIndex: 0, stageIndex: 4, finalStatus: "WON" },
            { leadIndex: 1, companyIndex: 1, stageIndex: 3, finalStatus: "IN_PROGRESS" },
            { leadIndex: 2, companyIndex: 2, stageIndex: 4, finalStatus: "LOST" },
            { leadIndex: 3, companyIndex: 3, stageIndex: 1, finalStatus: "IN_PROGRESS" },
        ],
        activities: [
            { title: "Ligação de primeiro contato", dueDate: "2026-08-01T13:00:00Z", linkTo: "lead", linkIndex: 4, outcome: "PENDING" },
            { title: "Enviar apresentação institucional", dueDate: "2026-08-02T13:00:00Z", linkTo: "lead", linkIndex: 5, outcome: "COMPLETED" },
            { title: "Reunião de descoberta", dueDate: "2026-08-03T13:00:00Z", linkTo: "lead", linkIndex: 6, outcome: "CANCELLED" },
            { title: "Follow-up de proposta", dueDate: "2026-08-04T13:00:00Z", linkTo: "deal", linkIndex: 0, outcome: "COMPLETED" },
            { title: "Reunião de negociação final", dueDate: "2026-08-05T13:00:00Z", linkTo: "deal", linkIndex: 1, outcome: "PENDING" },
            { title: "Alinhamento de escopo", dueDate: "2026-08-06T13:00:00Z", linkTo: "deal", linkIndex: 3, outcome: "PENDING" },
        ],
    },
    {
        name: "Consultoria Prisma",
        domain: "consultoria-prisma",
        adminName: "Marcelo Duarte",
        adminEmail: "admin@consultoria-prisma.com",
        team: [
            { name: "Sabrina Teixeira", email: "sabrina@consultoria-prisma.com", profile: "MANAGER" },
            { name: "Diego Farias", email: "diego@consultoria-prisma.com", profile: "USER" },
        ],
        companies: [
            {
                name: "Transportes Rota Certa", document: "98765432000101", phone: "5132221001",
                email: "contato@rotacerta.com.br", website: "https://rotacerta.com.br",
                city: "Porto Alegre", state: "RS",
                contacts: [{ name: "Cláudio Machado", position: "Diretor de Operações", email: "claudio@rotacerta.com.br", phone: "51988880001" }],
            },
            {
                name: "Distribuidora Nova Era", document: "98765432000102", phone: "5132221002",
                email: "contato@novaera.com.br", website: "https://novaera.com.br",
                city: "Porto Alegre", state: "RS",
                contacts: [{ name: "Vanessa Oliveira", position: "Compradora", email: "vanessa@novaera.com.br", phone: "51988880002" }],
            },
            {
                name: "Tech Solutions Sul", document: "98765432000103", phone: "5132221003",
                email: "contato@techsul.com.br", website: "https://techsul.com.br",
                city: "Caxias do Sul", state: "RS",
                contacts: [{ name: "Henrique Cunha", position: "CTO", email: "henrique@techsul.com.br", phone: "54988880003" }],
            },
        ],
        pipelineName: "Pipeline de Vendas",
        stages: [
            { name: "Prospecção", color: "#3366FF" },
            { name: "Diagnóstico", color: "#33AAFF" },
            { name: "Proposta", color: "#FFAA00" },
            { name: "Fechado", color: "#33CC66" },
        ],
        leads: [
            { name: "Paula Ribeiro", email: "paula.ribeiro@lead.com", phone: "51977770001", companyIndex: 0 },
            { name: "Vinícius Castro", email: "vinicius.castro@lead.com", phone: "51977770002", companyIndex: 1 },
            { name: "Isabela Moura", email: "isabela.moura@lead.com", phone: "51977770003", companyIndex: 2 },
            { name: "André Lopes", email: "andre.lopes@lead.com", phone: "51977770004" },
            { name: "Carolina Dias", email: "carolina.dias@lead.com", phone: "51977770005" },
        ],
        deals: [
            { leadIndex: 0, companyIndex: 0, stageIndex: 3, finalStatus: "WON" },
            { leadIndex: 1, companyIndex: 1, stageIndex: 2, finalStatus: "IN_PROGRESS" },
        ],
        activities: [
            { title: "Ligação de qualificação", dueDate: "2026-08-01T13:00:00Z", linkTo: "lead", linkIndex: 3, outcome: "PENDING" },
            { title: "Envio de material técnico", dueDate: "2026-08-02T13:00:00Z", linkTo: "lead", linkIndex: 4, outcome: "COMPLETED" },
            { title: "Reunião de fechamento", dueDate: "2026-08-03T13:00:00Z", linkTo: "deal", linkIndex: 0, outcome: "COMPLETED" },
        ],
    },
];

const seedTenant = async (blueprint: TenantBlueprint) => {
    const existing = await tenantRepository.findByDomain(blueprint.domain);

    if (existing) {
        console.log(`Tenant "${blueprint.name}" já existe (${blueprint.domain}), pulando.`);
        return;
    }

    console.log(`Criando tenant "${blueprint.name}"...`);

    const tenant = await tenantService.createTenant({
        name: blueprint.name,
        domain: blueprint.domain,
        adminName: blueprint.adminName,
        adminEmail: blueprint.adminEmail,
        adminPassword: PASSWORD,
    });

    await settingsService.updateByTenant(tenant.id, {
        primaryColor: "#1A2B3C",
        secondaryColor: "#FFAA00",
        logoUrl: `https://placehold.co/200x60?text=${encodeURIComponent(blueprint.name)}`,
    });

    const admin = await userRepository.findByTenantAndEmail(tenant.id, blueprint.adminEmail);
    if (!admin) {
        throw new Error(`Admin de "${blueprint.name}" não encontrado após criação do tenant.`);
    }

    const teamUsers = [admin];
    for (const member of blueprint.team) {
        const user = await userService.createUser({
            tenantId: tenant.id,
            name: member.name,
            email: member.email,
            password: PASSWORD,
            profile: member.profile,
        });
        teamUsers.push(user);
    }

    const companies = [];
    for (const companyBlueprint of blueprint.companies) {
        const company = await companyService.createCompany({
            tenantId: tenant.id,
            name: companyBlueprint.name,
            document: companyBlueprint.document,
            phone: companyBlueprint.phone,
            email: companyBlueprint.email,
            website: companyBlueprint.website,
            city: companyBlueprint.city,
            state: companyBlueprint.state,
        });
        companies.push(company);

        if (companyBlueprint.status === "INACTIVE") {
            await companyService.updateCompany(company.id, tenant.id, { status: "INACTIVE" });
        }

        for (const contactBlueprint of companyBlueprint.contacts) {
            await contactService.createContact({
                tenantId: tenant.id,
                companyId: company.id,
                name: contactBlueprint.name,
                position: contactBlueprint.position,
                email: contactBlueprint.email,
                phone: contactBlueprint.phone,
            });
        }
    }

    const pipeline = await pipelineService.createPipeline({ tenantId: tenant.id, name: blueprint.pipelineName });

    const stages = [];
    for (let i = 0; i < blueprint.stages.length; i += 1) {
        const stageBlueprint = blueprint.stages[i];
        if (!stageBlueprint) continue;
        const stage = await stageService.createStage(pipeline.id, tenant.id, {
            name: stageBlueprint.name,
            order: i + 1,
            color: stageBlueprint.color,
        });
        stages.push(stage);
    }

    const responsibleForLeads = teamUsers[teamUsers.length - 1] ?? admin;

    const leads = [];
    for (const leadBlueprint of blueprint.leads) {
        const company = leadBlueprint.companyIndex !== undefined ? companies[leadBlueprint.companyIndex] : undefined;
        const lead = await leadService.createLead({
            tenantId: tenant.id,
            responsibleUserId: responsibleForLeads.id,
            name: leadBlueprint.name,
            email: leadBlueprint.email,
            phone: leadBlueprint.phone,
            ...(company ? { companyId: company.id } : {}),
        });
        leads.push(lead);
    }

    // PUT /leads/:id/status já existe (Kanban), mas mover pra PERDIDO agora cria uma
    // negociação de verdade (exige empresa/Pipeline/Etapa já montados) — setado direto
    // aqui só pra dar variedade visual ao frontend sem depender da ordem de criação
    // dos demais dados de demonstração abaixo.
    if (leads[5]) await prisma.lead.update({ where: { id: leads[5].id }, data: { status: "EM_ANDAMENTO" } });
    if (leads[7]) await prisma.lead.update({ where: { id: leads[7].id }, data: { status: "PERDIDO" } });

    const deals = [];
    for (const dealBlueprint of blueprint.deals) {
        const lead = leads[dealBlueprint.leadIndex];
        const company = companies[dealBlueprint.companyIndex];
        const firstStage = stages[0];
        if (!lead || !company || !firstStage) continue;

        const deal = await dealService.createDeal(
            {
                tenantId: tenant.id,
                leadId: lead.id,
                companyId: company.id,
                responsibleUserId: responsibleForLeads.id,
                pipelineId: pipeline.id,
                stageId: firstStage.id,
            },
            admin.id,
        );

        const targetStage = stages[dealBlueprint.stageIndex];
        if (targetStage && targetStage.id !== firstStage.id) {
            await dealService.changeStage(deal.id, tenant.id, { stageId: targetStage.id }, admin.id);
        }

        if (dealBlueprint.finalStatus !== "IN_PROGRESS") {
            await dealService.changeStatus(deal.id, tenant.id, { status: dealBlueprint.finalStatus });
        }

        deals.push(deal);
    }

    for (const activityBlueprint of blueprint.activities) {
        const linkedId =
            activityBlueprint.linkTo === "lead"
                ? leads[activityBlueprint.linkIndex]?.id
                : deals[activityBlueprint.linkIndex]?.id;

        if (!linkedId) continue;

        const activity = await activityService.createActivity({
            tenantId: tenant.id,
            responsibleUserId: responsibleForLeads.id,
            title: activityBlueprint.title,
            dueDate: new Date(activityBlueprint.dueDate),
            ...(activityBlueprint.linkTo === "lead" ? { leadId: linkedId } : { dealId: linkedId }),
        });

        if (activityBlueprint.outcome === "COMPLETED") {
            await activityService.completeActivity(activity.id, tenant.id);
        } else if (activityBlueprint.outcome === "CANCELLED") {
            await activityService.cancelActivity(activity.id, tenant.id);
        }
    }

    // Integração Meta desabilitada, só como exemplo de configuração; os logs abaixo são
    // dados fictícios inseridos direto (não passaram por um webhook real) só para o
    // frontend ter o que renderizar na tela de logs da integração.
    await metaIntegrationService.updateByTenant(tenant.id, {
        pageId: "000000000000000",
        pageAccessToken: "demo-fake-page-access-token",
        defaultResponsibleUserId: responsibleForLeads.id,
        duplicateStrategy: "IGNORE",
    });

    await prisma.metaIntegrationLog.createMany({
        data: [
            {
                tenantId: tenant.id,
                leadgenId: "demo-leadgen-001",
                pageId: "000000000000000",
                formId: "demo-form-1",
                status: "PROCESSED",
                rawPayload: JSON.stringify({ note: "dado de demonstração, não veio de um webhook real" }),
            },
            {
                tenantId: tenant.id,
                leadgenId: "demo-leadgen-002",
                pageId: "000000000000000",
                formId: "demo-form-1",
                status: "FAILED",
                errorMessage: "Graph API retornou 400: Invalid OAuth access token (dado de demonstração)",
                rawPayload: JSON.stringify({ note: "dado de demonstração, não veio de um webhook real" }),
            },
        ],
    });

    console.log(
        `Tenant "${blueprint.name}" pronto: ${teamUsers.length} usuários, ${companies.length} empresas, ` +
            `${leads.length} leads, ${deals.length} negociações, ${blueprint.activities.length} atividades.`,
    );
};

const run = async () => {
    for (const blueprint of blueprints) {
        await seedTenant(blueprint);
    }

    console.log(`\nSenha padrão de todos os usuários criados neste script: ${PASSWORD}`);
    await prisma.$disconnect();
};

run().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
