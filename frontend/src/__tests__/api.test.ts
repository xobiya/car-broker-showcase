import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

describe('API Client', () => {
  it('should set auth header when token exists', async () => {
    localStorage.setItem('autobroker_token', 'test-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'ok' }),
    });

    const { api } = await import('../lib/api');
    await api.get('/api/vehicles');

    const call = mockFetch.mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-token');
  });

  it('should handle 401 errors', async () => {
    localStorage.setItem('autobroker_token', 'expired-token');
    localStorage.setItem('autobroker_user', '{"id":"1"}');

    const unauthorizedHandler = vi.fn();
    window.addEventListener('autobroker:unauthorized', unauthorizedHandler);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Unauthorized' }),
    });

    const { api } = await import('../lib/api');
    await expect(api.get('/api/vehicles')).rejects.toThrow('Unauthorized');
    expect(localStorage.getItem('autobroker_token')).toBeNull();
  });

  it('should throw error with server message on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Validation failed' }),
    });

    const { api } = await import('../lib/api');
    await expect(api.get('/api/vehicles')).rejects.toThrow('Validation failed');
  });

  it('should pass query params correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ([]),
    });

    const { api } = await import('../lib/api');
    await api.get('/api/vehicles', { params: { status: 'approved' } });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('status=approved');
  });
});

describe('Auth Store', () => {
  it('should set and clear user', async () => {
    const { useStore } = await import('../store');
    const store = useStore.getState();

    store.setUser({ id: '1', name: 'Test', email: 'test@test.com', phone: '', role: 'buyer' });
    expect(useStore.getState().user?.name).toBe('Test');
    expect(useStore.getState().isAuthenticated).toBe(true);

    store.logout();
    expect(useStore.getState().user).toBeNull();
    expect(useStore.getState().isAuthenticated).toBe(false);
  });

  it('should manage toasts', async () => {
    const { useStore } = await import('../store');
    const store = useStore.getState();

    store.addToast('Test error', 'error');
    expect(useStore.getState().toasts).toHaveLength(1);
    expect(useStore.getState().toasts[0].text).toBe('Test error');
    expect(useStore.getState().toasts[0].type).toBe('error');
  });
});
