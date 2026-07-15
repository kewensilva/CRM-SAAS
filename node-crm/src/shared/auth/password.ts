import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = (plainPassword: string, passwordHash: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, passwordHash);
};
