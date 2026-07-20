import type { WidgetFieldKey } from "../types/widget.types";

export type UpdateWidgetDTO = {
    enabled?: boolean | undefined;
    buttonColor?: string | undefined;
    icon?: string | undefined;
    defaultResponsibleUserId?: string | undefined;
    requestedFields?: WidgetFieldKey[] | undefined;
};
