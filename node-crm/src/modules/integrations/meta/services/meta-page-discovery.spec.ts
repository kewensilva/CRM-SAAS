import { metaGraphApiClient } from "./meta-graph-api.client";
import { discoverPages, noPagesMessage, pageIdsFromPermissions } from "./meta-page-discovery";

jest.mock("../../../../config/meta", () => ({
    metaConfig: { oauthScopes: ["pages_show_list", "pages_read_engagement", "pages_manage_metadata", "leads_retrieval"] },
}));
jest.mock("./meta-graph-api.client", () => ({
    metaGraphApiClient: { listManagedPages: jest.fn(), debugUserToken: jest.fn(), fetchPageWithToken: jest.fn() },
}));

const client = jest.mocked(metaGraphApiClient);
const ALL_SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_metadata", "leads_retrieval"];

beforeEach(() => jest.resetAllMocks());

describe("discoverPages", () => {
    it("login clássico: usa /me/accounts e nem consulta as permissões", async () => {
        client.listManagedPages.mockResolvedValue([{ id: "p1", name: "Loja", access_token: "t1" }]);

        const result = await discoverPages("user-token", "app");

        expect(result.pages).toEqual([{ id: "p1", name: "Loja", access_token: "t1" }]);
        expect(client.debugUserToken).not.toHaveBeenCalled();
    });

    it("/me/accounts vazio (Página de portfólio empresarial): busca pelas permissões granulares", async () => {
        client.listManagedPages.mockResolvedValue([]);
        client.debugUserToken.mockResolvedValue({
            scopes: ALL_SCOPES,
            granularScopes: [
                { scope: "pages_show_list", target_ids: ["p1", "p2"] },
                { scope: "leads_retrieval", target_ids: ["p1"] },
                { scope: "business_management", target_ids: ["b9"] },
            ],
        });
        client.fetchPageWithToken.mockImplementation(async (id) =>
            id === "p1" ? { id: "p1", name: "Cliente", access_token: "page-token" } : Promise.reject(new Error("sem acesso")),
        );

        const result = await discoverPages("user-token", "app");

        expect(client.fetchPageWithToken.mock.calls.map(([id]) => id)).toEqual(["p1", "p2"]);
        expect(result.pages).toEqual([{ id: "p1", name: "Cliente", access_token: "page-token" }]);
    });
});

describe("pageIdsFromPermissions", () => {
    it("junta os IDs das permissões de Página, sem repetir e sem IDs de outros tipos", () => {
        expect(
            pageIdsFromPermissions({
                scopes: [],
                granularScopes: [
                    { scope: "pages_show_list", target_ids: ["p1"] },
                    { scope: "pages_manage_metadata", target_ids: ["p1", "p3"] },
                    { scope: "ads_management", target_ids: ["act_1"] },
                    { scope: "leads_retrieval" },
                ],
            }),
        ).toEqual(["p1", "p3"]);
    });
});

describe("noPagesMessage", () => {
    it("lista as permissões que faltaram", () => {
        expect(noPagesMessage({ scopes: ["pages_show_list"], granularScopes: [] })).toContain(
            "pages_read_engagement, pages_manage_metadata, leads_retrieval",
        );
    });

    it("com todas as permissões, orienta a marcar a Página na tela da Meta", () => {
        expect(noPagesMessage({ scopes: ALL_SCOPES, granularScopes: [] })).toContain("marque a Página do cliente");
    });
});
