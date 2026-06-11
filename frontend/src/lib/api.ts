import type { User, VehicleListing, Lead, Sale, Broker, AuditLogEntry, VehicleDocument, InspectionRecord, SavedVehicle, TestDriveRequest, Report } from "../../../shared/types";

const TOKEN_KEY = "autobroker_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("autobroker_user");
};

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string>;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = path;
  if (options.params) {
    const qs = new URLSearchParams(options.params).toString();
    url += `?${qs}`;
  }

  const init: RequestInit = {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  const res = await fetch(url, init);

  if (res.status === 401) {
    clearSession();
    window.dispatchEvent(new CustomEvent("autobroker:unauthorized"));
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const err = await res.json();
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    throw new Error(`Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiFetch<T>(path, { method: "GET", ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => apiFetch<T>(path, { method: "POST", body, ...options }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => apiFetch<T>(path, { method: "PUT", body, ...options }),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) => apiFetch<T>(path, { method: "DELETE", body, ...options }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>("/api/auth/login", { email, password }),
  register: (payload: { name: string; email: string; password: string; phone?: string; role: "buyer" | "broker" }) =>
    api.post<{ user: User; token: string }>("/api/auth/register", payload),
  logout: () => api.post<{ message: string }>("/api/auth/logout"),
  me: () => api.get<{ user: User }>("/api/auth/me"),
};

export const vehiclesApi = {
  list: () => api.get<VehicleListing[]>("/api/vehicles"),
  create: (data: Record<string, unknown>) => api.post<VehicleListing>("/api/vehicles", data),
  update: (id: string, data: Record<string, unknown>) => api.put<{ message: string }>(`/api/vehicles/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/api/vehicles/${id}`),
  approve: (id: string) => api.put<{ message: string }>(`/api/vehicles/${id}/approve`),
  reject: (id: string, reason: string) => api.put<{ message: string }>(`/api/vehicles/${id}/reject`, { reason }),
  submit: (id: string) => api.put<{ message: string }>(`/api/vehicles/${id}/submit`),
};

export const leadsApi = {
  list: () => api.get<Lead[]>("/api/leads"),
  create: (data: Record<string, unknown>) => api.post<Lead>("/api/leads", data),
  updateStatus: (id: string, status: string) => api.put<{ message: string }>(`/api/leads/${id}/status`, { status }),
};

export const salesApi = {
  list: () => api.get<Sale[]>("/api/sales"),
  create: (data: Record<string, unknown>) => api.post<Sale>("/api/sales", data),
};

export const brokersApi = {
  list: () => api.get<Broker[]>("/api/brokers"),
  get: (id: string) => api.get<Broker>(`/api/brokers/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put<{ success: boolean }>(`/api/brokers/${id}`, data),
  approve: (id: string) => api.put<{ message: string }>(`/api/brokers/${id}/approve`),
  reject: (id: string) => api.put<{ message: string }>(`/api/brokers/${id}/reject`),
};

export const usersApi = {
  list: () => api.get<User[]>("/api/users"),
  get: (id: string) => api.get<User>(`/api/users/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put<User>(`/api/users/${id}`, data),
};

export const statsApi = {
  get: () => api.get<{ totals: Record<string, number> }>("/api/stats"),
};

export const auditApi = {
  list: () => api.get<AuditLogEntry[]>("/api/audit-logs"),
  create: (data: Record<string, unknown>) => api.post<AuditLogEntry>("/api/audit-logs", data),
};

export const documentsApi = {
  list: (vehicleId: string) => api.get<VehicleDocument[]>(`/api/documents`, { params: { vehicleId } }),
  create: (data: Record<string, unknown>) => api.post<VehicleDocument>("/api/documents", data),
  delete: (id: string) => api.delete<{ message: string }>(`/api/documents/${id}`),
};

export const inspectionsApi = {
  list: (vehicleId: string) => api.get<InspectionRecord[]>(`/api/inspections`, { params: { vehicleId } }),
  create: (data: Record<string, unknown>) => api.post<InspectionRecord>("/api/inspections", data),
  update: (id: string, data: Record<string, unknown>) => api.put<{ message: string }>(`/api/inspections/${id}`, data),
};

export const savedVehiclesApi = {
  list: (userId: string) => api.get<SavedVehicle[]>(`/api/saved-vehicles`, { params: { userId } }),
  save: (userId: string, vehicleId: string) => api.post<SavedVehicle>("/api/saved-vehicles", { userId, vehicleId }),
  remove: (userId: string, vehicleId: string) => api.delete<{ success: boolean }>("/api/saved-vehicles", { userId, vehicleId }),
};

export const testDrivesApi = {
  list: () => api.get<TestDriveRequest[]>("/api/test-drives"),
  create: (data: Record<string, unknown>) => api.post<TestDriveRequest>("/api/test-drives", data),
  updateStatus: (id: string, status: string) => api.put<{ success: boolean }>(`/api/test-drives/${id}/status`, { status }),
};

export const reportsApi = {
  list: () => api.get<Report[]>("/api/reports"),
  create: (data: Record<string, unknown>) => api.post<Report>("/api/reports", data),
  updateStatus: (id: string, status: string, adminNotes?: string) =>
    api.put<{ message: string }>(`/api/reports/${id}/status`, { status, admin_notes: adminNotes }),
};

export const uploadApi = {
  single: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    const token = getToken();
    return fetch("/api/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json()) as Promise<{ url: string; filename: string }>;
  },
  multiple: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    if (folder) formData.append("folder", folder);
    const token = getToken();
    return fetch("/api/upload/multiple", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json()) as Promise<{ urls: string[] }>;
  },
};
