import { hashPassword } from "../../../shared/auth/password";
import { AuthorizationError, ConflictError, NotFoundError } from "../../../shared/errors";
import { userRepository } from "../../users/repositories/user.repository";
import type { CreateOwnerDTO } from "../dto/create-owner.dto";
import { ownerRepository } from "../repositories/owner.repository";
import type { Owner } from "../types/owner.types";

// Conta raiz da plataforma — nunca pode ser removida, nem por outro Owner. Sem isso, uma
// remoção acidental (ou mal-intencionada) do último Owner administrativo derrubaria o
// acesso de gestão da CMB à própria plataforma sem ter como recuperar. Configurável via
// env pra não hardcodar segredo nenhum, mas o e-mail em si não é sensível.
const PROTECTED_OWNER_EMAIL = process.env["PROTECTED_OWNER_EMAIL"] ?? "dev@cmb.dev";

const createOwner = async (data: CreateOwnerDTO): Promise<Owner> => {
    const existing = await userRepository.findByTenantAndEmail(null, data.email);

    if (existing) {
        throw new ConflictError("Já existe um usuário com este e-mail.");
    }

    const passwordHash = await hashPassword(data.password);

    return ownerRepository.create({ name: data.name, email: data.email, passwordHash });
};

const listOwners = (): Promise<Owner[]> => {
    return ownerRepository.list();
};

// Só o próprio Owner autenticado pode criar/apagar outro Owner (checado na rota via
// authorize("OWNER")) — aqui só falta impedir que ele apague a própria conta por engano,
// o que o deixaria sem acesso nenhum à plataforma.
const deleteOwner = async (id: string, requestingUserId: string): Promise<void> => {
    if (id === requestingUserId) {
        throw new AuthorizationError("Você não pode remover a própria conta.");
    }

    const owner = await ownerRepository.findById(id);

    if (!owner) {
        throw new NotFoundError("Owner não encontrado.");
    }

    if (owner.email === PROTECTED_OWNER_EMAIL) {
        throw new AuthorizationError("Esta conta é protegida e não pode ser removida.");
    }

    await ownerRepository.softDelete(id);
};

export const ownerService = {
    createOwner,
    listOwners,
    deleteOwner,
};
