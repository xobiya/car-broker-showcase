import { create } from "zustand";
import type { User, VehicleListing } from "../../../shared/types";

interface Toast {
  text: string;
  type: "success" | "error" | "info";
  id: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  toasts: Toast[];
  initialFilters: Record<string, unknown> | null;
  selectedVehicle: VehicleListing | null;
  selectedBrokerId: string | null;
  theme: "dark" | "light";

  setUser: (user: User | null) => void;
  addToast: (text: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  setInitialFilters: (filters: Record<string, unknown> | null) => void;
  setSelectedVehicle: (v: VehicleListing | null) => void;
  setSelectedBrokerId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  logout: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem("autobroker_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })(),
  isAuthenticated: !!localStorage.getItem("autobroker_user"),
  isLoading: true,
  toasts: [],
  initialFilters: null,
  selectedVehicle: null,
  selectedBrokerId: null,
  theme: (() => {
    try {
      const saved = localStorage.getItem("autobroker_theme");
      const initial = (saved === "light" || saved === "dark") ? saved : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", initial === "dark");
        document.documentElement.classList.toggle("light", initial === "light");
      }
      return initial;
    } catch {
      return "dark";
    }
  })(),

  setUser: (user) => {
    if (user) {
      localStorage.setItem("autobroker_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("autobroker_user");
    }
    set({ user, isAuthenticated: !!user });
  },

  addToast: (text, type) => {
    const id = crypto.randomUUID();
    const toast: Toast = { text, type, id };
    set(state => ({ toasts: [...state.toasts, toast] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4500);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  setInitialFilters: (filters) => set({ initialFilters: filters }),
  setSelectedVehicle: (v) => set({ selectedVehicle: v }),
  setSelectedBrokerId: (id) => set({ selectedBrokerId: id }),
  setLoading: (loading) => set({ isLoading: loading }),

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("autobroker_theme", nextTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        document.documentElement.classList.toggle("light", nextTheme === "light");
      }
    } catch {}
    set({ theme: nextTheme });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem("autobroker_theme", theme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.classList.toggle("light", theme === "light");
      }
    } catch {}
    set({ theme });
  },

  logout: () => {
    localStorage.removeItem("autobroker_user");
    localStorage.removeItem("autobroker_token");
    localStorage.removeItem("autobroker_activeView");
    set({ user: null, isAuthenticated: false });
  },
}));
