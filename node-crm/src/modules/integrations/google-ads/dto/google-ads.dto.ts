import type { GoogleAdsConversionTrigger, GoogleAdsLeadOrigin } from "../types/google-ads.types";

export type SelectGoogleAdsAccountDTO = {
    customerId: string;
    loginCustomerId?: string | null | undefined;
    customerName?: string | null | undefined;
};

export type SaveGoogleAdsRuleDTO = {
    name: string;
    trigger: GoogleAdsConversionTrigger;
    originFilter: GoogleAdsLeadOrigin | null;
    conversionActionId: string;
    conversionActionName?: string | null | undefined;
    sendValue: boolean;
    enabled?: boolean | undefined;
};

export type UpdateGoogleAdsRuleDTO = {
    [Key in keyof SaveGoogleAdsRuleDTO]?: SaveGoogleAdsRuleDTO[Key] | undefined;
};
