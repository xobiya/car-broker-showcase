import { secureSession } from './secure-session';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const CUSTOM_API_URL_KEY = 'arif_custom_api_url';

function getDefaultApiBaseUrl(): string {
  const configured = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

  if (Platform.OS === 'web') {
    return configured || 'http://localhost:3000';
  }

  // If hostUri is available from Expo packager (e.g. "192.168.1.100:8081"), use its IP:
  const hostUri = Constants.expoConfig?.hostUri;
  const devIp = hostUri ? hostUri.split(':')[0] : null;

  if (devIp && (!configured || configured.includes('localhost') || configured.includes('127.0.0.1'))) {
    return `http://${devIp}:3000`;
  }

  // If configured is an explicit non-localhost URL (e.g. LAN IP or https://...), use it
  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured;
  }

  // Fallback to developer PC Wi-Fi LAN IP (reachable on physical phones on same Wi-Fi)
  return 'http://172.26.166.46:3000';
}

let activeApiBaseUrl: string = getDefaultApiBaseUrl();

// Attempt to load any user-configured server URL asynchronously
(async () => {
  try {
    const saved = Platform.OS === 'web'
      ? (typeof localStorage !== 'undefined' ? localStorage.getItem(CUSTOM_API_URL_KEY) : null)
      : await SecureStore.getItemAsync(CUSTOM_API_URL_KEY);
    if (saved && saved.startsWith('http')) {
      activeApiBaseUrl = saved.replace(/\/$/, '');
    }
  } catch {
    // Ignore storage errors on boot
  }
})();

export function getApiBaseUrl(): string {
  return activeApiBaseUrl;
}

export async function setApiBaseUrl(newUrl: string): Promise<string> {
  const clean = newUrl.trim().replace(/\/$/, '');
  activeApiBaseUrl = clean;
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(CUSTOM_API_URL_KEY, clean);
    } else {
      await SecureStore.setItemAsync(CUSTOM_API_URL_KEY, clean);
    }
  } catch {}
  return clean;
}

export const API_BASE_URL = getApiBaseUrl();

type RequestOptions = RequestInit & {
  json?: unknown;
  params?: Record<string, string | number | undefined>;
  retryAuth?: boolean;
};

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const refreshToken = await secureSession.getRefreshToken();
        const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Client-Platform': 'native',
          },
          body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
        });
        if (!response.ok) return null;
        const body = (await response.json()) as {
          token?: string;
          accessToken?: string;
          refreshToken?: string;
        };
        const token = body.token ?? body.accessToken;
        if (token) await secureSession.setAccessToken(token);
        if (body.refreshToken)
          await secureSession.setRefreshToken(body.refreshToken);
        return token ?? null;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

function buildUrl(pathname: string, params?: RequestOptions['params']) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim() !== '')
      query.set(key, String(value));
  });
  const suffix = query.toString();
  return `${getApiBaseUrl()}${pathname}${suffix ? `?${suffix}` : ''}`;
}

export async function request<T>(
  pathname: string,
  { json, headers, params, retryAuth = true, ...options }: RequestOptions = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'Set EXPO_PUBLIC_API_BASE_URL in apps/mobile/.env before connecting.',
    );
  }
  const token = await secureSession.getAccessToken();
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(buildUrl(pathname, params), {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Client-Platform': 'native',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    ...(isFormData ? { body: options.body } : {}),
  });

  const isAuthRoute =
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/refresh');
  if (response.status === 401 && retryAuth && token && !isAuthRoute) {
    const renewed = await refreshAccessToken();
    if (renewed)
      return request<T>(pathname, {
        json,
        headers,
        params,
        ...options,
        retryAuth: false,
      });
    await secureSession.clear();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(
      body.error || body.message || `Request failed (${response.status})`,
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
