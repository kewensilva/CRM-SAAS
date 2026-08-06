export type UpdateWebWidgetIntegrationDTO = {
    enabled?: boolean | undefined;
    defaultResponsibleUserId?: string | undefined;
    duplicateStrategy?: "IGNORE" | "UPDATE" | undefined;
    showEmailField?: boolean | undefined;
    showPhoneField?: boolean | undefined;
    showMessageField?: boolean | undefined;
    buttonLabel?: string | undefined;
    buttonContentType?: "TEXT" | "ICON" | undefined;
    buttonIcon?: string | undefined;
    buttonColor?: string | undefined;
};
