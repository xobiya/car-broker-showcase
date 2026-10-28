import { request } from '../../services/api-client';
import { secureSession } from '../../services/secure-session';
import type { RegisterInput, User } from '../../types/models';
type AuthResponse = {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
};
async function persistSession(
  result: Pick<AuthResponse, 'token' | 'accessToken' | 'refreshToken'>,
) {
  const token = result.token ?? result.accessToken;
  if (token) await secureSession.setAccessToken(token);
  if (result.refreshToken)
    await secureSession.setRefreshToken(result.refreshToken);
}
export const authService = {
  async login(email: string, password: string) {
    const result = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    });
    await persistSession(result);
    return result.user;
  },
  async register(input: RegisterInput) {
    const result = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      json: input,
    });
    await persistSession(result);
    return result.user;
  },
  async loginWithFirebaseGoogle(payload: {
    email: string;
    name?: string;
    role?: 'buyer' | 'seller' | 'broker';
    photoURL?: string;
    uid?: string;
  }) {
    const result = await request<AuthResponse>('/api/auth/firebase-google', {
      method: 'POST',
      json: payload,
    });
    await persistSession(result);
    return result.user;
  },
  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),
  async updateProfile(
    id: string,
    input: { name: string; phone?: string; bio?: string },
  ) {
    return request<User>(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      json: input,
    });
  },
  async changePassword(currentPassword: string, newPassword: string) {
    const result = await request<{
      message: string;
      token?: string;
      accessToken?: string;
      refreshToken?: string;
    }>('/api/auth/change-password', {
      method: 'POST',
      json: { currentPassword, newPassword },
    });
    await persistSession(result);
    return result.message;
  },
  logout: async () => {
    const refreshToken = await secureSession.getRefreshToken();
    try {
      await request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
        json: refreshToken ? { refreshToken } : undefined,
        retryAuth: false,
      });
    } finally {
      await secureSession.clear();
    }
  },
};
