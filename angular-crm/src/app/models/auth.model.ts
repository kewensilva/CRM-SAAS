export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export interface ForgotPasswordResponseData {
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown[];
}
