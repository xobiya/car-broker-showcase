import React, { useState } from "react";
import { User } from "../../../../shared/types";
import { Shield, Mail, UserIcon, Phone, Loader2, X, ChevronRight, Eye, EyeOff } from "lucide-react";
import { authApi, setToken } from "../../lib/api";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  defaultRole?: "buyer" | "broker" | "seller";
  initialTab?: "login" | "register";
}

type AuthTab = "login" | "register";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "abebe.k@autobroker.et", color: "text-blue-900", dot: "bg-blue-900" },
  { label: "Broker", email: "yonas.h@autobroker.et", color: "text-indigo-600", dot: "bg-indigo-600" },
  { label: "Seller", email: "mesfin.t@autobroker.et", color: "text-orange-500", dot: "bg-orange-500" },
  { label: "Buyer", email: "dawit.l@gmail.com", color: "text-emerald-600", dot: "bg-emerald-600" },
];

export default function AuthModal({ onClose, onSuccess, onNotify, defaultRole, initialTab }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab || (defaultRole ? "register" : "login"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+251 ");
  const [role, setRole] = useState<"buyer" | "broker" | "seller">(defaultRole || "buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("+251 ");
    setRole(defaultRole || "buyer");
    setError("");
  };

  const switchTab = (t: AuthTab) => {
    setTab(t);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data: { user: User; token: string };

      if (tab === "register") {
        data = await authApi.register({ name, email, password, phone, role });
      } else {
        data = await authApi.login(email, password);
      }

      setToken(data.token);
      onNotify(tab === "register" ? "Account created successfully!" : "Welcome back!", "success");
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (emailVal: string) => {
    setEmail(emailVal);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className="px-5 sm:px-7 pt-8 sm:pt-9 pb-4 sm:pb-5">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {tab === "login" ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
              {tab === "login"
                ? "Sign in to access your dashboard."
                : "Join Ethiopia's trusted auto marketplace."}
            </p>
          </div>

          <div className="flex bg-slate-100 rounded-lg p-0.5 mb-4 sm:mb-5">
            {(["login", "register"] as AuthTab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {tab === "login" && role && (
            <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Signing in as:</span>
              <span className="text-[11px] font-black text-blue-900 capitalize">{role}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <p className="text-[11px] font-semibold text-rose-700">{error}</p>
              </div>
            )}

            {tab === "register" && (
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Dawit Lemma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. dawit@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Password</label>
              <div className="relative">
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {tab === "register" && (
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+251 9X XXX XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
              </div>
            )}

            {tab === "register" && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Joining as:</span>
                <span className="text-[11px] font-black text-blue-900 capitalize">{role}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Please wait...</>
              ) : tab === "register" ? (
                <><UserIcon size={14} /> Create Account</>
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>

          <div className="relative my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNotify("Google sign-in coming soon!", "info")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="15" height="15"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => onNotify("Facebook sign-in coming soon!", "info")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="15" height="15"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>
        </div>

        {tab === "login" && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-7 py-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Quick Demo Access</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map(({ label, email: demoEmail, color, dot }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => fillDemo(demoEmail)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                  <span className={`text-[11px] font-bold ${color} shrink-0 w-12`}>{label}</span>
                  <span className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate font-medium">{demoEmail}</span>
                  <ChevronRight size={12} className="ml-auto text-slate-300 group-hover:text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
