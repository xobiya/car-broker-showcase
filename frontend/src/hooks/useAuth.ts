import { useEffect } from "react";
import { useStore } from "../store";
import { authApi, setToken } from "../lib/api";

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useStore();

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; role: "buyer" | "broker" }) => {
    const res = await authApi.register(payload);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    storeLogout();
  };

  const checkSession = async () => {
    try {
      const res = await authApi.me();
      setUser(res.user);
    } catch {
      storeLogout();
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => storeLogout();
    window.addEventListener("autobroker:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("autobroker:unauthorized", handleUnauthorized);
  }, []);

  return { user, isAuthenticated, login, register, logout, checkSession };
}
