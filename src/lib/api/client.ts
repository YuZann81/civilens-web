import { ApiError, ApiResponse, HealthResponse } from "./types";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://localhost:8000/api/cv/v1";
}

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
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

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
  };

  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url.toString(), {
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

export async function checkApiHealth(): Promise<HealthResponse> {
  const result = await apiClient<HealthResponse>("/health", {
    method: "GET",
    cache: "no-store",
  });
  return result.data;
}
