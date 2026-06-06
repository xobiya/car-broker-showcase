import React, { useState, useEffect } from "react";
import {
  Shield, Check, Users, DollarSign, Award, Star,
  Edit3, Trash2, Plus, Landmark, TrendingUp,
  Car, ClipboardList, UserCheck, Menu, X
} from "lucide-react";
import { VehicleListing, User, Broker, Lead, Sale } from "../../../shared/types";

interface AdminPanelProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
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

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminPanel({ onNotify }: AdminPanelProps) {
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  type AdminTab = "overview" | "listings" | "brokers" | "commissions" | "buyers";
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);

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
    try {
      setLoading(true);
      const [vehRes, salesRes, leadsRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/sales"),
        fetch("/api/leads"),
      ]);
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (salesRes.ok) setSales(await salesRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());

      setBrokers([
        { id: "brk-1", name: "Dawit Mekonnen", email: "dawit@autobroker.et", phone: "+251 91 123 4567", listings: 8, sales: 14, commission: 280000, verified: true, joinedAt: "2024-01-15" },
        { id: "brk-2", name: "Yonas Hailu", email: "yonas@autobroker.et", phone: "+251 91 234 5678", listings: 4, sales: 6, commission: 120000, verified: true, joinedAt: "2024-03-22" },
        { id: "brk-3", name: "Tigist Assefa", email: "tigist@autobroker.et", phone: "+251 91 345 6789", listings: 3, sales: 2, commission: 85000, verified: false, joinedAt: "2024-06-01" },
      ]);
    } catch (err) {
      onNotify("Failed to load admin data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}/approve`, { method: "PUT" });
      if (res.ok) { onNotify("Listing approved & published.", "success"); fetchData(); }
    } catch { onNotify("Error approving listing.", "error"); }
  };

  const handleMarkSold = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sold" })
      });
      if (res.ok) { onNotify("Vehicle marked as sold.", "success"); fetchData(); }
    } catch { onNotify("Error updating vehicle.", "error"); }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" })
      });
      if (res.ok) { onNotify("Listing returned to pending review.", "info"); fetchData(); }
    } catch { onNotify("Error updating listing.", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this listing?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) { onNotify("Listing deleted.", "success"); fetchData(); }
    } catch { onNotify("Error deleting listing.", "error"); }
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

  const navItems: { key: AdminTab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "listings", label: "Listings", icon: Car },
    { key: "brokers", label: "Brokers", icon: UserCheck },
    { key: "buyers", label: "Buyers", icon: Users },
    { key: "commissions", label: "Commissions", icon: DollarSign },
  ];

  const sidebar = (
    <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} shrink-0 bg-white border-r border-slate-200 h-full flex flex-col transition-all duration-300 relative`}>
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm z-10 cursor-pointer"
      >
        {sidebarCollapsed ? <Menu size={12} /> : <X size={12} />}
      </button>

      <div className={`p-5 border-b border-slate-100 ${sidebarCollapsed ? "px-3" : ""}`}>
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm shrink-0">
            <Shield size={18} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Admin</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => { setAdminTab(item.key); setSidebarOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3 px-4"} py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === item.key
                ? "bg-blue-900 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            }`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon size={15} />
            {!sidebarCollapsed && item.label}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t border-slate-100 ${sidebarCollapsed ? "px-2" : ""}`}>
        <button
          onClick={handleOpenCreate}
          className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm`}
          title={sidebarCollapsed ? "Add Car" : undefined}
        >
          <Plus size={14} />
          {!sidebarCollapsed && "Add Car Listing"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex font-sans text-slate-800 h-full relative">

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-xl shadow-sm"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex sticky top-0 h-screen">
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
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto overflow-x-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-6 ml-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-900 text-white shadow-sm">
              <Shield size={14} />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Admin Panel</p>
          </div>
        </div>

        {/* Page header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight capitalize">
              {adminTab === "overview" && "Dashboard Overview"}
              {adminTab === "listings" && "Vehicle Listings"}
              {adminTab === "brokers" && "Broker Management"}
              {adminTab === "buyers" && "Buyer Inquiries"}
              {adminTab === "commissions" && "Commission & Revenue"}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {adminTab === "overview" && "System analytics and recent activity"}
              {adminTab === "listings" && "Approve, edit, and manage all vehicles"}
              {adminTab === "brokers" && "Verify and monitor broker performance"}
              {adminTab === "buyers" && "Track buyer inquiries and lead status"}
              {adminTab === "commissions" && "Revenue reports and commission tracking"}
            </p>
          </div>
          {adminTab === "listings" && (
            <button
              onClick={handleOpenCreate}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Plus size={14} /> Add Car Listing
            </button>
          )}
        </div>

        {/* Stat Cards Row (visible on overview and listings) */}
        {(adminTab === "overview" || adminTab === "listings") && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
            <StatCard label="Total Cars" value={totalCars} icon={Car} accent="text-slate-700" />
            <StatCard label="Active" value={activeCars} icon={Check} accent="text-emerald-600" />
            <StatCard label="Pending" value={pendingCars} icon={ClipboardList} accent="text-amber-500" />
            <StatCard label="Sold" value={soldCars} icon={Award} accent="text-blue-900" />
            <StatCard label="Brokers" value={totalBrokers} icon={UserCheck} accent="text-indigo-600" />
            <StatCard label="Buyers" value={totalBuyers} icon={Users} accent="text-teal-600" />
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
                      <button
                        onClick={() => handleApprove(v.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
                      >
                        Approve
                      </button>
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {vehicles.length} Vehicle{vehicles.length !== 1 ? "s" : ""} Listed
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
                {vehicles.map(v => (
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
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        v.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : v.status === "sold" ? "bg-blue-50 text-blue-800 border border-blue-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {v.status === "pending" && (
                          <button
                            onClick={() => handleApprove(v.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            title="Approve"
                          >Approve</button>
                        )}
                        {v.status === "approved" && (
                          <button
                            onClick={() => handleMarkSold(v.id)}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            title="Mark as Sold"
                          >Mark Sold</button>
                        )}
                        {v.status === "sold" && (
                          <button
                            onClick={() => handleReject(v.id)}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
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
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        ><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-xs font-bold">No listings yet. Click "Add Car Listing" to begin.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BROKERS TAB ──────────────────────────────────────────────────────── */}
      {adminTab === "brokers" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Broker</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Listings</th>
                  <th className="p-4">Sales</th>
                  <th className="p-4">Commission (ETB)</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {brokers.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                          {b.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-bold text-slate-800">{b.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-slate-600">{b.phone}</p>
                      <p className="text-[10px] text-slate-400">{b.email}</p>
                    </td>
                    <td className="p-4 font-mono font-bold">{b.listings}</td>
                    <td className="p-4 font-mono font-bold">{b.sales}</td>
                    <td className="p-4 font-bold font-mono text-orange-500">{b.commission.toLocaleString()}</td>
                    <td className="p-4 font-mono text-slate-400">{b.joinedAt}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        b.verified ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}>
                        {b.verified ? "✓ Verified" : "Unverified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BUYERS TAB ───────────────────────────────────────────────────────── */}
      {adminTab === "buyers" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {leads.length} Buyer Inquiry{leads.length !== 1 ? "ies" : "y"} Received
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Vehicle Interested In</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Lead Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {leads.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800">{l.buyerName}</td>
                    <td className="p-4">
                      <p className="font-mono text-slate-600 text-[10px]">{l.buyerPhone}</p>
                      <p className="text-[10px] text-slate-400">{l.buyerEmail}</p>
                    </td>
                    <td className="p-4 font-bold">
                      {l.vehicleBrand} {l.vehicleModel}
                      {l.vehiclePrice && <p className="text-[10px] text-slate-400 font-mono">{l.vehiclePrice.toLocaleString()} ETB</p>}
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-500">{l.message || "—"}</td>
                    <td className="p-4 font-mono text-slate-400">{new Date(l.inquiryDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        l.status === "sold" ? "bg-blue-50 text-blue-800 border border-blue-100"
                        : l.status === "negotiating" ? "bg-orange-50 text-orange-600 border border-orange-100"
                        : l.status === "contacted" ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-400 font-bold">No buyer inquiries yet.</td></tr>
                )}
              </tbody>
            </table>
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

      {/* ── FORM MODAL ───────────────────────────────────────────────────────── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-5 text-slate-800 max-h-[92vh] overflow-y-auto my-8">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-blue-900 flex items-center gap-2">
                <Landmark size={16} />
                {editingVehicle ? "Edit Car Listing" : "Add New Car Listing"}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕ Close</button>
            </div>

            <form onSubmit={handleSaveListing} className="space-y-5">

              {/* ── Basic Information ─────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Basic Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brand *" value={brand} onChange={setBrand} placeholder="e.g. Toyota" required />
                  <Field label="Model *" value={model} onChange={setModel} placeholder="e.g. Land Cruiser" required />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <FieldNum label="Manufacturing Year *" value={year} onChange={setYear} />
                  <FieldNum label="Registration Year" value={regYear} onChange={setRegYear} />
                  <FieldSelect label="Condition" value={condition} onChange={setCondition} options={["New", "Used", "Certified Pre-Owned"]} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <FieldSelect label="Body Type" value={bodyType} onChange={setBodyType} options={["SUV", "Sedan", "Coupe", "Hatchback", "Pickup", "Minivan", "Wagon", "Convertible"]} />
                  <FieldSelect label="Drive Type" value={driveType} onChange={setDriveType} options={["4WD", "AWD", "FWD", "RWD"]} />
                  <Field label="Color" value={color} onChange={setColor} placeholder="e.g. Pearl White" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FieldNum label="Number of Doors" value={doors} onChange={setDoors} min={2} max={6} />
                  <FieldNum label="Seating Capacity" value={seats} onChange={setSeats} min={2} max={12} />
                </div>
              </div>

              {/* ── Performance & Specs ───────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Performance & Specs</p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldNum label="Mileage (km) *" value={mileage} onChange={setMileage} />
                  <FieldSelect label="Fuel Type" value={fuelType} onChange={setFuelType} options={["Benzine", "Diesel", "Electric", "Hybrid", "LPG"]} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <FieldSelect label="Transmission" value={transmission} onChange={setTransmission} options={["Automatic", "Manual", "CVT"]} />
                  <Field label="Engine Size" value={engineSize} onChange={setEngineSize} placeholder="e.g. 3.5L" />
                  <FieldSelect label="Engine Type" value={engineType} onChange={setEngineType} options={["V4", "V6", "V8", "I4", "I6", "Electric", "Hybrid"]} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FieldNum label="Horsepower (hp)" value={horsepower} onChange={setHorsepower} />
                  <Field label="Chassis Number" value={chassisNumber} onChange={setChassisNumber} placeholder="VIN / Chassis No." />
                </div>
              </div>

              {/* ── Pricing & Commission ──────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Pricing & Commission</p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldNum label="Asking Price (ETB) *" value={price} onChange={setPrice} />
                  <FieldNum label="Original / MSRP Price (ETB)" value={originalPrice} onChange={setOriginalPrice} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FieldSelect label="Commission Type" value={commissionType} onChange={setCommissionType} options={["percentage", "fixed"]} />
                  <FieldNum label={commissionType === "percentage" ? "Commission Rate (%)" : "Commission Amount (ETB)"} value={commissionRate} onChange={setCommissionRate} />
                </div>
              </div>

              {/* ── Location & Media ──────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Location & Media</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Location *" value={location} onChange={setLocation} placeholder="e.g. Addis Ababa, Bole" required />
                  <Field label="Image URL (optional)" value={imageUrl} onChange={setImageUrl} placeholder="https://..." />
                </div>

                {/* Multi-image upload */}
                <div className="mt-3 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Upload Images</label>
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                        >
                          ×
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-900/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                      <Plus size={20} className="text-slate-400" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Add Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          Array.from({ length: files.length }, (_, i) => files[i]).forEach((file: File) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setUploadedImages(prev => [...prev, ev.target.result as string]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">Supports multiple images. First image is the primary listing photo.</p>
                </div>
              </div>

              {/* ── Status & Flags ────────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Status & Flags</p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldSelect
                    label="Listing Status"
                    value={status}
                    onChange={(v) => setStatus(v as any)}
                    options={["pending", "approved", "sold"]}
                  />
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                        className="rounded border-slate-300 text-orange-500"
                      />
                      <Star size={13} className="text-orange-400" />
                      Mark as Featured Listing
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Description & Notes ───────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Description & Notes</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Vehicle Description</label>
                    <textarea
                      value={description} onChange={e => setDescription(e.target.value)}
                      rows={3} placeholder="Full description of the vehicle condition, history, features..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Admin Notes (internal)</label>
                    <textarea
                      value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                      rows={2} placeholder="Internal notes visible only to admins..."
                      className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Submit ────────────────────────────────────────────────── */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button" onClick={() => setShowFormModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-4 py-2 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                >
                  {editingVehicle ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}

// ─── Reusable mini form components ────────────────────────────────────────
function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{label}</label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
      />
    </div>
  );
}

function FieldNum({ label, value, onChange, min, max }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{label}</label>
      <input
        type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        min={min} max={max}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
