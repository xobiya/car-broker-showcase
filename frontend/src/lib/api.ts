/**
 * Centralized API client for Arif Car Sell.
 *
 * - Automatically attaches the stored JWT token to every request.
 * - Handles 401 Unauthorized globally (clears local session).
 * - Provides typed helper wrappers for all backend endpoints.
 */

const TOKEN_KEY = "autobroker_token";
const USER_KEY = "autobroker_user";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Makes an authenticated API request.
 * - Injects Authorization header when a token is present.
 * - On 401, clears the local session so the user is effectively logged out.
 * - On non-OK responses, extracts `{ error }` from the JSON body and throws.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  const res = await fetch(path, init);

  if (res.status === 401) {
    // Token expired or invalid — clear session
    clearSession();
    // Dispatch a custom event so the app can react (show login modal, etc.)
    window.dispatchEvent(new CustomEvent("autobroker:unauthorized"));
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const err = await res.json();
      let errorMsg = `Request failed with status ${res.status}`;
      if (err) {
        if (typeof err.error === "string") {
          errorMsg = err.error;
        } else if (err.error && typeof err.error === "object" && typeof err.error.message === "string") {
          errorMsg = err.error.message;
        } else if (typeof err.message === "string") {
          errorMsg = err.message;
        } else if (typeof err.error === "object") {
          errorMsg = JSON.stringify(err.error);
        } else {
          errorMsg = JSON.stringify(err);
        }
      }
      throw new Error(errorMsg);
    }
    throw new Error(`Request failed with status ${res.status}`);
  }

  // Return undefined for 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Convenience shorthands
// ---------------------------------------------------------------------------

export const api = {
  get: <T = unknown>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "GET", ...options }),

  post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "POST", body, ...options }),

  put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "PUT", body, ...options }),

  patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "PATCH", body, ...options }),

  delete: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "DELETE", body, ...options }),
};

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: any; token: string }>("/api/auth/login", {
      email,
      password,
    }),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: "buyer" | "broker";
  }) => api.post<{ user: any; token: string }>("/api/auth/register", payload),
};

// ---------------------------------------------------------------------------
// Vehicle endpoints
// ---------------------------------------------------------------------------

export const vehiclesApi = {
  list: () => api.get<any[]>("/api/vehicles"),
  create: (data: any) => api.post<any>("/api/vehicles", data),
  update: (id: string, data: any) => api.put<any>(`/api/vehicles/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/api/vehicles/${id}`),
  approve: (id: string) =>
    api.put<{ message: string }>(`/api/vehicles/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.put<{ message: string }>(`/api/vehicles/${id}/reject`, { reason }),
  submit: (id: string) =>
    api.put<{ message: string }>(`/api/vehicles/${id}/submit`),
};

// ---------------------------------------------------------------------------
// Leads endpoints
// ---------------------------------------------------------------------------

export const leadsApi = {
  list: () => api.get<any[]>("/api/leads"),
  create: (data: any) => api.post<any>("/api/leads", data),
  updateStatus: (id: string, status: string) =>
    api.put<{ message: string }>(`/api/leads/${id}/status`, { status }),
};

// ---------------------------------------------------------------------------
// Sales endpoints
// ---------------------------------------------------------------------------

export const salesApi = {
  list: () => api.get<any[]>("/api/sales"),
  create: (data: any) => api.post<any>("/api/sales", data),
};

// ---------------------------------------------------------------------------
// Brokers endpoints
// ---------------------------------------------------------------------------

export const brokersApi = {
  list: () => api.get<any[]>("/api/brokers"),
  get: (id: string) => api.get<any>(`/api/brokers/${id}`),
  update: (id: string, data: any) => api.put<any>(`/api/brokers/${id}`, data),
};

// ---------------------------------------------------------------------------
// Users endpoints
// ---------------------------------------------------------------------------

export const usersApi = {
  get: (id: string) => api.get<any>(`/api/users/${id}`),
  update: (id: string, data: any) => api.put<any>(`/api/users/${id}`, data),
};

// ---------------------------------------------------------------------------
// Stats / Audit Logs
// ---------------------------------------------------------------------------

export const statsApi = {
  get: () => api.get<any>("/api/stats"),
};

export const auditApi = {
  list: () => api.get<any[]>("/api/audit-logs"),
  create: (data: any) => api.post<any>("/api/audit-logs", data),
};

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const documentsApi = {
  list: (vehicleId: string) =>
    api.get<any[]>(`/api/documents?vehicleId=${vehicleId}`),
  create: (data: any) => api.post<any>("/api/documents", data),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/documents/${id}`),
};

// ---------------------------------------------------------------------------
// Inspections
// ---------------------------------------------------------------------------

export const inspectionsApi = {
  list: (vehicleId: string) =>
    api.get<any[]>(`/api/inspections?vehicleId=${vehicleId}`),
  create: (data: any) => api.post<any>("/api/inspections", data),
  update: (id: string, data: any) =>
    api.put<{ message: string }>(`/api/inspections/${id}`, data),
};

// ---------------------------------------------------------------------------
// Saved Vehicles
// ---------------------------------------------------------------------------

export const savedVehiclesApi = {
  list: (userId: string) =>
    api.get<any[]>(`/api/saved-vehicles?userId=${userId}`),
  save: (userId: string, vehicleId: string) =>
    api.post<any>("/api/saved-vehicles", { userId, vehicleId }),
  remove: (userId: string, vehicleId: string) =>
    api.delete<{ success: boolean }>("/api/saved-vehicles", {
      userId,
      vehicleId,
    }),
};

// ---------------------------------------------------------------------------
// Test Drives
// ---------------------------------------------------------------------------

export const testDrivesApi = {
  list: () => api.get<any[]>("/api/test-drives"),
  create: (data: any) => api.post<any>("/api/test-drives", data),
  updateStatus: (id: string, status: string) =>
    api.put<{ success: boolean }>(`/api/test-drives/${id}/status`, { status }),
};

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const reportsApi = {
  list: () => api.get<any[]>("/api/reports"),
  create: (data: any) => api.post<any>("/api/reports", data),
  updateStatus: (id: string, status: string, adminNotes?: string) =>
    api.put<{ message: string }>(`/api/reports/${id}/status`, {
      status,
      admin_notes: adminNotes,
    }),
};
