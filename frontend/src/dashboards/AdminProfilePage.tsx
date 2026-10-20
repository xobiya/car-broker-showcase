import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Shield, Save, LogOut, Camera, Lock, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { uploadApi } from "../lib/api";
import SEO from "../components/common/SEO";

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
      onNotify("Avatar uploaded.", "success");
    } catch {
      onNotify("Failed to upload avatar.", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ name, email, phone, avatar });
      setName(updated.name || "");
      setEmail(updated.email || "");
      setPhone(updated.phone || "");
      setAvatar(updated.avatar || "");
      onNotify("Profile updated successfully.", "success");
    } catch (err: any) {
      onNotify(err?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
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
      onNotify("Password changed successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      onNotify(err?.message || "Failed to change password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B0F19] transition-colors">
      <SEO title="Admin Profile — Arif Car Sell" noIndex={true} />
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 transition-colors">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-500 dark:text-slate-400">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Admin Profile</h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Manage your account</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-6 md:p-8 space-y-6">

          {/* ── Profile Card ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4846]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-[#FF4846]/40 flex items-center justify-center text-3xl font-black overflow-hidden ring-4 ring-white/10 text-[#FF4846]">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{name?.charAt(0)?.toUpperCase() || "A"}</span>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarPick}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-[#FF4846] flex items-center justify-center shadow hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {avatarUploading ? <Loader2 size={14} className="animate-spin text-[#FF4846]" /> : <Camera size={14} className="text-slate-700 dark:text-slate-300" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{name || "Admin"}</h2>
                  <p className="text-sm text-[#FF4846] font-black uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                    <Shield size={14} /> Administrator
                  </p>
                  {user?.joinDate && (
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">
                      Joined {new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Role</label>
                <div className="w-full text-sm px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <Shield size={14} className="text-[#FF4846]" /> Administrator
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={handleSave} disabled={saving || !dirty}
                  className="flex items-center gap-1.5 bg-[#FF4846] hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-sm"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={onLogout}
                  className="flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer border border-slate-200 dark:border-slate-800"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* ── Password Card ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Lock size={16} className="text-slate-400 dark:text-slate-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Change Password</h3>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition" />
                  {newPassword && (
                    <p className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${newPassword.length >= 6 ? "text-emerald-500" : "text-amber-500"}`}>
                      {newPassword.length >= 6 ? <Check size={10} /> : <X size={10} />}
                      At least 6 characters
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition" />
                  {confirmPassword && (
                    <p className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${newPassword === confirmPassword ? "text-emerald-500" : "text-rose-500"}`}>
                      {newPassword === confirmPassword ? <Check size={10} /> : <X size={10} />}
                      {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-1.5 bg-[#FF4846] hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-sm"
              >
                {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* ── Account Info Card ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Shield size={16} className="text-slate-400 dark:text-slate-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">Account Information</h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">User ID</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 break-all">{user?.id || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Role</p>
                  <p className="text-sm font-semibold text-[#FF4846] mt-1 uppercase">Administrator</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Verification</p>
                  <p className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${user?.verified ? "text-emerald-500" : "text-amber-500"}`}>
                    {user?.verified ? <><Check size={14} /> Verified</> : <><X size={14} /> Unverified</>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Joined</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{user?.phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
