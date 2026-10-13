import type { MetaIntegration, MetaIntegrationPublic } from "../types/meta-integration.types";

// Remove o token antes de qualquer resposta HTTP.
export const toPublicIntegration = ({
    pageAccessToken,
    ...rest
}: MetaIntegration): MetaIntegrationPublic => ({
    ...rest,
    hasPageToken: Boolean(pageAccessToken),
});