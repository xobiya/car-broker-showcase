import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'arif_access_token';
const REFRESH_TOKEN_KEY = 'arif_refresh_token';
let browserAccessToken: string | null = null;
let browserRefreshToken: string | null = null;

export const secureSession = {
  getAccessToken: async () => {
    if (Platform.OS === 'web') return browserAccessToken;
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  setAccessToken: async (token: string) => {
    if (Platform.OS === 'web') {
      browserAccessToken = token;
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken: async () => {
    if (Platform.OS === 'web') return browserRefreshToken;
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string) => {
    if (Platform.OS === 'web') {
      browserRefreshToken = token;
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  clear: async () => {
    if (Platform.OS === 'web') {
      browserAccessToken = null;
      browserRefreshToken = null;
      return;
    }
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
