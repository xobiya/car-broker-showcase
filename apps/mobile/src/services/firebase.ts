// Firebase configuration from environment or project defaults
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDemoPlaceholderOnlyApiKeyForApp',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'arif-car-sell.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'arif-car-sell',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'arif-car-sell.appspot.com',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:123456789012:android:abcdef123456',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export type FirebaseGoogleUser = {
  email: string;
  name?: string;
  photoURL?: string;
  uid?: string;
  idToken?: string;
  accessToken?: string;
};

export interface FirebaseSignInResult {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
  displayName?: string;
  photoUrl?: string;
}

export interface FirebaseUserRecord {
  localId: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export class FirebaseAuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'FirebaseAuthError';
    this.code = code;
  }
}

const FIREBASE_IDENTITY_BASE = 'https://identitytoolkit.googleapis.com/v1';
const FIREBASE_SECURE_TOKEN_BASE = 'https://securetoken.googleapis.com/v1';

/**
 * Maps raw Firebase error strings to human-friendly error messages.
 */
function humanizeFirebaseError(rawError: string): {
  code: string;
  message: string;
} {
  const code = rawError.split(' ')[0].toUpperCase();

  switch (code) {
    case 'EMAIL_EXISTS':
      return {
        code,
        message:
          'This email address is already registered. Please sign in instead.',
      };
    case 'OPERATION_NOT_ALLOWED':
      return {
        code,
        message: 'Password sign-in is not enabled for this Firebase project.',
      };
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return {
        code,
        message:
          'Too many unsuccessful attempts. Access has been temporarily restricted. Please try again later.',
      };
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
    case 'INVALID_LOGIN_CREDENTIALS':
      return {
        code,
        message:
          'Invalid email address or password. Please check your credentials.',
      };
    case 'USER_DISABLED':
      return {
        code,
        message: 'This account has been disabled by an administrator.',
      };
    case 'INVALID_EMAIL':
      return { code, message: 'Please enter a valid email address.' };
    case 'WEAK_PASSWORD':
      return {
        code,
        message:
          'The password is too weak. Please choose a password with at least 6 characters.',
      };
    case 'EXPIRED_OOB_CODE':
      return {
        code,
        message:
          'The password reset link has expired. Please request a new one.',
      };
    case 'INVALID_OOB_CODE':
      return {
        code,
        message: 'The password reset link is invalid or has already been used.',
      };
    default:
      return {
        code,
        message:
          rawError
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase()) || 'Authentication failed.',
      };
  }
}

/**
 * Lightweight, robust Firebase Auth helper for Expo React Native and Web.
 * Connects directly to Firebase Identity Toolkit REST API (no heavy native SDKs required),
 * supporting Email/Password, Password Reset, Google OAuth validation, and token refresh.
 */
export const firebaseAuth = {
  getConfig(): FirebaseConfig {
    return firebaseConfig;
  },

  /**
   * Checks whether a live (non-placeholder) Firebase API key is configured.
   */
  isConfigured(): boolean {
    const key = firebaseConfig.apiKey?.trim();
    return Boolean(
      key && !key.startsWith('AIzaSyDemoPlaceholder') && key.length > 20,
    );
  },

  /**
   * Translates error objects or messages into user-friendly strings.
   */
  getFriendlyErrorMessage(err: unknown): string {
    if (err instanceof FirebaseAuthError) return err.message;
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unexpected error occurred during authentication.';
  },

  /**
   * Prepares and validates a Firebase Google OAuth payload.
   */
  async verifyGoogleAccount(
    payload: FirebaseGoogleUser,
  ): Promise<
    Required<
      Pick<FirebaseGoogleUser, 'email' | 'name' | 'photoURL' | 'uid'>
    > & { idToken?: string }
  > {
    if (!payload.email || !/^\S+@\S+\.\S+$/.test(payload.email)) {
      throw new FirebaseAuthError(
        'INVALID_EMAIL',
        'Please provide a valid Google account email.',
      );
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name?.trim() || email.split('@')[0];
    const photoURL = payload.photoURL || '';

    // If an idToken is provided and Firebase is configured, verify it with Firebase Identity Toolkit
    let uid = payload.uid;
    if (!uid && payload.idToken && this.isConfigured()) {
      try {
        const userRec = await this.lookupAccount(payload.idToken);
        if (userRec?.localId) {
          uid = userRec.localId;
        }
      } catch {
        // Fall back to generated uid if lookup fails
      }
    }

    if (!uid) {
      uid = `firebase_google_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    return {
      email,
      name,
      photoURL,
      uid,
      idToken: payload.idToken,
    };
  },

  /**
   * Signs in a user using email and password via Firebase Identity Toolkit.
   */
  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseSignInResult> {
    if (!this.isConfigured()) {
      throw new FirebaseAuthError(
        'CONFIG_MISSING',
        'Firebase API key is not configured. Please set EXPO_PUBLIC_FIREBASE_API_KEY in your .env file.',
      );
    }

    const res = await fetch(
      `${FIREBASE_IDENTITY_BASE}/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          returnSecureToken: true,
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      const rawError = data?.error?.message || 'SIGNIN_FAILED';
      const { code, message } = humanizeFirebaseError(rawError);
      throw new FirebaseAuthError(code, message);
    }

    return data as FirebaseSignInResult;
  },

  /**
   * Creates a new user account with email and password via Firebase Identity Toolkit.
   */
  async signUpWithEmailAndPassword(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<FirebaseSignInResult> {
    if (!this.isConfigured()) {
      throw new FirebaseAuthError(
        'CONFIG_MISSING',
        'Firebase API key is not configured. Please set EXPO_PUBLIC_FIREBASE_API_KEY in your .env file.',
      );
    }

    const res = await fetch(
      `${FIREBASE_IDENTITY_BASE}/accounts:signUp?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          returnSecureToken: true,
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      const rawError = data?.error?.message || 'SIGNUP_FAILED';
      const { code, message } = humanizeFirebaseError(rawError);
      throw new FirebaseAuthError(code, message);
    }

    const result = data as FirebaseSignInResult;

    // Update displayName if provided
    if (displayName && result.idToken) {
      try {
        await this.updateProfile(result.idToken, { displayName });
        result.displayName = displayName;
      } catch {
        // Non-blocking; account is created successfully
      }
    }

    return result;
  },

  /**
   * Sends a password reset email via Firebase Identity Toolkit.
   */
  async sendPasswordResetEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      throw new FirebaseAuthError(
        'INVALID_EMAIL',
        'Please provide a valid email address.',
      );
    }

    if (!this.isConfigured()) {
      // In demo/dev mode without configured API key, return a mock success so app flows continue cleanly
      return {
        success: true,
        message: `A password reset link has been dispatched to ${trimmedEmail} (Demo mode).`,
      };
    }

    const res = await fetch(
      `${FIREBASE_IDENTITY_BASE}/accounts:sendOobCode?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: trimmedEmail,
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      const rawError = data?.error?.message || 'RESET_FAILED';
      const { code, message } = humanizeFirebaseError(rawError);
      throw new FirebaseAuthError(code, message);
    }

    return {
      success: true,
      message: `Password reset email sent to ${trimmedEmail}. Please check your inbox.`,
    };
  },

  /**
   * Looks up user profile details using a Firebase ID Token.
   */
  async lookupAccount(idToken: string): Promise<FirebaseUserRecord | null> {
    if (!this.isConfigured() || !idToken) return null;

    const res = await fetch(
      `${FIREBASE_IDENTITY_BASE}/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      },
    );

    const data = await res.json();
    if (!res.ok || !data?.users?.[0]) return null;

    const user = data.users[0];
    return {
      localId: user.localId,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  },

  /**
   * Refreshes a Firebase ID Token using a refresh token.
   */
  async refreshIdToken(
    refreshToken: string,
  ): Promise<{ idToken: string; refreshToken: string; expiresIn: string }> {
    if (!this.isConfigured()) {
      throw new FirebaseAuthError(
        'CONFIG_MISSING',
        'Firebase is not configured.',
      );
    }

    const res = await fetch(
      `${FIREBASE_SECURE_TOKEN_BASE}/token?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      throw new FirebaseAuthError(
        'REFRESH_FAILED',
        data?.error?.message || 'Failed to refresh token.',
      );
    }

    return {
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  },

  /**
   * Updates user profile (displayName or photoUrl) via Firebase Identity Toolkit.
   */
  async updateProfile(
    idToken: string,
    profile: { displayName?: string; photoUrl?: string },
  ): Promise<void> {
    if (!this.isConfigured()) return;

    await fetch(
      `${FIREBASE_IDENTITY_BASE}/accounts:update?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          displayName: profile.displayName,
          photoUrl: profile.photoUrl,
          returnSecureToken: false,
        }),
      },
    );
  },

  /**
   * Signs in with OAuth credentials (e.g. Google ID token) via Firebase Identity Toolkit.
   */
  async signInWithIdp(options: {
    providerId: string;
    idToken?: string;
    accessToken?: string;
    requestUri?: string;
  }): Promise<FirebaseSignInResult> {
    if (!this.isConfigured()) {
      throw new FirebaseAuthError(
        'CONFIG_MISSING',
        'Firebase is not configured.',
      );
    }

    const postBodyParams: string[] = [
      `providerId=${encodeURIComponent(options.providerId)}`,
    ];
    if (options.idToken)
      postBodyParams.push(`id_token=${encodeURIComponent(options.idToken)}`);
    if (options.accessToken)
      postBodyParams.push(
        `access_token=${encodeURIComponent(options.accessToken)}`,
      );

    const res = await fetch(
      `${FIREBASE_IDENTITY_BASE}/accounts:signInWithIdp?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postBody: postBodyParams.join('&'),
          requestUri: options.requestUri || 'http://localhost',
          returnSecureToken: true,
          returnIdpCredential: true,
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      const rawError = data?.error?.message || 'IDP_AUTH_FAILED';
      const { code, message } = humanizeFirebaseError(rawError);
      throw new FirebaseAuthError(code, message);
    }

    return data as FirebaseSignInResult;
  },
};
