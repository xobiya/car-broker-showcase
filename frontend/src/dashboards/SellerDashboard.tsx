import React, { useState, useEffect, useMemo } from "react";
import {
  Car, Store, Eye, MessageCircle, TrendingUp, Plus, X, LogOut,
  Clock, MapPin, Fuel, Settings, Search, RefreshCw, Trash2, Check,
  Menu, Gauge, DollarSign, Users, Phone, LayoutGrid, List as ListIcon,
  ChevronRight, ChevronLeft, Sparkles, AlertCircle, Calendar, ShieldCheck, Edit3, Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { VehicleListing, Lead } from "../../../shared/types";
import Combobox from "../components/ui/Combobox";
import {
  BRANDS, LOCATIONS, COLORS, FUEL_TYPES, TRANSMISSIONS,
  DRIVE_TYPES, CONDITIONS, BODY_TYPES, ENGINE_TYPES,
  DOOR_OPTIONS, SEAT_OPTIONS, INQUIRY_STATUSES,
  LISTING_STATUSES, MONTHS
} from "../lib/constants";

interface SellerDashboardProps {
  currentUser: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onLogout: () => void;
}

type SellerTab = "listings" | "inquiries" | "activity";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BRAND_MODELS: Record<string, string[]> = {
  "Toyota": ["Vitz", "Yaris", "Passo", "Corolla", "Premio", "Allion", "Fielder", "Harrier", "Land Cruiser", "Land Cruiser Prado", "Rush", "Hilux", "Hiace", "Camry", "RAV4", "Fortuner", "Corolla Cross", "Starlet", "Belta", "Avanza", "Innova", "Coaster", "Dyna", "Tundra", "Highlander", "Crown", "Sienta", "Noah", "Voxy", "Alphard", "Auris", "Axio"],
  "BYD": ["Atto 3", "Seagull", "Dolphin", "Han", "Tang", "Yuan Plus", "Seal", "Song Plus"],
  "Hyundai": ["Tucson", "Elantra", "Santa Fe", "Accent", "Grand i10", "Creta", "Sonata", "Palisade", "Kona", "Venue", "Staria", "Grand Starex", "H-1", "i20", "i30", "Tucson LWB"],
  "Suzuki": ["Swift", "Dzire", "Alto", "Ertiga", "Vitara", "Jimny", "S-Presso", "Celerio", "Baleno", "Grand Vitara", "Wagon R", "Ciaz", "Ignis", "APV"],
  "Kia": ["Sportage", "Sorento", "Picanto", "Rio", "Cerato", "Seltos", "Telluride", "Stonic", "Niro", "EV6", "Carnival", "K5", "Soul"],
  "Honda": ["Fit", "Civic", "CR-V", "Vezel", "Grace", "Freed", "Accord", "HR-V", "Odyssey", "Stepwgn", "N-Box", "Shuttle", "Jazz", "City", "BR-V", "WR-V"],
  "Nissan": ["Note", "X-Trail", "Patrol", "Sunny", "Juke", "Qashqai", "Navara", "Pathfinder", "Altima", "Leaf", "Murano", "Elgrand", "Serena", "Wingroad", "March", "Tiida", "Frontier"],
  "Changan": ["CS35", "CS55", "CS75", "Eado", "Alsvin", "UNI-K", "UNI-T", "UNI-V", "Deepal"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "CLS", "A-Class", "B-Class", "AMG GT", "V-Class", "Sprinter"],
  "BMW": ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "X6", "i4", "i7", "M3", "M5", "Z4", "1 Series"],
  "Volkswagen": ["Golf", "Passat", "Polo", "Tiguan", "ID.4", "ID.3", "Jetta", "T-Cross", "T-Roc", "Touran", "Sharan", "Teramont", "Amarok", "Virtus", "Lavida"],
  "Ford": ["Ranger", "Everest", "Explorer", "Escape", "Focus", "Fusion", "Mustang", "Edge", "Transit", "F-150", "Endeavour", "EcoSport"],
  "Mitsubishi": ["L200", "Pajero", "Montero", "Outlander", "Eclipse Cross", "Mirage", "Delica", "ASX", "Triton", "Xpander"],
  "Isuzu": ["D-Max", "MU-X", "FRR", "N-Series", "ELF", "KB", "Trooper"],
  "MG": ["MG5", "MG6", "MG ZS", "MG HS", "MG RX5", "MG3", "MG GT", "MG EZS"],
  "Geely": ["Tugela", "Emgrand", "Coolray", "Monjaro", "Starray", "Okavango", "Geometry C", "Panda"],
  "Chevrolet": ["Trailblazer", "Captiva", "Equinox", "Tahoe", "Suburban", "Malibu", "Camaro", "Colorado", "Spark", "Aveo", "Cruze"],
  "Mazda": ["CX-5", "CX-9", "CX-30", "CX-3", "BT-50", "Mazda3", "Mazda6", "MX-5", "Demio", "Atenza", "Axela", "Biante"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Range Rover Evoque", "Discovery", "Discovery Sport", "Defender", "Velar"],
  "Lexus": ["LX570", "RX350", "NX200", "ES350", "GX460", "LS500", "UX200", "LM300h"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer"],
  "Peugeot": ["3008", "5008", "208", "2008", "308", "508", "Partner", "Landtrek", "Rifter"],
  "Renault": ["Kwid", "Duster", "Logan", "Sandero", "Koleos", "Captur", "Kangoo", "Triber"],
  "Foton": ["Tunland", "BJ40", "New Energy", "AUV", "View"],
  "Great Wall": ["Haval H6", "Haval H2", "Haval Jolion", "Wingle 5", "Wingle 7", "Poer", "Ora Good Cat", "Tank 300", "Tank 500"],
  "Haval": ["H6", "H2", "Jolion", "Dargo", "H9", "F7", "M6"],
  "Jetour": ["X70", "X90", "X95", "Dashing", "Traveller"],
  "Chery": ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "Omoda 5", "EQ1"],
};

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [locked]);
}

function ActivityChart({ listings }: { listings: VehicleListing[] }) {
  const monthlyData = MONTHS_SHORT.map((_, i) => {
    const monthListings = listings.filter(v => {
      const d = new Date(v.createdAt || Date.now());
      return d.getMonth() === i;
    });
    return { label: MONTHS_SHORT[i], count: monthListings.length };
  });
  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
  const currentMonth = new Date().getMonth();
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2">
        <TrendingUp size={14} className="text-orange-500 shrink-0" />
        <span className="uppercase tracking-wider">Listing Frequency</span>
      </h3>
      <div className="flex items-end gap-2.5 h-32 w-full pt-4">
        {monthlyData.map((d, i) => {
          const height = Math.round((d.count / maxCount) * 100);
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold rounded-lg px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-md">
                {d.count} listing{d.count !== 1 ? "s" : ""}
              </div>
              <div
                className={`w-full rounded-t-md transition-all duration-500 relative overflow-hidden ${
                  d.count > 0 
                    ? (i === currentMonth 
                      ? "bg-gradient-to-t from-orange-600 to-amber-500" 
                      : "bg-orange-400/70 hover:bg-orange-500/90") 
                    : "bg-slate-100/80"
                }`}
                style={{ height: `${Math.max(height, d.count > 0 ? 8 : 2)}%`, minHeight: d.count > 0 ? 8 : 2 }}
              />
              <span className={`text-[8px] font-black uppercase tracking-wider ${i === currentMonth ? "text-orange-500" : "text-slate-400"}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SellerDashboard({ currentUser, onNotify, onLogout }: SellerDashboardProps) {
  const [tab, setTab] = useState<SellerTab>("listings");
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [inquiries, setInquiries] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);

  useScrollLock(showAddModal || showDeleteConfirm !== null);

  const userId = currentUser?.id;

  const fetchData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [vehRes, leadRes] = await Promise.all([
        fetch(`/api/vehicles?sellerId=${userId}`),
        fetch(`/api/leads?sellerId=${userId}`),
      ]);
      if (vehRes.ok) {
        const all: VehicleListing[] = await vehRes.json();
        setListings(all.filter(v => v.brokerId === userId || v.brokerId?.startsWith("usr")));
      }
      if (leadRes.ok) setInquiries(await leadRes.json());
    } catch {
      onNotify("Failed to load seller data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const filteredListings = useMemo(() => {
    let result = listings;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        `${v.brand} ${v.model}`.toLowerCase().includes(q) ||
        v.location?.toLowerCase().includes(q) ||
        v.status?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(v => v.status === statusFilter);
    }
    return result;
  }, [listings, searchQuery, statusFilter]);

  const filteredInquiries = useMemo(() => {
    if (inquiryFilter === "all") return inquiries;
    return inquiries.filter(i => i.status === inquiryFilter);
  }, [inquiries, inquiryFilter]);

  const approvedListings = listings.filter(v => v.status === "approved");
  const pendingListings = listings.filter(v => v.status === "pending");
  const soldListings = listings.filter(v => v.status === "sold");

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings(prev => prev.filter(v => v.id !== id));
        onNotify("Listing deleted.", "success");
      } else onNotify("Failed to delete listing.", "error");
    } catch { onNotify("Network error.", "error"); }
    setShowDeleteConfirm(null);
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}/submit`, { method: "PUT" });
      if (res.ok) {
        setListings(prev => prev.map(v => v.id === id ? { ...v, status: "pending" as const } : v));
        onNotify("Listing submitted for approval.", "success");
      } else onNotify("Failed to submit listing.", "error");
    } catch { onNotify("Network error.", "error"); }
  };

  const handleSave = (v: VehicleListing) => {
    if (editingVehicle) {
      setListings(prev => prev.map(item => item.id === v.id ? v : item));
      setEditingVehicle(null);
      onNotify("Listing updated.", "success");
    } else {
      setListings(prev => [...prev, v]);
      onNotify("Listing created! Awaiting approval.", "success");
    }
    setShowAddModal(false);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "listings" as SellerTab, label: "My Listings", shortLabel: "Listings", icon: Car, badge: pendingListings.length || undefined },
    { key: "inquiries" as SellerTab, label: "Inquiries", shortLabel: "Inquiries", icon: MessageCircle, badge: inquiries.filter(i => i.status === "new").length || undefined },
    { key: "activity" as SellerTab, label: "Activity Hub", shortLabel: "Activity", icon: TrendingUp },
  ];

  const currentTabLabel = navItems.find(n => n.key === tab)?.label || "";

  return (
    <div className="flex font-sans text-slate-800 h-screen w-screen overflow-hidden bg-slate-50">
      
      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-slate-950 border-r border-slate-900/60 h-full flex-col text-slate-300 shadow-2xl relative z-20">
        {/* Glow effect in sidebar */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
        
        <div className="h-20 border-b border-slate-900/60 flex items-center px-6 shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Store size={18} />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight uppercase">Seller Hub</span>
              <span className="text-[9px] font-black uppercase text-orange-400 tracking-widest block mt-0.5 leading-none">Dashboard</span>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto relative">
          {navItems.map(item => {
            const isActive = tab === item.key;
            return (
              <button key={item.key} onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/15"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />}
                <item.icon size={16} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                    isActive ? "bg-white/20 text-white" : "bg-orange-500 text-white"
                  }`}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900/60 shrink-0">
          <button onClick={() => setShowAddModal(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 hover:shadow-xl hover:shadow-orange-500/15 active:scale-[0.98] text-white font-black px-4 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md uppercase tracking-wider"
          >
            <Plus size={16} /> Add Listing
          </button>
        </div>

        <div className="p-4 border-t border-slate-900/60 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black shrink-0 shadow-inner">
              {currentUser?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{currentUser?.name || "Seller"}</p>
              <span className="text-[9px] font-black uppercase text-orange-400 mt-1.5 inline-flex items-center gap-1">
                <ShieldCheck size={9} /> Seller Account
              </span>
            </div>
            <button onClick={onLogout} className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay (lg:hidden) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-72 bg-slate-950 border-r border-slate-900/60 h-full flex flex-col text-slate-355 text-slate-300 shadow-2xl"
            >
              <div className="h-20 border-b border-slate-900/60 flex items-center px-6 shrink-0 justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                    <Store size={16} />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-tight">Seller Hub</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
                {navItems.map(item => {
                  const isActive = tab === item.key;
                  return (
                    <button key={item.key} onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                      }`}
                    >
                      <item.icon size={16} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                          isActive ? "bg-white/20 text-white" : "bg-orange-500 text-white"
                        }`}>{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-900/60 bg-slate-950/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black shrink-0">
                    {currentUser?.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-none">{currentUser?.name || "Seller"}</p>
                    <span className="text-[9px] font-black uppercase text-orange-400 mt-1 block">Seller</span>
                  </div>
                  <button onClick={onLogout} className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer" title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Panel ── */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 select-none">
              <Store size={12} className="text-orange-500" />
              <span>Seller Panel</span>
              <ChevronRight size={10} />
              <span className="text-slate-700">{currentTabLabel}</span>
            </div>
            <h1 className="sm:hidden text-sm font-black text-slate-900 truncate">
              {currentTabLabel}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {tab === "listings" && (
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
                <button onClick={() => setViewMode("grid")}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition cursor-pointer ${viewMode === "grid" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition cursor-pointer ${viewMode === "list" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="List View"
                >
                  <ListIcon size={15} />
                </button>
              </div>
            )}
            <button onClick={fetchData}
              className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200 cursor-pointer text-slate-400 hover:text-slate-700 bg-slate-50/50"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 lg:pb-8 relative">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
            {[
              { label: "Active", count: approvedListings.length, icon: Eye, color: "text-emerald-500 bg-emerald-50 border-emerald-100", sub: "Marketplace Live" },
              { label: "Pending", count: pendingListings.length, icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-100", sub: "SLA Under Review" },
              { label: "Inquiries", count: inquiries.length, icon: MessageCircle, color: "text-blue-500 bg-blue-50 border-blue-100", sub: `${inquiries.filter(i => i.status === "new").length} New Received` },
              { label: "Sold", count: soldListings.length, icon: Sparkles, color: "text-orange-500 bg-orange-50 border-orange-100", sub: "Completed Sales" }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow group"
              >
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1 tracking-tight leading-none">{stat.count}</span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-1.5 truncate group-hover:text-slate-500 transition-colors">{stat.sub}</span>
                </div>
                <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── TAB: LISTINGS ── */}
              {tab === "listings" && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search vehicle brand, model, location..."
                        className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-orange-400 focus:bg-white transition"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex gap-1.5 overflow-x-auto flex-nowrap -mx-1 px-1 pb-1 scrollbar-none">
                        {LISTING_STATUSES.map(st => {
                          const count = st === "all" ? listings.length : listings.filter(v => v.status === st).length;
                          const active = statusFilter === st;
                          return (
                            <button key={st} onClick={() => setStatusFilter(st)}
                              className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                                active ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
                              }`}
                            >
                              {st} <span className="opacity-60 font-bold ml-0.5">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm active:scale-[0.98] uppercase tracking-wider shrink-0"
                      >
                        <Plus size={14} /> Add Listing
                      </button>
                    </div>
                  </div>

                  {/* Listing Cards */}
                  {filteredListings.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 bg-white border border-dashed border-slate-200/80 rounded-2xl">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-500">
                        <Car size={24} />
                      </div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No matching listings</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Create a vehicle listing or adjust filters to see details.</p>
                      <button onClick={() => setShowAddModal(true)}
                        className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-2 shadow-md shadow-orange-500/10"
                      >
                        <Plus size={14} /> Add Listing
                      </button>
                    </div>
                  ) : (
                    <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"}>
                      {filteredListings.map(v => {
                        const statusBadge = {
                          approved: "bg-emerald-500 text-white",
                          pending: "bg-amber-500 text-white",
                          sold: "bg-blue-500 text-white",
                        }[v.status] || "bg-slate-500 text-white";

                        if (viewMode === "list") {
                          return (
                            /* Responsive List Item */
                            <div key={v.id} className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                              <div className="w-full sm:w-28 h-28 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                                <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <span className={`absolute top-2 left-2 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider sm:hidden ${statusBadge}`}>
                                  {v.status}
                                </span>
                              </div>
                              <div className="flex-grow min-w-0 w-full sm:w-auto grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                                <div className="sm:col-span-5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900 truncate">{v.brand} {v.model}</h3>
                                    <span className={`hidden sm:inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadge}`}>
                                      {v.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1 truncate">
                                    <MapPin size={10} className="text-slate-400" /> {v.location}
                                  </p>
                                </div>
                                <div className="sm:col-span-4 flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><Gauge size={10} /> {v.mileage?.toLocaleString()} km</span>
                                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><Fuel size={10} /> {v.fuelType}</span>
                                </div>
                                <div className="sm:col-span-3 sm:text-right">
                                  <span className="text-sm font-black text-orange-500 block leading-none">ETB {fmt(v.price)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-slate-100 sm:border-0 pt-3 sm:pt-0 shrink-0 flex-wrap sm:flex-nowrap">
                                {(v.status === "draft" || v.status === "rejected") && (
                                  <button onClick={() => handleSubmitForApproval(v.id)}
                                    className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-500 border border-orange-100 hover:border-orange-500 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm w-full sm:w-auto"
                                  >
                                    <Send size={11} /> Submit
                                  </button>
                                )}
                                <button onClick={() => { setEditingVehicle(v); setShowAddModal(true); }}
                                  className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-500 border border-blue-100 hover:border-blue-500 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm w-full sm:w-auto"
                                >
                                  <Edit3 size={11} /> Edit
                                </button>
                                <button onClick={() => setShowDeleteConfirm(v.id)}
                                  className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm w-full sm:w-auto"
                                >
                                  <Trash2 size={11} /> Delete
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          /* Grid Card Item */
                          <div key={v.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                            <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
                              <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                              <span className={`absolute top-3 left-3 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${statusBadge}`}>
                                {v.status}
                              </span>
                            </div>
                            <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors truncate">{v.brand} {v.model}</h3>
                                  <span className="text-sm font-black text-orange-500 shrink-0 whitespace-nowrap">ETB {fmt(v.price)}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <MapPin size={10} className="text-slate-400" /> <span className="truncate">{v.location}</span>
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50 -mx-4 px-4">
                                <span className="flex flex-col items-center gap-1 text-center"><Gauge size={12} className="text-slate-400" /> <span className="text-slate-800 text-[9px] mt-0.5">{v.mileage?.toLocaleString()} km</span></span>
                                <span className="flex flex-col items-center gap-1 text-center border-x border-slate-200/50"><Fuel size={12} className="text-slate-400" /> <span className="text-slate-800 text-[9px] mt-0.5">{v.fuelType}</span></span>
                                <span className="flex flex-col items-center gap-1 text-center"><Settings size={12} className="text-slate-400" /> <span className="text-slate-800 text-[9px] mt-0.5">{v.transmission}</span></span>
                              </div>

                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {(v.status === "draft" || v.status === "rejected") && (
                                  <button onClick={() => handleSubmitForApproval(v.id)}
                                    className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-500 border border-orange-100 hover:border-orange-500 px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                                  >
                                    <Send size={11} /> Submit
                                  </button>
                                )}
                                <button onClick={() => { setEditingVehicle(v); setShowAddModal(true); }}
                                  className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-500 border border-blue-100 hover:border-blue-500 px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                                >
                                  <Edit3 size={11} /> Edit
                                </button>
                                <button onClick={() => setShowDeleteConfirm(v.id)}
                                  className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                                >
                                  <Trash2 size={11} /> Delete
                                </button>
                                {v.status === "approved" && (
                                  <span className="ml-auto text-[9px] text-emerald-600 font-black flex items-center gap-1 select-none">
                                    <Eye size={11} /> Listed Live
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Delete Confirmation Sheet/Modal */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setShowDeleteConfirm(null)} 
                      />
                      <motion.div 
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 text-center space-y-5 relative z-10 sm:border sm:border-slate-100"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500">
                          <Trash2 size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Delete Listing?</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-[250px] mx-auto leading-relaxed">This listing will be permanently removed. This action cannot be undone.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                          <button onClick={() => setShowDeleteConfirm(null)}
                            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500 cursor-pointer order-2 sm:order-1"
                          >Cancel</button>
                          <button onClick={() => handleDelete(showDeleteConfirm)}
                            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-rose-500/10 order-1 sm:order-2"
                          >Delete</button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: INQUIRIES ── */}
              {tab === "inquiries" && (
                <div className="space-y-4">
                  {inquiries.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 bg-white border border-dashed border-slate-200/80 rounded-2xl">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-500">
                        <MessageCircle size={24} />
                      </div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No inquiries received</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">When potential buyers ask about your cars, their details will display here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Filter header */}
                      <div className="flex gap-1.5 overflow-x-auto flex-nowrap -mx-1 px-1 pb-1 scrollbar-none bg-white p-3 border border-slate-200/80 rounded-2xl shadow-sm">
                        {INQUIRY_STATUSES.map(st => {
                          const count = st === "all" ? inquiries.length : inquiries.filter(i => i.status === st).length;
                          const active = inquiryFilter === st;
                          return (
                            <button key={st} onClick={() => setInquiryFilter(st)}
                              className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                active ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
                              }`}
                            >
                              {st} <span className="opacity-60 font-bold">({count})</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Inquiries list */}
                      <div className="space-y-3.5">
                        {filteredInquiries.map(inq => {
                          const statusConfig = {
                            new: "bg-blue-50 text-blue-700 border-blue-200",
                            contacted: "bg-amber-50 text-amber-700 border-amber-200",
                            negotiating: "bg-purple-50 text-purple-700 border-purple-200",
                            sold: "bg-emerald-50 text-emerald-700 border-emerald-200",
                            cancelled: "bg-rose-50 text-rose-700 border-rose-200",
                          }[inq.status] || "bg-slate-50 text-slate-600 border-slate-200";

                          return (
                            <div key={inq.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm">
                                    {(inq.buyerName || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="text-sm font-black text-slate-900">{inq.buyerName || "Anonymous Buyer"}</h3>
                                    <p className="text-[11px] text-slate-400 font-semibold mt-1 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                                      {inq.buyerEmail && <span>{inq.buyerEmail}</span>}
                                      {inq.buyerPhone && (
                                        <>
                                          <span className="hidden sm:inline text-slate-300">•</span>
                                          <span>{inq.buyerPhone}</span>
                                        </>
                                      )}
                                    </p>
                                    {inq.vehicleBrand && (
                                      <p className="text-[10px] text-orange-600 font-black mt-2.5 flex items-center gap-1 bg-orange-50 border border-orange-100/50 rounded-lg px-2 py-1.5 w-fit">
                                        <Car size={11} /> Re: {inq.vehicleBrand} {inq.vehicleModel || ""}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0 shrink-0 gap-2">
                                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${statusConfig}`}>
                                    {inq.status}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 select-none"><Calendar size={10} /> {new Date(inq.inquiryDate).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {inq.message && (
                                <div className="mt-4 bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Buyer Inquiry Note</p>
                                  <p className="text-xs text-slate-700 italic leading-relaxed">"{inq.message}"</p>
                                </div>
                              )}

                              <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                                {inq.buyerEmail && (
                                  <a href={`mailto:${inq.buyerEmail}?subject=Feleke Cars - Inquiry response on ${inq.vehicleBrand || "vehicle"} ${inq.vehicleModel || ""}`}
                                    className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl transition cursor-pointer no-underline shadow-sm hover:shadow active:scale-[0.98]"
                                  >
                                    <MessageCircle size={13} /> Email Reply
                                  </a>
                                )}
                                {inq.buyerPhone && (
                                  <a href={`tel:${inq.buyerPhone}`}
                                    className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition cursor-pointer no-underline shadow-sm hover:shadow active:scale-[0.98]"
                                  >
                                    <Phone size={13} /> Call Buyer
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: ACTIVITY ── */}
              {tab === "activity" && (
                <div className="space-y-5 sm:space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <ActivityChart listings={listings} />
                    
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-xs font-black text-slate-800 mb-5 flex items-center gap-2">
                        <Users size={14} className="text-orange-500 shrink-0" />
                        <span className="uppercase tracking-wider">Engagement Overview</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>Listing Live-to-Total ratio</span>
                          <span className="text-slate-900 font-extrabold">{approvedListings.length} / {listings.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${listings.length > 0 ? (approvedListings.length / listings.length) * 100 : 0}%` }} 
                          />
                        </div>
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Conversion Rate</span>
                            <span className="text-lg font-black text-orange-500 block leading-none">
                              {listings.length > 0 ? Math.round((soldListings.length / listings.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="space-y-1 border-l border-slate-100 pl-4">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Review</span>
                            <span className="text-lg font-black text-slate-800 block leading-none">{pendingListings.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                        <Clock size={14} className="text-slate-500 shrink-0" />
                        <span className="uppercase tracking-wider">Recent Activity Logs</span>
                      </h3>
                    </div>
                    {listings.length === 0 && inquiries.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No activities recorded</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {[...listings.slice(0, 5).map(v => ({
                          type: "listing" as const,
                          title: `${v.status === "approved" ? "Listed" : v.status === "sold" ? "Sold" : "Submitted"}: ${v.brand} ${v.model}`,
                          detail: `${v.price.toLocaleString()} ETB`,
                          time: v.createdAt || new Date().toISOString(),
                        })), ...inquiries.slice(0, 5).map(i => ({
                          type: "inquiry" as const,
                          title: `New inquiry from ${i.buyerName || "Anonymous"}`,
                          detail: `Re: ${i.vehicleBrand} ${i.vehicleModel || ""}`,
                          time: i.inquiryDate,
                        }))].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/40 transition">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              item.type === "listing" 
                                ? "bg-orange-50/80 border-orange-100/50 text-orange-500" 
                                : "bg-blue-50/80 border-blue-100/50 text-blue-500"
                            }`}>
                              {item.type === "listing" ? <Car size={14} /> : <MessageCircle size={14} />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{item.detail}</p>
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">{new Date(item.time).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Mobile Bottom Navigation Bar (lg:hidden) ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 flex items-center justify-around safe-area-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.06)] h-16">
          {navItems.map(item => {
            const isActive = tab === item.key;
            return (
              <button key={item.key} onClick={() => setTab(item.key)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 transition cursor-pointer ${
                  isActive ? "text-orange-500" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className="relative">
                  <item.icon size={20} className={isActive ? "scale-105" : ""} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-orange-500 text-white text-[8px] font-black px-1 rounded-full min-w-[14px] text-center leading-4 shadow-sm border border-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${isActive ? "text-orange-500 font-black" : "text-slate-400 font-bold"}`}>
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
          <button onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 text-slate-400 hover:text-orange-500 transition cursor-pointer"
          >
            <div className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 border-2 border-white transform active:scale-95 transition-transform">
              <Plus size={20} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-400">Add</span>
          </button>
        </nav>
      </main>

      {/* Add Listing Stepper Modal */}
      {showAddModal && (
        <AddListingModal
          sellerId={userId}
          editing={editingVehicle}
          onClose={handleCloseModal}
          onSaved={handleSave}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}

/* ── 3-STEP VEHICLE FORM WIZARD ── */
function AddListingModal({ sellerId, editing, onClose, onSaved, onNotify }: {
  sellerId: string;
  editing?: VehicleListing | null;
  onClose: () => void;
  onSaved: (v: VehicleListing) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear(), regYear: new Date().getFullYear(),
    price: 0, originalPrice: 0, mileage: 0,
    fuelType: "Gasoline", transmission: "Automatic", driveType: "4WD",
    location: "Addis Ababa", description: "", color: "", phone: "",
    condition: "Used", bodyType: "SUV",
    doors: 4, seats: 5, engineSize: "", engineType: "V6", horsepower: 0,
    chassisNumber: "", commissionRate: 1.0,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editing;

  useEffect(() => {
    if (editing) {
      setForm({
        brand: editing.brand, model: editing.model,
        year: editing.year || new Date().getFullYear(),
        regYear: editing.year || new Date().getFullYear(),
        price: editing.price, originalPrice: editing.originalPrice || 0,
        mileage: editing.mileage || 0,
        fuelType: editing.fuelType || "Gasoline",
        transmission: editing.transmission || "Automatic",
        driveType: editing.driveType || "4WD",
        location: editing.location || "Addis Ababa",
        description: editing.description || "", color: editing.color || "",
        phone: "",
        condition: editing.condition || "Used",
        bodyType: editing.bodyType || "SUV",
        doors: editing.doors || 4, seats: editing.seats || 5,
        engineSize: editing.engineSize || "", engineType: editing.engineType || "V6",
        horsepower: editing.horsepower || 0,
        chassisNumber: editing.chassisNumber || "", commissionRate: editing.commissionRate || 1.0,
      });
      if (editing.imageUrl) setUploadedImages([editing.imageUrl]);
      if (editing.gallery) {
        const gallery = typeof editing.gallery === "string" ? JSON.parse(editing.gallery) : editing.gallery;
        if (Array.isArray(gallery)) setUploadedImages(prev => [...new Set([...prev, ...gallery])]);
      }
    }
  }, [editing]);

  useScrollLock(true);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.brand || !form.model) {
      setError("Brand and model are required.");
      onNotify("Brand and model are required.", "error");
      setStep(1);
      return;
    }
    if (form.price <= 0) {
      setError("Price is required and must be positive.");
      onNotify("Price is required and must be positive.", "error");
      setStep(3);
      return;
    }
    setSubmitting(true);
    try {
      const primaryImage = uploadedImages.length > 0 ? uploadedImages[0] : undefined;
      const body = {
        broker_id: sellerId,
        brand: form.brand, model: form.model, year: form.year,
        registration_year: form.regYear,
        price: form.price, original_price: form.originalPrice || form.price,
        mileage: form.mileage,
        fuel_type: form.fuelType, transmission: form.transmission,
        drive_type: form.driveType,
        location: form.location, description: form.description,
        image_url: primaryImage,
        gallery_images: uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : undefined,
        color: form.color || undefined, phone: form.phone || undefined,
        condition: form.condition, body_type: form.bodyType,
        doors: form.doors, seats: form.seats,
        engine_size: form.engineSize || undefined,
        engine_type: form.engineType,
        horsepower: form.horsepower || undefined,
        chassis_number: form.chassisNumber || undefined,
        commission_rate: form.commissionRate,
        ...(isEditing ? {} : { status: "pending" }),
      };
      const res = await fetch(isEditing ? `/api/vehicles/${editing!.id}` : "/api/vehicles", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { 
        const data = await res.json(); 
        onSaved(data); 
      } else { 
        const err = await res.json(); 
        setError(err.error || "Failed to save listing.");
        onNotify(err.error || "Failed to save listing.", "error"); 
      }
    } catch { 
      setError("Network error. Please try again.");
      onNotify("Network error. Please try again.", "error"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!form.brand || !form.model)) {
      setError("Please select Brand and fill Model first.");
      onNotify("Please select Brand and fill Model first.", "error");
      return;
    }
    setError(null);
    setStep(s => Math.min(s + 1, 3));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const currentModels = useMemo(() => {
    return BRAND_MODELS[form.brand] || [];
  }, [form.brand]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl sm:border sm:border-slate-200/80 max-h-[94vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm shrink-0">
              {isEditing ? <Edit3 size={15} /> : <Plus size={15} />}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">{isEditing ? "Edit Listing" : "New Vehicle Listing"}</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition">
            <X size={16} />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="px-5 sm:px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0 select-none">
          {[
            { nr: 1, label: "Info" },
            { nr: 2, label: "Specs" },
            { nr: 3, label: "Media" }
          ].map((item, i) => {
            const active = step === item.nr;
            const done = step > item.nr;
            return (
              <React.Fragment key={item.nr}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition ${
                    active 
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/20 animate-pulse" 
                      : done 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-slate-200 border-slate-200 text-slate-500"
                  }`}>
                    {done ? <Check size={11} /> : item.nr}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${active ? "text-orange-500" : done ? "text-emerald-600" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 transition-colors ${
                    step > item.nr ? "bg-emerald-500" : "bg-slate-200"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex-grow overflow-y-auto p-5 sm:p-6 pb-24 sm:pb-6 font-sans text-slate-800">
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2.5 text-rose-800 text-xs font-semibold mb-4 animate-fade-in">
              <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
                  <Car size={12} /> Brand & Model
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Brand *</label>
                    <Combobox value={form.brand} onChange={v => {
                      const models = BRAND_MODELS[v] || [];
                      const stillValid = models.includes(form.model);
                      setForm(p => ({ ...p, brand: v, model: stillValid ? p.model : "" }));
                    }} options={BRANDS} placeholder="Select Brand..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Model *</label>
                    <Combobox value={form.model} onChange={v => handleChange("model", v)} options={currentModels} placeholder={form.brand ? "Select Model..." : "Select Brand First"} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
                  <Calendar size={12} /> Manufacture & Classification
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Year</label>
                    <input type="number" value={form.year} onChange={e => handleChange("year", parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Reg. Year</label>
                    <input type="number" value={form.regYear} onChange={e => handleChange("regYear", parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Condition</label>
                    <select value={form.condition} onChange={e => handleChange("condition", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                      {CONDITIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Body Type</label>
                    <select value={form.bodyType} onChange={e => handleChange("bodyType", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                      {BODY_TYPES.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Chassis / VIN Number</label>
                <input value={form.chassisNumber} onChange={e => handleChange("chassisNumber", e.target.value)} placeholder="Enter full chassis number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
              </div>
            </motion.div>
          )}

          {/* STEP 2: Specifications */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
                  <Settings size={12} /> Drivetrain & Spec
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Mileage (km)</label>
                    <input type="number" value={form.mileage || ""} onChange={e => handleChange("mileage", parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Fuel Type</label>
                    <select value={form.fuelType} onChange={e => handleChange("fuelType", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                      {FUEL_TYPES.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Transmission</label>
                    <select value={form.transmission} onChange={e => handleChange("transmission", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                      {TRANSMISSIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Drive Type</label>
                    <select value={form.driveType} onChange={e => handleChange("driveType", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                      {DRIVE_TYPES.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Exterior Color</label>
                  <Combobox value={form.color} onChange={v => handleChange("color", v)} options={COLORS} placeholder="Select Color..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Doors</label>
                  <select value={form.doors} onChange={e => handleChange("doors", parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                    {DOOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Seats</label>
                  <select value={form.seats} onChange={e => handleChange("seats", parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                    {SEAT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Engine Displacement</label>
                  <input value={form.engineSize} onChange={e => handleChange("engineSize", e.target.value)} placeholder="e.g. 2.0L"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Engine Layout</label>
                  <select value={form.engineType} onChange={e => handleChange("engineType", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400">
                    {ENGINE_TYPES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Horsepower (HP)</label>
                  <input type="number" value={form.horsepower || ""} onChange={e => handleChange("horsepower", parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Location *</label>
                  <Combobox value={form.location} onChange={v => handleChange("location", v)} options={LOCATIONS} placeholder="Select Location..." />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Pricing & Media */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
                  <DollarSign size={12} /> Pricing Values
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Selling Price (ETB) *</label>
                    <input type="number" required value={form.price || ""} onChange={e => handleChange("price", parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">MSRP / Original Price</label>
                    <input type="number" value={form.originalPrice || ""} onChange={e => handleChange("originalPrice", parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Commission (%)</label>
                    <input type="number" step="0.1" value={form.commissionRate} onChange={e => handleChange("commissionRate", parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
                  <Store size={12} /> Gallery & Description
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 text-[11px] font-bold cursor-pointer"
                      >×</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Main</span>}
                    </div>
                  ))}
                  <label className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-slate-100/50">
                    <Plus size={16} className="text-slate-400" />
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Upload</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from({ length: files.length }, (_, i) => files[i]).forEach((file: File) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => { if (ev.target?.result) setUploadedImages(prev => [...prev, ev.target.result as string]); };
                        reader.readAsDataURL(file);
                      });
                      e.target.value = "";
                    }} />
                  </label>
                </div>
                {uploadedImages.length === 0 && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-2.5 flex items-center gap-1.5"><AlertCircle size={11} className="text-amber-500" /> Add at least one photo (first will be the main image)</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Contact Phone</label>
                  <input value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+251 9XX XXX XXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-400" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Description</label>
                  <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={2}
                    placeholder="Vehicle features, tax/custom status, service logs..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-400 resize-none" />
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="absolute sm:static bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 p-4 flex gap-3 shrink-0">
          <button type="button" onClick={step === 1 ? onClose : handlePrevStep}
            className="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500 cursor-pointer text-center"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          
          {step < 3 ? (
            <button type="button" onClick={handleNextStep}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-orange-500/10 text-center flex items-center justify-center gap-1.5"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer disabled:opacity-60 shadow-md shadow-orange-500/10 text-center flex items-center justify-center gap-1.5"
            >
              {submitting ? "Saving..." : isEditing ? "Update Listing" : "Submit Listing"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
