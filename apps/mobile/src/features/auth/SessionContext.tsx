import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from './auth-service';
import { secureSession } from '../../services/secure-session';
import type { RegisterInput, User } from '../../types/models';
type SessionContextValue = {
  user: User | null; ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
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
        const token = await secureSession.getAccessToken();
        if (token) { const result = await authService.getCurrentUser(); if (active) setUser(result.user); }
      } catch { await secureSession.clear(); }
      finally { if (active) setReady(true); }
    }
    void restoreSession();
    return () => { active = false; };
  }, []);
  const value = useMemo<SessionContextValue>(() => ({
    user, ready,
    signIn: async (email, password) => setUser(await authService.login(email, password)),
    register: async input => setUser(await authService.register(input)),
    updateProfile: async input => { if (!user) throw new Error('Sign in to edit your profile.'); setUser(await authService.updateProfile(user.id, input)); },
    changePassword: (current, next) => authService.changePassword(current, next),
    signOut: async () => { try { await authService.logout(); } finally { setUser(null); } },
  }), [user, ready]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider.');
  return context;
}
