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

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  role: "user" | "citizen" | "government" | "admin" | string;
  status: "active" | "suspended" | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponseData {
  user: AuthUser;
  requires_verification?: boolean;
  message?: string;
}

export interface VerifyResetCodeData {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponseData {
  reset_authorization: string;
}

export interface ResetPasswordData {
  email: string;
  reset_authorization: string;
  password: string;
  password_confirmation: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface ReportLocation {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ReportMedia {
  id: number;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface ReportAiAnalysis {
  id: number;
  status: "pending" | "processing" | "completed" | "failed" | string;
  summary?: string | null;
  severity?: "low" | "medium" | "high" | "critical" | string | null;
  analysis?: string | null;
  confidence?: number | null;
  completed_at?: string | null;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  category?: Category | null;
  location?: ReportLocation | null;
  media?: ReportMedia[];
  ai_analysis?: ReportAiAnalysis | null;
  status: "pending" | "under_review" | "resolved" | "rejected" | string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category_id: number;
  location: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export interface ReportFilterParams {
  mine?: boolean;
  category_id?: number;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface HealthResponse {
  status: string;
  checks?: {
    database?: string;
    redis?: string;
    [key: string]: string | undefined;
  };
}
