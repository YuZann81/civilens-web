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

export interface ApiSuccessEnvelope<T> {
  data: T;
  message?: string;
}

export interface ApiPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  [key: string]: unknown;
}

export interface ApiCollectionEnvelope<T> {
  data: T[];
  meta: ApiPaginationMeta;
  message?: string;
}

export interface HealthResponse {
  status: string;
  checks?: {
    database?: string;
    redis?: string;
    [key: string]: string | undefined;
  };
}
