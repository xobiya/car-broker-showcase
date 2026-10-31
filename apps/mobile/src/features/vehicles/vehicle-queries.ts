import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadService, testDriveService, vehicleService } from './vehicle-service';
import type { Lead, TestDriveRequest, VehicleFilters } from '../../types/models';

export const vehicleQueryKeys = {
  all: ['vehicles'] as const,
  list: (filters: VehicleFilters = {}) => ['vehicles', 'list', filters] as const,
  detail: (id: string) => ['vehicles', id] as const,
  saved: (userId?: string) => ['saved', userId] as const,
  leads: ['leads'] as const,
  testDrives: ['test-drives'] as const,
};

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({ queryKey: vehicleQueryKeys.list(filters), queryFn: () => vehicleService.list(filters) });
}
export function useInfiniteVehicles(filters: Omit<VehicleFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: vehicleQueryKeys.list(filters), initialPageParam: 1,
    queryFn: ({ pageParam }) => vehicleService.list({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => lastPage.length === 20 ? pages.length + 1 : undefined,
  });
}
export function useVehicle(id: string) {
  return useQuery({ queryKey: vehicleQueryKeys.detail(id), queryFn: () => vehicleService.get(id), enabled: Boolean(id) });
}
export function useSavedVehicles(userId?: string) {
  return useQuery({ queryKey: vehicleQueryKeys.saved(userId), queryFn: () => vehicleService.saved(userId!), enabled: Boolean(userId) });
}
export function useToggleSavedVehicle(userId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ vehicleId, saved }: { vehicleId: string; saved: boolean }) => {
      if (!userId) throw new Error('Sign in to save vehicles.');
      return saved ? vehicleService.removeSaved(userId, vehicleId) : vehicleService.save(userId, vehicleId);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: vehicleQueryKeys.saved(userId) }),
  });
}
export function useCreateVehicle() {
  const client = useQueryClient();
  return useMutation({ mutationFn: vehicleService.create, onSuccess: () => client.invalidateQueries({ queryKey: vehicleQueryKeys.all }) });
}
export function useUpdateVehicle() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => vehicleService.update(id, body), onSuccess: (_, { id }) => Promise.all([client.invalidateQueries({ queryKey: vehicleQueryKeys.all }), client.invalidateQueries({ queryKey: vehicleQueryKeys.detail(id) })]) });
}
export function useRemoveVehicle() {
  const client = useQueryClient();
  return useMutation({ mutationFn: vehicleService.remove, onSuccess: () => client.invalidateQueries({ queryKey: vehicleQueryKeys.all }) });
}
export function useLeads() {
  return useQuery({ queryKey: vehicleQueryKeys.leads, queryFn: leadService.list });
}
export function useUpdateLeadStatus() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) => leadService.updateStatus(id, status), onSuccess: () => client.invalidateQueries({ queryKey: vehicleQueryKeys.leads }) });
}
export function useTestDrives(enabled = true) {
  return useQuery({ queryKey: vehicleQueryKeys.testDrives, queryFn: testDriveService.list, enabled });
}
export function useUpdateTestDriveStatus() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: TestDriveRequest['status'] }) => testDriveService.updateStatus(id, status), onSuccess: () => client.invalidateQueries({ queryKey: vehicleQueryKeys.testDrives }) });
}

