export type ErrorDetail = {
    field: string;
    message: string;
};

export class AppError extends Error {
    readonly statusCode: number;
    readonly details: ErrorDetail[];

    constructor(message: string, statusCode: number, details: ErrorDetail[] = []) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details: ErrorDetail[] = []) {
        super(message, 422, details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string) {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class BusinessRuleError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class IntegrationError extends AppError {
    constructor(message: string) {
        super(message, 502);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Erro interno.") {
        super(message, 500);
    }
}
