import { NotFoundError } from "../../../shared/errors";
import type { Pagination } from "../../../shared/types/api-response";
import type { CreateCompanyDTO } from "../dto/create-company.dto";
import type { UpdateCompanyDTO } from "../dto/update-company.dto";
import { companyRepository } from "../repositories/company.repository";
import type { Company } from "../types/company.types";

const createCompany = (data: CreateCompanyDTO): Promise<Company> => {
    return companyRepository.create(data);
};

const getCompany = async (id: string, tenantId: string): Promise<Company> => {
    const company = await companyRepository.findByIdAndTenant(id, tenantId);

    if (!company) {
        throw new NotFoundError("Empresa não encontrada.");
    }

    return company;
};

const listCompanies = async (
    tenantId: string,
    page: number,
    pageSize: number,
    search?: string | undefined,
): Promise<{ items: Company[]; pagination: Pagination }> => {
    const { items, totalItems } = await companyRepository.listByTenant(tenantId, {
        page,
        pageSize,
        search,
    });

    return {
        items,
        pagination: {
            page,
            pageSize,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
        },
    };
};

const updateCompany = async (
    id: string,
    tenantId: string,
    data: UpdateCompanyDTO,
): Promise<Company> => {
    await getCompany(id, tenantId);

    return companyRepository.update(id, data);
};

const deleteCompany = async (id: string, tenantId: string): Promise<void> => {
    await getCompany(id, tenantId);
    await companyRepository.softDelete(id);
};

export const companyService = {
    createCompany,
    getCompany,
    listCompanies,
    updateCompany,
    deleteCompany,
};
