import {
  ApiError,
  ApiResponse,
  ApiSuccessEnvelope,
  AuthUser,
  HealthResponse,
  LoginCredentials,
  RegisterData,
  RegisterResponseData,
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
    ...(options.body ? { "Content-Type": "application/json" } : {}),
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
