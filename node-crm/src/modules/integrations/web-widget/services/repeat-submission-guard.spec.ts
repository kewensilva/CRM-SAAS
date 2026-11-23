import { claimSubmission } from "./repeat-submission-guard";

describe("claimSubmission", () => {
    const person = { tenantId: "t1", name: "Ana Souza", email: "ana@example.com", phone: "(11) 99999-0000" };

    it("o primeiro envio passa e os repetidos logo em seguida são barrados", () => {
        const now = 1_000_000;

        expect(claimSubmission(person, now)).toBe(true);
        expect(claimSubmission({ ...person, name: " ana souza ", phone: "11999990000" }, now + 500)).toBe(false);
    });

    it("libera de novo depois da janela de 2 minutos", () => {
        const now = 5_000_000;

        expect(claimSubmission({ ...person, tenantId: "t2" }, now)).toBe(true);
        expect(claimSubmission({ ...person, tenantId: "t2" }, now + 2 * 60 * 1000 + 1)).toBe(true);
    });

    it("pessoas diferentes não se bloqueiam", () => {
        const now = 9_000_000;

        expect(claimSubmission({ ...person, tenantId: "t3" }, now)).toBe(true);
        expect(claimSubmission({ ...person, tenantId: "t3", email: "bia@example.com" }, now)).toBe(true);
    });
});
