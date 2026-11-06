describe("buildIngestBody", () => {
    beforeEach(() => {
        jest.resetModules();
        process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID = "111-222-3333";
    });

    const load = () => import("./google-ads-data-manager.client");

    it("monta destino com MCC (loginAccount), ação de conversão e identificadores em hash", async () => {
        const { buildIngestBody, buildUserIdentifiers } = await load();

        const body = buildIngestBody(
            {
                customerId: "1234567890",
                conversionActionId: "987",
                transactionId: "deal-won:1",
                occurredAt: new Date("2026-10-29T18:00:00Z"),
                gclid: "Cj0KCQ",
                userIdentifiers: buildUserIdentifiers("John.Smith@EXAMPLE.COM", "(11) 98888-7777"),
                value: 900,
                currency: "BRL",
            },
            true,
        );

        expect(body.destinations).toEqual([
            {
                operatingAccount: { accountType: "GOOGLE_ADS", accountId: "1234567890" },
                loginAccount: { accountType: "GOOGLE_ADS", accountId: "1112223333" },
                productDestinationId: "987",
            },
        ]);
        expect(body.encoding).toBe("HEX");
        expect(body.validateOnly).toBe(true);
        expect(body.events[0]).toEqual({
            eventTimestamp: "2026-10-29T18:00:00.000Z",
            eventSource: "WEB",
            transactionId: "deal-won:1",
            adIdentifiers: { gclid: "Cj0KCQ" },
            userData: {
                userIdentifiers: [
                    { emailAddress: "8e621e3d0368631d263d07a351fa8d34fba0d17c15fbcdec11a5f58008d022a0" },
                    { phoneNumber: expect.stringMatching(/^[0-9a-f]{64}$/) },
                ],
            },
            conversionValue: 900,
            currency: "BRL",
        });
    });

    it("sem GCLID nem e-mail/telefone não há como atribuir — recusa antes de chamar o Google", async () => {
        const { buildIngestBody } = await load();

        expect(() =>
            buildIngestBody(
                {
                    customerId: "1234567890",
                    conversionActionId: "1",
                    transactionId: "t",
                    occurredAt: new Date(),
                    gclid: null,
                    userIdentifiers: [],
                    value: null,
                    currency: "BRL",
                },
                false,
            ),
        ).toThrow("Sem GCLID, e-mail ou telefone");
    });

    it("sem MCC configurado explica a variável que falta", async () => {
        delete process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID;
        const { buildIngestBody } = await load();

        expect(() =>
            buildIngestBody(
                { customerId: "1", conversionActionId: "1", transactionId: "t", occurredAt: new Date(), gclid: "g", userIdentifiers: [], value: null, currency: "BRL" },
                false,
            ),
        ).toThrow("GOOGLE_ADS_MANAGER_ACCOUNT_ID");
    });
});
