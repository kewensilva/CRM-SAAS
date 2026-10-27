import { mapMetaLeadSource } from "./meta-lead-source";

describe("mapMetaLeadSource", () => {
    it("lead de anúncio do Instagram", () => {
        expect(mapMetaLeadSource({ platform: "ig", is_organic: false })).toEqual({
            utmSource: "instagram",
            utmMedium: "anuncio",
        });
    });

    it("lead orgânico do Facebook", () => {
        expect(mapMetaLeadSource({ platform: "fb", is_organic: true })).toEqual({
            utmSource: "facebook",
            utmMedium: "organico",
        });
    });

    it("plataforma desconhecida é mantida como veio", () => {
        expect(mapMetaLeadSource({ platform: "Messenger" }).utmSource).toBe("messenger");
    });

    it("sem os campos (Meta recusou platform/is_organic) fica sem Fonte", () => {
        expect(mapMetaLeadSource({})).toEqual({ utmSource: undefined, utmMedium: undefined });
    });
});
