import type { MetaLeadFieldData } from "../types/meta-integration.types";

// Fonte de um lead do Meta Lead Ads, no mesmo formato da Fonte (UTM) dos leads do site,
// para aparecer igual no CRM ("instagram / anuncio") e casar com os canais do Budget
// ("Instagram Ads" → "instagram") na atribuição de conversões dos Relatórios.
const PLATFORM_SOURCES: Record<string, string> = {
    ig: "instagram",
    instagram: "instagram",
    fb: "facebook",
    facebook: "facebook",
};

export const mapMetaLeadSource = (
    lead: Pick<MetaLeadFieldData, "platform" | "is_organic">,
): { utmSource: string | undefined; utmMedium: string | undefined } => {
    const platform = lead.platform?.trim().toLowerCase();

    return {
        utmSource: platform ? (PLATFORM_SOURCES[platform] ?? platform) : undefined,
        utmMedium: lead.is_organic === undefined ? undefined : lead.is_organic ? "organico" : "anuncio",
    };
};
