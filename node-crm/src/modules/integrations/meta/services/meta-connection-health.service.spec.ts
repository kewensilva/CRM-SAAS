import { metaIntegrationRepository } from "../repositories/meta-integration.repository";
import { metaLogRepository } from "../repositories/meta-log.repository";
import { metaConnectionHealthService } from "./meta-connection-health.service";
import { metaPageAssetsClient } from "./meta-page-assets.client";

jest.mock("../repositories/meta-integration.repository", () => ({ metaIntegrationRepository: { findByTenant: jest.fn() } }));
jest.mock("../repositories/meta-log.repository", () => ({ metaLogRepository: { findLatestByTenant: jest.fn() } }));
jest.mock("./meta-graph-api.client", () => ({ metaGraphApiClient: { subscribePageToLeadgen: jest.fn() } }));
jest.mock("./meta-page-assets.client", () => ({
    metaPageAssetsClient: { fetchInstagramAccount: jest.fn(), isSubscribedToLeadgen: jest.fn(), listLeadForms: jest.fn() },
}));

const integrations = jest.mocked(metaIntegrationRepository);
const logs = jest.mocked(metaLogRepository);
const assets = jest.mocked(metaPageAssetsClient);

const connected = {
    pageId: "p1",
    pageName: "Loja",
    pageAccessToken: "token",
    defaultResponsibleUserId: "u1",
    enabled: true,
} as Awaited<ReturnType<typeof metaIntegrationRepository.findByTenant>>;

beforeEach(() => {
    jest.resetAllMocks();
    logs.findLatestByTenant.mockResolvedValue(null);
});

describe("metaConnectionHealthService.getHealth", () => {
    it("sem Página conectada não consulta a Meta", async () => {
        integrations.findByTenant.mockResolvedValue(null);

        const health = await metaConnectionHealthService.getHealth("t1");

        expect(health.connected).toBe(false);
        expect(assets.fetchInstagramAccount).not.toHaveBeenCalled();
    });

    it("uma verificação que falha não esconde as outras", async () => {
        integrations.findByTenant.mockResolvedValue(connected);
        assets.fetchInstagramAccount.mockResolvedValue({ id: "ig1", username: "loja" });
        assets.isSubscribedToLeadgen.mockResolvedValue(true);
        assets.listLeadForms.mockRejectedValue(new Error("Meta recusou a requisição: permissão"));

        const health = await metaConnectionHealthService.getHealth("t1");

        expect(health.instagram).toEqual({ value: { id: "ig1", username: "loja" }, error: null });
        expect(health.webhookSubscribed).toEqual({ value: true, error: null });
        expect(health.forms).toEqual({ value: null, error: "Meta recusou a requisição: permissão" });
        expect(health.hasDefaultResponsible).toBe(true);
    });
});
