import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types/models';

const ACCESS_TOKEN_KEY = 'arif_access_token';
const REFRESH_TOKEN_KEY = 'arif_refresh_token';
const USER_PROFILE_KEY = 'arif_user_profile';

let browserAccessToken: string | null = null;
let browserRefreshToken: string | null = null;
let browserUserCache: string | null = null;

const isWeb = Platform.OS === 'web';

function getWebStorage(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore storage restrictions
  }
  return null;
}

function setWebStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage restrictions
  }
}

function removeWebStorage(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage restrictions
  }
}

export const secureSession = {
  getAccessToken: async (): Promise<string | null> => {
    if (isWeb) {
      return getWebStorage(ACCESS_TOKEN_KEY) ?? browserAccessToken;
    }
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  setAccessToken: async (token: string): Promise<void> => {
    if (isWeb) {
      browserAccessToken = token;
      setWebStorage(ACCESS_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken: async (): Promise<string | null> => {
    if (isWeb) {
      return getWebStorage(REFRESH_TOKEN_KEY) ?? browserRefreshToken;
    }
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string): Promise<void> => {
    if (isWeb) {
      browserRefreshToken = token;
      setWebStorage(REFRESH_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  getUserProfile: async (): Promise<User | null> => {
    try {
      let raw: string | null = null;
      if (isWeb) {
        raw = getWebStorage(USER_PROFILE_KEY) ?? browserUserCache;
      } else {
        raw = await SecureStore.getItemAsync(USER_PROFILE_KEY);
      }
      if (raw) return JSON.parse(raw) as User;
    } catch {
      // Ignore parse failure
    }
    return null;
  },

  setUserProfile: async (user: User | null): Promise<void> => {
    try {
      if (user) {
        const str = JSON.stringify(user);
        if (isWeb) {
          browserUserCache = str;
          setWebStorage(USER_PROFILE_KEY, str);
        } else {
          await SecureStore.setItemAsync(USER_PROFILE_KEY, str);
        }
      } else {
        if (isWeb) {
          browserUserCache = null;
          removeWebStorage(USER_PROFILE_KEY);
        } else {
          await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
        }
      }
    } catch {
      // Ignore storage error
    }
  },

  clear: async (): Promise<void> => {
    if (isWeb) {
      browserAccessToken = null;
      browserRefreshToken = null;
      browserUserCache = null;
      removeWebStorage(ACCESS_TOKEN_KEY);
      removeWebStorage(REFRESH_TOKEN_KEY);
      removeWebStorage(USER_PROFILE_KEY);
      return;
    }
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_PROFILE_KEY),
    ]);
  },
};
