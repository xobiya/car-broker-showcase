import React, { useState, useId } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Loader2,
  Eye,
  EyeOff,
  Car,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Crown,
  Briefcase,
  Store,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useStore } from "../../store";
import type { User } from "@autobroker/shared";

export interface AuthLayoutProps {
  initialMode?: "login" | "register";
  defaultRole?: "buyer" | "seller" | "broker";
  onSuccess?: (user: User) => void;
  redirectOnSuccess?: boolean;
}

const DEMO_ACCOUNTS = [
  { roleKey: "admin" as const, email: "abebe.k@autobroker.et", label: "Administrator", icon: Crown },
  { roleKey: "broker" as const, email: "yonas.h@autobroker.et", label: "Licensed Broker", icon: Briefcase },
  { roleKey: "seller" as const, email: "mesfin.t@autobroker.et", label: "Direct Seller", icon: Store },
  { roleKey: "buyer" as const, email: "dawit.l@gmail.com", label: "Buyer Account", icon: UserCheck },
];

export default function AuthLayout({
  initialMode = "login",
  defaultRole = "buyer",
  onSuccess,
  redirectOnSuccess = true,
}: AuthLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["authentication", "validation", "notifications", "common", "metadata"]);
  const { login, register } = useAuth();
  const addToast = useStore((s) => s.addToast);

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+251 ");
  const [role, setRole] = useState<"buyer" | "seller" | "broker">(defaultRole);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailInputId = useId();
  const passwordInputId = useId();
  const nameInputId = useId();
  const phoneInputId = useId();
  const rememberMeId = useId();
  const termsCheckboxId = useId();

  // Switch between Login and Register modes
  const handleModeSwitch = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    if (newMode === "login") {
      navigate("/login", { replace: true });
    } else {
      navigate("/register", { replace: true });
    }
  };

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string; width: string } => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200 dark:bg-slate-700", width: "0%" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) {
      return {
        score: 1,
        label: t("authentication:strength.weak", "Weak"),
        color: "bg-rose-500",
        width: "33%",
      };
    }
    if (score <= 3) {
      return {
        score: 2,
        label: t("authentication:strength.fair", "Fair"),
        color: "bg-amber-500",
        width: "66%",
      };
    }
    return {
      score: 3,
      label: t("authentication:strength.strong", "Strong"),
      color: "bg-emerald-500",
      width: "100%",
    };
  };

  const pwdStrength = calculatePasswordStrength(password);

  // Quick fill demo account
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      if (!email.trim() || !password.trim()) {
        setError(t("validation:required"));
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError(t("validation:required"));
        return;
      }
      if (!agreedToTerms) {
        setError(t("validation:termsRequired"));
        return;
      }
    }

    setLoading(true);

    try {
      let loggedUser: User;
      if (mode === "login") {
        loggedUser = await login(email.trim(), password);
        addToast(t("notifications:auth.loginSuccess", { name: loggedUser.name }), "success");
      } else {
        loggedUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
        });
        addToast(t("notifications:auth.registerSuccess", { name: loggedUser.name }), "success");
      }

      if (onSuccess) {
        onSuccess(loggedUser);
      }

      if (redirectOnSuccess) {
        if (loggedUser.role === "admin") navigate("/admin");
        else if (loggedUser.role === "broker") navigate("/broker-dashboard");
        else navigate("/profile");
      }
    } catch (err: any) {
      setError(err.message || (mode === "login" ? t("notifications:auth.invalidCredentials") : t("validation:generalError")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-6">
      
      {/* Brand Header */}
      <div className="text-center mb-3 sm:mb-4">
        <Link to="/" className="inline-flex flex-wrap items-center justify-center gap-2 hover:opacity-90 transition">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#FF416C] to-[#FF4B2B] flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <Car size={18} />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Arif Car Sell
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF4B2B] border border-orange-500/20">
            {t("authentication:showcase.badge", "Ethiopia's Verified Marketplace")}
          </span>
        </Link>
      </div>

      {/* Main Sliding Double Card Container */}
      <div className="relative w-full min-h-0 md:min-h-[560px] bg-white dark:bg-slate-900 rounded-3xl md:rounded-[36px] shadow-xl md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col md:block">
        
        {/* Top decorative gradient bar on mobile */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF416C] via-[#FF4B2B] to-[#FF416C] md:hidden" />

        {/* ========================================================================= */}
        {/* MOBILE SEGMENTED TAB SWITCHER (< md screens)                             */}
        {/* ========================================================================= */}
        <div className="md:hidden p-3.5 sm:p-4 pb-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => handleModeSwitch("login")}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-[#FF4B2B] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Lock size={13} />
              <span>{t("authentication:modal.signInTab", "Sign In")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("register")}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-[#FF4B2B] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <UserIcon size={13} />
              <span>{t("authentication:overlay.signUpButton", "Sign Up")}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FORM CONTAINER (Sits on left for login, right for register on md+) */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-1/2 p-4 sm:p-8 lg:p-10 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            mode === "register" ? "md:ml-auto" : "md:mr-auto"
          }`}
        >
          {mode === "login" ? (
            /* --- LOGIN FORM --- */
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t("authentication:login.title", "Welcome Back")}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("authentication:login.subtitle", "Sign in to access your dashboard, saved vehicles, and inquiries.")}
                </p>

                {/* Social / Demo Accounts Row */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t("authentication:login.quickFill", "Quick Test Demo Accounts:")}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-xs mx-auto pt-0.5">
                    {DEMO_ACCOUNTS.map((acc) => {
                      const Icon = acc.icon;
                      const isCurrent = email === acc.email;
                      return (
                        <button
                          key={acc.roleKey}
                          type="button"
                          onClick={() => handleQuickFill(acc.email)}
                          title={`${acc.label} (${acc.email})`}
                          className={`py-1.5 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                            isCurrent
                              ? "border-[#FF4B2B] bg-orange-500/10 text-[#FF4B2B] shadow-xs"
                              : "border-slate-200 dark:border-slate-700/80 bg-[#F4F6F9] dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-[#FF4B2B] hover:text-[#FF4B2B]"
                          }`}
                        >
                          <Icon size={15} className={isCurrent ? "text-[#FF4B2B]" : ""} />
                          <span className="text-[9px] font-bold leading-tight truncate w-full text-center">
                            {acc.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium pt-1">
                    {t("authentication:overlay.orEmailLogin", "or use your email password")}
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor={emailInputId} className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    {t("authentication:login.emailLabel", "Email address")}
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={emailInputId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("authentication:login.emailPlaceholder", "Enter your email")}
                      className="w-full pl-10 pr-4 py-3 bg-[#F4F6F9] dark:bg-slate-800 border-none rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/40 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={passwordInputId} className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    {t("authentication:login.passwordLabel", "Password")}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={passwordInputId}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("authentication:login.passwordPlaceholder", "Enter your password")}
                      className="w-full pl-10 pr-11 py-3 bg-[#F4F6F9] dark:bg-slate-800 border-none rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/40 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                  <label htmlFor={rememberMeId} className="flex items-center gap-1.5 cursor-pointer text-slate-500 font-medium select-none">
                    <input
                      id={rememberMeId}
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#FF4B2B] accent-[#FF4B2B] cursor-pointer"
                    />
                    <span>{t("authentication:login.rememberMe", "Remember me")}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => addToast("Password reset link sent to registered email.", "info")}
                    className="text-slate-400 hover:text-[#FF4B2B] transition cursor-pointer"
                  >
                    {t("authentication:login.forgotPassword", "Forgot password?")}
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[46px] py-3 rounded-xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    <span>{t("authentication:login.submitButton", "Sign In to Account")}</span>
                  </button>
                </div>

                {/* Mobile switch to Register link */}
                <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400 md:hidden">
                  <span>{t("authentication:login.noAccountPrompt", "Don't have an account yet?")} </span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("register")}
                    className="font-bold text-[#FF4B2B] hover:underline cursor-pointer"
                  >
                    {t("authentication:login.createAccountLink", "Create one now")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* --- REGISTER FORM --- */
            <div className="space-y-3.5">
              <div className="text-center space-y-1 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t("authentication:register.title", "Create Your Account")}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("authentication:register.subtitle", "Join Ethiopia's verified automotive marketplace.")}
                </p>

                {/* Social / Demo Accounts Row */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t("authentication:login.quickFill", "Quick Test Demo Accounts:")}
                  </span>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    {DEMO_ACCOUNTS.map((acc) => {
                      const Icon = acc.icon;
                      return (
                        <button
                          key={acc.roleKey}
                          type="button"
                          onClick={() => handleQuickFill(acc.email)}
                          title={`${acc.label} (${acc.email})`}
                          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4F6F9] dark:bg-slate-800 hover:border-[#FF4B2B] hover:text-[#FF4B2B] text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group relative"
                        >
                          <Icon size={15} className="group-hover:scale-110 transition-transform" />
                          <span className="sr-only">{acc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                    {t("authentication:overlay.orEmailRegister", "or use your email for registration")}
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5">
                
                {/* Role Selector Chips */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-left">
                    {t("authentication:register.roleSelectionTitle", "I want to register as a:")}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4F6F9] dark:bg-slate-800 rounded-xl">
                    {[
                      { id: "buyer" as const, label: t("authentication:register.roles.buyer", "Customer"), icon: Car },
                      { id: "seller" as const, label: t("authentication:register.roles.seller", "Direct Seller"), icon: TrendingUp },
                      { id: "broker" as const, label: t("authentication:register.roles.broker", "Auto Broker"), icon: ShieldCheck },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = role === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRole(item.id)}
                          className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-white dark:bg-slate-900 text-[#FF4B2B] shadow-xs font-bold"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 text-[10px] font-medium"
                          }`}
                        >
                          <Icon size={12} className="shrink-0" />
                          <span className="text-[10px] truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Phone side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={nameInputId} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5 block">
                      {t("authentication:register.nameLabel", "Full Name")}
                    </label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id={nameInputId}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("authentication:register.namePlaceholder", "e.g. Dawit Lemma")}
                        className="w-full pl-9 pr-3 py-2 bg-[#F4F6F9] dark:bg-slate-800 border-none rounded-xl text-base sm:text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/40 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={phoneInputId} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5 block">
                      {t("authentication:register.phoneLabel", "Phone Number")}
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id={phoneInputId}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("authentication:register.phonePlaceholder", "+251 911...")}
                        className="w-full pl-9 pr-3 py-2 bg-[#F4F6F9] dark:bg-slate-800 border-none rounded-xl text-base sm:text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/40 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor={emailInputId} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5 block">
                    {t("authentication:register.emailLabel", "Email Address")}
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={emailInputId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("authentication:register.emailPlaceholder", "name@example.com")}
                      className="w-full pl-9 pr-3 py-2 bg-[#F4F6F9] dark:bg-slate-800 border-none rounded-xl text-base sm:text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/40 transition"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor={passwordInputId} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5 block">
                    {t("authentication:register.passwordLabel", "Password")}
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={passwordInputId}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("authentication:register.passwordPlaceholder", "At least 6 characters")}
                      className="w-full pl-9 pr-9 py-2 bg-[#F4F6F9] dark:bg-slate-800 border-none rounded-xl text-base sm:text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/40 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Password strength */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">
                        {t("authentication:strength.label", "Password strength:")}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {pwdStrength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: pwdStrength.width }} />
                    </div>
                  </div>
                )}

                {/* Terms agreement */}
                <div className="flex items-start gap-1.5 pt-0.5 text-[10px] text-slate-500">
                  <input
                    id={termsCheckboxId}
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded text-[#FF4B2B] accent-[#FF4B2B] cursor-pointer"
                  />
                  <label htmlFor={termsCheckboxId} className="cursor-pointer leading-tight">
                    {t("authentication:register.termsPrompt", "I agree to the")}{" "}
                    <Link to="/terms" className="text-[#FF4B2B] underline font-semibold">
                      {t("authentication:register.termsLink", "Terms")}
                    </Link>{" "}
                    &{" "}
                    <Link to="/privacy" className="text-[#FF4B2B] underline font-semibold">
                      {t("authentication:register.privacyLink", "Privacy")}
                    </Link>
                  </label>
                </div>

                <div className="pt-1 text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[46px] py-3 rounded-xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    <span>{t("authentication:register.submitButton", "Create My Account")}</span>
                  </button>
                </div>

                {/* Mobile switch to Login link */}
                <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400 md:hidden">
                  <span>{t("authentication:register.alreadyHaveAccount", "Already registered?")} </span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("login")}
                    className="font-bold text-[#FF4B2B] hover:underline cursor-pointer"
                  >
                    {t("authentication:register.signInLink", "Sign in here")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP CURVED OVERLAY PANEL (Positioned on Left or Right)                */}
        {/* ========================================================================= */}
        <div
          className={`hidden md:flex absolute top-0 w-1/2 h-full z-20 text-white transition-all duration-700 ease-in-out p-10 flex-col items-center justify-center text-center bg-gradient-to-tr from-[#FF416C] via-[#FF4B2B] to-[#FF416C] shadow-2xl ${
            mode === "register"
              ? "left-0 rounded-tr-[120px] rounded-br-[120px] rounded-tl-none rounded-bl-none"
              : "right-0 rounded-tl-[120px] rounded-bl-[120px] rounded-tr-none rounded-br-none"
          }`}
        >
          {mode === "register" ? (
            /* Left Overlay in Register Mode: Prompts user to SIGN IN */
            <div className="space-y-5 max-w-xs animate-fadeIn">
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                {t("authentication:overlay.welcomeBackTitle", "Welcome Back!")}
              </h2>
              <p className="text-xs text-white/95 leading-relaxed font-normal">
                {t("authentication:overlay.welcomeBackText", "Enter your personal details to use all of site features")}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("login")}
                  className="border-2 border-white text-white font-bold py-2.5 px-9 rounded-xl uppercase tracking-wider text-xs hover:bg-white hover:text-[#FF4B2B] transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {t("authentication:modal.signInTab", "Sign In")}
                </button>
              </div>
            </div>
          ) : (
            /* Right Overlay in Login Mode: Prompts user to SIGN UP */
            <div className="space-y-5 max-w-xs animate-fadeIn">
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                {t("authentication:overlay.helloFriendTitle", "Hello, Friend!")}
              </h2>
              <p className="text-xs text-white/95 leading-relaxed font-normal">
                {t("authentication:overlay.helloFriendText", "Register with your personal details to use all of site features")}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("register")}
                  className="border-2 border-white text-white font-bold py-2.5 px-9 rounded-xl uppercase tracking-wider text-xs hover:bg-white hover:text-[#FF4B2B] transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {t("authentication:modal.registerTab", "Register New Account")}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Trust micro bar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 text-center px-2">
        <span>🔒 256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>{t("authentication:showcase.statListings", "500+ Verified Cars")}</span>
        <span>•</span>
        <span>{t("authentication:showcase.statSatisfaction", "99.4% Buyer Satisfaction")}</span>
      </div>

    </div>
  );
}
