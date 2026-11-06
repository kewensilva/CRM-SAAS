import type { ConversionSource } from "../types/conversion-sync.types";

// undefined = não alterar. Nos segredos, null/"" = apagar.
export type SaveConversionIntegrationDTO = {
    name?: string | undefined;
    enabled?: boolean | undefined;
    googleAdsCustomerId?: string | null | undefined;
    gclidField?: string | null | undefined;
    sourceApiUrl?: string | null | undefined;
    sourceApiToken?: string | null | undefined;
    webhookSecret?: string | null | undefined;
    currencyCode?: string | undefined;
};

export type CreateConversionIntegrationDTO = SaveConversionIntegrationDTO & {
    name: string;
    source: ConversionSource;
};
