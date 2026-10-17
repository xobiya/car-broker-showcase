import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useStore } from "../store";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const addToast = useStore((s) => s.addToast);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+251 ");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller" | "broker">("buyer");
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms of service and privacy policy to continue.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: role as any
      });
      addToast(`Account created successfully! Welcome to Arif Car Sell, ${user.name}.`, "success");
      if (user.role === "broker") navigate("/broker-dashboard");
      else navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please verify your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 md:px-8 bg-slate-50/60 dark:bg-[#0B0F19] pb-24 sm:pb-12">
      <div className="w-full max-w-md mx-auto">
        
        {/* Main Carento Style Register Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-none p-7 sm:p-10 space-y-6">
          
          {/* Sign In & Sign Up Navigation Bar Switcher */}
          <div className="flex items-center p-1.5 bg-slate-100/90 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 bg-[#0B0F19] text-[#22c55e] shadow-sm"
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <span className="bg-emerald-500/10 text-[#16a34a] border border-emerald-500/25 text-xs font-black px-3.5 py-1 rounded-full inline-block">
              New Account Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Create an account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Join thousands of vehicle owners and certified brokers in Ethiopia
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
              Account Type:
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-transparent dark:border-slate-800">
              {[
                { id: "buyer", label: "Customer" },
                { id: "broker", label: "Certified Broker" }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    role === r.id
                      ? "bg-[#0B0F19] dark:bg-emerald-500/10 text-[#22c55e] border border-emerald-500/20 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawit Lemma"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Create Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-400 accent-[#22c55e] cursor-pointer"
                id="terms-check"
              />
              <label htmlFor="terms-check" className="cursor-pointer leading-snug">
                I agree to the <Link to="/terms" className="text-[#16a34a] dark:text-[#22c55e] underline font-semibold">Terms</Link> and <Link to="/privacy" className="text-[#16a34a] dark:text-[#22c55e] underline font-semibold">Privacy Policy</Link>.
              </label>
            </div>

            {/* Carento Signature Green Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#16a34a] dark:text-[#22c55e] hover:text-emerald-700 dark:hover:text-emerald-400 underline">
              Sign in here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
