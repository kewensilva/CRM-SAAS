import { normalizeEmail, normalizePhone, sha256Hex } from "./user-identifiers";

describe("normalizeEmail", () => {
    it("minúsculas e sem espaços", () => {
        expect(normalizeEmail("  John.Smith@EXAMPLE.COM ")).toBe("john.smith@example.com");
    });

    it("gmail: remove pontos e o sufixo +", () => {
        expect(normalizeEmail("Cloudy.SanFrancisco+shopping@gmail.com")).toBe("cloudysanfrancisco@gmail.com");
        expect(normalizeEmail("jane.doe+x@googlemail.com")).toBe("janedoe@googlemail.com");
    });

    it("outros domínios mantêm pontos e +", () => {
        expect(normalizeEmail("user.name+NYC@Example.com")).toBe("user.name+nyc@example.com");
    });

    it("valor sem @ ou vazio vira null", () => {
        expect(normalizeEmail("sem-arroba")).toBeNull();
        expect(normalizeEmail("")).toBeNull();
        expect(normalizeEmail(null)).toBeNull();
    });
});

describe("normalizePhone", () => {
    it("celular brasileiro sem código do país", () => {
        expect(normalizePhone("(11) 98888-7777")).toBe("+5511988887777");
        expect(normalizePhone("1133334444")).toBe("+551133334444");
    });

    it("já com 55 ou +", () => {
        expect(normalizePhone("5511988887777")).toBe("+5511988887777");
        expect(normalizePhone("+1 (800) 555-0199")).toBe("+18005550199");
    });

    it("número curto demais vira null", () => {
        expect(normalizePhone("4888888")).toBeNull();
        expect(normalizePhone(undefined)).toBeNull();
    });
});

describe("sha256Hex", () => {
    it("hash do exemplo da documentação do Google", () => {
        expect(sha256Hex("john.smith@example.com").toUpperCase()).toBe(
            "8E621E3D0368631D263D07A351FA8D34FBA0D17C15FBCDEC11A5F58008D022A0",
        );
    });
});
