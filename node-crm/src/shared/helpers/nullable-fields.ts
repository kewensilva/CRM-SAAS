// Converte campos opcionais (string | undefined) em (string | null) para criação —
// Prisma exige valor explícito ou ausência total da chave, nunca `undefined`.
export const undefinedToNull = <T extends Record<string, unknown>>(obj: T): T => {
    const result = {} as T;

    for (const key of Object.keys(obj) as (keyof T)[]) {
        result[key] = (obj[key] === undefined ? null : obj[key]) as T[keyof T];
    }

    return result;
};

// Remove chaves com valor `undefined` para updates parciais — mantém apenas
// os campos que o cliente realmente enviou.
export const stripUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
    const result: Partial<T> = {};

    for (const key of Object.keys(obj) as (keyof T)[]) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }

    return result;
};
