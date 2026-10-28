import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Shield, Save, LogOut, Camera, Lock, Check, X,
  Loader2, Mail, Phone, Calendar, Key, User, Eye, EyeOff,
  CheckCircle2, AlertCircle, LayoutDashboard, Sparkles
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { uploadApi } from "../lib/api";
import SEO from "../components/common/SEO";
import Logo from "../components/ui/Logo";

interface AdminProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AdminProfilePage({ onBack, onLogout, onNotify }: AdminProfilePageProps) {
  const { user, updateProfile, changePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    const changed =
      name !== (user?.name || "") ||
      email !== (user?.email || "") ||
      phone !== (user?.phone || "") ||
      avatar !== (user?.avatar || "");
    setDirty(changed);
  }, [name, email, phone, avatar, user]);

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await uploadApi.single(file, "avatars");
      setAvatar(result.url);
      await updateProfile({ avatar: result.url });
      onNotify("Admin avatar updated successfully.", "success");
    } catch {
      onNotify("Failed to upload avatar.", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ name, email, phone, avatar });
      setName(updated.name || "");
      setEmail(updated.email || "");
      setPhone(updated.phone || "");
      setAvatar(updated.avatar || "");
      setDirty(false);
      onNotify("Admin credentials updated successfully.", "success");
    } catch (err: any) {
      onNotify(err?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      onNotify("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword.length < 6) {
      onNotify("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify("New passwords do not match.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      onNotify("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      onNotify(err?.message || "Failed to change password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (name || user?.name || "Admin").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C0D12] text-slate-800 dark:text-slate-100 transition-colors relative flex flex-col">
      <SEO title="Admin Profile — Arif Car Sell" noIndex={true} />

      {/* Ambient Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[300px] bg-orange-500/10 dark:bg-orange-500/15 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-10 w-[400px] h-[300px] bg-amber-500/5 blur-3xl pointer-events-none z-0" />

      {/* Top Header Bar */}
      <header className="shrink-0 bg-white/95 dark:bg-[#111319]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition cursor-pointer text-slate-600 dark:text-slate-400 active:scale-95"
            title="Return to Admin Panel"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <Logo size="sm" iconOnly={true} />
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Admin Profile
              </h1>
              <p className="text-[10px] text-[#F97316] font-bold uppercase tracking-wider">
                System Administrator Account
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1C1F2B] hover:bg-slate-200 dark:hover:bg-[#25293A] text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition cursor-pointer border border-rose-500/20"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 relative z-10 space-y-6">

        {/* Hero Identity Card */}
        <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Avatar with Camera Picker */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-lg shadow-orange-500/20">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-[#161822] overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black text-[#F97316]">{initials}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={avatarUploading}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
                  title="Upload profile photo"
                >
                  {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {name || "Administrator"}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-[#F97316] border border-orange-500/20">
                    <Shield size={11} /> Super Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {email || "admin@arifcarsell.com"}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Full Root Access · Arif Car Sell Platform Command
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-xs font-black text-slate-900 dark:text-white">Active</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1 justify-center mt-0.5">
                <CheckCircle2 size={11} /> Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Personal Information (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User size={16} className="text-[#F97316]" />
                Personal Information
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Update your administrative display name and contact details
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+251 9..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
                {dirty && (
                  <span className="text-[11px] font-medium text-amber-500">Unsaved changes</span>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Password & Security (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Key size={16} className="text-[#F97316]" />
                Security Credentials
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Change password to protect administrative controls
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {newPassword && (
                  <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                    newPassword.length >= 6 ? "text-emerald-500" : "text-amber-500"
                  }`}>
                    {newPassword.length >= 6 ? <Check size={11} /> : <X size={11} />}
                    Minimum 6 characters
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                />
                {confirmPassword && (
                  <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                    newPassword === confirmPassword ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {newPassword === confirmPassword ? <Check size={11} /> : <X size={11} />}
                    {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
                >
                  {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>{changingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
