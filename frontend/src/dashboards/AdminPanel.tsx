import React, { useState, useEffect } from "react";
import {
  Shield, Check, Users, DollarSign, Award, Star,
  Edit3, Trash2, Plus, Landmark, TrendingUp,
  Car, ClipboardList, UserCheck, Menu, X, Save,
  Bell, LogOut, ChevronRight, Search, RefreshCw
} from "lucide-react";
import { VehicleListing, User, Broker, Lead, Sale, Report } from "../../../shared/types";
import Logo from "../components/ui/Logo";

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
        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button
              key={o}
              type="button"
              onMouseDown={() => { setInput(o); onChange(o); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition cursor-pointer ${o === input ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-700"}`}
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
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

  const notifications = [
    { id: "n1", text: "New listing pending approval: Toyota Corolla 2024", time: "5 min ago", unread: true },
    { id: "n2", text: "Report received: Suspicious activity on listing #V-003", time: "12 min ago", unread: true },
    { id: "n3", text: "Broker Dawit Mekonnen listed 3 new vehicles", time: "1 hour ago", unread: false },
    { id: "n4", text: "Commission payout processed: 280,000 ETB", time: "3 hours ago", unread: false },
    { id: "n5", text: "New buyer inquiry for Hyundai Tucson 2023", time: "5 hours ago", unread: false },
  ];

  type AdminTab = "overview" | "listings" | "brokers" | "commissions" | "buyers" | "reports" | "users";
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
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

  const safeFetch = async (url: string) => {
    try {
      const token = localStorage.getItem("autobroker_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, { headers });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  };

  const fetchData = async () => {
    setLoading(true);
    const [vehiclesData, salesData, leadsData, reportsData, brokersData, usersData] = await Promise.all([
      safeFetch("/api/vehicles"),
      safeFetch("/api/sales"),
      safeFetch("/api/leads"),
      safeFetch("/api/reports"),
      safeFetch("/api/brokers"),
      safeFetch("/api/users"),
    ]);
    if (vehiclesData) setVehicles(vehiclesData);
    if (salesData) setSales(salesData);
    if (leadsData) setLeads(leadsData);
    if (reportsData) setReports(reportsData);
    if (usersData) setUsers(usersData);

    if (brokersData && vehiclesData && salesData) {
      const enrichedBrokers = brokersData.map((b: any) => {
        const brokerVehicles = vehiclesData.filter((v: any) => v.brokerId === b.id);
        const brokerSales = salesData.filter((s: any) => s.brokerId === b.id);
        return {
          ...b,
          listings: brokerVehicles.length,
          sales: brokerSales.length,
          commission: brokerSales.reduce((sum: number, s: any) => sum + s.commission, 0),
          joinedAt: b.joinDate ? new Date(b.joinDate).toLocaleDateString() : "Pending",
        };
      });
      setBrokers(enrichedBrokers);
    } else if (brokersData) {
      setBrokers(brokersData);
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
      const res = await fetch(`/api/vehicles/${id}/approve`, { method: "PUT" });
      if (res.ok) { onNotify("Listing approved & published.", "success"); fetchData(); }
      else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error approving listing.", "error");
      }
    } catch { onNotify("Network error approving listing.", "error"); }
  };

  const handleMarkSold = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sold" })
      });
      if (res.ok) { onNotify("Vehicle marked as sold.", "success"); fetchData(); }
      else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error updating vehicle.", "error");
      }
    } catch { onNotify("Network error.", "error"); }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" })
      });
      if (res.ok) { onNotify("Listing returned to pending review.", "info"); fetchData(); }
      else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error updating listing.", "error");
      }
    } catch { onNotify("Network error.", "error"); }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("autobroker_token");
    return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };

  const handleBrokerApprove = async (brokerId: string) => {
    try {
      const res = await fetch(`/api/brokers/${brokerId}/approve`, {
        method: "PUT",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        onNotify("Broker approved and verified!", "success");
        fetchData();
        if (selectedBroker?.id === brokerId) setSelectedBroker({ ...selectedBroker, verified: true });
      } else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error approving broker.", "error");
      }
    } catch { onNotify("Network error.", "error"); }
  };

  const handleBrokerReject = async (brokerId: string) => {
    try {
      const res = await fetch(`/api/brokers/${brokerId}/reject`, {
        method: "PUT",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        onNotify("Broker verification revoked.", "info");
        fetchData();
        if (selectedBroker?.id === brokerId) setSelectedBroker({ ...selectedBroker, verified: false });
      } else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error revoking broker.", "error");
      }
    } catch { onNotify("Network error.", "error"); }
  };

  const handleRejectListing = async (id: string) => {
    const reason = prompt("Please enter the reason for rejecting this listing:");
    if (reason === null) return; // user cancelled
    try {
      const res = await fetch(`/api/vehicles/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        onNotify("Listing rejected.", "info");
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error rejecting listing.", "error");
      }
    } catch {
      onNotify("Network error rejecting listing.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this listing?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) { onNotify("Listing deleted.", "success"); fetchData(); }
      else {
        const err = await res.json().catch(() => ({}));
        onNotify(err.error || "Error deleting listing.", "error");
      }
    } catch { onNotify("Network error.", "error"); }
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
      const payload = {
        brand, model, year, registration_year: regYear, mileage, price,
        original_price: originalPrice || price, image_url: primaryImage, description,
        gallery_images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : undefined,
        fuel_type: fuelType, transmission, location, status,
        is_featured: isFeatured, condition, body_type: bodyType, drive_type: driveType,
        color, doors, seats, engine_size: engineSize, engine_type: engineType,
        horsepower, chassis_number: chassisNumber, commission_rate: commissionRate,
        commission_type: commissionType, admin_notes: adminNotes,
      };
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        onNotify(editingVehicle ? "Vehicle updated!" : "New vehicle created!", "success");
        setShowFormModal(false);
        fetchData();
      } else {
        onNotify("Error saving listing.", "error");
      }
    } catch { onNotify("Connection error.", "error"); }
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

  const navItems: { key: AdminTab; label: string; icon: any; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "listings", label: "Listings", icon: Car, badge: pendingCars || undefined },
    { key: "brokers", label: "Brokers", icon: UserCheck },
    { key: "buyers", label: "Buyers", icon: Users, badge: leads.length || undefined },
    { key: "commissions", label: "Commissions", icon: DollarSign },
    { key: "reports", label: "Reports", icon: Shield, badge: reports.filter(r => r.status === "pending").length || undefined },
    { key: "users", label: "Members", icon: Users },
  ];

  const sidebar = (
    <aside className={`${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-slate-950 border-r border-slate-900 h-full flex flex-col transition-all duration-300 relative text-slate-300 shadow-2xl`}>
      {/* Header / Logo */}
      <div className={`h-20 border-b border-slate-900 flex items-center justify-between px-5 ${sidebarCollapsed ? "justify-center" : ""}`}>
        {!sidebarCollapsed ? (
          <div>
            <Logo size="sm" inverted />
            <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest mt-1 inline-block">Admin Panel</span>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 cursor-pointer" onClick={() => setSidebarCollapsed(false)}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <rect x="2" y="2" width="44" height="44" rx="12" fill="white" fillOpacity="0.2" />
              <circle cx="24" cy="24" r="8" fill="white" />
              <path d="M24 18C28.4183 18 32 20.6863 32 24C32 27.3137 28.4183 30 24 30C19.5817 30 16 27.3137 16 24C16 20.6863 19.5817 18 24 18Z" fill="white" />
            </svg>
          </div>
        )}
        
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = adminTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setAdminTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-0" : "gap-3.5 px-4"} py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/10"
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
                  isActive ? "bg-white/20 text-white" : "bg-orange-500 text-white"
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

      {/* Add listing quick button */}
      <div className={`p-4 border-t border-slate-900 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={handleOpenCreate}
          className={`bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 text-white font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${sidebarCollapsed ? "w-11 h-11 p-0 rounded-xl" : "w-full"}`}
          title={sidebarCollapsed ? "Add Car Listing" : undefined}
        >
          <Plus size={16} />
          {!sidebarCollapsed && <span>Add Car Listing</span>}
        </button>
      </div>

      {/* Sidebar Footer User Card */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-blue-900/30 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner font-black shrink-0">
            {adminUser?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{adminUser?.name || "Admin"}</p>
              <span className="text-[9px] font-black uppercase text-slate-500 mt-1 inline-block">Administrator</span>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
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
    <div className="flex font-sans text-slate-800 h-screen w-screen overflow-hidden bg-slate-50 relative">

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* ── Unified Top Header Bar ─────────────────────────────────────────── */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-0 flex items-center justify-between h-16 shadow-sm">
          {/* Left: Mobile toggle + Breadcrumb + Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              <Shield size={11} className="text-slate-300" />
              <span>Admin</span>
              <ChevronRight size={10} />
              <span className="text-slate-600">
                {adminTab === "overview" && "Overview"}
                {adminTab === "listings" && "Listings"}
                {adminTab === "brokers" && "Brokers"}
                {adminTab === "buyers" && "Buyers"}
                {adminTab === "commissions" && "Commissions"}
                {adminTab === "reports" && "Reports"}
                {adminTab === "users" && "Members"}
              </span>
            </div>

            <div className="hidden sm:block w-px h-5 bg-slate-200" />

            {/* Page title */}
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 tracking-tight truncate">
                {adminTab === "overview" && "Dashboard Overview"}
                {adminTab === "listings" && "Vehicle Listings"}
                {adminTab === "brokers" && "Broker Management"}
                {adminTab === "buyers" && "Buyer Inquiries"}
                {adminTab === "commissions" && "Commission & Revenue"}
                {adminTab === "reports" && "Trust & Safety Reports"}
                {adminTab === "users" && "Member Management"}
              </h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                {adminTab === "overview" && "Analytics and recent activity"}
                {adminTab === "listings" && "Approve, edit, and manage all vehicles"}
                {adminTab === "brokers" && "Verify and monitor broker performance"}
                {adminTab === "buyers" && "Track buyer inquiries and lead status"}
                {adminTab === "commissions" && "Revenue reports and commission tracking"}
                {adminTab === "reports" && "Review and moderate user reports"}
                {adminTab === "users" && "All registered platform members"}
              </p>
            </div>
          </div>

          {/* Right: Refresh + Quick Action + Notification Bell + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Add button for Listings */}
            {adminTab === "listings" && (
              <button
                onClick={handleOpenCreate}
                className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={13} /> Add Listing
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer text-slate-400 hover:text-slate-600"
              title="Refresh data"
            >
              <RefreshCw size={15} />
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
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
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
                              <p className="text-xs text-slate-700 font-medium leading-snug">{n.text}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 p-3 text-center bg-slate-50">
                      <button
                        onClick={() => { setShowNotifDropdown(false); onNavigate?.("notifications"); }}
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
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1 bg-gradient-to-r from-slate-50 to-blue-50/30">
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-8">

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
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {b.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{b.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{b.listings} listings · {b.sales} sold</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-orange-500">{b.commission.toLocaleString()} ETB</p>
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
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1">
              {["all", "draft", "pending", "approved", "rejected", "sold"].map((st) => {
                const count = st === "all" ? vehicles.length : vehicles.filter(v => v.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setListingStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      listingStatusFilter === st
                        ? "bg-blue-900 text-white shadow-sm"
                        : "bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {st} <span className="opacity-60 ml-0.5">({count})</span>
                  </button>
                );
              })}
            </div>
            {/* Search Input */}
            <div className="relative md:w-80 shrink-0">
              <input
                type="text"
                value={listingSearch}
                onChange={e => setListingSearch(e.target.value)}
                placeholder="Search brand, model, location..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {filteredVehiclesList.length} Vehicle{filteredVehiclesList.length !== 1 ? "s" : ""} Found
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Price (ETB)</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(() => {
                    const paginatedVehicles = filteredVehiclesList.slice((listingPage - 1) * ITEMS_PER_PAGE, listingPage * ITEMS_PER_PAGE);
                    return paginatedVehicles.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={v.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg bg-slate-100 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">{v.brand} {v.model}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{v.fuelType} · {v.transmission}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{v.year}</td>
                      <td className="p-4 font-bold font-mono">{v.price.toLocaleString()}</td>
                      <td className="p-4 text-slate-500">{v.location}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          v.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : v.status === "sold" ? "bg-blue-50 text-blue-800 border-blue-100"
                          : v.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100"
                          : v.status === "draft" ? "bg-slate-50 text-slate-500 border-slate-200"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          {v.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(v.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                                title="Approve"
                              >Approve</button>
                              <button
                                onClick={() => handleRejectListing(v.id)}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                                title="Reject"
                              >Reject</button>
                            </>
                          )}
                          {v.status === "approved" && (
                            <button
                              onClick={() => handleMarkSold(v.id)}
                              className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                              title="Mark as Sold"
                            >Mark Sold</button>
                          )}
                          {(v.status === "sold" || v.status === "rejected") && (
                            <button
                              onClick={() => handleReject(v.id)}
                              className="border border-slate-200 hover:bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition"
                              title="Revert to Pending"
                            >Revert</button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          ><Edit3 size={13} /></button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Brokers</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{brokers.length}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Verified</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{brokers.filter(b => b.verified).length}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Pending Review</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{brokers.filter(b => !b.verified).length}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {brokers.length} Broker{brokers.length !== 1 ? "s" : ""} Registered
            </p>
            <div className="relative md:w-72 shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={brokerSearch}
                onChange={e => setBrokerSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
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
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(() => {
                    const filtered = brokers.filter(b =>
                      !brokerSearch || `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(brokerSearch.toLowerCase())
                    );
                    const paginated = filtered.slice((brokerPage - 1) * ITEMS_PER_PAGE, brokerPage * ITEMS_PER_PAGE);
                    return paginated.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setSelectedBroker(b)}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 text-white ${
                              b.verified ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-slate-500 to-slate-600"
                            }`}>
                              {b.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{b.name}</p>
                              {b.licenseNumber && <p className="text-[9px] text-slate-400 font-mono">LIC: {b.licenseNumber}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-slate-600">{b.phone}</p>
                          <p className="text-[10px] text-slate-400">{b.email}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-center">{b.listings ?? 0}</td>
                        <td className="p-4 font-mono font-bold text-center">{b.sales ?? 0}</td>
                        <td className="p-4 font-bold font-mono text-orange-500">{(b.commission ?? 0).toLocaleString()}</td>
                        <td className="p-4 font-mono text-slate-400">{b.joinedAt}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            b.verified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {b.verified ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                            {!b.verified ? (
                              <button
                                onClick={() => handleBrokerApprove(b.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
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
                              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Registered Buyers</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{users.filter(u => u.role === "buyer").length}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Inquiries</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{leads.length}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Negotiations</p>
              <p className="text-2xl font-black text-orange-500 mt-1">{leads.filter(l => l.status === "negotiating").length}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {users.filter(u => u.role === "buyer").length} Registered Buyer{users.filter(u => u.role === "buyer").length !== 1 ? "s" : ""} · {leads.length} Total Inquir{leads.length !== 1 ? "ies" : "y"}
            </p>
            <div className="relative md:w-72 shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buyerSearch}
                onChange={e => setBuyerSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Inquiries</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(() => {
                    const buyers = users.filter(u => u.role === "buyer");
                    const filtered = buyers.filter(b =>
                      !buyerSearch || `${b.name} ${b.email} ${(b as any).phone}`.toLowerCase().includes(buyerSearch.toLowerCase())
                    );
                    const paginated = filtered.slice((buyerPage - 1) * ITEMS_PER_PAGE, buyerPage * ITEMS_PER_PAGE);
                    return paginated.map((b: any, idx: number) => {
                      const buyerLeads = leads.filter(l => l.buyerEmail?.toLowerCase() === b.email?.toLowerCase());
                      const lastLead = buyerLeads.sort((a, b) => new Date(b.inquiryDate).getTime() - new Date(a.inquiryDate).getTime())[0];
                      return (
                      <tr key={b.id || idx} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setSelectedBuyer({ ...b, leads: buyerLeads })}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                              {(b.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{b.name}</p>
                              {buyerLeads.length > 0 && <p className="text-[9px] text-teal-600 font-black uppercase tracking-wider">{buyerLeads.length} inquiry{buyerLeads.length !== 1 ? "ies" : ""}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-600">{b.email}</p>
                          {b.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.phone}</p>}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {b.joinDate ? new Date(b.joinDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-700">{buyerLeads.length}</span>
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
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedBuyer({ ...b, leads: buyerLeads }); }}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Sales</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{sales.length || 22}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{(totalRevenue || 48500000).toLocaleString()} ETB</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Total Commission</p>
              <p className="text-2xl font-black text-orange-500 mt-1">{(totalCommission || 485000).toLocaleString()} ETB</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Sale Price (ETB)</th>
                    <th className="p-4">Commission Type</th>
                    <th className="p-4">Commission (ETB)</th>
                    <th className="p-4">Sale Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {sales.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{s.vehicleBrand} {s.vehicleModel}</td>
                      <td className="p-4 font-bold font-mono">{s.salePrice.toLocaleString()}</td>
                      <td className="p-4 text-slate-400 font-semibold uppercase text-[10px]">Flat Rate (1%)</td>
                      <td className="p-4 font-black font-mono text-orange-500">{s.commission.toLocaleString()}</td>
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {reports.length} Report{reports.length !== 1 ? "s" : ""} Submitted
            </p>
            <span className="text-[10px] text-slate-400 font-bold">
              {reports.filter(r => r.status === "pending").length} pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800">{r.reporterName}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mr-1">{r.targetType}</span>
                      <span className="text-slate-600">{r.targetId}</span>
                    </td>
                    <td className="p-4 font-semibold">{r.reason}</td>
                    <td className="p-4 max-w-[200px] truncate text-slate-500">{r.description || "—"}</td>
                    <td className="p-4 font-mono text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        r.status === "resolved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : r.status === "dismissed" ? "bg-slate-100 text-slate-400 border border-slate-200"
                        : r.status === "reviewed" ? "bg-blue-50 text-blue-800 border border-blue-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {r.status === "pending" && (
                          <button
                            onClick={async () => {
                              await fetch(`/api/reports/${r.id}/status`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "reviewed" }),
                              });
                              fetchData();
                            }}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >Mark Reviewed</button>
                        )}
                        {r.status === "reviewed" && (
                          <>
                            <button
                              onClick={async () => {
                                await fetch(`/api/reports/${r.id}/status`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "resolved" }),
                                });
                                fetchData();
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            >Resolve</button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/reports/${r.id}/status`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "dismissed" }),
                                });
                                fetchData();
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
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {users.length} Registered Member{users.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-3">
              <div className="relative md:w-72 shrink-0">
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone, role..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition"
                />
              </div>
              <button
                onClick={fetchData}
                className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Member</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(() => {
                    const filtered = users.filter(u =>
                      !userSearch || `${u.name} ${u.email} ${u.phone} ${u.role}`.toLowerCase().includes(userSearch.toLowerCase())
                    );
                    const paginated = filtered.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);
                    return paginated.map((u: any, idx: number) => (
                      <tr key={u.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 text-white ${
                              u.role === "admin" ? "bg-gradient-to-br from-indigo-600 to-blue-700"
                              : u.role === "broker" ? "bg-gradient-to-br from-orange-500 to-orange-600"
                              : "bg-gradient-to-br from-slate-600 to-slate-700"
                            }`}>
                              {(u.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-600">{u.email}</p>
                          {u.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{u.phone}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            u.role === "admin" ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : u.role === "broker" ? "bg-orange-50 text-orange-600 border-orange-100"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
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

      {/* ── FORM MODAL ───────────────────────────────────────────────────────── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Landmark size={16} />
                {editingVehicle ? "Edit Listing" : "Add New Listing"}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveListing} className="p-6 space-y-5 overflow-y-auto">
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

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowFormModal(false)} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 cursor-pointer">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 text-sm bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
                  <Save size={14} /> {editingVehicle ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BROKER DETAIL MODAL ────────────────────────────────────────────────── */}
      {selectedBroker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <UserCheck size={16} className="text-indigo-600" />
                Broker Profile Detail
              </h3>
              <button onClick={() => setSelectedBroker(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              
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
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedBroker(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">Close Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BUYER DETAIL MODAL ────────────────────────────────────────────────── */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Users size={16} className="text-teal-600" />
                Buyer Activity Detail
              </h3>
              <button onClick={() => setSelectedBuyer(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedBuyer(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">Close Activity</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>{/* end scrollable content */}
    </main>
    </div>
  );
}
