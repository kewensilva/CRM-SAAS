export type SuccessResponse<T> = {
    success: true;
    data: T;
};

export type Pagination = {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type PaginatedResponse<T> = {
    success: true;
    data: T[];
    pagination: Pagination;
};

export type ErrorResponse = {
    success: false;
    message: string;
    errors: { field: string; message: string }[];
    requestId: string;
};
