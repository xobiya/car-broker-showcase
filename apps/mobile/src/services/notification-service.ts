import { request } from './api-client';

export const notificationService = {
  registerDevice: (token: string) =>
    request<void>('/api/devices', { method: 'POST', json: { token } }),
  unregisterDevice: (token: string) =>
    request<void>('/api/devices', { method: 'DELETE', json: { token } }),
};
