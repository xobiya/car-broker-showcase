import React, { useState } from "react";
import { ArrowLeft, Shield, Save, LogOut } from "lucide-react";

interface AdminProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AdminProfilePage({ onBack, onLogout, onNotify }: AdminProfilePageProps) {
  const saved = localStorage.getItem("autobroker_user");
  const user = saved ? JSON.parse(saved) : null;

  const [name, setName] = useState(user?.name || "Admin");
  const [email, setEmail] = useState(user?.email || "admin@autobroker.et");
  const [phone, setPhone] = useState(user?.phone || "+251 91 000 0000");

  const handleSave = () => {
    const updated = { ...user, name, email, phone };
    localStorage.setItem("autobroker_user", JSON.stringify(updated));
    onNotify("Profile updated successfully.", "success");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer">
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900">Admin Profile</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manage your account</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-2xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm text-blue-200 font-black uppercase tracking-wider mt-0.5">Administrator</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Role</label>
              <div className="w-full text-sm px-3 py-2.5 rounded-lg bg-slate-100 text-slate-500 font-semibold flex items-center gap-2">
                <Shield size={14} className="text-orange-500" /> Administrator
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer">
                <Save size={14} /> Save Changes
              </button>
              <button onClick={onLogout} className="flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer border border-slate-200">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
