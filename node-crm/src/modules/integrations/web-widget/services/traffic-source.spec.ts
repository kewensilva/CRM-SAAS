import { resolveGclid, resolveTrafficSource } from "./traffic-source";

const PAGE = "https://site-do-cliente.com.br/contato";

describe("resolveTrafficSource", () => {
    it("UTM enviada tem prioridade e não é alterada", () => {
        expect(
            resolveTrafficSource({ utmSource: "instagram", utmMedium: "bio" }, `${PAGE}?gclid=x`, "https://www.google.com/"),
        ).toEqual({ utmSource: "instagram", utmMedium: "bio" });
    });

    it("UTM na própria URL da página é aproveitada", () => {
        expect(resolveTrafficSource({}, `${PAGE}?utm_source=newsletter&utm_medium=email&utm_campaign=nov`, undefined)).toEqual({
            utmSource: "newsletter",
            utmMedium: "email",
            utmCampaign: "nov",
            utmTerm: undefined,
            utmContent: undefined,
        });
    });

    it("gclid na URL = anúncio do Google", () => {
        expect(resolveTrafficSource({}, `${PAGE}?gclid=Cj0KCQ`, "https://www.google.com/")).toEqual({
            utmSource: "google",
            utmMedium: "cpc",
        });
    });

    it("fbclid vindo do Instagram = instagram / social; sem referrer = facebook / social", () => {
        expect(resolveTrafficSource({}, `${PAGE}?fbclid=IwAR`, "https://l.instagram.com/")).toMatchObject({
            utmSource: "instagram",
            utmMedium: "social",
        });
        expect(resolveTrafficSource({}, `${PAGE}?fbclid=IwAR`, undefined)).toMatchObject({ utmSource: "facebook" });
    });

    it("link da bio do Instagram (sem UTM, sem fbclid) = instagram / referral", () => {
        expect(resolveTrafficSource({}, PAGE, "https://l.instagram.com/?u=https%3A%2F%2Fsite")).toMatchObject({
            utmSource: "instagram",
            utmMedium: "referral",
        });
    });

    it("busca orgânica e outros sites", () => {
        expect(resolveTrafficSource({}, PAGE, "https://www.google.com.br/")).toMatchObject({ utmSource: "google", utmMedium: "organic" });
        expect(resolveTrafficSource({}, PAGE, "https://lm.facebook.com/l.php")).toMatchObject({ utmSource: "facebook", utmMedium: "referral" });
        expect(resolveTrafficSource({}, PAGE, "https://blog.parceiro.com.br/post")).toMatchObject({
            utmSource: "blog.parceiro.com.br",
            utmMedium: "referral",
        });
    });

    it("acesso direto ou navegação dentro do próprio site fica sem fonte", () => {
        expect(resolveTrafficSource({}, PAGE, undefined)).toEqual({});
        expect(resolveTrafficSource({}, PAGE, "https://www.site-do-cliente.com.br/servicos")).toEqual({});
        expect(resolveTrafficSource({}, "não é url", "também não")).toEqual({});
    });
});

describe("resolveGclid", () => {
    it("prefere o GCLID guardado pelo widget na chegada ao site", () => {
        expect(resolveGclid("CjwGuardado", "https://loja.com/contato?gclid=CjwDaUrl")).toBe("CjwGuardado");
    });

    it("sem GCLID guardado, usa o da URL do envio", () => {
        expect(resolveGclid(undefined, "https://loja.com/?gclid=CjwDaUrl")).toBe("CjwDaUrl");
    });

    it("sem GCLID em lugar nenhum fica undefined", () => {
        expect(resolveGclid("  ", "https://loja.com/")).toBeUndefined();
    });
});
