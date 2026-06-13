import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Shield, Save, LogOut, Camera, Lock, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { uploadApi } from "../lib/api";

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
    <div className="h-full flex flex-col bg-slate-50">
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer">
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900">Admin Profile</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manage your account</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-6 md:p-8 space-y-6">

          {/* ── Profile Card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 md:p-8">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-black overflow-hidden ring-4 ring-white/30">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{name?.charAt(0)?.toUpperCase() || "A"}</span>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarPick}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-blue-800 flex items-center justify-center shadow hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                  >
                    {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} className="text-slate-600" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{name || "Admin"}</h2>
                  <p className="text-sm text-blue-200 font-black uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                    <Shield size={14} /> Administrator
                  </p>
                  {user?.joinDate && (
                    <p className="text-[11px] text-blue-300/70 font-semibold mt-1">
                      Joined {new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button onClick={handleSave} disabled={saving || !dirty}
                  className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={onLogout}
                  className="flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer border border-slate-200"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* ── Password Card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
              <h3 className="text-sm font-black text-slate-800">Change Password</h3>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
                  {newPassword && (
                    <p className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${newPassword.length >= 6 ? "text-emerald-600" : "text-amber-500"}`}>
                      {newPassword.length >= 6 ? <Check size={10} /> : <X size={10} />}
                      At least 6 characters
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition" />
                  {confirmPassword && (
                    <p className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${newPassword === confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
                      {newPassword === confirmPassword ? <Check size={10} /> : <X size={10} />}
                      {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer"
              >
                {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* ── Account Info Card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              <h3 className="text-sm font-black text-slate-800">Account Information</h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">User ID</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1 break-all">{user?.id || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Role</p>
                  <p className="text-sm font-semibold text-orange-600 mt-1 uppercase">Administrator</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Verification</p>
                  <p className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${user?.verified ? "text-emerald-600" : "text-amber-500"}`}>
                    {user?.verified ? <><Check size={14} /> Verified</> : <><X size={14} /> Unverified</>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Joined</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{user?.phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
