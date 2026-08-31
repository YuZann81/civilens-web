import {
  ApiCollectionEnvelope,
  ApiError,
  ApiResponse,
  ApiSuccessEnvelope,
  AuthUser,
  Category,
  CreateReportPayload,
  GovernmentOverviewMetrics,
  HealthResponse,
  InAppNotification,
  LoginCredentials,
  RegisterData,
  RegisterResponseData,
  Report,
  ReportComment,
  ReportFilterParams,
  ReportFlag,
  ReportMedia,
  ReportStatusHistory,
  ResetPasswordData,
  Topic,
  UserProfile,
  VerifyResetCodeData,
  VerifyResetCodeResponseData,
} from "./types";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl && envUrl.length > 0 && envUrl !== "undefined") {
    const cleaned = envUrl.replace(/\/+$/, "");
    if (!cleaned.endsWith("/cv/v1") && !cleaned.endsWith("/api/cv/v1")) {
      return `${cleaned}/cv/v1`;
    }
    return cleaned;
  }
  return "http://localhost:8000/api/cv/v1";
}

export function getApiRootUrl(): string {
  const baseUrl = getApiBaseUrl();
  return baseUrl.replace(/\/api\/cv\/v1\/?$/, "").replace(/\/cv\/v1\/?$/, "");
}

export function getGoogleOAuthUrl(): string {
  return `${getApiBaseUrl()}/auth/google/redirect`;
}

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
}

function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const url = new URL(`${baseUrl}${normalizedEndpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const xsrf = getXsrfToken();
  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(xsrf && options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())
      ? { "X-XSRF-TOKEN": xsrf }
      : {}),
  };

  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      credentials: "include",
      ...options,
      headers,
    });
  } catch (error) {
    const networkMessage =
      error instanceof Error ? error.message : "Network request failed";
    throw new ApiError(0, `Network error: ${networkMessage}`);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : `HTTP error ${response.status}`;

    throw new ApiError(response.status, errorMessage, data);
  }

  return {
    data: data as T,
    status: response.status,
  };
}

export async function initCsrf(): Promise<void> {
  const baseUrl = getApiBaseUrl();
  try {
    await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    const networkMessage =
      error instanceof Error ? error.message : "Failed to initialize CSRF cookie";
    throw new ApiError(0, `CSRF initialization error: ${networkMessage}`);
  }
}

/* =========================================================================
   Authentication API
   ========================================================================= */

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<AuthUser | null>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return await getAuthUser();
}

export async function register(data: RegisterData): Promise<RegisterResponseData> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<RegisterResponseData | AuthUser>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const rawData = response.data.data;
  if ("user" in rawData && rawData.user) {
    return rawData as RegisterResponseData;
  }
  return {
    user: rawData as AuthUser,
    requires_verification: false,
    message: response.data.message,
  };
}

export async function forgotPassword(email: string): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetCode(
  data: VerifyResetCodeData
): Promise<VerifyResetCodeResponseData> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<VerifyResetCodeResponseData>>(
    "/auth/verify-reset-code",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return response.data.data;
}

export async function resetPassword(data: ResetPasswordData): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resendVerificationEmail(): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>("/auth/email/resend", {
    method: "POST",
  });
}

export async function getAuthUser(): Promise<AuthUser> {
  const result = await apiClient<ApiSuccessEnvelope<AuthUser>>("/auth/me", {
    method: "GET",
    cache: "no-store",
  });
  return result.data.data;
}

export async function logout(): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>("/auth/logout", {
    method: "POST",
  });
}

export async function checkApiHealth(): Promise<HealthResponse> {
  const result = await apiClient<HealthResponse>("/health", {
    method: "GET",
    cache: "no-store",
  });
  return result.data;
}

/* =========================================================================
   Report Domain & Topics / Categories API
   ========================================================================= */

export async function getTopics(params?: { q?: string; limit?: number }): Promise<Topic[]> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.limit) query.append("limit", params.limit.toString());

  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await apiClient<ApiSuccessEnvelope<Topic[]>>(`/topics${qs}`, {
    method: "GET",
    cache: "no-store",
  });
  return response.data.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient<ApiSuccessEnvelope<Category[]>>("/categories", {
    method: "GET",
    cache: "no-store",
  });
  return response.data.data;
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<Report>>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data.data;
}

export async function uploadReportMedia(reportId: number, file: File): Promise<ReportMedia> {
  await initCsrf();
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient<ApiSuccessEnvelope<ReportMedia>>(`/reports/${reportId}/media`, {
    method: "POST",
    body: formData,
  });
  return response.data.data;
}

export async function deleteReportMedia(reportId: number, mediaId: number): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>(`/reports/${reportId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

export async function getReports(
  params: ReportFilterParams = {}
): Promise<ApiCollectionEnvelope<Report>> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params.mine) queryParams.mine = 1;
  if (params.category_id) queryParams.category_id = params.category_id;
  if (params.topic) queryParams.topic = params.topic;
  if (params.q) queryParams.q = params.q;
  if (params.status) queryParams.status = params.status;
  if (params.severity) queryParams.severity = params.severity;
  if (params.from) queryParams.from = params.from;
  if (params.to) queryParams.to = params.to;
  if (params.sort) queryParams.sort = params.sort;
  if (params.order) queryParams.order = params.order;
  if (params.page) queryParams.page = params.page;
  if (params.per_page) queryParams.per_page = params.per_page;

  const response = await apiClient<ApiCollectionEnvelope<Report>>("/reports", {
    method: "GET",
    params: queryParams,
    cache: "no-store",
  });
  return response.data;
}

export async function getReport(id: number | string): Promise<Report> {
  const response = await apiClient<ApiSuccessEnvelope<Report>>(`/reports/${id}`, {
    method: "GET",
    cache: "no-store",
  });
  return response.data.data;
}

export async function retryReportAiAnalysis(id: number | string): Promise<Report> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<Report>>(`/reports/${id}/retry-ai`, {
    method: "POST",
  });
  return response.data.data;
}

/* =========================================================================
   Comments & Community Engagement API
   ========================================================================= */

export async function getReportComments(
  reportId: number | string,
  page = 1
): Promise<ApiCollectionEnvelope<ReportComment>> {
  const response = await apiClient<ApiCollectionEnvelope<ReportComment>>(
    `/reports/${reportId}/comments?page=${page}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return response.data;
}

export async function postReportComment(
  reportId: number | string,
  content: string,
  parentId?: number
): Promise<ReportComment> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<ReportComment>>(
    `/reports/${reportId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ content, parent_id: parentId }),
    }
  );
  return response.data.data;
}

export async function deleteReportComment(
  reportId: number | string,
  commentId: number
): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>(
    `/reports/${reportId}/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );
}

export async function toggleReportReaction(
  reportId: number | string,
  type = "support"
): Promise<{ reacted: boolean; reactions_count: number }> {
  await initCsrf();
  const response = await apiClient<
    ApiSuccessEnvelope<{ reacted: boolean; reactions_count: number }>
  >(`/reports/${reportId}/reaction`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
  return response.data.data;
}

export async function toggleReportBookmark(
  reportId: number | string
): Promise<{ bookmarked: boolean; bookmarks_count: number }> {
  await initCsrf();
  const response = await apiClient<
    ApiSuccessEnvelope<{ bookmarked: boolean; bookmarks_count: number }>
  >(`/reports/${reportId}/bookmark`, {
    method: "POST",
  });
  return response.data.data;
}

export async function getBookmarks(
  page = 1
): Promise<ApiCollectionEnvelope<Report>> {
  const response = await apiClient<ApiCollectionEnvelope<Report>>(
    `/bookmarks?page=${page}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return response.data;
}

export async function toggleTopicFollow(
  topicId: number
): Promise<{ followed: boolean; followers_count: number }> {
  await initCsrf();
  const response = await apiClient<
    ApiSuccessEnvelope<{ followed: boolean; followers_count: number }>
  >(`/topics/${topicId}/follow`, {
    method: "POST",
  });
  return response.data.data;
}

export async function getReportTimeline(
  reportId: number | string
): Promise<ReportStatusHistory[]> {
  const response = await apiClient<ApiSuccessEnvelope<ReportStatusHistory[]>>(
    `/reports/${reportId}/timeline`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return response.data.data;
}

export async function updateReportStatus(
  reportId: number | string,
  status: string,
  notes?: string
): Promise<Report> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<Report>>(
    `/reports/${reportId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    }
  );
  return response.data.data;
}

export async function getNotifications(
  page = 1
): Promise<ApiCollectionEnvelope<InAppNotification> & { meta: { unread_count: number } }> {
  const response = await apiClient<
    ApiCollectionEnvelope<InAppNotification> & { meta: { unread_count: number } }
  >(`/notifications?page=${page}`, {
    method: "GET",
    cache: "no-store",
  });
  return response.data;
}

export async function markNotificationAsRead(
  id: number
): Promise<InAppNotification> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<InAppNotification>>(
    `/notifications/${id}/read`,
    {
      method: "POST",
    }
  );
  return response.data.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await initCsrf();
  await apiClient<ApiSuccessEnvelope<null>>("/notifications/read-all", {
    method: "POST",
  });
}

export async function getUserProfile(
  id: number | string
): Promise<UserProfile> {
  const response = await apiClient<ApiSuccessEnvelope<UserProfile>>(
    `/users/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return response.data.data;
}

/* =========================================================================
   Government Dashboard, Moderation & Topic Administration API
   ========================================================================= */

export async function getGovernmentAnalytics(): Promise<GovernmentOverviewMetrics> {
  const response = await apiClient<ApiSuccessEnvelope<GovernmentOverviewMetrics>>(
    "/government/analytics/overview",
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return response.data.data;
}

export async function flagReport(
  reportId: number | string,
  reason: string,
  description?: string
): Promise<ReportFlag> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<ReportFlag>>(
    `/reports/${reportId}/flag`,
    {
      method: "POST",
      body: JSON.stringify({ reason, description }),
    }
  );
  return response.data.data;
}

export async function getModerationFlags(
  status?: string,
  page = 1
): Promise<ApiCollectionEnvelope<ReportFlag>> {
  const query = new URLSearchParams();
  if (status) query.append("status", status);
  if (page) query.append("page", page.toString());

  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await apiClient<ApiCollectionEnvelope<ReportFlag>>(
    `/moderation/flags${qs}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return response.data;
}

export async function resolveModerationFlag(
  flagId: number,
  status: string,
  moderator_notes?: string
): Promise<ReportFlag> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<ReportFlag>>(
    `/moderation/flags/${flagId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, moderator_notes }),
    }
  );
  return response.data.data;
}

export async function mergeTopics(
  sourceTopicId: number,
  targetTopicId: number
): Promise<Topic> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<Topic>>(
    `/topics/${sourceTopicId}/merge`,
    {
      method: "POST",
      body: JSON.stringify({ target_topic_id: targetTopicId }),
    }
  );
  return response.data.data;
}

export async function updateTopic(
  topicId: number,
  data: { name?: string; description?: string; is_official?: boolean; is_active?: boolean }
): Promise<Topic> {
  await initCsrf();
  const response = await apiClient<ApiSuccessEnvelope<Topic>>(
    `/topics/${topicId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
  return response.data.data;
}
