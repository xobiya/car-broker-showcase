import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Heart, Calendar, Trash2, Clock, MapPin, User, Mail, Phone,
  Key, Camera, Check, Eye, EyeOff, Loader2, ShieldCheck, Bell,
  BadgeCheck, Save, LayoutDashboard, LogOut, ArrowRight, Search,
  Car, Plus, X, AlertCircle, MessageCircle, RefreshCw, Edit3,
  ExternalLink, Sparkles, SlidersHorizontal, Shield, Fuel, Gauge,
  CalendarDays, CheckCircle2, ChevronRight
} from "lucide-react";
import type { VehicleListing, SavedVehicle, TestDriveRequest, Lead } from "../../../shared/types";
import { savedVehiclesApi, testDrivesApi, uploadApi, vehiclesApi, leadsApi } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import VehicleFormModal from "../components/ui/VehicleFormModal";
import SEO from "../components/common/SEO";

interface BuyerProfilePageProps {
  user: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails?: (vehicle: VehicleListing) => void;
}

type TabType = "overview" | "listings" | "saved" | "profile" | "security";

export default function BuyerProfilePage({ user, onNotify, onViewDetails }: BuyerProfilePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateProfile, changePassword, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Data states
  const [savedVehicles, setSavedVehicles] = useState<(SavedVehicle & { vehicle?: VehicleListing })[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequest[]>([]);
  const [myListings, setMyListings] = useState<VehicleListing[]>([]);
  const [inquiries, setInquiries] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Listing modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  const [listingFilter, setListingFilter] = useState<"all" | "approved" | "pending" | "sold">("all");

  // Profile edit states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.location || "Addis Ababa");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // Password edit states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const userId = user?.id;
  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  // Sync profile fields with user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCity(user.location || "Addis Ababa");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // Check dirty state
  useEffect(() => {
    const isDirty =
      name !== (user?.name || "") ||
      email !== (user?.email || "") ||
      phone !== (user?.phone || "") ||
      city !== (user?.location || "Addis Ababa") ||
      avatar !== (user?.avatar || "");
    setProfileDirty(isDirty);
  }, [name, email, phone, city, avatar, user]);

  // URL Query handling (?section=listings, etc.)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get("section");
    const action = params.get("action");
    if (sec === "listings") setActiveTab("listings");
    else if (sec === "saved") setActiveTab("saved");
    else if (sec === "profile") setActiveTab("profile");
    else if (sec === "security") setActiveTab("security");
    else if (sec === "dashboard" || sec === "overview") setActiveTab("overview");

    if (action === "new") {
      setShowAddModal(true);
    }
  }, [location.search]);

  // Fetch real data for user
  const fetchData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [savedData, tdData, allVehicles, allLeads] = await Promise.all([
        savedVehiclesApi.list(userId).catch(() => [] as SavedVehicle[]),
        testDrivesApi.list().catch(() => [] as TestDriveRequest[]),
        vehiclesApi.list().catch(() => [] as VehicleListing[]),
        leadsApi.list().catch(() => [] as Lead[]),
      ]);
      setSavedVehicles(savedData);
      setTestDrives(tdData);
      setMyListings(allVehicles.filter(v => v.brokerId === userId));
      setInquiries(allLeads);
    } catch {
      onNotify("Failed to load profile activity.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Avatar upload
  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await uploadApi.single(file, "avatars");
      setAvatar(result.url);
      await updateProfile({ avatar: result.url });
      onNotify("Profile photo updated successfully.", "success");
    } catch {
      onNotify("Failed to upload avatar image.", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);
    try {
      await updateProfile({
        name,
        email,
        phone,
        location: city,
        avatar,
      });
      setProfileDirty(false);
      onNotify("Profile information saved successfully.", "success");
    } catch (err: any) {
      onNotify(err?.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      onNotify("Please complete all password fields.", "error");
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onNotify("Password updated successfully.", "success");
    } catch (err: any) {
      onNotify(err?.message || "Failed to change password.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  // Actions
  const handleRemoveSaved = async (vehicleId: string) => {
    try {
      await savedVehiclesApi.remove(userId, vehicleId);
      setSavedVehicles(prev => prev.filter(s => s.vehicleId !== vehicleId));
      onNotify("Removed from saved cars.", "info");
    } catch {
      onNotify("Error removing saved car.", "error");
    }
  };

  const handleCancelTestDrive = async (id: string) => {
    try {
      await testDrivesApi.updateStatus(id, "cancelled");
      setTestDrives(prev => prev.map(t => (t.id === id ? { ...t, status: "cancelled" } : t)));
      onNotify("Test drive request cancelled.", "info");
    } catch {
      onNotify("Error cancelling test drive.", "error");
    }
  };

  const handleDeleteListing = async (vehicleId: string) => {
    try {
      await vehiclesApi.delete(vehicleId);
      setMyListings(prev => prev.filter(v => v.id !== vehicleId));
      setDeletingVehicleId(null);
      onNotify("Vehicle listing removed successfully.", "success");
    } catch {
      onNotify("Failed to delete listing.", "error");
    }
  };

  // Filtered listings
  const filteredMyListings = useMemo(() => {
    if (listingFilter === "all") return myListings;
    return myListings.filter(v => v.status === listingFilter);
  }, [myListings, listingFilter]);

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-500 dark:text-emerald-400", label: "Active" },
      pending: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500 dark:text-amber-400", label: "Review Needed" },
      sold: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-500 dark:text-blue-400", label: "Sold" },
      rejected: { bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-500 dark:text-rose-400", label: "Rejected" },
      confirmed: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-500 dark:text-emerald-400", label: "Confirmed" },
      cancelled: { bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-500 dark:text-rose-400", label: "Cancelled" },
    };
    const c = config[status] || { bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-500", label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0C0D12] text-slate-800 dark:text-slate-100 transition-colors relative pb-20">
      <SEO title={`${user?.name || "User"} Profile — Arif Car Sell`} noIndex={true} />

      {/* Ambient Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[300px] bg-orange-500/10 dark:bg-orange-500/15 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[300px] bg-rose-500/5 blur-3xl pointer-events-none z-0" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 relative z-10 space-y-6">

        {/* ── TOP HERO PROFILE CARD ──────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Avatar & User Details */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-md shadow-orange-500/20">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-[#161822] overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt={user?.name} className="w-full h-full object-cover" />
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
                  title="Change photo"
                >
                  {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {user?.name || "Member Profile"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-[#F97316] border border-orange-500/20">
                    {user?.role === "broker" ? "Broker Partner" : user?.role === "seller" ? "Car Seller" : "Verified Buyer"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                  {user?.email} {user?.phone ? `· ${user.phone}` : ""}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium mt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#F97316]" /> {city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={12} className="text-slate-400" />
                    Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3">
              {/* Quick Stat Pill */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] p-2 rounded-2xl text-center">
                <div className="px-3 py-1">
                  <span className="block text-base font-black text-slate-900 dark:text-white">{savedVehicles.length}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Saved</span>
                </div>
                <div className="px-3 py-1 border-x border-slate-200 dark:border-white/[0.06]">
                  <span className="block text-base font-black text-slate-900 dark:text-white">{myListings.length}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">My Cars</span>
                </div>
                <div className="px-3 py-1">
                  <span className="block text-base font-black text-slate-900 dark:text-white">{testDrives.length}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Drives</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Sell Car</span>
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); navigate("/login"); }}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#1C1F2B] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-500 border border-slate-200/80 dark:border-white/[0.06] transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── STREAMLINED TAB NAVIGATION PILLS ─────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "overview" as TabType, label: "Overview & Activity", icon: Sparkles },
            { id: "listings" as TabType, label: "My Listed Cars", icon: Car, count: myListings.length },
            { id: "saved" as TabType, label: "Saved Cars", icon: Heart, count: savedVehicles.length },
            { id: "profile" as TabType, label: "Personal Info", icon: User },
            { id: "security" as TabType, label: "Security & Password", icon: Key },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? "bg-[#F97316] text-white shadow-md shadow-orange-500/20 font-black"
                    : "bg-white dark:bg-[#161822]/90 hover:bg-slate-100 dark:hover:bg-[#1F2230] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/[0.1] text-slate-700 dark:text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: OVERVIEW & ACTIVITY ────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Sell CTA if no cars listed */}
            {myListings.length === 0 && (
              <div className="rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                    <Car size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Want to sell a car in Ethiopia?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      List your vehicle on Arif Car Sell with verified Libre protection & zero upfront fees.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
                  className="px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
                >
                  List My Car
                </button>
              </div>
            )}

            {/* Two Column Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Listed Cars or Saved Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* My Listed Cars Preview */}
                <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Car size={16} className="text-[#F97316]" />
                      My Listed Cars
                    </h3>
                    {myListings.length > 0 && (
                      <button
                        onClick={() => setActiveTab("listings")}
                        className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        View all ({myListings.length}) <ChevronRight size={13} />
                      </button>
                    )}
                  </div>

                  {myListings.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Car size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No vehicles listed yet</p>
                      <p className="text-[11px] text-slate-400">Add your first vehicle listing to connect with buyers.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myListings.slice(0, 3).map(v => (
                        <div
                          key={v.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3 hover:border-orange-500/30 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={v.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=150&q=80"}
                              alt=""
                              className="w-14 h-11 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {v.year} {v.brand} {v.model}
                              </h4>
                              <p className="text-[11px] font-black text-[#F97316] font-mono mt-0.5">
                                {v.price ? v.price.toLocaleString() : "N/A"} ETB
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {renderStatusBadge(v.status)}
                            <button
                              onClick={() => { setEditingVehicle(v); setShowAddModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Vehicles Preview */}
                <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Heart size={16} className="text-rose-500" />
                      Saved Vehicles
                    </h3>
                    {savedVehicles.length > 0 && (
                      <button
                        onClick={() => setActiveTab("saved")}
                        className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        View all ({savedVehicles.length}) <ChevronRight size={13} />
                      </button>
                    )}
                  </div>

                  {savedVehicles.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Heart size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No saved vehicles yet</p>
                      <p className="text-[11px] text-slate-400">Tap the heart icon on any car to bookmark it here.</p>
                      <button
                        onClick={() => navigate("/vehicles")}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Explore Marketplace
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedVehicles.slice(0, 4).map(s => {
                        const v = s.vehicle;
                        if (!v) return null;
                        return (
                          <div
                            key={s.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 group"
                          >
                            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                              <img src={v.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              <button
                                onClick={() => handleRemoveSaved(v.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                                title="Remove"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {v.year} {v.brand} {v.model}
                              </h4>
                              <p className="text-xs font-black text-[#F97316] font-mono mt-0.5">
                                {v.price ? v.price.toLocaleString() : "N/A"} ETB
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (onViewDetails) onViewDetails(v);
                                else navigate(`/vehicles/${v.id}`);
                              }}
                              className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                            >
                              View Car
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Scheduled Test Drives & Inquiries (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Test Drive Bookings */}
                <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar size={16} className="text-[#F97316]" />
                      Test Drive Bookings
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500">
                      {testDrives.length}
                    </span>
                  </div>

                  {testDrives.length === 0 ? (
                    <div className="py-6 text-center space-y-1.5">
                      <Clock size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No appointments scheduled</p>
                      <p className="text-[11px] text-slate-400">Book a test drive directly from any car detail page.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {testDrives.slice(0, 4).map(td => (
                        <div
                          key={td.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {td.vehicleTitle || "Vehicle Inspection"}
                            </span>
                            {renderStatusBadge(td.status)}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{td.preferredDate} · {td.preferredTime}</span>
                            {td.status === "pending" && (
                              <button
                                onClick={() => handleCancelTestDrive(td.id)}
                                className="text-rose-500 font-bold hover:underline cursor-pointer"
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

                {/* Buyer Inquiries */}
                <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageCircle size={16} className="text-[#F97316]" />
                      Inquiries & Leads
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500">
                      {inquiries.length}
                    </span>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="py-6 text-center space-y-1.5">
                      <MessageCircle size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active inquiries</p>
                      <p className="text-[11px] text-slate-400">Questions from buyers will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.slice(0, 3).map(inq => (
                        <div
                          key={inq.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{inq.buyerName}</span>
                            <span className="text-[10px] text-slate-400">{inq.inquiryDate}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            "{inq.message}"
                          </p>
                          <p className="text-[10px] text-[#F97316] font-mono font-bold mt-1">
                            {inq.buyerPhone || inq.buyerEmail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY LISTED CARS ────────────────────────────────────────────── */}
        {activeTab === "listings" && (
          <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  My Car Inventory
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Manage vehicle specs, pricing, and moderation status
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1C1F2B] p-1 rounded-2xl">
                  {(["all", "approved", "pending", "sold"] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setListingFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        listingFilter === f
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  <Plus size={14} /> Add Vehicle
                </button>
              </div>
            </div>

            {filteredMyListings.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <Car size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No cars found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {listingFilter === "all"
                    ? "You haven't listed any cars yet. Add your vehicle to begin receiving buyer offers."
                    : `No cars currently with "${listingFilter}" status.`}
                </p>
                <button
                  onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
                  className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold"
                >
                  Post a Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMyListings.map(v => (
                  <div
                    key={v.id}
                    className="rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden flex flex-col justify-between group hover:border-orange-500/30 transition shadow-xs"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <img src={v.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute top-2 left-2">
                          {renderStatusBadge(v.status)}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {v.year} {v.brand} {v.model}
                        </h4>
                        <p className="text-base font-black text-[#F97316] font-mono">
                          {v.price ? v.price.toLocaleString() : "N/A"} <span className="text-xs font-bold">ETB</span>
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>{v.location || "Addis Ababa"}</span>
                          <span>·</span>
                          <span>{v.condition || "Used"}</span>
                          <span>·</span>
                          <span>{v.mileage ? `${v.mileage.toLocaleString()} km` : "New"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingVehicle(v); setShowAddModal(true); }}
                        className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingVehicleId(v.id)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SAVED CARS ────────────────────────────────────────────────── */}
        {activeTab === "saved" && (
          <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Saved Vehicles
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Your bookmarked cars for comparison and quick viewing
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/vehicles")}
                className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>

            {savedVehicles.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <Heart size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No saved cars yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the heart icon on any vehicle while browsing to save it here for later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedVehicles.map(s => {
                  const v = s.vehicle;
                  if (!v) return null;
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden flex flex-col justify-between group hover:border-orange-500/30 transition shadow-xs"
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <img src={v.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <button
                            type="button"
                            onClick={() => handleRemoveSaved(v.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer shadow-md"
                            title="Remove from saved"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {v.year} {v.brand} {v.model}
                          </h4>
                          <p className="text-base font-black text-[#F97316] font-mono">
                            {v.price ? v.price.toLocaleString() : "N/A"} <span className="text-xs font-bold">ETB</span>
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>{v.location || "Addis Ababa"}</span>
                            <span>·</span>
                            <span>{v.condition || "Used"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewDetails) onViewDetails(v);
                            else navigate(`/vehicles/${v.id}`);
                          }}
                          className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                        >
                          View Vehicle Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PERSONAL DETAILS ──────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-6 max-w-3xl">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Update your contact details and public marketplace identity
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Primary City / Region
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1C1F2B] text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition cursor-pointer"
                  >
                    {["Addis Ababa", "Hawassa", "Adama", "Bahir Dar", "Dire Dawa", "Bishoftu", "Mekelle", "Gondar"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingProfile || !profileDirty}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
                {profileDirty && (
                  <span className="text-[11px] font-medium text-amber-500">Unsaved changes</span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 5: SECURITY & PASSWORD ───────────────────────────────────────── */}
        {activeTab === "security" && (
          <div className="rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Password & Security
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Ensure your Arif Car Sell account credentials remain secure
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
                  Confirm New Password
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
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#F97316] hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
                >
                  {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>{changingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ── MODALS ────────────────────────────────────────────────────────────── */}
      {/* Add / Edit Listing Modal */}
      {showAddModal && (
        <VehicleFormModal
          sellerId={userId}
          editing={editingVehicle}
          role={user?.role === "broker" ? "broker" : "seller"}
          onClose={() => { setShowAddModal(false); setEditingVehicle(null); }}
          onSaved={() => {
            setShowAddModal(false);
            setEditingVehicle(null);
            fetchData();
            onNotify("Vehicle listing updated.", "success");
          }}
          onNotify={onNotify}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingVehicleId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeletingVehicleId(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#161822] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Listing?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to remove this vehicle from the marketplace? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVehicleId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteListing(deletingVehicleId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
