import { buildIngestBody, buildUserIdentifiers } from "./data-manager.client";
import type { OfflineConversion } from "./data-manager.client";

const base: OfflineConversion = {
    customerId: "1234567890",
    loginCustomerId: "9998887777",
    conversionActionId: "555",
    transactionId: "up-1",
    occurredAt: new Date("2026-11-20T15:00:00.000Z"),
    gclid: "Cj0KCQ",
    userIdentifiers: buildUserIdentifiers("ana@example.com", "11988887777"),
    value: 1500,
    currency: "BRL",
};

describe("buildIngestBody", () => {
    it("monta o destino com a conta do cliente e a conta de acesso (MCC ou ela mesma)", () => {
        const body = buildIngestBody(base, false);

        expect(body.destinations[0]).toEqual({
            operatingAccount: { accountType: "GOOGLE_ADS", accountId: "1234567890" },
            loginAccount: { accountType: "GOOGLE_ADS", accountId: "9998887777" },
            productDestinationId: "555",
        });
        expect(body.events[0]).toMatchObject({
            transactionId: "up-1",
            adIdentifiers: { gclid: "Cj0KCQ" },
            conversionValue: 1500,
            currency: "BRL",
        });
        expect(body.events[0]?.userData?.userIdentifiers).toHaveLength(2);
    });

    it("sem GCLID, e-mail ou telefone recusa antes de chamar o Google", () => {
        expect(() => buildIngestBody({ ...base, gclid: null, userIdentifiers: [] }, false)).toThrow("Lead sem GCLID");
    });

    it("sem valor não manda conversionValue", () => {
        expect(buildIngestBody({ ...base, value: null }, true).events[0]).not.toHaveProperty("conversionValue");
    });
});
