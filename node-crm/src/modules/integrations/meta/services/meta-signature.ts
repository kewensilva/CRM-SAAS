import { createHmac, timingSafeEqual } from "node:crypto";

import { metaConfig } from "../../../../config/meta";

const SIGNATURE_PREFIX = "sha256=";

// Valida o header X-Hub-Signature-256: HMAC-SHA256 do corpo bruto usando o App Secret.
// Garante que a requisição realmente veio da Meta, não de qualquer cliente HTTP.
// https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
export const isValidMetaSignature = (rawBody: Buffer | undefined, signatureHeader: string | undefined): boolean => {
    if (!rawBody || !signatureHeader || !signatureHeader.startsWith(SIGNATURE_PREFIX)) {
        return false;
    }

    const expectedSignature = createHmac("sha256", metaConfig.appSecret).update(rawBody).digest("hex");
    const receivedSignature = signatureHeader.slice(SIGNATURE_PREFIX.length);

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(receivedSignature, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
};
