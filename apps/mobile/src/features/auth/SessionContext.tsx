import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from './auth-service';
import { secureSession } from '../../services/secure-session';
import type { RegisterInput, User } from '../../types/models';

type SessionContextValue = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  signInWithGoogle: (payload: {
    email: string;
    name?: string;
    role?: 'buyer' | 'seller' | 'broker';
    photoURL?: string;
    uid?: string;
  }) => Promise<void>;
  updateProfile: (input: { name: string; phone?: string; bio?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        // 1. Immediately read cached user profile to avoid brief unauthenticated flicker
        const cachedUser = await secureSession.getUserProfile();
        if (cachedUser && active) {
          setUser(cachedUser);
        }

        const token = await secureSession.getAccessToken();
        if (token) {
          const result = await authService.getCurrentUser();
          if (active) {
            setUser(result.user);
            await secureSession.setUserProfile(result.user);
          }
        } else if (!cachedUser) {
          if (active) setUser(null);
        }
      } catch {
        // Only clear if token verification definitively failed
        const token = await secureSession.getAccessToken();
        if (!token) {
          await secureSession.clear();
          if (active) setUser(null);
        }
      } finally {
        if (active) setReady(true);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      ready,
      signIn: async (email, password) => {
        const loggedUser = await authService.login(email, password);
        await secureSession.setUserProfile(loggedUser);
        setUser(loggedUser);
      },
      register: async (input) => {
        const regUser = await authService.register(input);
        await secureSession.setUserProfile(regUser);
        setUser(regUser);
      },
      signInWithGoogle: async (payload) => {
        const googleUser = await authService.loginWithFirebaseGoogle(payload);
        await secureSession.setUserProfile(googleUser);
        setUser(googleUser);
      },
      updateProfile: async (input) => {
        if (!user) throw new Error('Sign in to edit your profile.');
        const updated = await authService.updateProfile(user.id, input);
        await secureSession.setUserProfile(updated);
        setUser(updated);
      },
      changePassword: (current, next) => authService.changePassword(current, next),
      signOut: async () => {
        try {
          await authService.logout();
        } finally {
          await secureSession.clear();
          setUser(null);
        }
      },
    }),
    [user, ready],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider.');
  return context;
}
