import React, { useState, useEffect, useRef } from "react";
import { Heart, Calendar, Trash2, Clock, MapPin, User, Mail, Phone, CalendarDays, Key, Camera, Check, Pencil, Eye, EyeOff, Loader2, ShieldCheck, Bell, BadgeCheck, Save, LayoutDashboard, Settings, LogOut, ArrowRight, Search } from "lucide-react";
import { VehicleListing, SavedVehicle, TestDriveRequest } from "../../../shared/types";

interface BuyerProfilePageProps {
  user: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails?: (vehicle: VehicleListing) => void;
}

type Section = "dashboard" | "saved" | "testdrives" | "profile" | "security" | "notifications" | "account";

const sections: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "saved", label: "Saved Vehicles", icon: Heart },
  { id: "testdrives", label: "Test Drives", icon: Calendar },
  { id: "profile", label: "Personal Info", icon: User },
  { id: "security", label: "Password & Security", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: ShieldCheck },
];

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${colors[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function BuyerProfilePage({ user, onNotify, onViewDetails }: BuyerProfilePageProps) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [savedVehicles, setSavedVehicles] = useState<(SavedVehicle & { vehicle?: VehicleListing })[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [savedRes, tdRes] = await Promise.all([
          fetch(`/api/saved-vehicles?userId=${userId}`),
          fetch(`/api/test-drives?userId=${userId}`),
        ]);
        if (savedRes.ok) setSavedVehicles(await savedRes.json());
        if (tdRes.ok) setTestDrives(await tdRes.json());
      } catch {
        onNotify("Failed to load data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, onNotify]);

  const handleRemoveSaved = async (vehicleId: string) => {
    try {
      const res = await fetch("/api/saved-vehicles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vehicleId }),
      });
      if (res.ok) {
        setSavedVehicles(prev => prev.filter(s => s.vehicleId !== vehicleId));
        onNotify("Removed from saved.", "success");
      }
    } catch {
      onNotify("Error removing vehicle.", "error");
    }
  };

  const handleCancelTestDrive = async (id: string) => {
    try {
      const res = await fetch(`/api/test-drives/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setTestDrives(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
        onNotify("Test drive cancelled.", "info");
      }
    } catch {
      onNotify("Error cancelling test drive.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Account</h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Welcome back, {user?.name?.split(" ")[0]}</p>
          </div>
          <a href="/browse"
            className="flex items-center gap-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 px-4 py-2.5 rounded-xl transition"
          >
            <Search size={14} />
            Browse Vehicles
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-sm font-black shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Buyer</p>
                  </div>
                </div>
              </div>
              <nav className="p-2 space-y-0.5">
                {sections.map(sec => {
                  const Icon = sec.icon;
                  const counts: Record<string, number> = { saved: savedVehicles.length, testdrives: testDrives.length };
                  const count = counts[sec.id];
                  return (
                    <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeSection === sec.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="flex-1 text-left">{sec.label}</span>
                      {count !== undefined && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          activeSection === sec.id ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {activeSection === "dashboard" && (
              <DashboardSection
                user={user}
                savedCount={savedVehicles.length}
                testDriveCount={testDrives.length}
                onNavigate={setActiveSection}
              />
            )}
            {activeSection === "saved" && (
              <SavedSection
                vehicles={savedVehicles}
                onViewDetails={onViewDetails}
                onRemove={handleRemoveSaved}
              />
            )}
            {activeSection === "testdrives" && (
              <TestDriveSection
                drives={testDrives}
                onCancel={handleCancelTestDrive}
              />
            )}
            {activeSection === "profile" && <ProfileSection user={user} onNotify={onNotify} />}
            {activeSection === "security" && <SecuritySection onNotify={onNotify} />}
            {activeSection === "notifications" && <NotificationsSection onNotify={onNotify} />}
            {activeSection === "account" && <AccountSection user={user} onNotify={onNotify} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSection({ user, savedCount, testDriveCount, onNavigate }: {
  user: any; savedCount: number; testDriveCount: number; onNavigate: (s: Section) => void;
}) {
  const joined = user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-black shadow-lg border-4 border-white">
              {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-black text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-medium">Member since {joined}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Heart} label="Saved Vehicles" value={savedCount} color="text-rose-500 bg-rose-50" onClick={() => onNavigate("saved")} />
        <StatCard icon={Calendar} label="Test Drives" value={testDriveCount} color="text-blue-500 bg-blue-50" onClick={() => onNavigate("testdrives")} />
        <StatCard icon={BadgeCheck} label="Verification" value={user?.verificationStatus === "verified" ? "Verified" : user?.verificationStatus === "pending" ? "Pending" : "Unverified"} color={user?.verificationStatus === "verified" ? "text-emerald-500 bg-emerald-50" : "text-amber-500 bg-amber-50"} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-800">Quick Actions</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction icon={Heart} label="View Saved Vehicles" desc="Browse your favorite cars" onClick={() => onNavigate("saved")} />
          <QuickAction icon={Calendar} label="View Test Drives" desc="Check your scheduled drives" onClick={() => onNavigate("testdrives")} />
          <QuickAction icon={User} label="Edit Profile" desc="Update personal information" onClick={() => onNavigate("profile")} />
          <QuickAction icon={Key} label="Change Password" desc="Update your password" onClick={() => onNavigate("security")} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: string | number; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className={`bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition cursor-pointer ${!onClick ? "cursor-default" : ""} text-left`}
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </button>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-400">{desc}</p>
      </div>
      <ArrowRight size={13} className="text-slate-300 shrink-0" />
    </button>
  );
}

function SavedSection({ vehicles, onViewDetails, onRemove }: {
  vehicles: (SavedVehicle & { vehicle?: VehicleListing })[];
  onViewDetails?: (v: VehicleListing) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">Saved Vehicles</h3>
        <p className="text-xs text-slate-400 mt-0.5">Vehicles you've saved for later</p>
      </div>
      <div className="p-6">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-400">No saved vehicles</p>
            <p className="text-xs text-slate-400 mt-1">Browse and save vehicles you're interested in</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(sv => sv.vehicle && (
              <div key={sv.id} className="border border-slate-200 rounded-2xl overflow-hidden flex hover:shadow-md transition cursor-pointer group"
                onClick={() => onViewDetails?.(sv.vehicle!)}
              >
                <div className="w-36 h-28 shrink-0 bg-slate-100 overflow-hidden">
                  <img src={sv.vehicle.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{sv.vehicle.brand} {sv.vehicle.model}</h4>
                      <button onClick={(e) => { e.stopPropagation(); onRemove(sv.vehicleId); }}
                        className="text-slate-300 hover:text-rose-500 transition cursor-pointer p-1 shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{sv.vehicle.year} &bull; {sv.vehicle.transmission} &bull; {sv.vehicle.fuelType}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-blue-900">ETB {fmt(sv.vehicle.price)}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10} /> {sv.vehicle.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TestDriveSection({ drives, onCancel }: {
  drives: TestDriveRequest[];
  onCancel: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">Test Drives</h3>
        <p className="text-xs text-slate-400 mt-0.5">Your scheduled and past test drives</p>
      </div>
      <div className="p-6">
        {drives.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-400">No test drives scheduled</p>
            <p className="text-xs text-slate-400 mt-1">Request a test drive from any vehicle detail page</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drives.map(td => (
              <div key={td.id} className="border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{td.vehicleBrand} {td.vehicleModel}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-1">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(td.preferredDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {td.preferredTime}</span>
                    </div>
                    {td.message && <p className="text-[11px] text-slate-500 mt-1 italic">"{td.message}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={td.status} />
                  {td.status === "pending" && (
                    <button onClick={() => onCancel(td.id)}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 px-3 py-1.5 border border-rose-200 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSection({ user, onNotify }: { user: any; onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", bio: user?.bio || "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("autobroker_user", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("autobroker:user-updated", { detail: updated }));
        onNotify("Profile updated.", "success");
        setEditing(false);
      } else {
        const err = await res.json();
        onNotify(err.error || "Update failed.", "error");
      }
    } catch {
      onNotify("Network error.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      const token = localStorage.getItem("autobroker_token");
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "avatars");
      const upRes = await fetch("/api/upload", {
        method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd,
      });
      const upData = await upRes.json();
      if (upRes.ok && upData.url) {
        await fetch(`/api/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar: upData.url }) });
        const meRes = await fetch("/api/auth/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (meRes.ok) {
          const meData = await meRes.json();
          const u = meData.user || meData;
          localStorage.setItem("autobroker_user", JSON.stringify(u));
          window.dispatchEvent(new CustomEvent("autobroker:user-updated", { detail: u }));
        }
        onNotify("Avatar updated.", "success");
      } else onNotify(upData.error || "Upload failed.", "error");
    } catch { onNotify("Error uploading avatar.", "error"); }
  };

  const joined = user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  return (
    <SectionCard title="Personal Information" subtitle="Update your personal details"
      action={!editing ?
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"><Pencil size={12} /> Edit</button>
        : <button onClick={() => { setEditing(false); setForm({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", bio: user?.bio || "" }); }}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer">Cancel</button>
      }
    >
      <div className="flex items-center gap-5 pb-6 mb-6 border-b border-slate-100">
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-black shadow-sm">
            {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <button onClick={() => fileRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
          ><Camera size={16} className="text-white" /></button>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-400">Member since {joined}</p>
        </div>
      </div>
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name"><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></Field>
            <Field label="Phone"><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" /></Field>
          </div>
          <Field label="Bio"><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="input resize-none" /></Field>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
            >{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={Mail} label="Email" value={user?.email || "—"} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone || "—"} />
          <InfoRow icon={CalendarDays} label="Member Since" value={joined} />
          <InfoRow icon={BadgeCheck} label="Verification" value={user?.verificationStatus ? user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1) : "Unverified"} />
          {user?.bio && <div className="sm:col-span-2"><InfoRow icon={User} label="Bio" value={user.bio} /></div>}
        </div>
      )}
    </SectionCard>
  );
}

function SecuritySection({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const [showForm, setShowForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async () => {
    setError("");
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) { setError("All fields required."); return; }
    if (form.newPassword.length < 6) { setError("Minimum 6 characters."); return; }
    if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setChanging(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      if (res.ok) {
        onNotify("Password changed.", "success"); setShowForm(false);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else { const err = await res.json(); setError(err.error || "Failed."); }
    } catch { setError("Network error."); } finally { setChanging(false); }
  };

  return (
    <SectionCard title="Password & Security" subtitle="Manage your password and account security"
      action={!showForm ? <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"><Key size={12} /> Change</button> : null}
    >
      {showForm ? (
        <div className="max-w-md space-y-4">
          <Field label="Current Password"><div className="relative"><input type={showCurrent ? "text" : "password"} value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} className="input pr-10" /><button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></Field>
          <Field label="New Password"><div className="relative"><input type={showNew ? "text" : "password"} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} className="input pr-10" /><button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></Field>
          <Field label="Confirm New Password"><input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className="input" /></Field>
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={handleChange} disabled={changing} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50">{changing ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}{changing ? "Changing..." : "Update Password"}</button>
            <button onClick={() => { setShowForm(false); setError(""); setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><ShieldCheck size={16} /></div>
          <div><p className="text-sm font-bold text-slate-800">Password</p><p className="text-xs text-slate-400">Last changed: —</p></div>
        </div>
      )}
    </SectionCard>
  );
}

function NotificationsSection({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const [prefs, setPrefs] = useState({ emailNewListings: true, emailTestDriveUpdates: true, emailPromotions: false, pushSavedPriceDrop: true });
  const toggle = (key: keyof typeof prefs) => { setPrefs(p => ({ ...p, [key]: !p[key] })); onNotify("Preference updated.", "success"); };

  return (
    <SectionCard title="Notifications" subtitle="Choose what notifications you receive">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Email Notifications</p>
      {[
        { key: "emailNewListings" as const, label: "New listings", desc: "Get notified when new vehicles matching your interests are listed" },
        { key: "emailTestDriveUpdates" as const, label: "Test drive updates", desc: "Receive updates about your test drive requests" },
        { key: "emailPromotions" as const, label: "Promotions & offers", desc: "Special offers, promotions, and market updates" },
      ].map(item => <ToggleRow key={item.key} checked={prefs[item.key]} onChange={() => toggle(item.key)} label={item.label} desc={item.desc} />)}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Push Notifications</p>
        <ToggleRow checked={prefs.pushSavedPriceDrop} onChange={() => toggle("pushSavedPriceDrop")} label="Price drops" desc="Get notified when a saved vehicle drops in price" />
      </div>
    </SectionCard>
  );
}

function AccountSection({ user, onNotify }: { user: any; onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!user?.id) return; setDeleting(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) { onNotify("Account deleted.", "info"); localStorage.clear(); window.location.href = "/"; }
      else { const err = await res.json(); onNotify(err.error || "Delete failed.", "error"); setConfirmDelete(false); }
    } catch { onNotify("Network error.", "error"); setConfirmDelete(false); } finally { setDeleting(false); }
  };

  return (
    <SectionCard title="Account" subtitle="Manage your account settings">
      {confirmDelete ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <Trash2 size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div><p className="text-sm font-bold text-rose-700">Are you absolutely sure?</p><p className="text-xs text-rose-600 mt-1">This permanently deletes your account and all associated data. This cannot be undone.</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50">{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}{deleting ? "Deleting..." : "Yes, Delete My Account"}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><Trash2 size={16} /></div>
            <div><p className="text-sm font-bold text-slate-800">Delete Account</p><p className="text-xs text-slate-400">Permanently remove your account and all data</p></div>
          </div>
          <button onClick={() => setConfirmDelete(true)} className="text-xs font-bold text-rose-500 hover:text-rose-700 px-4 py-2 rounded-lg border border-rose-200 hover:bg-rose-50 transition cursor-pointer shrink-0">Delete</button>
        </div>
      )}
    </SectionCard>
  );
}

function SectionCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div><h3 className="text-sm font-black text-slate-800">{title}</h3>{subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}</div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 block">{label}</label>{children}</div>;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><Icon size={16} /></div>
      <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p></div>
    </div>
  );
}

function ToggleRow({ checked, onChange, label, desc }: { key?: string; checked: boolean; onChange: () => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div><p className="text-sm font-semibold text-slate-800">{label}</p><p className="text-xs text-slate-400">{desc}</p></div>
      <button onClick={onChange} className={`relative w-10 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${checked ? "bg-blue-900" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}
