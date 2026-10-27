describe("emailService.sendSupportTicketEmail", () => {
    const fetchMock = jest.fn();

    beforeEach(() => {
        jest.resetModules();
        process.env.RESEND_API_KEY = "re_test";
        delete process.env.SUPPORT_TICKET_EMAIL;
        fetchMock.mockReset().mockResolvedValue({ ok: true });
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    it("envia ao atendimento, com Reply-To de quem abriu e o texto do usuário escapado", async () => {
        const { emailService } = await import("./email.service");

        await emailService.sendSupportTicketEmail({
            ticketId: "t-1",
            title: "<script>alert(1)</script>",
            message: "linha 1\nlinha <b>2</b>",
            createdAt: new Date("2026-10-27T15:00:00Z"),
            tenantName: "Agência Delta",
            userName: "Ana",
            userEmail: "ana@delta.com",
        });

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);

        expect(body.to).toEqual(["atendimento@contentmarketingbrasil.com"]);
        expect(body.reply_to).toBe("ana@delta.com");
        expect(body.subject).toBe("[Chamado CRM] Agência Delta — <script>alert(1)</script>");
        expect(body.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
        expect(body.html).not.toContain("<script>");
        expect(body.html).toContain("linha 1<br />linha &lt;b&gt;2&lt;/b&gt;");
        expect(body.html).toContain("27/10/2026, 12:00:00");
    });
});
