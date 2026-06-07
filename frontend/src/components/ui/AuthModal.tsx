import React, { useState } from "react";
import { User } from "../../../../shared/types";
import { Shield, Mail, UserIcon, Phone, Loader2, X, ChevronRight } from "lucide-react";
import { authApi, setToken } from "../../lib/api";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

type AuthTab = "login" | "register";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "abebe.k@autobroker.et", color: "text-blue-900", dot: "bg-blue-900" },
  { label: "Broker", email: "yonas.h@autobroker.et", color: "text-indigo-600", dot: "bg-indigo-600" },
  { label: "Buyer", email: "dawit.l@gmail.com", color: "text-emerald-600", dot: "bg-emerald-600" },
];

export default function AuthModal({ onClose, onSuccess, onNotify }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+2519");
  const [role, setRole] = useState<"buyer" | "broker">("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("+2519");
    setRole("buyer");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="px-8 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Arif Car Sell</h2>
              <p className="text-[11px] text-slate-400 font-semibold">Ethiopia's Trusted Auto Marketplace</p>
            </div>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(["login", "register"] as AuthTab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <p className="text-[11px] font-semibold text-rose-700">{error}</p>
              </div>
            )}

            {tab === "register" && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Dawit Lemma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. dawit@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
            </div>

            {tab === "register" && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +251 91 123 4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>
              </div>
            )}

            {tab === "register" && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">I want to join as</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as "buyer" | "broker")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer"
                >
                  <option value="buyer">Buyer — Search & Inquire Vehicles</option>
                  <option value="broker">Broker — List & Manage Your Inventory</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Please wait...</>
              ) : tab === "register" ? (
                <><UserIcon size={15} /> Create Account</>
              ) : (
                <><Shield size={15} /> Sign In</>
              )}
            </button>
          </form>
        </div>

        {tab === "login" && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Quick Demo Access</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(({ label, email: demoEmail, color, dot }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => fillDemo(demoEmail)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                  <span className={`text-[11px] font-bold ${color} shrink-0 w-14`}>{label}</span>
                  <span className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate font-medium">{demoEmail}</span>
                  <ChevronRight size={13} className="ml-auto text-slate-300 group-hover:text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
