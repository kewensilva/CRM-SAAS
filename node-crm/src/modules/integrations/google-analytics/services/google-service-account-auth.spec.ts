import { createVerify, generateKeyPairSync } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

const decodePart = (part: string) => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

// process.env converte undefined na string "undefined" — variável ausente precisa de delete.
const setEnv = (name: string, value: string | undefined): void => {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
};

const loadModule = async (env: Record<string, string | undefined>) => {
    jest.resetModules();
    setEnv("GA_SERVICE_ACCOUNT_EMAIL", env.email);
    setEnv("GA_SERVICE_ACCOUNT_PRIVATE_KEY", env.key);

    return import("./google-service-account-auth");
};

describe("getServiceAccountAccessToken", () => {
    const fetchMock = jest.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    it("assina o JWT com RS256, troca pelo token e reaproveita o cache", async () => {
        // Chave com "\n" literal, como chega de uma variável de ambiente.
        const auth = await loadModule({ email: "crm@proj.iam.gserviceaccount.com", key: privatePem.replace(/\n/g, "\\n") });

        fetchMock.mockResolvedValue({ ok: true, json: async () => ({ access_token: "ya29.token", expires_in: 3600 }) });

        await expect(auth.getServiceAccountAccessToken()).resolves.toBe("ya29.token");
        await expect(auth.getServiceAccountAccessToken()).resolves.toBe("ya29.token");
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const body = new URLSearchParams(fetchMock.mock.calls[0][1].body as string);
        const [header, claims, signature] = (body.get("assertion") as string).split(".");

        expect(body.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
        expect(decodePart(header)).toEqual({ alg: "RS256", typ: "JWT" });
        expect(decodePart(claims)).toMatchObject({
            iss: "crm@proj.iam.gserviceaccount.com",
            scope: "https://www.googleapis.com/auth/analytics.readonly",
            aud: "https://oauth2.googleapis.com/token",
        });
        expect(
            createVerify("RSA-SHA256").update(`${header}.${claims}`).verify(publicKey, Buffer.from(signature, "base64url")),
        ).toBe(true);
    });

    it("sem credenciais explica o que falta configurar, sem chamar o Google", async () => {
        const auth = await loadModule({ email: undefined, key: undefined });

        expect(auth.hasServiceAccountCredentials()).toBe(false);
        await expect(auth.getServiceAccountAccessToken()).rejects.toThrow("GA_SERVICE_ACCOUNT_EMAIL");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("chave privada inválida vira erro de configuração", async () => {
        const auth = await loadModule({ email: "crm@proj.iam.gserviceaccount.com", key: "não-é-uma-chave" });

        await expect(auth.getServiceAccountAccessToken()).rejects.toThrow("GA_SERVICE_ACCOUNT_PRIVATE_KEY inválida");
    });

    it("credencial recusada pelo Google vira IntegrationError sem vazar o corpo", async () => {
        const auth = await loadModule({ email: "crm@proj.iam.gserviceaccount.com", key: privatePem });

        fetchMock.mockResolvedValue({ ok: false, status: 400, text: async () => '{"error":"invalid_grant"}' });

        await expect(auth.getServiceAccountAccessToken()).rejects.toThrow("O Google recusou as credenciais");
    });
});
