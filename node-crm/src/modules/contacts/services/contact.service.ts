import { NotFoundError } from "../../../shared/errors";
import type { Pagination } from "../../../shared/types/api-response";
import { companyRepository } from "../../companies/repositories/company.repository";
import type { CreateContactDTO } from "../dto/create-contact.dto";
import type { UpdateContactDTO } from "../dto/update-contact.dto";
import { contactRepository } from "../repositories/contact.repository";
import type { Contact } from "../types/contact.types";

const createContact = async (data: CreateContactDTO): Promise<Contact> => {
    const company = await companyRepository.findByIdAndTenant(data.companyId, data.tenantId);

    if (!company) {
        throw new NotFoundError("Empresa não encontrada.");
    }

    return contactRepository.create(data);
};

const getContact = async (id: string, tenantId: string): Promise<Contact> => {
    const contact = await contactRepository.findByIdAndTenant(id, tenantId);

    if (!contact) {
        throw new NotFoundError("Contato não encontrado.");
    }

    return contact;
};

const listContacts = async (
    tenantId: string,
    page: number,
    pageSize: number,
    companyId?: string | undefined,
    search?: string | undefined,
): Promise<{ items: Contact[]; pagination: Pagination }> => {
    const { items, totalItems } = await contactRepository.listByTenant(tenantId, {
        page,
        pageSize,
        companyId,
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

const updateContact = async (
    id: string,
    tenantId: string,
    data: UpdateContactDTO,
): Promise<Contact> => {
    await getContact(id, tenantId);

    return contactRepository.update(id, data);
};

const deleteContact = async (id: string, tenantId: string): Promise<void> => {
    await getContact(id, tenantId);
    await contactRepository.softDelete(id);
};

export const contactService = {
    createContact,
    getContact,
    listContacts,
    updateContact,
    deleteContact,
};
