import type { ConversionTrigger } from "../types/conversion-sync.types";

export type SaveConversionRuleDTO = {
    name?: string | undefined;
    trigger?: ConversionTrigger | undefined;
    triggerValue?: string | null | undefined;
    conversionActionId?: string | undefined;
    sendValue?: boolean | undefined;
    enabled?: boolean | undefined;
};

export type CreateConversionRuleDTO = SaveConversionRuleDTO & {
    name: string;
    trigger: ConversionTrigger;
    conversionActionId: string;
};
