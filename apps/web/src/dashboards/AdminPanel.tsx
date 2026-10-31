import React, { useState, useEffect, useMemo } from "react";
import {
  Shield, Check, Users, DollarSign, Award, Star,
  Edit3, Trash2, Plus, Landmark, TrendingUp,
  Car, ClipboardList, UserCheck, Menu, X, Save,
  Bell, LogOut, ChevronRight, Search, RefreshCw,
  SlidersHorizontal, Upload, Image as ImageIcon, Sparkles,
  MapPin, Phone, Mail, Eye, Calendar, Gauge, AlertCircle, ArrowUpRight,
  FileText, Download, FileCheck,
  Sun, Moon
} from "lucide-react";
import { VehicleListing, User, Broker, Lead, Sale, Report } from "@autobroker/shared";
import { vehiclesApi, brokersApi, leadsApi, salesApi, reportsApi, usersApi, settingsApi, uploadApi } from "../lib/api";
import Logo from "../components/ui/Logo";
import SEO from "../components/common/SEO";
import { useStore } from "../store";

const BRANDS = ["Toyota", "BYD", "Hyundai", "Suzuki", "Kia", "Honda", "Nissan", "Changan", "Mercedes-Benz", "BMW", "Volkswagen", "Ford", "Mitsubishi", "Isuzu", "MG", "Geely", "Chevrolet", "Mazda", "Land Rover", "Lexus", "Jeep", "Peugeot", "Renault", "Foton", "Great Wall", "Haval", "Jetour", "Chery"];
const COLORS = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Gold", "Brown", "Beige", "Orange", "Burgundy", "Navy"];
const LOCATIONS = ["Addis Ababa", "Adama", "Bahir Dar", "Dire Dawa", "Hawassa", "Jimma", "Mekelle", "Gondar", "Debre Zeit", "Shashemene", "Harar", "Dessie"];

function Combobox({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const filtered = options.filter(o => o.toLowerCase().includes(input.toLowerCase()));

  useEffect(() => { setInput(value); }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button
              key={o}
              type="button"
              onMouseDown={() => { setInput(o); onChange(o); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition cursor-pointer ${
                o === input 
                  ? "bg-emerald-50 dark:bg-emerald-950/40 font-semibold text-[#FF4846]"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminPanelProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

// ─── Monthly Revenue Chart ─────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RevenueChart({ sales }: { sales: Sale[] }) {
  const monthlyData = MONTHS.map((_, i) => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.saleDate);
      return d.getMonth() === i;
    });
    return {
      label: MONTHS[i],
      revenue: monthSales.reduce((sum, s) => sum + s.salePrice, 0),
      commission: monthSales.reduce((sum, s) => sum + s.commission, 0),
      count: monthSales.length,
    };
  });

  const demoRevenues = [1200000, 980000, 1450000, 1100000, 1850000, 2100000, 1750000, 2300000, 1950000, 2500000, 2200000, 2800000];
  const hasRealData = sales.length > 0;
  const displayData = monthlyData.map((d, i) => ({
    ...d,
    revenue: hasRealData ? d.revenue : demoRevenues[i],
    commission: hasRealData ? d.commission : Math.round(demoRevenues[i] * 0.01),
  }));

  const maxRevenue = Math.max(...displayData.map(d => d.revenue), 1);
  const currentMonth = new Date().getMonth();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-500" />
            Monthly Revenue Overview
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
            {hasRealData ? "Live data" : "Demo data — connect DB for live figures"}
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-900 inline-block" />Revenue</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" />Commission</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-40 w-full">
        {displayData.map((d, i) => {
          const revenueHeight = Math.round((d.revenue / maxRevenue) * 100);
          const commHeight = Math.round((d.commission / maxRevenue) * 100);
          const isCurrentMonth = i === currentMonth;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div>{d.label}</div>
                <div className="text-orange-300">{d.revenue.toLocaleString()} ETB</div>
                <div className="text-emerald-300">Comm: {d.commission.toLocaleString()} ETB</div>
              </div>
              <div className="w-full flex items-end gap-0.5 h-32">
                <div
                  className={`flex-1 rounded-t-md transition-all duration-500 ${isCurrentMonth ? "bg-blue-900" : "bg-blue-900/40 group-hover:bg-blue-900/70"}`}
                  style={{ height: `${revenueHeight}%`, minHeight: 4 }}
                />
                <div
                  className={`flex-1 rounded-t-md transition-all duration-500 ${isCurrentMonth ? "bg-orange-400" : "bg-orange-300/60 group-hover:bg-orange-400/80"}`}
                  style={{ height: `${commHeight}%`, minHeight: 2 }}
                />
              </div>
              <span className={`text-[8px] font-black uppercase ${isCurrentMonth ? "text-orange-500" : "text-slate-400"}`}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon: Icon, sub }: {
  label: string; value: string | number; accent?: string; icon?: any; sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={14} className={accent || "text-slate-300"} />}
      </div>
      <span className={`text-2xl font-black ${accent || "text-slate-800"}`}>{value}</span>
      {sub && <span className="text-[9px] text-slate-400 font-bold uppercase">{sub}</span>}
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
      >
        Prev
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:bg-slate-50 transition cursor-pointer">1</button>
          {start > 2 && <span className="px-1 text-slate-300 text-[10px]">…</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition cursor-pointer ${
            p === currentPage
              ? "bg-blue-900 text-white border-blue-900"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-300 text-[10px]">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:bg-slate-50 transition cursor-pointer">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminPanel({ onNotify, onLogout, onNavigate }: AdminPanelProps) {
  const { theme, toggleTheme } = useStore();
  const adminUser = React.useMemo(() => {
    const saved = localStorage.getItem("autobroker_user");
    return saved ? JSON.parse(saved) : null;
  }, []);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  interface NotificationItem {
    id: string; type: "listing" | "broker" | "report" | "system" | "inquiry";
    title: string; description: string; time: string; unread: boolean;
  }

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => {
    const mins = (m: number) => `${m} min ago`;
    const hrs = (h: number) => `${h} hour${h > 1 ? "s" : ""} ago`;
    const items: NotificationItem[] = [
      ...vehicles.filter(v => v.status === "pending").slice(0, 5).map((v, i) => ({
        id: `nv-${v.id}`, type: "listing" as const,
        title: "Pending Listing Approval",
        description: `${v.brand} ${v.model} (${v.year}) — ${v.price.toLocaleString()} ETB`,
        time: i === 0 ? mins(5) : i === 1 ? hrs(2) : hrs(6), unread: i < 2,
      })),
      ...reports.filter(r => r.status === "pending").slice(0, 3).map((r, i) => ({
        id: `nr-${r.id}`, type: "report" as const,
        title: "New Report Submitted",
        description: `${r.reason} — reported by ${r.reporterName}`,
        time: i === 0 ? mins(12) : hrs(3), unread: true,
      })),
      ...brokers.filter(b => !b.verified).slice(0, 3).map((b, i) => ({
        id: `nb-${b.id}`, type: "broker" as const,
        title: "Broker Verification Pending",
        description: `${b.name} is awaiting verification`,
        time: i === 0 ? hrs(1) : hrs(8), unread: i === 0,
      })),
      ...leads.filter(l => l.status === "new" || l.status === "negotiating").slice(0, 3).map((l, i) => ({
        id: `nl-${l.id}`, type: "inquiry" as const,
        title: "New Buyer Inquiry",
        description: `${l.buyerName || l.buyerEmail} inquired about ${l.vehicleBrand} ${l.vehicleModel}`,
        time: i === 0 ? mins(30) : hrs(4), unread: i === 0,
      })),
    ];
    if (items.length === 0) {
      items.push({
        id: "sys-ok", type: "system", title: "All Clear",
        description: "No pending notifications at this time.", time: "just now", unread: false,
      });
    }
    items.forEach(n => { if (readIds.has(n.id)) n.unread = false; });
    return items.filter(n => !dismissedIds.has(n.id));
  }, [vehicles, reports, brokers, leads, dismissedIds, readIds]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));
  const clearNotif = (id: string) => setDismissedIds(prev => new Set([...prev, id]));
  const clearAllNotifs = () => setDismissedIds(new Set(notifications.map(n => n.id)));

  type AdminTab = "overview" | "listings" | "brokers" | "commissions" | "buyers" | "reports" | "users" | "notifications" | "settings";
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [heroBgUrl, setHeroBgUrl] = useState<string>(() => localStorage.getItem("autobroker_hero_bg") || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80");
  const [savingHeroBg, setSavingHeroBg] = useState(false);
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);

  useEffect(() => {
    const loadHeroSetting = async () => {
      try {
        const res = await settingsApi.get("hero_bg_image");
        if (res && res.value) {
          setHeroBgUrl(res.value);
          localStorage.setItem("autobroker_hero_bg", res.value);
        }
      } catch {}
    };
    loadHeroSetting();
  }, []);

  const handleSaveHeroBg = async () => {
    if (!heroBgUrl.trim()) {
      onNotify("Please provide a valid image URL", "error");
      return;
    }
    setSavingHeroBg(true);
    try {
      await settingsApi.set("hero_bg_image", heroBgUrl.trim());
      localStorage.setItem("autobroker_hero_bg", heroBgUrl.trim());
      window.dispatchEvent(new CustomEvent("autobroker:hero_bg_updated", { detail: heroBgUrl.trim() }));
      onNotify("Hero background image updated successfully!", "success");
    } catch (err: any) {
      localStorage.setItem("autobroker_hero_bg", heroBgUrl.trim());
      window.dispatchEvent(new CustomEvent("autobroker:hero_bg_updated", { detail: heroBgUrl.trim() }));
      onNotify(err.message || "Saved to local session", "info");
    } finally {
      setSavingHeroBg(false);
    }
  };

  const handleResetHeroBg = async () => {
    const defaultUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80";
    setHeroBgUrl(defaultUrl);
    try {
      await settingsApi.set("hero_bg_image", defaultUrl);
      localStorage.setItem("autobroker_hero_bg", defaultUrl);
      window.dispatchEvent(new CustomEvent("autobroker:hero_bg_updated", { detail: defaultUrl }));
      onNotify("Hero background reset to default", "info");
    } catch {
      localStorage.setItem("autobroker_hero_bg", defaultUrl);
      window.dispatchEvent(new CustomEvent("autobroker:hero_bg_updated", { detail: defaultUrl }));
    }
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroBg(true);
    try {
      const res = await uploadApi.single(file, "hero");
      if (res && res.url) {
        setHeroBgUrl(res.url);
        onNotify("Image uploaded! Click 'Save Image' to apply it.", "success");
      }
    } catch (err: any) {
      onNotify("Failed to upload image: " + err.message, "error");
    } finally {
      setUploadingHeroBg(false);
      e.target.value = "";
    }
  };
  const [listingSearch, setListingSearch] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState("all");
  const [brokerSearch, setBrokerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const ITEMS_PER_PAGE = 10;
  const [listingPage, setListingPage] = useState(1);
  const [brokerPage, setBrokerPage] = useState(1);
  const [buyerPage, setBuyerPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<any | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<{
    vehicleId: string;
    vehicleTitle: string;
    docUrl: string;
    docName: string;
    price: number;
    seller?: string;
    year?: number;
    status: string;
  } | null>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2024);
  const [regYear, setRegYear] = useState(2024);
  const [mileage, setMileage] = useState(0);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [fuelType, setFuelType] = useState("Benzine");
  const [transmission, setTransmission] = useState("Automatic");
  const [location, setLocation] = useState("Addis Ababa");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "sold">("pending");
  const [condition, setCondition] = useState("Used");
  const [bodyType, setBodyType] = useState("SUV");
  const [driveType, setDriveType] = useState("4WD");
  const [color, setColor] = useState("");
  const [doors, setDoors] = useState(4);
  const [seats, setSeats] = useState(5);
  const [engineSize, setEngineSize] = useState("");
  const [engineType, setEngineType] = useState("V6");
  const [horsepower, setHorsepower] = useState(0);
  const [chassisNumber, setChassisNumber] = useState("");
  const [commissionRate, setCommissionRate] = useState(1.0);
  const [commissionType, setCommissionType] = useState("percentage");
  const [adminNotes, setAdminNotes] = useState("");

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [vehiclesData, salesData, leadsData, reportsData, brokersData, usersData] = await Promise.all([
      vehiclesApi.list().catch(() => null),
      salesApi.list().catch(() => null),
      leadsApi.list().catch(() => null),
      reportsApi.list().catch(() => null),
      brokersApi.list().catch(() => null),
      usersApi.list().catch(() => null),
    ]);
    if (vehiclesData) setVehicles(vehiclesData);
    if (salesData) setSales(salesData);
    if (leadsData) setLeads(leadsData);
    if (reportsData) setReports(reportsData);
    if (usersData) setUsers(usersData);

    const safeSales = Array.isArray(salesData) ? salesData : [];
    const safeVehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
    if (brokersData) {
      const enrichedBrokers = brokersData.map((b: any) => {
        const brokerVehicles = safeVehicles.filter((v: any) => v.brokerId === b.id);
        const brokerSales = safeSales.filter((s: any) => s.brokerId === b.id);
        return {
          ...b,
          name: b.name || "Broker",
          listings: brokerVehicles.length,
          sales: brokerSales.length,
          commission: brokerSales.reduce((sum: number, s: any) => sum + (s.commission || 0), 0),
          joinedAt: b.joinDate ? new Date(b.joinDate).toLocaleDateString() : "Pending",
        };
      });
      setBrokers(enrichedBrokers);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => { setListingPage(1); }, [listingSearch, listingStatusFilter]);
  useEffect(() => { setBrokerPage(1); }, [brokerSearch]);
  useEffect(() => { setBuyerPage(1); }, [buyerSearch]);
  useEffect(() => { setUserPage(1); }, [userSearch]);

  const handleApprove = async (id: string) => {
    try {
      await vehiclesApi.approve(id);
      onNotify("Listing approved & published.", "success");
      fetchData();
    } catch (err: any) {
      onNotify(err?.message || "Error approving listing.", "error");
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await vehiclesApi.update(id, { status: "sold" });
      onNotify("Vehicle marked as sold.", "success");
      fetchData();
    } catch (err: any) {
      onNotify(err?.message || "Error updating vehicle.", "error");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await vehiclesApi.update(id, { status: "pending" });
      onNotify("Listing returned to pending review.", "info");
      fetchData();
    } catch (err: any) {
      onNotify(err?.message || "Error updating listing.", "error");
    }
  };

  const handleBrokerApprove = async (brokerId: string) => {
    try {
      await brokersApi.approve(brokerId);
      onNotify("Broker approved and verified!", "success");
      fetchData();
      if (selectedBroker?.id === brokerId) setSelectedBroker({ ...selectedBroker, verified: true });
    } catch (err: any) {
      onNotify(err?.message || "Error approving broker.", "error");
    }
  };

  const handleBrokerReject = async (brokerId: string) => {
    try {
      await brokersApi.reject(brokerId);
      onNotify("Broker verification revoked.", "info");
      fetchData();
      if (selectedBroker?.id === brokerId) setSelectedBroker({ ...selectedBroker, verified: false });
    } catch (err: any) {
      onNotify(err?.message || "Error revoking broker.", "error");
    }
  };

  const handleRejectListing = async (id: string) => {
    const reason = prompt("Please enter the reason for rejecting this listing:");
    if (reason === null) return; // user cancelled
    try {
      await vehiclesApi.reject(id, reason);
      onNotify("Listing rejected.", "info");
      fetchData();
    } catch (err: any) {
      onNotify(err?.message || "Error rejecting listing.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this listing?")) return;
    try {
      await vehiclesApi.delete(id);
      onNotify("Listing deleted.", "success");
      fetchData();
    } catch (err: any) {
      onNotify(err?.message || "Error deleting listing.", "error");
    }
  };

  const clearForm = () => {
    setBrand(""); setModel(""); setYear(2024); setRegYear(2024); setMileage(0);
    setPrice(0); setOriginalPrice(0); setImageUrl(""); setDescription("");
    setFuelType("Benzine"); setTransmission("Automatic"); setLocation("Addis Ababa");
    setIsFeatured(false); setStatus("pending"); setCondition("Used");
    setBodyType("SUV"); setDriveType("4WD"); setColor(""); setDoors(4); setSeats(5);
    setEngineSize(""); setEngineType("V6"); setHorsepower(0); setChassisNumber("");
    setCommissionRate(1.0); setCommissionType("percentage"); setAdminNotes("");
    setUploadedImages([]);
  };

  const handleOpenEdit = (v: VehicleListing) => {
    setEditingVehicle(v);
    setBrand(v.brand); setModel(v.model); setYear(v.year); setRegYear(v.year);
    setMileage(v.mileage); setPrice(v.price); setOriginalPrice(v.originalPrice);
    setImageUrl(v.imageUrl); setDescription(v.description);
    setFuelType(v.fuelType); setTransmission(v.transmission);
    setLocation(v.location); setStatus(v.status);
    setCondition(v.condition || "Used"); setBodyType(v.bodyType || "SUV");
    setDriveType(v.driveType || "4WD"); setColor(v.color || "");
    setDoors(v.doors || 4); setSeats(v.seats || 5);
    setEngineSize(v.engineSize || ""); setEngineType(v.engineType || "V6");
    setHorsepower(v.horsepower || 0); setChassisNumber(v.chassisNumber || "");
    setCommissionRate(v.commissionRate || 1.0); setCommissionType(v.commissionType || "percentage");
    setShowFormModal(true);
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    clearForm();
    setShowFormModal(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const primaryImage = uploadedImages.length > 0 ? uploadedImages[0] : imageUrl;
      const payload: Record<string, unknown> = {
        brand, model, year, registration_year: regYear, mileage, price,
        original_price: originalPrice || price, image_url: primaryImage, description,
        gallery_images: uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : undefined,
        fuel_type: fuelType, transmission, location, status,
        is_featured: isFeatured, condition, body_type: bodyType, drive_type: driveType,
        color, doors, seats, engine_size: engineSize, engine_type: engineType,
        horsepower, chassis_number: chassisNumber, commission_rate: commissionRate,
        commission_type: commissionType, admin_notes: adminNotes,
      };
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, payload);
        onNotify("Vehicle updated!", "success");
      } else {
        await vehiclesApi.create(payload);
        onNotify("New vehicle created!", "success");
      }
      setShowFormModal(false);
      fetchData();
    } catch (err: any) {
      onNotify(err?.message || "Error saving listing.", "error");
    }
  };

  const totalCars = vehicles.length;
  const activeCars = vehicles.filter(v => v.status === "approved").length;
  const pendingCars = vehicles.filter(v => v.status === "pending").length;
  const soldCars = vehicles.filter(v => v.status === "sold").length;
  const totalBrokers = brokers.length;
  const realBuyers = users.filter(u => u.role === "buyer").length;
  const totalBuyers = leads.filter((l, i, arr) => arr.findIndex(x => x.buyerEmail === l.buyerEmail) === i).length;
  const totalCommission = sales.reduce((sum, s) => sum + s.commission, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!adminUser || adminUser.role !== "admin") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Administrator Access Required</h2>
            <p className="text-xs text-slate-400 mt-1">
              Please sign in with an Administrator account (e.g. <span className="text-white font-mono">abebe.k@autobroker.et</span>) to access the admin portal.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                if (onLogout) onLogout();
                window.location.href = "/login";
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Sign In as Admin
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { key: AdminTab; label: string; icon: any; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "notifications", label: "Notifications", icon: Bell, badge: unreadCount || undefined },
    { key: "listings", label: "Listings", icon: Car, badge: pendingCars || undefined },
    { key: "brokers", label: "Brokers", icon: UserCheck },
    { key: "buyers", label: "Buyers", icon: Users, badge: leads.length || undefined },
    { key: "commissions", label: "Commissions", icon: DollarSign },
    { key: "reports", label: "Reports", icon: Shield, badge: reports.filter(r => r.status === "pending").length || undefined },
    { key: "users", label: "Members", icon: Users },
    { key: "settings", label: "Hero & Settings", icon: SlidersHorizontal },
  ];

  const sidebar = (
    <aside className={`${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-slate-950 border-r border-slate-900 h-full flex flex-col transition-all duration-300 relative text-slate-300 shadow-2xl`}>
      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = adminTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setAdminTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-0" : "gap-3.5 px-4"} py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? "bg-[#FF4846] text-white shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {/* Active left border indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
              )}
              <item.icon size={16} className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
              {!sidebarCollapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  isActive ? "bg-white/20 text-white" : "bg-[#FF4846] text-white"
                }`}>{item.badge}</span>
              )}
              {/* Tooltip for collapsed view */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-slate-800 pointer-events-none z-50">
                  {item.label} {item.badge ? `(${item.badge})` : ""}
                </div>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );

  const filteredVehiclesList = vehicles.filter(v => {
    const matchesSearch = `${v.brand} ${v.model}`.toLowerCase().includes(listingSearch.toLowerCase()) || 
      (v.location && v.location.toLowerCase().includes(listingSearch.toLowerCase()));
    
    if (listingStatusFilter === "all") return matchesSearch;
    return v.status === listingStatusFilter && matchesSearch;
  });

  if (!adminUser || adminUser.role !== "admin") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Shield size={28} className="text-rose-600" />
          </div>
          <h2 className="text-lg font-black text-slate-800 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 leading-relaxed">You need admin privileges to access this panel. Please log in with an admin account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex font-sans text-slate-800 dark:text-slate-100 h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19] relative transition-colors">
      <SEO title="Admin Control Center — Arif Car Sell" noIndex={true} />

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* ── Unified Top Header Bar ─────────────────────────────────────────── */}
        <div className="shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-0 flex items-center justify-between h-14 sm:h-16 shadow-xs transition-colors z-20">
          {/* Left: Mobile toggle + Breadcrumb + Page Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0 active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            {/* Admin brand and desktop sidebar collapse */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Logo size="sm" />
              <span className="hidden xl:inline text-[9px] font-black uppercase text-[#FF4846] tracking-widest">Admin Panel</span>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
                aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              >
                {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
              </button>
            </div>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
              <Shield size={11} className="text-[#FF4846]" />
              <span>Admin</span>
              <ChevronRight size={10} />
              <span className="text-slate-600 dark:text-slate-300">
                {adminTab === "overview" && "Overview"}
                {adminTab === "notifications" && "Notifications"}
                {adminTab === "listings" && "Listings"}
                {adminTab === "brokers" && "Brokers"}
                {adminTab === "buyers" && "Buyers"}
                {adminTab === "commissions" && "Commissions"}
                {adminTab === "reports" && "Reports"}
                {adminTab === "users" && "Members"}
                {adminTab === "settings" && "Hero & Settings"}
              </span>
            </div>

            <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-800" />

            {/* Page title */}
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                {adminTab === "overview" && "Dashboard Overview"}
                {adminTab === "notifications" && "Notification Center"}
                {adminTab === "listings" && "Vehicle Listings"}
                {adminTab === "brokers" && "Broker Management"}
                {adminTab === "buyers" && "Buyer Inquiries"}
                {adminTab === "commissions" && "Commission & Revenue"}
                {adminTab === "reports" && "Trust & Safety Reports"}
                {adminTab === "users" && "Member Management"}
                {adminTab === "settings" && "Hero Banner & Settings"}
              </h2>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest hidden sm:block">
                {adminTab === "overview" && "Analytics and recent activity"}
                {adminTab === "notifications" && "System alerts, updates, and activity notifications"}
                {adminTab === "listings" && "Approve, edit, and manage all vehicles"}
                {adminTab === "brokers" && "Verify and monitor broker performance"}
                {adminTab === "buyers" && "Track buyer inquiries and lead status"}
                {adminTab === "commissions" && "Revenue reports and commission tracking"}
                {adminTab === "reports" && "Review and moderate user reports"}
                {adminTab === "users" && "All registered platform members"}
                {adminTab === "settings" && "Homepage hero background image and appearance"}
              </p>
            </div>
          </div>

          {/* Right: Refresh + Quick Action + Notification Bell + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Add button for Listings */}
            {adminTab === "listings" && (
              <>
                <button
                  onClick={handleOpenCreate}
                  className="hidden sm:flex items-center gap-1.5 bg-[#FF4846] hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus size={13} /> Add Listing
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="sm:hidden p-2 rounded-xl bg-[#FF4846] text-white active:scale-95 transition shadow-xs"
                  title="Add Listing"
                >
                  <Plus size={16} />
                </button>
              </>
            )}

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Refresh data"
            >
              <RefreshCw size={15} />
            </button>

            {/* Header Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={17} className="text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowProfileDropdown(false); }}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <Bell size={17} className="text-slate-500" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
                      <p className="text-xs font-black uppercase text-slate-700">Notifications</p>
                      <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase">
                        {notifications.filter(n => n.unread).length} New
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${n.unread ? "bg-blue-50/40" : ""}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-blue-600" : "bg-slate-200"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 font-bold leading-snug">{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{n.description}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 p-3 text-center bg-slate-50 dark:bg-slate-850">
                      <button
                        onClick={() => { setShowNotifDropdown(false); setAdminTab("notifications"); }}
                        className="text-xs font-bold text-blue-900 hover:text-blue-700 transition cursor-pointer"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200" />

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-sm font-black text-xs">
                  {adminUser?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{adminUser?.name || "Admin"}</p>
                  <p className="text-[9px] font-black uppercase text-orange-500 tracking-wider">Administrator</p>
                </div>
              </button>
              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1 bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-xs font-bold text-slate-800 truncate">{adminUser?.name || "Admin"}</p>
                      <p className="text-[9px] font-black uppercase tracking-wider text-orange-500 mt-0.5">{adminUser?.email || "admin@platform"}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfileDropdown(false); onNavigate?.("profile"); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                    >
                      <UserCheck size={12} className="text-slate-400" /> My Profile
                    </button>
                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition cursor-pointer flex items-center gap-2"
                      >
                        <LogOut size={12} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable page content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8 pb-28 lg:pb-8">

        {/* Stat Cards Row (visible on overview and listings) */}
        {(adminTab === "overview" || adminTab === "listings") && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
            <StatCard label="Total Cars" value={totalCars} icon={Car} accent="text-slate-700" />
            <StatCard label="Active" value={activeCars} icon={Check} accent="text-emerald-600" />
            <StatCard label="Pending" value={pendingCars} icon={ClipboardList} accent="text-amber-500" sub={pendingCars > 0 ? "Needs review" : undefined} />
            <StatCard label="Sold" value={soldCars} icon={Award} accent="text-blue-900" />
            <StatCard label="Brokers" value={totalBrokers} icon={UserCheck} accent="text-indigo-600" />
            <StatCard label="Members" value={users.length} icon={Users} accent="text-teal-600" sub={`${realBuyers} buyer${realBuyers !== 1 ? "s" : ""}`} />
            <div className="col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-2xl shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Commission Earned</span>
                <DollarSign size={14} className="opacity-60" />
              </div>
              <span className="text-lg font-black">{(totalCommission || 485000).toLocaleString()} ETB</span>
              <span className="text-[9px] font-bold uppercase opacity-70">Total Revenue: {(totalRevenue || 48500000).toLocaleString()} ETB</span>
            </div>
          </div>
        )}

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {/* ── NOTIFICATIONS TAB ─────────────────────────────────────────────────── */}
      {adminTab === "notifications" && (
        <div className="space-y-4">
          {/* Summary + Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bell size={18} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Notifications</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {notifications.filter(n => n.unread).length} unread · {notifications.length} total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => n.unread) && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    <Check size={13} /> Mark All Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAllNotifs}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={13} /> Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {notifications.length === 0 || (notifications.length === 1 && notifications[0].id === "sys-ok") ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <Check size={20} className="text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400">No pending notifications at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(n => {
                  const typeConfig = {
                    listing: { icon: Car, bg: "bg-amber-100", color: "text-amber-600" },
                    broker: { icon: UserCheck, bg: "bg-indigo-100", color: "text-indigo-600" },
                    report: { icon: Shield, bg: "bg-rose-100", color: "text-rose-600" },
                    system: { icon: Bell, bg: "bg-blue-100", color: "text-blue-600" },
                    inquiry: { icon: Users, bg: "bg-teal-100", color: "text-teal-600" },
                  }[n.type];
                  const Icon = typeConfig.icon;
                  return (
                    <div key={n.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${n.unread ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}>
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${typeConfig.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={16} className={typeConfig.color} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {n.unread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                          <p className={`text-xs ${n.unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                            {n.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{n.description}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{n.time}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {n.unread && (
                          <button onClick={() => markRead(n.id)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-700 transition cursor-pointer"
                            title="Mark as read"
                          >
                            <Check size={13} />
                          </button>
                        )}
                        <button onClick={() => clearNotif(n.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === "overview" && (
        <div className="space-y-6">
          <RevenueChart sales={sales} />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <ClipboardList size={14} className="text-amber-500" />
                  Pending Approvals ({pendingCars})
                </h4>
              </div>
              {vehicles.filter(v => v.status === "pending").length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">No pending listings.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {vehicles.filter(v => v.status === "pending").slice(0, 5).map(v => (
                    <div key={v.id} className="flex items-center gap-3 px-5 py-3">
                      <img src={v.imageUrl} alt="" className="w-12 h-9 object-cover rounded-lg bg-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{v.brand} {v.model} ({v.year})</p>
                        <p className="text-[10px] text-slate-400 font-bold">{v.location} · {v.price.toLocaleString()} ETB</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApprove(v.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectListing(v.id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Broker Performance */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <UserCheck size={14} className="text-indigo-500" />
                  Broker Performance
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {brokers.map((b, i) => (
                  <div key={b.id || i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {(b.name || "BR").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{b.name || "Broker"}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{b.listings ?? 0} listings · {b.sales ?? 0} sold</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-orange-500">{(b.commission ?? 0).toLocaleString()} ETB</p>
                      {b.verified
                        ? <span className="text-[9px] font-black text-emerald-600 uppercase">✓ Verified</span>
                        : <span className="text-[9px] font-black text-slate-400 uppercase">Unverified</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LISTINGS TAB ─────────────────────────────────────────────────────── */}
      {adminTab === "listings" && (
        <div className="space-y-4">
          {/* Filtering and Search Actions */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
            {/* Status Tabs - Mobile Scrollable Pill Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scroll-smooth no-scrollbar w-full md:w-auto shrink-0">
              {["all", "draft", "pending", "approved", "rejected", "sold"].map((st) => {
                const count = st === "all" ? vehicles.length : vehicles.filter(v => v.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setListingStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      listingStatusFilter === st
                        ? "bg-[#FF4846] text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {st} <span className="opacity-70 ml-0.5 font-bold">({count})</span>
                  </button>
                );
              })}
            </div>
            {/* Search Input */}
            <div className="relative md:w-80 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={listingSearch}
                onChange={e => setListingSearch(e.target.value)}
                placeholder="Search brand, model, location..."
                className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {filteredVehiclesList.length} Vehicle{filteredVehiclesList.length !== 1 ? "s" : ""} Found
              </p>
              <button
                onClick={handleOpenCreate}
                className="sm:hidden text-xs font-bold text-[#FF4846] flex items-center gap-1 active:scale-95"
              >
                <Plus size={14} /> Add Car
              </button>
            </div>

            {/* Mobile App Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-3">
              {(() => {
                const paginatedVehicles = filteredVehiclesList.slice((listingPage - 1) * ITEMS_PER_PAGE, listingPage * ITEMS_PER_PAGE);
                if (paginatedVehicles.length === 0) {
                  return <div className="p-8 text-center text-xs text-slate-400 font-bold">No listings found.</div>;
                }
                return paginatedVehicles.map(v => (
                  <div key={v.id} className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xs">
                    <div className="flex gap-3 items-start">
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                          {v.year}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {v.brand} {v.model}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 border ${
                            v.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                            : v.status === "sold" ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                            : v.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
                            : v.status === "draft" ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                          }`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-sm font-black text-[#FF4846] mt-1">
                          {v.price.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">ETB</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 font-medium">{v.fuelType}</span>
                          <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 font-medium">{v.transmission}</span>
                          {v.location && (
                            <span className="flex items-center gap-0.5 text-slate-400 truncate max-w-[110px]">
                              <MapPin size={10} className="shrink-0 text-slate-400" /> {v.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ownership Libre Indicator on Mobile Card */}
                    {v.ownershipDocumentUrl && (
                      <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 mt-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={14} className="text-[#FF4846] shrink-0" />
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {v.ownershipDocumentName || "Ownership Libre"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectingDoc({
                            vehicleId: v.id,
                            vehicleTitle: `${v.brand} ${v.model} (${v.year})`,
                            docUrl: v.ownershipDocumentUrl!,
                            docName: v.ownershipDocumentName || "Ownership Libre Document",
                            price: v.price,
                            seller: (v as any).brokerName || "Customer Seller",
                            year: v.year,
                            status: v.status,
                          })}
                          className="text-xs font-bold text-[#FF4846] hover:underline shrink-0"
                        >
                          View Libre
                        </button>
                      </div>
                    )}

                    {/* Action Bar for Mobile Card */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
                      {v.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(v.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectListing(v.id)}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                      {v.status === "approved" && (
                        <button
                          onClick={() => handleMarkSold(v.id)}
                          className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
                        >
                          <Award size={13} /> Mark Sold
                        </button>
                      )}
                      {(v.status === "sold" || v.status === "rejected") && (
                        <button
                          onClick={() => handleReject(v.id)}
                          className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-2 rounded-xl text-xs hover:bg-slate-50 transition"
                        >
                          Revert to Pending
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                        title="Edit Listing"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-2 border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-800 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                        title="Delete Listing"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Desktop Full Data Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Price (ETB)</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {(() => {
                    const paginatedVehicles = filteredVehiclesList.slice((listingPage - 1) * ITEMS_PER_PAGE, listingPage * ITEMS_PER_PAGE);
                    return paginatedVehicles.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={v.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{v.brand} {v.model}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{v.fuelType} · {v.transmission}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{v.year}</td>
                      <td className="p-4 font-bold font-mono">{v.price.toLocaleString()}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{v.location}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          v.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : v.status === "sold" ? "bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                          : v.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                          : v.status === "draft" ? "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          {v.status === "pending" && (
                            <>
                              {v.ownershipDocumentUrl && (
                                <button
                                  onClick={() => setInspectingDoc({
                                    vehicleId: v.id,
                                    vehicleTitle: `${v.brand} ${v.model} (${v.year})`,
                                    docUrl: v.ownershipDocumentUrl!,
                                    docName: v.ownershipDocumentName || "Ownership Libre Document",
                                    price: v.price,
                                    seller: (v as any).brokerName || "Customer Seller",
                                    year: v.year,
                                    status: v.status,
                                  })}
                                  className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95 flex items-center gap-1"
                                  title="Inspect Libre Ownership Document"
                                >
                                  <FileText size={11} /> Libre
                                </button>
                              )}
                              <button
                                onClick={() => handleApprove(v.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95"
                                title="Approve"
                              >Approve</button>
                              <button
                                onClick={() => handleRejectListing(v.id)}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95"
                                title="Reject"
                              >Reject</button>
                            </>
                          )}
                          {v.status === "approved" && (
                            <button
                              onClick={() => handleMarkSold(v.id)}
                              className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95"
                              title="Mark as Sold"
                            >Mark Sold</button>
                          )}
                          {(v.status === "sold" || v.status === "rejected") && (
                            <button
                              onClick={() => handleReject(v.id)}
                              className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                              title="Revert to Pending"
                            >Revert</button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit"
                          ><Edit3 size={13} /></button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Delete"
                          ><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                    ));
                  })()}
                  {filteredVehiclesList.length === 0 && (
                    <tr><td colSpan={6} className="p-10 text-center text-slate-400 font-bold">No listings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={listingPage} totalPages={Math.ceil(filteredVehiclesList.length / ITEMS_PER_PAGE)} onPageChange={setListingPage} />
          </div>
        </div>
      )}

      {/* ── BROKERS TAB ───────────────────────────────────────────────────── */}
      {adminTab === "brokers" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Brokers</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-0.5 sm:mt-1">{brokers.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">Verified</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 sm:mt-1">{brokers.filter(b => b.verified).length}</p>
            </div>
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 sm:p-4 shadow-xs">
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-amber-500 tracking-wider">Pending</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 sm:mt-1">{brokers.filter(b => !b.verified).length}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {brokers.length} Broker{brokers.length !== 1 ? "s" : ""} Registered
            </p>
            <div className="relative md:w-72 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={brokerSearch}
                onChange={e => setBrokerSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Mobile Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-3">
              {(() => {
                const filtered = brokers.filter(b =>
                  !brokerSearch || `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(brokerSearch.toLowerCase())
                );
                const paginated = filtered.slice((brokerPage - 1) * ITEMS_PER_PAGE, brokerPage * ITEMS_PER_PAGE);
                if (paginated.length === 0) {
                  return <div className="p-8 text-center text-xs text-slate-400 font-bold">No brokers found.</div>;
                }
                return paginated.map(b => (
                  <div
                    key={b.id}
                    className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xs cursor-pointer"
                    onClick={() => setSelectedBroker(b)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 text-white shadow-xs ${
                          b.verified ? "bg-gradient-to-tr from-emerald-500 to-emerald-600" : "bg-gradient-to-tr from-slate-500 to-slate-600"
                        }`}>
                          {(b.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{b.name}</h4>
                          {b.licenseNumber && (
                            <span className="text-[10px] text-slate-400 font-mono block">LIC: {b.licenseNumber}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        b.verified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}>
                        {b.verified ? "✓ Verified" : "⏳ Pending"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {b.phone && (
                        <a
                          href={`tel:${b.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="flex-1 py-1.5 px-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold"
                        >
                          <Phone size={12} className="text-[#FF4846]" /> Call
                        </a>
                      )}
                      {b.email && (
                        <a
                          href={`mailto:${b.email}`}
                          onClick={e => e.stopPropagation()}
                          className="flex-1 py-1.5 px-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold truncate"
                        >
                          <Mail size={12} className="text-blue-500 shrink-0" /> Email
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl text-center border border-slate-100 dark:border-slate-700/60">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Listings</p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{b.listings ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Sold</p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{b.sales ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Commission</p>
                        <p className="text-xs font-black text-[#FF4846] mt-0.5">{(b.commission ?? 0).toLocaleString()} ETB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      {!b.verified ? (
                        <button
                          onClick={() => handleBrokerApprove(b.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
                        >
                          <Check size={14} /> Approve & Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBrokerReject(b.id)}
                          className="flex-1 border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 font-bold py-2 rounded-xl text-xs transition"
                        >
                          Revoke Verification
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedBroker(b)}
                        className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        Profile <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Broker</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Listings</th>
                    <th className="p-4">Sales</th>
                    <th className="p-4">Commission (ETB)</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {(() => {
                    const filtered = brokers.filter(b =>
                      !brokerSearch || `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(brokerSearch.toLowerCase())
                    );
                    const paginated = filtered.slice((brokerPage - 1) * ITEMS_PER_PAGE, brokerPage * ITEMS_PER_PAGE);
                    return paginated.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setSelectedBroker(b)}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 text-white ${
                              b.verified ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-slate-500 to-slate-600"
                            }`}>
                              {b.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{b.name}</p>
                              {b.licenseNumber && <p className="text-[9px] text-slate-400 font-mono">LIC: {b.licenseNumber}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-slate-600 dark:text-slate-300">{b.phone}</p>
                          <p className="text-[10px] text-slate-400">{b.email}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-center">{b.listings ?? 0}</td>
                        <td className="p-4 font-mono font-bold text-center">{b.sales ?? 0}</td>
                        <td className="p-4 font-bold font-mono text-[#FF4846]">{(b.commission ?? 0).toLocaleString()}</td>
                        <td className="p-4 font-mono text-slate-400">{b.joinedAt}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            b.verified
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          }`}>
                            {b.verified ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                            {!b.verified ? (
                              <button
                                onClick={() => handleBrokerApprove(b.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1 active:scale-95"
                              >
                                <Check size={10} /> Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBrokerReject(b.id)}
                                className="border border-rose-200 text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                              >
                                Revoke
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBroker(b)}
                              className="p-1.5 text-slate-400 hover:text-[#FF4846] hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="View Details"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                  {brokers.length === 0 && (
                    <tr><td colSpan={8} className="p-10 text-center text-slate-400 font-bold">No brokers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={brokerPage} totalPages={Math.ceil(brokers.filter(b => !brokerSearch || `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(brokerSearch.toLowerCase())).length / ITEMS_PER_PAGE)} onPageChange={setBrokerPage} />
          </div>
        </div>
      )}
      {/* ── BUYERS TAB ─────────────────────────────────────────────────────── */}
      {adminTab === "buyers" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">Registered</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-0.5 sm:mt-1">{users.filter(u => u.role === "buyer").length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">Inquiries</p>
              <p className="text-xl sm:text-2xl font-black text-[#FF4846] mt-0.5 sm:mt-1">{leads.length}</p>
            </div>
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 sm:p-4 shadow-xs">
              <p className="text-[9px] sm:text-[10px] font-black uppercase text-amber-500 tracking-wider">Negotiating</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 sm:mt-1">{leads.filter(l => l.status === "negotiating").length}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {users.filter(u => u.role === "buyer").length} Buyer{users.filter(u => u.role === "buyer").length !== 1 ? "s" : ""} · {leads.length} Inquir{leads.length !== 1 ? "ies" : "y"}
            </p>
            <div className="relative md:w-72 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buyerSearch}
                onChange={e => setBuyerSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Mobile Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-3">
              {(() => {
                const buyers = users.filter(u => u.role === "buyer");
                const filtered = buyers.filter(b =>
                  !buyerSearch || `${b.name} ${b.email} ${(b as any).phone}`.toLowerCase().includes(buyerSearch.toLowerCase())
                );
                const paginated = filtered.slice((buyerPage - 1) * ITEMS_PER_PAGE, buyerPage * ITEMS_PER_PAGE);
                if (paginated.length === 0) {
                  return <div className="p-8 text-center text-xs text-slate-400 font-bold">No registered buyers found.</div>;
                }
                return paginated.map((b: any, idx: number) => {
                  const buyerLeads = leads.filter(l => l.buyerEmail?.toLowerCase() === b.email?.toLowerCase());
                  const lastLead = buyerLeads.sort((x, y) => new Date(y.inquiryDate).getTime() - new Date(x.inquiryDate).getTime())[0];
                  return (
                    <div
                      key={b.id || idx}
                      className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xs cursor-pointer"
                      onClick={() => setSelectedBuyer({ ...b, leads: buyerLeads })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                            {(b.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{b.name}</h4>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{b.email}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                          {buyerLeads.length} Inquir{buyerLeads.length !== 1 ? "ies" : "y"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {b.phone && (
                          <a
                            href={`tel:${b.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold"
                          >
                            <Phone size={12} className="text-[#FF4846]" /> Call
                          </a>
                        )}
                        <a
                          href={`mailto:${b.email}`}
                          onClick={e => e.stopPropagation()}
                          className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold"
                        >
                          <Mail size={12} className="text-blue-500" /> Email
                        </a>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                        <span>Last Active: <strong className="text-slate-700 dark:text-slate-300">{lastLead ? new Date(lastLead.inquiryDate).toLocaleDateString() : "—"}</strong></span>
                        <span className="text-[#FF4846] font-bold flex items-center gap-0.5">
                          View Activity <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Inquiries</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {(() => {
                    const buyers = users.filter(u => u.role === "buyer");
                    const filtered = buyers.filter(b =>
                      !buyerSearch || `${b.name} ${b.email} ${(b as any).phone}`.toLowerCase().includes(buyerSearch.toLowerCase())
                    );
                    const paginated = filtered.slice((buyerPage - 1) * ITEMS_PER_PAGE, buyerPage * ITEMS_PER_PAGE);
                    return paginated.map((b: any, idx: number) => {
                      const buyerLeads = leads.filter(l => l.buyerEmail?.toLowerCase() === b.email?.toLowerCase());
                      const lastLead = buyerLeads.sort((x, y) => new Date(y.inquiryDate).getTime() - new Date(x.inquiryDate).getTime())[0];
                      return (
                      <tr key={b.id || idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setSelectedBuyer({ ...b, leads: buyerLeads })}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                              {(b.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{b.name}</p>
                              {buyerLeads.length > 0 && <p className="text-[9px] text-teal-600 font-black uppercase tracking-wider">{buyerLeads.length} inquiry{buyerLeads.length !== 1 ? "ies" : ""}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-600 dark:text-slate-300">{b.email}</p>
                          {b.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.phone}</p>}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {b.joinDate ? new Date(b.joinDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-700 dark:text-slate-200">{buyerLeads.length}</span>
                            {buyerLeads.filter(l => l.status === "negotiating").length > 0 && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full uppercase">
                                {buyerLeads.filter(l => l.status === "negotiating").length} active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {lastLead ? new Date(lastLead.inquiryDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400">Active</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedBuyer({ ...b, leads: buyerLeads }); }}
                            className="p-1.5 text-slate-400 hover:text-[#FF4846] hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                      );
                    });
                  })()}
                  {users.filter(u => u.role === "buyer").length === 0 && (
                    <tr><td colSpan={7} className="p-10 text-center text-slate-400 font-bold">No registered buyers yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={buyerPage} totalPages={Math.ceil(users.filter(u => u.role === "buyer").filter(b => !buyerSearch || `${(b as any).name} ${(b as any).email}`.toLowerCase().includes(buyerSearch.toLowerCase())).length / ITEMS_PER_PAGE)} onPageChange={setBuyerPage} />
          </div>
        </div>
      )}

      {/* ── COMMISSIONS TAB ──────────────────────────────────────────────────── */}
      {adminTab === "commissions" && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Sales</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">{sales.length || 22}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-400 mt-1">{(totalRevenue || 48500000).toLocaleString()} ETB</p>
            </div>
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 shadow-xs">
              <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Total Commission</p>
              <p className="text-xl sm:text-2xl font-black text-[#FF4846] mt-1">{(totalCommission || 485000).toLocaleString()} ETB</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Mobile View for Commissions (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-2.5">
              {sales.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">No sales recorded yet.</div>
              ) : (
                sales.map((s, idx) => (
                  <div key={idx} className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{s.vehicleBrand} {s.vehicleModel}</h4>
                      <span className="text-xs font-black text-[#FF4846]">+{s.commission.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                      <span>Price: <strong className="text-slate-800 dark:text-slate-200">{s.salePrice.toLocaleString()} ETB</strong></span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(s.saleDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Sale Price (ETB)</th>
                    <th className="p-4">Commission Type</th>
                    <th className="p-4">Commission (ETB)</th>
                    <th className="p-4">Sale Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {sales.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-800 dark:text-white">{s.vehicleBrand} {s.vehicleModel}</td>
                      <td className="p-4 font-bold font-mono">{s.salePrice.toLocaleString()}</td>
                      <td className="p-4 text-slate-400 font-semibold uppercase text-[10px]">Flat Rate (1%)</td>
                      <td className="p-4 font-black font-mono text-[#FF4846]">{s.commission.toLocaleString()}</td>
                      <td className="p-4 font-mono text-slate-400">{new Date(s.saleDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold">No sales recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORTS TAB ──────────────────────────────────────────────────────── */}
      {adminTab === "reports" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {reports.length} Report{reports.length !== 1 ? "s" : ""} Submitted
            </p>
            <span className="text-[10px] text-amber-500 font-bold">
              {reports.filter(r => r.status === "pending").length} pending
            </span>
          </div>

          {/* Mobile View for Reports (md:hidden) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-3">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold">No reports submitted.</div>
            ) : (
              reports.map((r, idx) => (
                <div key={r.id || idx} className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">{r.reason}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">By {r.reporterName}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      r.status === "resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : r.status === "dismissed" ? "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      : r.status === "reviewed" ? "bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/50 dark:text-blue-400"
                      : "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/50 dark:text-amber-400"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                      "{r.description}"
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Target: {r.targetType}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.status === "pending" && (
                    <button
                      onClick={async () => {
                        try {
                          await reportsApi.updateStatus(r.id, "reviewed");
                          onNotify("Report marked as reviewed", "info");
                          fetchData();
                        } catch (err: any) {
                          onNotify(err?.message || "Failed to update report", "error");
                        }
                      }}
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded-xl text-xs transition active:scale-95 shadow-xs"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {r.status === "reviewed" && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await reportsApi.updateStatus(r.id, "resolved");
                            onNotify("Report marked as resolved", "success");
                            fetchData();
                          } catch (err: any) {
                            onNotify(err?.message || "Failed to resolve report", "error");
                          }
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs transition active:scale-95 shadow-xs"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await reportsApi.updateStatus(r.id, "dismissed");
                            onNotify("Report dismissed", "info");
                            fetchData();
                          } catch (err: any) {
                            onNotify(err?.message || "Failed to dismiss report", "error");
                          }
                        }}
                        className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {reports.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-800 dark:text-white">{r.reporterName}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-1">{r.targetType}</span>
                      <span className="text-slate-600 dark:text-slate-300">{r.targetId}</span>
                    </td>
                    <td className="p-4 font-semibold">{r.reason}</td>
                    <td className="p-4 max-w-[200px] truncate text-slate-500 dark:text-slate-400">{r.description || "—"}</td>
                    <td className="p-4 font-mono text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        r.status === "resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : r.status === "dismissed" ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        : r.status === "reviewed" ? "bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                        : "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {r.status === "pending" && (
                          <button
                            onClick={async () => {
                              try {
                                await reportsApi.updateStatus(r.id, "reviewed");
                                onNotify("Report marked as reviewed", "info");
                                fetchData();
                              } catch (err: any) {
                                onNotify(err?.message || "Failed to update report", "error");
                              }
                            }}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >Mark Reviewed</button>
                        )}
                        {r.status === "reviewed" && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  await reportsApi.updateStatus(r.id, "resolved");
                                  onNotify("Report marked as resolved", "success");
                                  fetchData();
                                } catch (err: any) {
                                  onNotify(err?.message || "Failed to resolve report", "error");
                                }
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            >Resolve</button>
                            <button
                              onClick={async () => {
                                try {
                                  await reportsApi.updateStatus(r.id, "dismissed");
                                  onNotify("Report dismissed", "info");
                                  fetchData();
                                } catch (err: any) {
                                  onNotify(err?.message || "Failed to dismiss report", "error");
                                }
                              }}
                              className="border border-slate-200 hover:bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            >Dismiss</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-slate-400 font-bold">No reports submitted.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USERS TAB ────────────────────────────────────────────────────────── */}
      {adminTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {users.length} Registered Member{users.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-72 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone, role..."
                  className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>
              <button
                onClick={fetchData}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#FF4846] p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 cursor-pointer transition shrink-0"
              >
                <RefreshCw size={13} /> <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {/* Mobile Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-3">
              {(() => {
                const filtered = users.filter(u =>
                  !userSearch || `${u.name} ${u.email} ${u.phone} ${u.role}`.toLowerCase().includes(userSearch.toLowerCase())
                );
                const paginated = filtered.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);
                if (paginated.length === 0) {
                  return <div className="p-8 text-center text-xs text-slate-400 font-bold">No members found.</div>;
                }
                return paginated.map((u: any, idx: number) => (
                  <div key={u.id || idx} className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 text-white shadow-xs ${
                          u.role === "admin" ? "bg-gradient-to-tr from-indigo-600 to-blue-700"
                          : u.role === "broker" ? "bg-gradient-to-tr from-orange-500 to-orange-600"
                          : "bg-gradient-to-tr from-slate-600 to-slate-700"
                        }`}>
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</h4>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{u.email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        u.role === "admin" ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400"
                        : u.role === "broker" ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                      <span>Phone: <strong className="text-slate-700 dark:text-slate-300 font-mono">{u.phone || "—"}</strong></span>
                      <span>Joined: {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Member</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {(() => {
                    const filtered = users.filter(u =>
                      !userSearch || `${u.name} ${u.email} ${u.phone} ${u.role}`.toLowerCase().includes(userSearch.toLowerCase())
                    );
                    const paginated = filtered.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);
                    return paginated.map((u: any, idx: number) => (
                      <tr key={u.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 text-white ${
                              u.role === "admin" ? "bg-gradient-to-br from-indigo-600 to-blue-700"
                              : u.role === "broker" ? "bg-gradient-to-br from-orange-500 to-orange-600"
                              : "bg-gradient-to-br from-slate-600 to-slate-700"
                            }`}>
                              {(u.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-600 dark:text-slate-300">{u.email}</p>
                          {u.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.phone}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            u.role === "admin" ? "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                            : u.role === "broker" ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400"
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400">Active</span>
                        </td>
                      </tr>
                    ));
                  })()}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold">No members found. Users will appear here after registering.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={userPage} totalPages={Math.ceil(users.filter(u => !userSearch || `${u.name} ${u.email} ${u.phone} ${u.role}`.toLowerCase().includes(userSearch.toLowerCase())).length / ITEMS_PER_PAGE)} onPageChange={setUserPage} />
          </div>
        </div>
      )}

      {/* ── SITE SETTINGS / HERO BANNER ───────────────────────────────────── */}
      {adminTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#FF4846]" />
                  <span>Homepage Hero Background Image</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change the main background photo shown on the homepage hero section.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetHeroBg}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  disabled={savingHeroBg}
                  onClick={handleSaveHeroBg}
                  className="bg-[#FF4846] hover:bg-emerald-600 disabled:opacity-50 text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Save size={14} />
                  <span>{savingHeroBg ? "Saving..." : "Save Image"}</span>
                </button>
              </div>
            </div>

            {/* Live Hero Mockup Preview */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Live Preview (Visible across the website)
              </label>
              <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-center items-center p-6 text-center shadow-inner border border-slate-800 bg-slate-950">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500 opacity-90"
                  style={{ backgroundImage: `url('${heroBgUrl}')` }}
                />
                <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-slate-950/35 to-slate-950/60 pointer-events-none" />
                
                <div className="relative z-10 max-w-xl space-y-3">
                  <h4 className="text-xl sm:text-3xl font-black text-white leading-tight">
                    Looking for a vehicle? <br />
                    <span className="text-[#FF4846]">You're in the perfect spot.</span>
                  </h4>
                  <p className="text-xs text-slate-200 max-w-md mx-auto">
                    Background photo is now crisp and clearly visible behind the search console.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block bg-[#FF4846] text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full shadow-md">
                      Current Hero Image Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input & Upload */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2">
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Image URL
                </label>
                <input
                  type="text"
                  value={heroBgUrl}
                  onChange={(e) => setHeroBgUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#FF4846] focus:bg-white transition"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Or Upload Local File
                </label>
                <label className="w-full text-xs font-bold py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#FF4846] bg-slate-50 hover:bg-emerald-50/50 text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload size={14} className="text-[#FF4846]" />
                  <span>{uploadingHeroBg ? "Uploading..." : "Upload New Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingHeroBg}
                    onChange={handleUploadHeroImage}
                  />
                </label>
              </div>
            </div>

            {/* Curated Presets */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Automotive Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  {
                    name: "Modern Architectural Showroom",
                    desc: "Classic Audi Showroom (Default)",
                    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80"
                  },
                  {
                    name: "Luxury SUV Showroom",
                    desc: "High-end Range Rover & Mercedes",
                    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80"
                  },
                  {
                    name: "Clean EV Charging Hub",
                    desc: "Modern Green Energy Hub",
                    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=80"
                  },
                  {
                    name: "Night Skyline Automotive",
                    desc: "Urban Evening Aesthetic",
                    url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=80"
                  },
                  {
                    name: "Minimalist Porsche Studio",
                    desc: "High-contrast Studio Display",
                    url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=80"
                  }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeroBgUrl(preset.url)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 group ${
                      heroBgUrl === preset.url
                        ? "border-[#FF4846] bg-emerald-50/40 ring-2 ring-[#FF4846]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-100 relative">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {heroBgUrl === preset.url && (
                        <div className="absolute top-1 right-1 bg-[#FF4846] text-white p-0.5 rounded-full shadow-xs">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">{preset.name}</p>
                      <p className="text-[9px] text-slate-400 line-clamp-1">{preset.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── FORM MODAL ───────────────────────────────────────────────────────── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-100 overflow-hidden h-[94vh] sm:h-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50 shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Landmark size={16} className="text-[#FF4846]" />
                {editingVehicle ? "Edit Listing" : "Add New Listing"}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowFormModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveListing} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* ── Basic Info ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Basic Information</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Brand *</label>
                    <Combobox value={brand} onChange={setBrand} options={BRANDS} placeholder="Select or type brand..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Model *</label>
                    <Combobox value={model} onChange={setModel} options={["Yaris", "Vitz", "Passo", "Corolla", "Premio", "Allion", "Fielder", "Harrier", "Land Cruiser", "Prado", "Rush", "Hilux", "Hiace", "Camry", "RAV4", "Atto 3", "Seagull", "Dolphin", "Han", "Tucson", "Elantra", "Santa Fe", "Accent", "Grand i10", "Creta", "Swift", "Dzire", "Alto", "Ertiga", "Vitara", "Jimny", "Sportage", "Sorento", "Picanto", "Rio", "Cerato", "Fit", "Civic", "CR-V", "Vezel", "Grace", "Freed", "Note", "X-Trail", "Patrol", "Sunny", "Juke", "C-Class", "E-Class", "Golf", "Passat", "Polo", "Tiguan", "Ranger", "L200", "D-Max"]} placeholder="Select or type model..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Year</label>
                    <input type="number" value={year} onChange={e => setYear(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Condition</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["New", "Used", "Imported", "Damaged"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Body Type</label>
                    <select value={bodyType} onChange={e => setBodyType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["SUV", "Sedan", "Hatchback", "Pickup", "Truck", "Van", "Coupe", "Convertible"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chassis Number</label>
                    <input type="text" value={chassisNumber} onChange={e => setChassisNumber(e.target.value)} placeholder="VIN / Chassis #" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* ── Specs ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Specifications</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Mileage (km)</label>
                    <input type="number" value={mileage} onChange={e => setMileage(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Fuel Type</label>
                    <select value={fuelType} onChange={e => setFuelType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["Benzine", "Diesel", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Transmission</label>
                    <select value={transmission} onChange={e => setTransmission(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["Automatic", "Manual"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Drive Type</label>
                    <select value={driveType} onChange={e => setDriveType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["4WD", "AWD", "FWD", "RWD"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Color</label>
                    <Combobox value={color} onChange={setColor} options={COLORS} placeholder="Select or type color..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Doors</label>
                    <select value={doors} onChange={e => setDoors(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {[2, 3, 4, 5].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Seats</label>
                    <select value={seats} onChange={e => setSeats(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {[2, 4, 5, 6, 7, 8].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Engine</label>
                    <input type="text" value={engineSize} onChange={e => setEngineSize(e.target.value)} placeholder="e.g. 3.5L" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Engine Type</label>
                    <select value={engineType} onChange={e => setEngineType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["V4", "V6", "V8", "V12", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Horsepower (HP)</label>
                    <input type="number" value={horsepower} onChange={e => setHorsepower(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reg. Year</label>
                    <input type="number" value={regYear} onChange={e => setRegYear(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Location *</label>
                    <Combobox value={location} onChange={setLocation} options={LOCATIONS} placeholder="Select or type location..." />
                  </div>
                </div>
              </div>

              {/* ── Pricing & Commission ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Pricing & Commission</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Price (ETB) *</label>
                    <input type="number" required value={price} onChange={e => setPrice(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">MSRP (ETB)</label>
                    <input type="number" value={originalPrice} onChange={e => setOriginalPrice(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Commission Type</label>
                    <select value={commissionType} onChange={e => setCommissionType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      {["percentage", "fixed"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{commissionType === "percentage" ? "Rate (%)" : "Amount (ETB)"}</label>
                    <input type="number" value={commissionRate} onChange={e => setCommissionRate(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* ── Images ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Photos</p>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer">×</button>
                        {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-900/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Main</span>}
                      </div>
                    ))}
                    <label className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                      <Plus size={20} className="text-slate-400" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Add</span>
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
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] text-slate-400">Upload images or enter a URL:</p>
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* ── Status & Flags ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Status & Flags</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Listing Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex items-end pb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded border-slate-300 text-orange-500" />
                      <Star size={13} className="text-orange-400" />
                      Featured Listing
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Description & Notes ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Description & Notes</p>
                <div className="space-y-3">
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Vehicle history, condition, imported features, tax status..." className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 resize-none" />
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} placeholder="Internal admin notes..." className="w-full text-sm px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 focus:outline-none focus:border-amber-400 resize-none" />
                </div>
              </div>

              </div>

              {/* Sticky Safe-Area Action Bar */}
              <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)} 
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 text-xs sm:text-sm bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
                >
                  <Save size={15} /> {editingVehicle ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BROKER DETAIL MODAL ────────────────────────────────────────────────── */}
      {selectedBroker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden h-[94vh] sm:h-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50 shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <UserCheck size={16} className="text-indigo-600" />
                Broker Profile Detail
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedBroker(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Profile Card & Info */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0 ${
                  selectedBroker.verified ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-slate-500 to-slate-600"
                }`}>
                  {selectedBroker.name ? selectedBroker.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "?"}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-black text-slate-800">{selectedBroker.name}</h4>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      selectedBroker.verified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedBroker.verified ? "✓ Verified" : "⏳ Pending Approval"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    {selectedBroker.bio || "No profile bio provided."}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Email</p>
                      <p className="font-semibold text-slate-700">{selectedBroker.email}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Phone</p>
                      <p className="font-mono font-semibold text-slate-700">{selectedBroker.phone}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">License Number</p>
                      <p className="font-mono font-semibold text-slate-700">{selectedBroker.licenseNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Joined</p>
                      <p className="font-semibold text-slate-700">{selectedBroker.joinedAt || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">Broker Verification Status</p>
                  <p className="text-[10px] text-slate-400">Verifying the broker allows them to list vehicles on the marketplace.</p>
                </div>
                <div className="ml-auto flex gap-2">
                  {!selectedBroker.verified ? (
                    <button
                      onClick={() => handleBrokerApprove(selectedBroker.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                    >
                      <Check size={14} /> Approve & Verify
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBrokerReject(selectedBroker.id)}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                    >
                      <X size={14} /> Revoke Verification
                    </button>
                  )}
                </div>
              </div>

              {/* Stats & Detailed Listing/Sales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Listings Section */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <p className="text-xs font-black uppercase text-slate-700 tracking-wider">Broker Listings</p>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {vehicles.filter(v => v.brokerId === selectedBroker.id).length} Active
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {vehicles.filter(v => v.brokerId === selectedBroker.id).map(v => (
                      <div key={v.id} className="flex items-center gap-3 p-3 hover:bg-slate-50/50">
                        <img src={v.imageUrl} alt="" className="w-12 h-9 object-cover rounded-lg bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{v.brand} {v.model} ({v.year})</p>
                          <p className="text-[10px] text-slate-400 font-bold">{v.price.toLocaleString()} ETB · {v.location}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          v.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : v.status === "sold" ? "bg-blue-50 text-blue-800 border-blue-100"
                          : v.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {v.status}
                        </span>
                      </div>
                    ))}
                    {vehicles.filter(v => v.brokerId === selectedBroker.id).length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 font-bold">No listings created yet.</div>
                    )}
                  </div>
                </div>

                {/* Sales Section */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <p className="text-xs font-black uppercase text-slate-700 tracking-wider">Sales Performance</p>
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {sales.filter(s => s.brokerId === selectedBroker.id).length} Sold
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {sales.filter(s => s.brokerId === selectedBroker.id).map(s => (
                      <div key={s.id} className="p-3 hover:bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-slate-800">{s.vehicleBrand} {s.vehicleModel}</p>
                          <span className="text-[10px] font-bold text-orange-500">+{s.commission.toLocaleString()} ETB</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                          <span>Sale: {s.salePrice.toLocaleString()} ETB</span>
                          <span>{new Date(s.saleDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {sales.filter(s => s.brokerId === selectedBroker.id).length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 font-bold">No sales recorded yet.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setSelectedBroker(null)} 
                className="w-full sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-800 px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BUYER DETAIL MODAL ────────────────────────────────────────────────── */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden h-[94vh] sm:h-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50 shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Users size={16} className="text-teal-600" />
                Buyer Activity Detail
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedBuyer(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Profile Card & Info */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-xl font-black shrink-0">
                  {selectedBuyer.name ? selectedBuyer.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-black text-slate-800">{selectedBuyer.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-xs">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Email Address</p>
                      <p className="font-semibold text-slate-700">{selectedBuyer.email}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Phone Number</p>
                      <p className="font-mono font-semibold text-slate-700">{selectedBuyer.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Joined Date</p>
                      <p className="font-semibold text-slate-700">
                        {selectedBuyer.joinDate ? new Date(selectedBuyer.joinDate).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Inquiries</p>
                      <p className="font-semibold text-slate-700">{selectedBuyer.leads?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry History */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                  <p className="text-xs font-black uppercase text-slate-700 tracking-wider">Inquiry & Negotiation History</p>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {selectedBuyer.leads?.length || 0} Inquiries
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {(selectedBuyer.leads || []).map((l: any, idx: number) => {
                    const vehicle = vehicles.find(v => v.id === l.vehicleId);
                    return (
                      <div key={l.id || idx} className="p-4 hover:bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {vehicle ? (
                            <img src={vehicle.imageUrl} alt="" className="w-12 h-9 object-cover rounded-lg bg-slate-100 shrink-0" />
                          ) : (
                            <div className="w-12 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Car size={16} className="text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {l.vehicleBrand} {l.vehicleModel}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              Price: {l.vehiclePrice ? `${l.vehiclePrice.toLocaleString()} ETB` : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 max-w-md">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Buyer Message</p>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-0.5 border border-slate-100 italic">
                            "{l.message || "No message provided."}"
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            l.status === "negotiating" ? "bg-orange-50 text-orange-700 border-orange-100"
                            : l.status === "sold" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : l.status === "cancelled" ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {l.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{new Date(l.inquiryDate).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(!selectedBuyer.leads || selectedBuyer.leads.length === 0) && (
                    <div className="p-8 text-center text-xs text-slate-400 font-bold">No inquiry history found.</div>
                  )}
                </div>
              </div>

            </div>

            <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setSelectedBuyer(null)} 
                className="w-full sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-800 px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Close Activity
              </button>
            </div>
          </div>
        </div>
      )}
      </div>{/* end scrollable content */}

      {/* ── NATIVE MOBILE APP BOTTOM NAVIGATION BAR ─────────────────────────── */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]"
      >
        <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
          {/* 1. Overview */}
          <button
            type="button"
            onClick={() => { setAdminTab("overview"); setMobileMoreOpen(false); }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer ${
              adminTab === "overview" && !mobileMoreOpen
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition ${adminTab === "overview" && !mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <Landmark size={20} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
          </button>

          {/* 2. Listings */}
          <button
            type="button"
            onClick={() => { setAdminTab("listings"); setMobileMoreOpen(false); }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              adminTab === "listings" && !mobileMoreOpen
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${adminTab === "listings" && !mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <Car size={20} />
              {vehicles.filter(v => v.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {vehicles.filter(v => v.status === "pending").length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Listings</span>
          </button>

          {/* 3. Center Action Floating Button: + Add Car */}
          <div className="flex justify-center -mt-5">
            <button
              type="button"
              onClick={handleOpenCreate}
              aria-label="Add New Car Listing"
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF4846] to-emerald-400 text-white shadow-lg shadow-[#FF4846]/35 flex items-center justify-center active:scale-95 transition-transform cursor-pointer border-2 border-white dark:border-slate-950"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 4. Brokers */}
          <button
            type="button"
            onClick={() => { setAdminTab("brokers"); setMobileMoreOpen(false); }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              adminTab === "brokers" && !mobileMoreOpen
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${adminTab === "brokers" && !mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <UserCheck size={20} />
              {brokers.filter(b => !b.verified).length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {brokers.filter(b => !b.verified).length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Brokers</span>
          </button>

          {/* 5. More / Control Center */}
          <button
            type="button"
            onClick={() => setMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              mobileMoreOpen || ["buyers", "commissions", "reports", "users", "settings", "notifications"].includes(adminTab)
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <SlidersHorizontal size={20} />
              {(reports.filter(r => r.status === "pending").length > 0 || unreadCount > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-slate-950" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE "MORE" BOTTOM SHEET ────────────────────────────────────────── */}
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
                <h4 className="text-base font-black text-slate-900 dark:text-white">Admin Management</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Arif Car Sell Quick Control Center</p>
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
                  id: "buyers",
                  label: "Buyer Inquiries",
                  desc: `${leads.length} Active leads`,
                  icon: Users,
                  color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40",
                  badge: leads.filter(l => l.status === "new").length > 0 ? `${leads.filter(l => l.status === "new").length} New` : null
                },
                {
                  id: "commissions",
                  label: "Commissions",
                  desc: "Sales & revenue",
                  icon: DollarSign,
                  color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
                  badge: null
                },
                {
                  id: "reports",
                  label: "Safety Reports",
                  desc: "Flagged content",
                  icon: AlertCircle,
                  color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
                  badge: reports.filter(r => r.status === "pending").length > 0 ? `${reports.filter(r => r.status === "pending").length}` : null
                },
                {
                  id: "users",
                  label: "User Accounts",
                  desc: `${users.length} Registered`,
                  icon: Users,
                  color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
                  badge: null
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  desc: `${unreadCount} Alerts`,
                  icon: Bell,
                  color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
                  badge: unreadCount > 0 ? `${unreadCount}` : null
                },
                {
                  id: "settings",
                  label: "Hero & Settings",
                  desc: "Showroom customization",
                  icon: SlidersHorizontal,
                  color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
                  badge: null
                }
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAdminTab(item.id as AdminTab);
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
                        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Profile & Logout */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black flex items-center justify-center text-sm">
                  {adminUser?.name ? adminUser.name[0].toUpperCase() : "A"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{adminUser?.name || "Administrator"}</p>
                  <p className="text-[10px] text-slate-400">{adminUser?.email || "admin@arifcarsell.et"}</p>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => { setMobileMoreOpen(false); onLogout(); }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Exit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Document Inspection Lightbox Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Ownership Document Verification (Libre)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {inspectingDoc.vehicleTitle} · {inspectingDoc.price.toLocaleString()} ETB
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

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              {inspectingDoc.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const vid = inspectingDoc.vehicleId;
                      setInspectingDoc(null);
                      handleRejectListing(vid);
                    }}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const vid = inspectingDoc.vehicleId;
                      setInspectingDoc(null);
                      handleApprove(vid);
                    }}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Check size={14} />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}
