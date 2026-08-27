export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: ApiErrorPayload | null;

  constructor(status: number, message: string, data: ApiErrorPayload | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface HealthResponse {
  status: string;
}
