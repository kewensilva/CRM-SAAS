import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Criptografia em repouso (AES-256-GCM) para tokens de acesso guardados no banco.
// Formato salvo: "enc:v1:<iv>:<authTag>:<dados>" (tudo em base64). O prefixo permite
// distinguir tokens novos (criptografados) de tokens antigos em texto puro, que continuam
// funcionando até serem salvos de novo.
const PREFIX = "enc:v1:";

const getKey = (): Buffer | null => {
    const raw = process.env.META_TOKEN_ENCRYPTION_KEY;

    if (!raw) {
        return null;
    }

    const key = Buffer.from(raw, "base64");

    if (key.length !== 32) {
        throw new Error(
            "META_TOKEN_ENCRYPTION_KEY deve ter 32 bytes em base64 (gere com: openssl rand -base64 32).",
        );
    }

    return key;
};

export const isEncryptedToken = (value: string): boolean => value.startsWith(PREFIX);

export const encryptToken = (plainText: string): string => {
    const key = getKey();

    // Sem chave configurada o comportamento antigo é mantido (texto puro) — o deploy não
    // quebra, mas a chave deve ser configurada antes de enviar o app para a análise da Meta.
    if (!key || isEncryptedToken(plainText)) {
        return plainText;
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptToken = (stored: string): string => {
    if (!isEncryptedToken(stored)) {
        return stored;
    }

    const key = getKey();

    if (!key) {
        throw new Error("Token criptografado, mas META_TOKEN_ENCRYPTION_KEY não está configurada.");
    }

    const [ivBase64, authTagBase64, dataBase64] = stored.slice(PREFIX.length).split(":");

    if (!ivBase64 || !authTagBase64 || !dataBase64) {
        throw new Error("Token criptografado em formato inválido.");
    }

    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivBase64, "base64"));
    decipher.setAuthTag(Buffer.from(authTagBase64, "base64"));

    return Buffer.concat([
        decipher.update(Buffer.from(dataBase64, "base64")),
        decipher.final(),
    ]).toString("utf8");
};