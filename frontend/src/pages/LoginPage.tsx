import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useStore } from "../store";

const DEMO_ACCOUNTS = [
  { roleKey: "buyer" as const, email: "dawit.l@gmail.com" },
  { roleKey: "broker" as const, email: "yonas.h@autobroker.et" },
  { roleKey: "admin" as const, email: "abebe.k@autobroker.et" }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["authentication", "validation", "notifications", "common"]);
  const { login } = useAuth();
  const addToast = useStore((s) => s.addToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t("validation:required"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      addToast(t("notifications:auth.loginSuccess", { name: user.name }), "success");
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "broker") navigate("/broker-dashboard");
      else navigate("/profile");
    } catch (err: any) {
      setError(err.message || t("notifications:auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 md:px-8 bg-slate-50/60 dark:bg-[#0B0F19] pb-24 sm:pb-12">
      <div className="w-full max-w-md mx-auto">
        
        {/* Main Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-none p-7 sm:p-10 space-y-6">
          
          {/* Sign In & Sign Up Navigation Bar Switcher */}
          <div className="flex items-center p-1.5 bg-slate-100/90 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 bg-[#0B0F19] text-[#22c55e] shadow-sm"
            >
              <LogIn size={15} />
              <span>{t("authentication:modal.signInTab")}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <UserPlus size={15} />
              <span>{t("authentication:modal.registerTab")}</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <span className="bg-emerald-500/10 text-[#16a34a] dark:text-[#22c55e] border border-emerald-500/25 text-xs font-black px-3.5 py-1 rounded-full inline-block">
              Arif Car Sell
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {t("authentication:login.title")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t("authentication:login.subtitle")}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {t("authentication:login.emailLabel")}
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("authentication:login.emailPlaceholder")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {t("authentication:login.passwordLabel")}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("authentication:login.passwordPlaceholder")}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-400 accent-[#22c55e] cursor-pointer"
                />
                <span>{t("authentication:login.rememberMe")}</span>
              </label>
              <button
                type="button"
                onClick={() => addToast("Password reset link sent to registered email.", "info")}
                className="text-slate-500 hover:text-[#16a34a] dark:hover:text-[#22c55e] font-semibold cursor-pointer transition"
              >
                {t("authentication:login.forgotPassword")}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t("authentication:login.submittingButton")}</span>
                </>
              ) : (
                <>
                  <span>{t("authentication:login.submitButton")}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Evaluation (Dev Mode Only) */}
          {(import.meta as any).env?.DEV && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-left space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {t("authentication:login.quickFill")}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.roleKey}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email)}
                    className="p-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer text-left truncate flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                    <span className="truncate">{t(`authentication:login.roles.${acc.roleKey}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Link to Register */}
          <div className="text-center pt-1 text-xs text-slate-600 dark:text-slate-400">
            {t("authentication:login.noAccountPrompt")}{" "}
            <Link to="/register" className="font-bold text-[#16a34a] dark:text-[#22c55e] hover:underline">
              {t("authentication:login.createAccountLink")}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
