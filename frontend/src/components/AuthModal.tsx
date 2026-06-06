import React, { useState } from "react";
import { User } from "../../../shared/types";
import { Shield } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AuthModal({ onClose, onSuccess, onNotify }: AuthModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"buyer" | "broker">("buyer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegistering 
        ? { name, email, phone, role }
        : { email };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Try to parse as JSON, but handle cases where server returns HTML (e.g. 404/500 from middleware)
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from server:", text);
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }

      if (res.ok) {
        onNotify(isRegistering ? "Registration successful!" : "Welcome back!", "success");
        onSuccess(data);
        onClose();
      } else {
        onNotify(data.error || "Authentication failed.", "error");
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      onNotify(err.message || "Network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4 text-slate-800">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-blue-900 flex items-center gap-2">
            <Shield size={16} />
            <span>{isRegistering ? "Register — Arif Car Sell" : "Login to Arif Car Sell"}</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Close
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawit Lemma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. dawit@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            {!isRegistering && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Demo Accounts</p>
                {[
                  { label: "Admin", email: "abebe.k@autobroker.et", color: "text-blue-900" },
                  { label: "Broker", email: "yonas.h@autobroker.et", color: "text-indigo-600" },
                  { label: "Buyer", email: "dawit.l@gmail.com", color: "text-emerald-600" },
                ].map(({ label, email, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setEmail(email); }}
                    className="w-full flex items-center gap-2 text-[10px] text-left group cursor-pointer"
                  >
                    <span className={`font-bold ${color} shrink-0 w-12`}>{label}:</span>
                    <span className="text-slate-500 group-hover:text-slate-800 transition-colors">{email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isRegistering && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +251 91 123 4567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">I want to join as</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "buyer" | "broker")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="buyer">Buyer (Search & Inquire)</option>
                  <option value="broker">Broker (List Sourced Vehicles & Manage Leads)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-xl text-xs tracking-wider transition-colors disabled:opacity-50 cursor-pointer uppercase"
          >
            {loading ? "Please wait..." : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs text-blue-900 hover:text-blue-950 font-bold transition-colors"
          >
            {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
