import { createHash } from "node:crypto";

// Normalização exigida pelo Google antes do hash (Data Manager API > Formatting):
// e-mail em minúsculas e sem espaços; em gmail.com/googlemail.com, sem pontos e sem o "+..."
// antes do @. Telefone em E.164. Depois, SHA-256 em hex.
const GMAIL_DOMAINS = ["gmail.com", "googlemail.com"];
const BRAZIL_COUNTRY_CODE = "55";
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export const sha256Hex = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

export const normalizeEmail = (raw: string | null | undefined): string | null => {
    const email = raw?.replace(/\s+/g, "").toLowerCase();

    if (!email || !email.includes("@")) {
        return null;
    }

    const at = email.lastIndexOf("@");
    const localPart = email.slice(0, at);
    const domain = email.slice(at + 1);

    if (!localPart || !domain) {
        return null;
    }

    if (GMAIL_DOMAINS.includes(domain)) {
        const [username = ""] = localPart.split("+");

        return `${username.replace(/\./g, "")}@${domain}`;
    }

    return email;
};

// Telefones das origens chegam em formatos variados ("(11) 98888-7777", "5511988887777",
// "+55 11 ..."). Sem código de país, assume Brasil (10 ou 11 dígitos = DDD + número).
export const normalizePhone = (raw: string | null | undefined): string | null => {
    if (!raw) {
        return null;
    }

    const hasPlus = raw.trim().startsWith("+");
    let digits = raw.replace(/\D/g, "").replace(/^00/, "");

    if (!hasPlus && (digits.length === 10 || digits.length === 11)) {
        digits = `${BRAZIL_COUNTRY_CODE}${digits.replace(/^0/, "")}`;
    }

    const phone = `+${digits}`;

    return E164_PATTERN.test(phone) ? phone : null;
};
