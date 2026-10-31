import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Heart, Calendar, Trash2, Clock, MapPin, User, Mail, Phone, CalendarDays,
  Key, Camera, Check, Pencil, Eye, EyeOff, Loader2, ShieldCheck, Bell,
  BadgeCheck, Save, LayoutDashboard, LogOut, ArrowRight, Search,
  Car, Plus, X, AlertCircle, MessageCircle, RefreshCw, Edit3,
  ExternalLink, Sparkles, ArrowLeft, SlidersHorizontal,
  FileText, UploadCloud, FileCheck, Download
} from "lucide-react";
import { VehicleListing, SavedVehicle, TestDriveRequest, Lead } from "../../../shared/types";
import { savedVehiclesApi, testDrivesApi, uploadApi, vehiclesApi, leadsApi, usersApi } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import Combobox from "../components/ui/Combobox";
import VehicleFormModal from "../components/ui/VehicleFormModal";
import SEO from "../components/common/SEO";
import {
  BRANDS, LOCATIONS, FUEL_TYPES, TRANSMISSIONS,
  DRIVE_TYPES, CONDITIONS, BODY_TYPES, ENGINE_TYPES,
  DOOR_OPTIONS, SEAT_OPTIONS, BRAND_MODELS
} from "../lib/constants";

interface BuyerProfilePageProps {
  user: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails?: (vehicle: VehicleListing) => void;
}

type Section = "dashboard" | "saved" | "testdrives" | "listings" | "inquiries" | "profile" | "security";

const sections: { id: Section; label: string; icon: any; category?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "saved", label: "Saved Vehicles", icon: Heart },
  { id: "testdrives", label: "Test Drives", icon: Calendar },
  { id: "listings", label: "My Listed Cars", icon: Car },
  { id: "inquiries", label: "Inquiries Received", icon: MessageCircle },
  { id: "profile", label: "Personal Info", icon: User },
  { id: "security", label: "Password & Security", icon: Key },
];

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
    completed: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
    sold: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60",
    rejected: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60",
    new: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
    contacted: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60",
    closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${colors[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status === "pending" && <Clock size={10} />}
      {status === "rejected" && <AlertCircle size={10} />}
      {status === "approved" && <Check size={10} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function BuyerProfilePage({ user, onNotify, onViewDetails }: BuyerProfilePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [savedVehicles, setSavedVehicles] = useState<(SavedVehicle & { vehicle?: VehicleListing })[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequest[]>([]);
  const [myListings, setMyListings] = useState<VehicleListing[]>([]);
  const [inquiries, setInquiries] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Listing modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<{
    vehicleTitle: string;
    docUrl: string;
    docName: string;
    price: number;
  } | null>(null);

  const userId = user?.id;
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  // Respond dynamically to URL changes like ?section=profile or ?section=listings&action=new
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get("section") as Section | null;
    const action = params.get("action");
    if (sec && sections.some(s => s.id === sec)) {
      setActiveSection(sec);
    }
    if (action === "new") {
      setShowAddModal(true);
    }
  }, [location.search]);

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
      onNotify("Failed to load customer data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleRemoveSaved = async (vehicleId: string) => {
    try {
      await savedVehiclesApi.remove(userId, vehicleId);
      setSavedVehicles(prev => prev.filter(s => s.vehicleId !== vehicleId));
      onNotify("Removed from saved.", "success");
    } catch {
      onNotify("Error removing vehicle.", "error");
    }
  };

  const handleCancelTestDrive = async (id: string) => {
    try {
      await testDrivesApi.updateStatus(id, "cancelled");
      setTestDrives(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
      onNotify("Test drive cancelled.", "info");
    } catch {
      onNotify("Error cancelling test drive.", "error");
    }
  };

  const handleDeleteListing = async (vehicleId: string) => {
    try {
      await vehiclesApi.delete(vehicleId);
      setMyListings(prev => prev.filter(v => v.id !== vehicleId));
      setDeletingVehicleId(null);
      onNotify("Vehicle listing removed.", "success");
    } catch {
      onNotify("Failed to delete vehicle.", "error");
    }
  };

  const handleLeadStatusChange = async (leadId: string, status: string) => {
    try {
      await leadsApi.updateStatus(leadId, status);
      setInquiries(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
      onNotify(`Inquiry updated to ${status}.`, "success");
    } catch {
      onNotify("Failed to update inquiry status.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors">
      <SEO title="User Profile — Arif Car Sell" noIndex={true} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 pb-28 lg:pb-10">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  My Profile
                </h1>
                <span className="lg:hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#E63D3B] border border-emerald-200/80 dark:border-emerald-800/80">
                  {user?.role === "broker" ? "Broker" : "Member"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Welcome back, {user?.name?.split(" ")[0]} — manage your account & cars.
              </p>
            </div>
            {/* Quick avatar on mobile */}
            <div 
              onClick={() => setActiveSection("profile")}
              className="lg:hidden w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#FF4846] border border-[#FF4846]/30 flex items-center justify-center text-xs font-black shrink-0 overflow-hidden cursor-pointer shadow-xs"
            >
              {user?.avatar ? <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" /> : initials}
            </div>
          </div>
          <div className="hidden sm:flex flex-row items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
              className="flex items-center justify-center gap-2 text-xs font-black text-slate-950 bg-[#FF4846] hover:bg-[#E63D3B] px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Plus size={15} strokeWidth={3} />
              <span>List a Car to Sell</span>
            </button>
            <button
              onClick={() => navigate("/vehicles")}
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Search size={14} />
              <span>Browse Marketplace</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Sidebar (Desktop only) */}
          <div className="hidden lg:block lg:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden sticky top-20 sm:top-24 z-20 transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-[#FF4846]/30 text-[#FF4846] flex items-center justify-center text-sm font-black shadow-sm shrink-0 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold text-[#FF4846] uppercase tracking-wider">
                      {user?.role === "broker" ? "Certified Broker" : "Verified Member"}
                    </p>
                  </div>
                </div>
              </div>
              <nav className="p-2 flex flex-col gap-1">
                {sections.map(sec => {
                  const Icon = sec.icon;
                  const counts: Record<string, number> = {
                    saved: savedVehicles.length,
                    testdrives: testDrives.length,
                    listings: myListings.length,
                    inquiries: inquiries.length,
                  };
                  const count = counts[sec.id];
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap w-full ${
                        activeSection === sec.id
                          ? "bg-[#FF4846] text-slate-950 font-black shadow-sm shadow-emerald-500/20"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <Icon size={15} className={`shrink-0 ${activeSection === sec.id ? "text-slate-950" : "text-slate-400"}`} />
                      <span className="text-left flex-1">{sec.label}</span>
                      {count !== undefined && count > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                          activeSection === sec.id
                            ? "bg-slate-950/20 text-slate-950"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeSection === "dashboard" && (
              <DashboardSection
                user={user}
                savedCount={savedVehicles.length}
                testDriveCount={testDrives.length}
                listingsCount={myListings.length}
                inquiriesCount={inquiries.length}
                onNavigate={setActiveSection}
                onAddListing={() => { setEditingVehicle(null); setShowAddModal(true); }}
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
            {activeSection === "listings" && (
              <ListingsSection
                listings={myListings}
                onAddListing={() => { setEditingVehicle(null); setShowAddModal(true); }}
                onEditListing={(v) => { setEditingVehicle(v); setShowAddModal(true); }}
                onDeleteListing={(id) => setDeletingVehicleId(id)}
                onInspectLibre={setInspectingDoc}
                onViewDetails={onViewDetails}
                onRefresh={fetchData}
              />
            )}
            {activeSection === "inquiries" && (
              <InquiriesSection
                inquiries={inquiries}
                onStatusChange={handleLeadStatusChange}
                onRefresh={fetchData}
              />
            )}
            {activeSection === "profile" && <ProfileSection onNotify={onNotify} />}
            {activeSection === "security" && <SecuritySection onNotify={onNotify} />}
          </div>
        </div>
      </div>

      {/* ── MOBILE NATIVE BOTTOM APP BAR (lg:hidden) ────────────────────── */}
      <nav 
        aria-label="Mobile Member Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
      >
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => { setActiveSection("dashboard"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
            activeSection === "dashboard" && !mobileMoreOpen
              ? "text-[#FF4846] font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
        </button>

        {/* 2. Saved */}
        <button
          type="button"
          onClick={() => { setActiveSection("saved"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
            activeSection === "saved" && !mobileMoreOpen
              ? "text-[#FF4846] font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Heart size={20} />
            {savedVehicles.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {savedVehicles.length > 9 ? "9+" : savedVehicles.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Saved</span>
        </button>

        {/* 3. Center Elevated Action Button: List Car */}
        <button
          type="button"
          onClick={() => { setEditingVehicle(null); setShowAddModal(true); setMobileMoreOpen(false); }}
          className="flex flex-col items-center -mt-5 cursor-pointer group"
          title="List a Car for Sale"
        >
          <div className="w-12 h-12 rounded-full bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-active:scale-95 transition">
            <Plus size={22} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-tight mt-1">Sell Car</span>
        </button>

        {/* 4. Test Drives */}
        <button
          type="button"
          onClick={() => { setActiveSection("testdrives"); setMobileMoreOpen(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
            activeSection === "testdrives" && !mobileMoreOpen
              ? "text-[#FF4846] font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <Calendar size={20} />
            {testDrives.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {testDrives.length > 9 ? "9+" : testDrives.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Drives</span>
        </button>

        {/* 5. More */}
        <button
          type="button"
          onClick={() => setMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
            mobileMoreOpen || ["listings", "inquiries", "profile", "security"].includes(activeSection)
              ? "text-[#FF4846] font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <div className="relative">
            <SlidersHorizontal size={20} />
            {inquiries.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white dark:border-slate-950" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </nav>

      {/* ── MOBILE "MORE" BOTTOM SHEET (lg:hidden) ────────────────────── */}
      {mobileMoreOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div 
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">Member Workspace</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Arif Car Sell Customer Portal</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {[
                {
                  id: "listings",
                  label: "My Listed Cars",
                  desc: `${myListings.length} Vehicles for sale`,
                  icon: Car,
                  color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
                  badge: myListings.length > 0 ? `${myListings.length}` : null
                },
                {
                  id: "inquiries",
                  label: "Inquiries Received",
                  desc: `${inquiries.length} Buyer inquiries`,
                  icon: MessageCircle,
                  color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
                  badge: inquiries.length > 0 ? `${inquiries.length}` : null
                },
                {
                  id: "profile",
                  label: "Personal Profile",
                  desc: "Edit contact & info",
                  icon: User,
                  color: "text-[#FF4846] bg-emerald-50 dark:bg-emerald-950/40",
                  badge: null
                },
                {
                  id: "security",
                  label: "Password & Security",
                  desc: "Credentials & security",
                  icon: Key,
                  color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
                  badge: null
                },
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id as Section);
                      setMobileMoreOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-2 relative ${
                      isActive 
                        ? "border-[#FF4846] bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-[#FF4846]/20" 
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                        <ItemIcon size={18} />
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-black bg-[#FF4846] text-slate-950 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Link to Public Marketplace */}
            <button
              type="button"
              onClick={() => { setMobileMoreOpen(false); navigate("/vehicles"); }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white text-xs font-bold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search size={16} className="text-[#FF4846]" />
                <span>Browse Marketplace Showroom</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            {/* User Profile summary & Sign Out */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF4846] text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover rounded-full" />
                  ) : initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name || "Customer"}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                      {user?.role === "broker" ? "Broker" : "Member"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{user?.phone || user?.email || "Verified Member"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setMobileMoreOpen(false); navigate("/"); }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showAddModal && (
        <VehicleFormModal
          sellerId={userId}
          editing={editingVehicle}
          role="seller"
          onClose={() => { setShowAddModal(false); setEditingVehicle(null); }}
          onSaved={() => {
            setShowAddModal(false);
            setEditingVehicle(null);
            fetchData();
            onNotify(editingVehicle ? "Vehicle updated successfully!" : "Vehicle listing submitted for review!", "success");
          }}
          onNotify={onNotify}
        />
      )}

      {/* Libre Document Inspection Lightbox Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Ownership Document (Libre)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {inspectingDoc.vehicleTitle} · {fmt(inspectingDoc.price)} ETB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">File Name</span>
                  <span className="font-bold text-slate-800 dark:text-white">{inspectingDoc.docName}</span>
                </div>
                <a
                  href={inspectingDoc.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={inspectingDoc.docName}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>Open Full Size</span>
                </a>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[500px]">
                {inspectingDoc.docUrl.startsWith("data:application/pdf") ? (
                  <iframe
                    src={inspectingDoc.docUrl}
                    title="Libre PDF"
                    className="w-full h-[450px]"
                  />
                ) : (
                  <img
                    src={inspectingDoc.docUrl}
                    alt="Vehicle Ownership Libre"
                    className="max-h-[450px] w-auto object-contain mx-auto"
                  />
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Native Mobile Bottom Sheet on phone) */}
      {deletingVehicleId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            {/* Sheet Handle */}
            <div className="sm:hidden -mt-2 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Listing?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This listing will be permanently removed from the marketplace.</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVehicleId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteListing(deletingVehicleId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────── DASHBOARD SECTION ──────────────── */

function DashboardSection({
  user, savedCount, testDriveCount, listingsCount, inquiriesCount, onNavigate, onAddListing
}: {
  user: any;
  savedCount: number;
  testDriveCount: number;
  listingsCount: number;
  inquiriesCount: number;
  onNavigate: (s: Section) => void;
  onAddListing: () => void;
}) {
  const joined = user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A";

  return (
    <div className="space-y-6">
      {/* Profile Photo & Account Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-[#FF4846]/30 text-[#FF4846] flex items-center justify-center text-xl sm:text-2xl font-black shadow-sm overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}</span>
              )}
            </div>
            <button
              onClick={() => onNavigate("profile")}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF4846] hover:bg-[#E63D3B] text-white flex items-center justify-center shadow-xs cursor-pointer transition active:scale-95"
              title="Change profile photo"
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#E63D3B] border border-emerald-200/80 dark:border-emerald-800/80">
                Verified Member
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              {user?.email ? `${user.email} • ` : ""}Member since {joined}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("profile")}
          className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <User size={14} className="text-[#FF4846]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Grid of Marketplace Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Heart} label="Saved Cars" value={savedCount} color="text-rose-500 bg-rose-50 dark:bg-rose-950/40" onClick={() => onNavigate("saved")} />
        <StatCard icon={Calendar} label="Test Drives" value={testDriveCount} color="text-[#FF4846] bg-emerald-50 dark:bg-emerald-950/40" onClick={() => onNavigate("testdrives")} />
        <StatCard icon={Car} label="My Listings" value={listingsCount} color="text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" onClick={() => onNavigate("listings")} />
        <StatCard icon={MessageCircle} label="Inquiries" value={inquiriesCount} color="text-amber-500 bg-amber-50 dark:bg-amber-950/40" onClick={() => onNavigate("inquiries")} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Quick Actions</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Customer Tools</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction icon={Plus} label="List a Vehicle for Sale" desc="Create a new marketplace listing" onClick={onAddListing} highlight />
          <QuickAction icon={Search} label="Browse Vehicles" desc="Explore certified cars available for purchase" onClick={() => { window.location.href = "/vehicles"; }} />
          <QuickAction icon={Car} label="Manage My Listings" desc="View, edit, or update your car listings" onClick={() => onNavigate("listings")} />
          <QuickAction icon={MessageCircle} label="Check Inquiries" desc="View prospective buyer messages & leads" onClick={() => onNavigate("inquiries")} />
          <QuickAction icon={Heart} label="View Saved Favorites" desc="See cars you bookmarked" onClick={() => onNavigate("saved")} />
          <QuickAction icon={Calendar} label="Test Drive Bookings" desc="Check appointment times and confirmations" onClick={() => onNavigate("testdrives")} />
          <QuickAction icon={User} label="Personal Profile" desc="Update contact info and city" onClick={() => onNavigate("profile")} />
          <QuickAction icon={Key} label="Password & Security" desc="Manage authentication settings" onClick={() => onNavigate("security")} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick, sub }: { icon: any; label: string; value: string | number; color: string; onClick?: () => void; sub?: string }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer ${!onClick ? "cursor-default" : ""} text-left group`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <Icon size={17} />
        </div>
        {sub && <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{sub}</span>}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
      </div>
    </button>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick, highlight }: { icon: any; label: string; desc: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer text-left ${
        highlight
          ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/70"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-100 dark:border-slate-800/80 hover:border-slate-200"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        highlight ? "bg-[#FF4846] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      }`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{desc}</p>
      </div>
      <ArrowRight size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
    </button>
  );
}

/* ──────────────── SAVED VEHICLES SECTION ──────────────── */

function SavedSection({ vehicles, onViewDetails, onRemove }: {
  vehicles: (SavedVehicle & { vehicle?: VehicleListing })[];
  onViewDetails?: (v: VehicleListing) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Saved Vehicles</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Vehicles you have bookmarked to compare and view</p>
        </div>
        <a href="/vehicles" className="text-xs font-bold text-[#FF4846] hover:underline flex items-center gap-1">
          <span>Find more</span>
          <ArrowRight size={12} />
        </a>
      </div>
      <div className="p-6">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Heart size={26} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">No saved vehicles yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Browse our marketplace and tap the heart icon on any vehicle to save it to your wishlist.</p>
            <a href="/vehicles" className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-white bg-[#FF4846] hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition shadow-sm">
              <Search size={13} />
              <span>Explore Marketplace</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(sv => sv.vehicle && (
              <div key={sv.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition cursor-pointer group bg-white dark:bg-slate-850/60"
                onClick={() => onViewDetails?.(sv.vehicle!)}
              >
                <div className="sm:w-44 h-36 bg-slate-100 dark:bg-slate-800 shrink-0 relative overflow-hidden">
                  <img src={sv.vehicle.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"}
                    alt={`${sv.vehicle.brand} ${sv.vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button onClick={(e) => { e.stopPropagation(); onRemove(sv.vehicleId); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-sm cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{sv.vehicle.brand}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#FF4846] transition-colors line-clamp-1">
                      {sv.vehicle.brand} {sv.vehicle.model}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sv.vehicle.year} • {sv.vehicle.mileage?.toLocaleString()} km • {sv.vehicle.fuelType}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <span className="text-sm font-black text-[#FF4846]">ETB {fmt(sv.vehicle.price)}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={10} /> {sv.vehicle.location}</span>
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

/* ──────────────── TEST DRIVES SECTION ──────────────── */

function TestDriveSection({ drives, onCancel }: {
  drives: TestDriveRequest[];
  onCancel: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-black text-slate-800 dark:text-white">Scheduled Test Drives</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your booked inspection and test drive appointments</p>
      </div>
      <div className="p-6">
        {drives.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#FF4846] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Calendar size={26} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">No test drives scheduled</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">When browsing vehicles, click "Book Test Drive" to schedule an in-person vehicle inspection.</p>
            <a href="/vehicles" className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-white bg-[#FF4846] hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition shadow-sm">
              <Car size={13} />
              <span>Browse Cars for Test Drive</span>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {drives.map(td => (
              <div key={td.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition bg-white dark:bg-slate-850/60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#FF4846] flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{td.vehicleBrand} {td.vehicleModel}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(td.preferredDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {td.preferredTime}</span>
                    </div>
                    {td.message && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">"{td.message}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={td.status} />
                  {td.status === "pending" && (
                    <button onClick={() => onCancel(td.id)}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-3 py-1.5 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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

/* ──────────────── MY LISTED CARS SECTION (SELLING) ──────────────── */

function ListingsSection({
  listings, onAddListing, onEditListing, onDeleteListing, onInspectLibre, onViewDetails, onRefresh
}: {
  listings: VehicleListing[];
  onAddListing: () => void;
  onEditListing: (v: VehicleListing) => void;
  onDeleteListing: (id: string) => void;
  onInspectLibre?: (doc: { vehicleTitle: string; docUrl: string; docName: string; price: number }) => void;
  onViewDetails?: (v: VehicleListing) => void;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return listings.filter(v => {
      const matchFilter = filter === "all" || v.status === filter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || `${v.brand} ${v.model} ${v.location}`.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [listings, filter, search]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span>My Listed Vehicles</span>
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              {listings.length} Listed
            </span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Manage cars you have put up for sale on the marketplace</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button onClick={onAddListing}
            className="flex items-center gap-1.5 text-xs font-black text-white bg-[#FF4846] hover:bg-emerald-600 px-4 py-2 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
          >
            <Plus size={14} />
            <span>+ List New Car</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by brand, model, city..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846]"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {["all", "approved", "pending", "rejected", "sold"].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer capitalize whitespace-nowrap ${
                  filter === st
                    ? "bg-[#FF4846] text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {st === "approved" ? "Live (Active)" : st === "pending" ? "Under Review" : st === "rejected" ? "Rejected" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Cards */}
      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Car size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {listings.length === 0 ? "You haven't listed any cars yet" : "No vehicles match your filter"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Any customer can sell vehicles on Arif Car Sell. Click below to add your car with photos and specs.
            </p>
            <button onClick={onAddListing} className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-white bg-[#FF4846] hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm">
              <Plus size={14} />
              <span>List a Car Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(vehicle => (
              <div key={vehicle.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition bg-white dark:bg-slate-850/60 flex flex-col">
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
                  <img
                    src={vehicle.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <StatusPill status={vehicle.status || "pending"} />
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye size={11} />
                    <span>{vehicle.views || 0} views</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{vehicle.brand}</span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                          {vehicle.brand} {vehicle.model}
                        </h4>
                      </div>
                      <span className="text-sm font-black text-[#FF4846] whitespace-nowrap">
                        ETB {fmt(vehicle.price)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {vehicle.ownershipDocumentUrl ? (
                        <button
                          type="button"
                          onClick={() => onInspectLibre?.({
                            vehicleTitle: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
                            docUrl: vehicle.ownershipDocumentUrl!,
                            docName: vehicle.ownershipDocumentName || "Ownership Libre Document",
                            price: vehicle.price,
                          })}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                          title="View Libre Ownership Document"
                        >
                          <FileCheck size={11} /> Libre Attached (View)
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          <FileText size={11} /> No Libre Attached
                        </span>
                      )}
                      {vehicle.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          <Clock size={11} /> Admin Reviewing
                        </span>
                      )}
                    </div>

                    {vehicle.status === "rejected" && (
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Listing Not Approved</p>
                            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5 leading-relaxed">
                              {vehicle.rejectionReason || "Please review your car details, photos, or ownership Libre document and re-submit."}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditListing(vehicle)}
                          className="mt-2.5 w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                        >
                          <Edit3 size={12} />
                          <span>Edit & Re-submit for Review</span>
                        </button>
                      </div>
                    )}

                    {vehicle.status === "pending" && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <Clock size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Awaiting admin review. Our administrators will verify your Libre before publishing live.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{vehicle.year} Year</span>
                      <span>{vehicle.mileage ? `${fmt(vehicle.mileage)} km` : "N/A"}</span>
                      <span>{vehicle.fuelType || "Gasoline"}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {vehicle.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button
                      onClick={() => onEditListing(vehicle)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(vehicle)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                        title="View Live Listing"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteListing(vehicle.id)}
                      className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Delete Listing"
                    >
                      <Trash2 size={14} />
                    </button>
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

/* ──────────────── INQUIRIES RECEIVED SECTION (SELLING) ──────────────── */

function InquiriesSection({
  inquiries, onStatusChange, onRefresh
}: {
  inquiries: Lead[];
  onStatusChange: (leadId: string, status: string) => void;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return inquiries;
    return inquiries.filter(l => l.status === filter);
  }, [inquiries, filter]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span>Inquiries Received</span>
            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {inquiries.length} Inquiries
            </span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Inquiries and messages from customers interested in your vehicles</p>
        </div>
        <button onClick={onRefresh} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {["all", "new", "contacted", "closed"].map(st => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer capitalize ${
              filter === st
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No inquiries yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              When prospective buyers contact you through your car listings, their messages and contact numbers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(lead => (
              <div key={lead.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-sm transition bg-white dark:bg-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{lead.buyerName || lead.name || "Customer"}</span>
                    <StatusPill status={lead.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {(lead.buyerPhone || lead.phone) && (
                      <a href={`tel:${lead.buyerPhone || lead.phone}`} className="flex items-center gap-1 font-semibold text-[#FF4846] hover:underline">
                        <Phone size={12} />
                        <span>{lead.buyerPhone || lead.phone}</span>
                      </a>
                    )}
                    {(lead.buyerEmail || lead.email) && (
                      <a href={`mailto:${lead.buyerEmail || lead.email}`} className="flex items-center gap-1 hover:underline">
                        <Mail size={12} />
                        <span>{lead.buyerEmail || lead.email}</span>
                      </a>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {new Date(lead.inquiryDate || lead.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  {lead.message && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 mt-2">
                      "{lead.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {lead.status === "new" && (
                    <button
                      onClick={() => onStatusChange(lead.id, "contacted")}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-xl text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                    >
                      Mark Contacted
                    </button>
                  )}
                  {lead.status !== "closed" && (
                    <button
                      onClick={() => onStatusChange(lead.id, "closed")}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      Mark Closed
                    </button>
                  )}
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-2 rounded-xl bg-[#FF4846] text-white hover:bg-emerald-600 transition shadow-xs flex items-center justify-center cursor-pointer"
                    title="Call Buyer"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// VehicleFormModal is imported from ../components/ui/VehicleFormModal

/* ──────────────── PROFILE SECTION ──────────────── */

function ProfileSection({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || ""
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateProfile(form);
      onNotify("Profile updated successfully.", "success");
      setEditing(false);
    } catch (err: any) {
      onNotify(err.message || "Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      const upData = await uploadApi.single(file, "avatars");
      if (upData && upData.url) {
        await updateProfile({ avatar: upData.url });
        onNotify("Avatar updated successfully.", "success");
      } else {
        onNotify("Upload failed.", "error");
      }
    } catch (err: any) {
      onNotify(err.message || "Error uploading avatar.", "error");
    }
  };

  const joined = user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  return (
    <SectionCard title="Personal Information" subtitle="Update your personal details"
      action={!editing ?
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-[#FF4846] hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition cursor-pointer"><Pencil size={12} /> Edit</button>
        : <button onClick={() => { setEditing(false); setForm({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", bio: user?.bio || "" }); }}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">Cancel</button>
      }
    >
      <div className="flex items-center gap-5 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-[#FF4846]/40 text-[#FF4846] flex items-center justify-center text-xl font-black shadow-sm ring-2 ring-[#FF4846]/20 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <button onClick={() => fileRef.current?.click()}
            className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
          ><Camera size={16} className="text-white" /></button>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Member since {joined}</p>
        </div>
      </div>
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name"><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></Field>
            <Field label="Phone"><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" /></Field>
          </div>
          <Field label="Bio"><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none" /></Field>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#FF4846] hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm"
            >{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={Mail} label="Email" value={user?.email || "—"} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone || "—"} />
          <InfoRow icon={CalendarDays} label="Member Since" value={joined} />
          <InfoRow icon={BadgeCheck} label="Verification" value={user?.verificationStatus ? user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1) : "Verified Customer"} />
          {user?.bio && <div className="sm:col-span-2"><InfoRow icon={User} label="Bio" value={user.bio} /></div>}
        </div>
      )}
    </SectionCard>
  );
}

/* ──────────────── SECURITY SECTION ──────────────── */

function SecuritySection({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const { changePassword } = useAuth();
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
      await changePassword(form.currentPassword, form.newPassword);
      onNotify("Password changed successfully.", "success");
      setShowForm(false);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <SectionCard title="Password & Security" subtitle="Manage your password and account security"
      action={!showForm ? <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs font-bold text-[#FF4846] hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition cursor-pointer"><Key size={12} /> Change</button> : null}
    >
      {showForm ? (
        <div className="max-w-md space-y-4">
          <Field label="Current Password">
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </Field>
          <Field label="New Password">
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </Field>
          <Field label="Confirm New Password">
            <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
          </Field>
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={handleChange} disabled={changing} className="flex items-center gap-2 bg-[#FF4846] hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm">{changing ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}{changing ? "Changing..." : "Update Password"}</button>
            <button onClick={() => { setShowForm(false); setError(""); setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#FF4846] flex items-center justify-center shrink-0"><ShieldCheck size={16} /></div>
          <div><p className="text-sm font-bold text-slate-800 dark:text-white">Password Protection</p><p className="text-xs text-slate-400 dark:text-slate-500">Keep your account secure with regular updates</p></div>
        </div>
      )}
    </SectionCard>
  );
}

/* ──────────────── NOTIFICATIONS SECTION ──────────────── */

function NotificationsSection({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const [prefs, setPrefs] = useState({ emailNewListings: true, emailTestDriveUpdates: true, emailPromotions: false, pushSavedPriceDrop: true, emailInquiries: true });
  const toggle = (key: keyof typeof prefs) => { setPrefs(p => ({ ...p, [key]: !p[key] })); onNotify("Preference updated.", "success"); };

  return (
    <SectionCard title="Notifications" subtitle="Choose what updates and alerts you receive">
      <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">Email Alerts</p>
      {[
        { key: "emailInquiries" as const, label: "Buyer inquiries", desc: "Get notified immediately when an interested buyer contacts you about your car" },
        { key: "emailNewListings" as const, label: "New vehicle listings", desc: "Get notified when new vehicles matching your interests are listed" },
        { key: "emailTestDriveUpdates" as const, label: "Test drive updates", desc: "Receive updates about your scheduled test drive requests" },
        { key: "emailPromotions" as const, label: "Promotions & offers", desc: "Special offers, promotions, and market updates" },
      ].map(item => <ToggleRow key={item.key} checked={prefs[item.key]} onChange={() => toggle(item.key)} label={item.label} desc={item.desc} />)}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">Push Notifications</p>
        <ToggleRow checked={prefs.pushSavedPriceDrop} onChange={() => toggle("pushSavedPriceDrop")} label="Price drops" desc="Get notified when a saved vehicle drops in price" />
      </div>
    </SectionCard>
  );
}

/* ──────────────── ACCOUNT SECTION ──────────────── */

function AccountSection({ user, onNotify }: { user: any; onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const { logout } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!user?.id) return;
    setDeleting(true);
    try {
      await usersApi.delete(user.id);
      onNotify("Account deleted.", "info");
      logout();
      window.location.href = "/";
    } catch (err: any) {
      onNotify(err.message || "Delete failed.", "error");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SectionCard title="Account" subtitle="Manage your account profile and data">
      {confirmDelete ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl">
            <Trash2 size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div><p className="text-sm font-bold text-rose-700 dark:text-rose-400">Are you absolutely sure?</p><p className="text-xs text-rose-600 dark:text-rose-300 mt-1">This permanently deletes your account, listed cars, and saved preferences. This cannot be undone.</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50">{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}{deleting ? "Deleting..." : "Yes, Delete My Account"}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0"><Trash2 size={16} /></div>
            <div><p className="text-sm font-bold text-slate-800 dark:text-white">Delete Account</p><p className="text-xs text-slate-400 dark:text-slate-500">Permanently remove your customer account and data</p></div>
          </div>
          <button onClick={() => setConfirmDelete(true)} className="text-xs font-bold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer shrink-0">Delete</button>
        </div>
      )}
    </SectionCard>
  );
}

/* ──────────────── SHARED UI HELPERS ──────────────── */

function SectionCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div><h3 className="text-sm font-black text-slate-800 dark:text-white">{title}</h3>{subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}</div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1.5 block">{label}</label>{children}</div>;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#FF4846] flex items-center justify-center shrink-0 mt-0.5"><Icon size={16} /></div>
      <div><p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{label}</p><p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{value}</p></div>
    </div>
  );
}

function ToggleRow({ checked, onChange, label, desc }: { key?: React.Key; checked: boolean; onChange: () => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div><p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p><p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p></div>
      <button type="button" onClick={onChange} className={`relative w-10 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${checked ? "bg-[#FF4846]" : "bg-slate-200 dark:bg-slate-700"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}
