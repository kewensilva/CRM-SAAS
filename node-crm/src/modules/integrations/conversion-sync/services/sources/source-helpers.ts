// Utilidades comuns aos conectores: os payloads das origens são dados externos sem tipo.

export type UnknownRecord = Record<string, unknown>;

export const asRecord = (value: unknown): UnknownRecord =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};

// Campos personalizados chegam como texto, número ou lista (RD Marketing manda lista).
export const asText = (value: unknown): string | null => {
    const first = Array.isArray(value) ? value[0] : value;

    if (typeof first === "string") {
        return first.trim() || null;
    }

    return typeof first === "number" ? String(first) : null;
};

export const asNumber = (value: unknown): number | null => {
    const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : value;

    return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
};

export const asDate = (value: unknown, fallback: Date): Date => {
    const date = typeof value === "string" || typeof value === "number" ? new Date(value) : null;

    return date && !Number.isNaN(date.getTime()) ? date : fallback;
};
