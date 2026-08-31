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

export interface Topic {
  id: number;
  name: string;
  slug: string;
  is_official?: boolean;
  reports_count?: number;
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

export interface ReportComment {
  id: number;
  report_id: number;
  parent_id?: number | null;
  content: string;
  is_official: boolean;
  user?: {
    id: number;
    name: string;
    role: string;
  } | null;
  replies?: ReportComment[];
  created_at: string;
  updated_at: string;
}

export interface ReportStatusHistory {
  id: number;
  status: string;
  notes?: string | null;
  actor_role: string;
  actor_name: string;
  created_at: string;
}

export interface InAppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read_at?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ReportFlag {
  id: number;
  report_id: number;
  reason: string;
  description?: string | null;
  status: "pending" | "reviewed" | "dismissed" | "actioned" | string;
  reporter?: {
    id: number;
    name: string;
  } | null;
  report?: {
    id: number;
    title: string;
    status: string;
  } | null;
  moderator?: {
    id: number;
    name: string;
  } | null;
  moderator_notes?: string | null;
  moderated_at?: string | null;
  created_at: string;
}

export interface GovernmentOverviewMetrics {
  total_reports: number;
  pending_reports: number;
  under_review_reports: number;
  verified_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  rejected_reports: number;
  closed_reports: number;
  high_priority_count: number;
  resolution_rate: number;
  severity_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  top_topics: Topic[];
}

export interface UserProfile {
  id: number;
  name: string;
  role: string;
  status: string;
  total_reports: number;
  resolved_reports: number;
  member_since: string;
  recent_reports?: Report[];
}

export interface Report {
  id: number;
  title: string;
  description: string;
  author?: {
    id: number;
    name: string;
    role: string;
  } | null;
  category?: Category | null;
  topics?: Topic[];
  location?: ReportLocation | null;
  media?: ReportMedia[];
  ai_analysis?: ReportAiAnalysis | null;
  status: "pending" | "under_review" | "resolved" | "rejected" | string;
  reactions_count?: number;
  user_reacted?: boolean;
  bookmarks_count?: number;
  user_bookmarked?: boolean;
  comments_count?: number;
  status_histories?: ReportStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category_id?: number | null;
  topics?: string[];
  location: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export interface ReportFilterParams {
  mine?: boolean;
  category_id?: number;
  topic?: string;
  q?: string;
  status?: string;
  severity?: string;
  from?: string;
  to?: string;
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
