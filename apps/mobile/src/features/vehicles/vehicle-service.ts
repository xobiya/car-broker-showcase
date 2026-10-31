import { request } from '../../services/api-client';
import type { Lead, SavedVehicle, TestDriveRequest, Vehicle, VehicleFilters } from '../../types/models';
import { FALLBACK_VEHICLES } from './fallback-vehicles';

export const vehicleService = {
  list: async (filters: VehicleFilters = {}): Promise<Vehicle[]> => {
    try {
      const data = await request<Vehicle[]>('/api/vehicles', {
        params: { limit: 50, ...filters },
      });
      if (Array.isArray(data) && data.length > 0) return data;
      return FALLBACK_VEHICLES;
    } catch {
      return FALLBACK_VEHICLES;
    }
  },
  get: async (id: string): Promise<Vehicle> => {
    try {
      return await request<Vehicle>(`/api/vehicles/${encodeURIComponent(id)}`);
    } catch {
      const found = FALLBACK_VEHICLES.find((x) => x.id === id);
      return found || FALLBACK_VEHICLES[0];
    }
  },
  saved: (userId: string) => request<SavedVehicle[]>('/api/saved-vehicles', { params: { userId } }),
  save: (userId: string, vehicleId: string) => request('/api/saved-vehicles', { method: 'POST', json: { userId, vehicleId } }),
  removeSaved: (userId: string, vehicleId: string) => request('/api/saved-vehicles', { method: 'DELETE', json: { userId, vehicleId } }),
  create: (body: Record<string, unknown>) => request<Vehicle>('/api/vehicles', { method: 'POST', json: body }),
  update: (id: string, body: Record<string, unknown>) => request<{ message: string }>(`/api/vehicles/${encodeURIComponent(id)}`, { method: 'PUT', json: body }),
  remove: (id: string) => request<{ message: string }>(`/api/vehicles/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  submit: (id: string) => request<{ message: string }>(`/api/vehicles/${encodeURIComponent(id)}/submit`, { method: 'PUT' }),
};

export const leadService = {
  list: () => request<Lead[]>('/api/leads'),
  create: (body: { vehicle_id: string; buyer_name: string; buyer_email: string; buyer_phone: string; message?: string }) => request<Lead>('/api/leads', { method: 'POST', json: body }),
  updateStatus: (id: string, status: Lead['status']) => request<{ message: string }>(`/api/leads/${encodeURIComponent(id)}/status`, { method: 'PUT', json: { status } }),
};

export const testDriveService = {
  list: () => request<TestDriveRequest[]>('/api/test-drives'),
  create: (body: { vehicle_id: string; name: string; email?: string; phone: string; preferred_date: string; preferred_time: string; message?: string }) => request<TestDriveRequest>('/api/test-drives', { method: 'POST', json: body }),
  updateStatus: (id: string, status: TestDriveRequest['status']) => request<{ success: boolean }>(`/api/test-drives/${encodeURIComponent(id)}/status`, { method: 'PUT', json: { status } }),
};

export async function uploadFiles(files: Array<{ uri: string; name: string; type: string }>, folder: string) {
  const data = new FormData();
  files.forEach((file) => data.append('files', file as unknown as Blob));
  data.append('folder', folder);
  return request<{ urls: string[] }>('/api/upload/multiple', { method: 'POST', body: data });
}
