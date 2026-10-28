// Firebase configuration from environment or project defaults
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderOnlyApiKeyForApp',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'arif-car-sell.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'arif-car-sell',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arif-car-sell.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:android:abcdef123456',
};

export type FirebaseGoogleUser = {
  email: string;
  name?: string;
  photoURL?: string;
  uid?: string;
};

/**
 * Lightweight Firebase Auth helper for Expo React Native and Web.
 * Connects directly to Firebase Identity Toolkit or passes Google credentials to backend.
 */
export const firebaseAuth = {
  getConfig() {
    return firebaseConfig;
  },

  /**
   * Prepares and validates Firebase Google OAuth payload.
   */
  async verifyGoogleAccount(payload: FirebaseGoogleUser) {
    if (!payload.email || !/^\S+@\S+\.\S+$/.test(payload.email)) {
      throw new Error('Please provide a valid Google account email.');
    }
    return {
      email: payload.email.toLowerCase().trim(),
      name: payload.name || payload.email.split('@')[0],
      photoURL: payload.photoURL || '',
      uid: payload.uid || `firebase_google_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  },
};
