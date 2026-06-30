import React, { useState, useEffect, useMemo } from "react";
import {
  Car, Store, Eye, MessageCircle, TrendingUp, Plus, X, LogOut, ChevronRight,
  Clock, MapPin, Fuel, Settings, Search, RefreshCw, Trash2, Check,
  Bell, Menu, Star, ShieldCheck, Gauge, DollarSign, Users, Filter, Phone
} from "lucide-react";
import type { VehicleListing, Lead } from "../../../shared/types";
import Combobox from "../components/ui/Combobox";
import { BRANDS, LOCATIONS, COLORS, FUEL_TYPES, TRANSMISSIONS, DRIVE_TYPES, CONDITIONS, BODY_TYPES, ENGINE_TYPES, DOOR_OPTIONS, SEAT_OPTIONS, INQUIRY_STATUSES, LISTING_STATUSES, MONTHS } from "../lib/constants";

interface SellerDashboardProps {
  currentUser: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onLogout: () => void;
}

type SellerTab = "listings" | "inquiries" | "activity";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon?: any; accent?: string; sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{label}</span>
        {Icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || "bg-slate-100"}`}>
          <Icon size={15} className="text-slate-600" />
        </div>}
      </div>
      <span className={`text-2xl font-black ${accent ? "text-slate-800" : "text-slate-800"}`}>{value}</span>
      {sub && <span className="text-[9px] text-slate-400 font-bold uppercase">{sub}</span>}
    </div>
  );
}

function ActivityChart({ listings }: { listings: VehicleListing[] }) {
  const monthlyData = MONTHS.map((_, i) => {
    const monthListings = listings.filter(v => {
      const d = new Date(v.createdAt || Date.now());
      return d.getMonth() === i;
    });
    return { label: MONTHS[i], count: monthListings.length };
  });
  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
  const currentMonth = new Date().getMonth();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-xs font-black text-slate-700 mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-orange-500" />
        Monthly Listing Activity
      </h3>
      <div className="flex items-end gap-2 h-28 w-full">
        {monthlyData.map((d, i) => {
          const height = Math.round((d.count / maxCount) * 100);
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                {d.count} listing{d.count !== 1 ? "s" : ""}
              </div>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${d.count > 0 ? (i === currentMonth ? "bg-orange-500" : "bg-orange-300/60 group-hover:bg-orange-400/80") : "bg-slate-100"}`}
                style={{ height: `${height}%`, minHeight: d.count > 0 ? 8 : 2 }}
              />
              <span className={`text-[7px] font-black uppercase ${i === currentMonth ? "text-orange-500" : "text-slate-400"}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [locked]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "listings" as SellerTab, label: "My Listings", icon: Car, badge: pendingListings.length || undefined },
    { key: "inquiries" as SellerTab, label: "Inquiries", icon: MessageCircle, badge: inquiries.filter(i => i.status === "new").length || undefined },
    { key: "activity" as SellerTab, label: "Activity", icon: TrendingUp },
  ];

  const sidebar = (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-900 h-full flex flex-col text-slate-300 shadow-2xl">
      <div className="h-20 border-b border-slate-900 flex items-center px-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Store size={16} />
            </div>
            <span className="text-sm font-black text-white tracking-tight">Seller Panel</span>
          </div>
          <span className="text-[9px] font-black uppercase text-orange-400 tracking-widest block mt-1">My Dashboard</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = tab === item.key;
          return (
            <button key={item.key} onClick={() => { setTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />}
              <item.icon size={16} className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  isActive ? "bg-white/20 text-white" : "bg-orange-500 text-white"
                }`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-900">
        <button onClick={() => setShowAddModal(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 text-white font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Listing
        </button>
      </div>
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black shrink-0">
            {currentUser?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-none">{currentUser?.name || "Seller"}</p>
            <span className="text-[9px] font-black uppercase text-orange-400 mt-1 inline-block">Seller</span>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex font-sans text-slate-800 h-screen w-screen overflow-hidden bg-slate-50">
      <div className="hidden lg:block h-full shrink-0">{sidebar}</div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 py-0 flex items-center justify-between h-16 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              <Store size={11} className="text-orange-400" />
              <span>Seller</span>
              <ChevronRight size={10} />
              <span className="text-slate-600">
                {tab === "listings" && "My Listings"}
                {tab === "inquiries" && "Inquiries"}
                {tab === "activity" && "Activity"}
              </span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-slate-200" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight truncate hidden sm:block">
              {tab === "listings" && `My Listings (${listings.length})`}
              {tab === "inquiries" && `Inquiries (${inquiries.length})`}
              {tab === "activity" && "Activity Overview"}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={fetchData} className="p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer text-slate-400 hover:text-slate-600" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Active Listings" value={approvedListings.length} icon={Car} sub={approvedListings.length > 0 ? "Live on marketplace" : undefined} />
            <StatCard label="Pending Review" value={pendingListings.length} icon={Clock} sub={pendingListings.length > 0 ? "Awaiting approval" : undefined} />
            <StatCard label="Total Inquiries" value={inquiries.length} icon={MessageCircle} sub={inquiries.filter(i => i.status === "new").length > 0 ? `${inquiries.filter(i => i.status === "new").length} new` : undefined} />
            <StatCard label="Sold" value={soldListings.length} icon={Check} sub={soldListings.length > 0 ? "Completed sales" : undefined} />
          </div>

          {tab === "listings" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="relative flex-1 max-w-xs">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by brand, model, status..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-400 focus:bg-white transition"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {LISTING_STATUSES.map(st => {
                      const count = st === "all" ? filteredListings.length : filteredListings.filter(v => v.status === st).length;
                      const active = statusFilter === st;
                      return (
                        <button key={st} onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                            active ? "bg-orange-500 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          }`}
                        >{st} <span className="opacity-60">({count})</span></button>
                      );
                    })}
                  </div>
                  <button onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-2 rounded-xl text-[10px] transition cursor-pointer shadow-sm shrink-0"
                  ><Plus size={13} /> Add</button>
                </div>
              </div>

              {filteredListings.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <Car size={24} className="text-orange-400" />
                  </div>
                  <p className="text-sm font-black text-slate-600">No listings yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first vehicle to start selling</p>
                  <button onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                  ><Plus size={14} /> Add Your First Listing</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredListings.map(v => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                      <div className="relative h-36 bg-slate-100">
                        <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 left-3 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm ${
                          v.status === "approved" ? "bg-emerald-500 text-white" :
                          v.status === "pending" ? "bg-amber-500 text-white" :
                          v.status === "sold" ? "bg-blue-500 text-white" :
                          "bg-slate-500 text-white"
                        }`}>{v.status}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{v.brand} {v.model}</h3>
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {v.location}
                            </p>
                          </div>
                          <span className="text-sm font-black text-orange-500 shrink-0 whitespace-nowrap">
                            ETB {fmt(v.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-3">
                          <span className="flex items-center gap-1"><Gauge size={11} /> {v.mileage?.toLocaleString()} km</span>
                          <span className="flex items-center gap-1"><Fuel size={11} /> {v.fuelType}</span>
                          <span className="flex items-center gap-1"><Settings size={11} /> {v.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => setShowDeleteConfirm(v.id)}
                            className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          ><Trash2 size={11} /> Delete</button>
                          {v.status === "approved" && (
                            <span className="text-[9px] text-emerald-600 font-black flex items-center gap-1 ml-auto">
                              <Eye size={10} /> Active on marketplace
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                      <Trash2 size={20} className="text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Delete Listing?</p>
                      <p className="text-xs text-slate-400 mt-1">This action cannot be undone.</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      >Cancel</button>
                      <button onClick={() => handleDelete(showDeleteConfirm)}
                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
                      >Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "inquiries" && (
            <div>
              {inquiries.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={24} className="text-orange-400" />
                  </div>
                  <p className="text-sm font-black text-slate-600">No inquiries yet</p>
                  <p className="text-xs text-slate-400 mt-1">When buyers reach out, inquiries will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    {INQUIRY_STATUSES.map(st => {
                      const count = st === "all" ? filteredInquiries.length : filteredInquiries.filter(i => i.status === st).length;
                      const active = inquiryFilter === st;
                      return (
                        <button key={st} onClick={() => setInquiryFilter(st)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                            active ? "bg-orange-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >{st} <span className="opacity-60">({count})</span></button>
                      );
                    })}
                  </div>
                  {filteredInquiries.map(inq => {
                    const statusColor = {
                      new: "bg-blue-100 text-blue-700 border-blue-200",
                      contacted: "bg-amber-100 text-amber-700 border-amber-200",
                      negotiating: "bg-purple-100 text-purple-700 border-purple-200",
                      sold: "bg-emerald-100 text-emerald-700 border-emerald-200",
                      cancelled: "bg-rose-100 text-rose-700 border-rose-200",
                    }[inq.status] || "bg-slate-100 text-slate-600 border-slate-200";
                    return (
                      <div key={inq.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                              {(inq.buyerName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{inq.buyerName || "Anonymous"}</p>
                              <p className="text-[11px] text-slate-400">{inq.buyerEmail}{inq.buyerPhone ? ` · ${inq.buyerPhone}` : ""}</p>
                              {inq.vehicleBrand && (
                                <p className="text-[10px] text-orange-500 font-semibold mt-1 flex items-center gap-1">
                                  <Car size={10} /> Re: {inq.vehicleBrand} {inq.vehicleModel || ""}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusColor}`}>
                              {inq.status}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">{new Date(inq.inquiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {inq.message && (
                          <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Message</p>
                            <p className="text-xs text-slate-700 italic">"{inq.message}"</p>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100">
                          {inq.buyerEmail && (
                            <a href={`mailto:${inq.buyerEmail}?subject=Inquiry about ${inq.vehicleBrand || "your vehicle"} ${inq.vehicleModel || ""}`}
                              className="flex items-center gap-1 text-[10px] font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition cursor-pointer no-underline"
                            >
                              <MessageCircle size={11} /> Reply via Email
                            </a>
                          )}
                          {inq.buyerPhone && (
                            <a href={`tel:${inq.buyerPhone}`}
                              className="flex items-center gap-1 text-[10px] font-bold bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition cursor-pointer no-underline"
                            >
                              <Phone size={11} /> Call
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActivityChart listings={listings} />
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-black text-slate-700 mb-4 flex items-center gap-2">
                    <Users size={14} className="text-orange-500" />
                    Engagement Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">Total Listings</span>
                      <span className="text-sm font-black text-slate-800">{listings.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${listings.length > 0 ? (approvedListings.length / listings.length) * 100 : 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">Active / Total</span>
                      <span className="text-xs font-bold text-slate-700">{approvedListings.length} / {listings.length}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">Conversion Rate</span>
                        <span className="text-sm font-black text-orange-500">
                          {listings.length > 0 ? Math.round((soldListings.length / listings.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">Inquiry Response Needed</span>
                        <span className="text-sm font-black text-amber-500">{inquiries.filter(i => i.status === "new").length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    Recent Activity
                  </h3>
                </div>
                {listings.length === 0 && inquiries.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-xs text-slate-400 font-bold">No activity yet</p>
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
                      <div key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === "listing" ? "bg-orange-100" : "bg-blue-100"
                        }`}>
                          {item.type === "listing" ? <Car size={14} className="text-orange-500" /> : <MessageCircle size={14} className="text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.detail}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold shrink-0">{new Date(item.time).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddListingModal
          sellerId={userId}
          onClose={() => setShowAddModal(false)}
          onCreated={(v) => { setListings(prev => [...prev, v]); setShowAddModal(false); onNotify("Listing created! Awaiting approval.", "success"); }}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}

function AddListingModal({ sellerId, onClose, onCreated, onNotify }: {
  sellerId: string;
  onClose: () => void;
  onCreated: (v: VehicleListing) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}) {
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

  useScrollLock(true);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || form.price <= 0) {
      onNotify("Brand, model, and price are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const primaryImage = uploadedImages.length > 0 ? uploadedImages[0] : undefined;
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          status: "pending",
        }),
      });
      if (res.ok) { const data = await res.json(); onCreated(data); }
      else { const err = await res.json(); onNotify(err.error || "Failed to create listing.", "error"); }
    } catch { onNotify("Network error. Please try again.", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
              <Plus size={15} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Add New Listing</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Fill in all required details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition cursor-pointer">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Basic Information */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
              <Car size={12} /> Basic Information
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Brand *</label>
                <Combobox value={form.brand} onChange={v => handleChange("brand", v)} options={BRANDS} placeholder="Select brand..." />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Model *</label>
                <input required value={form.model} onChange={e => handleChange("model", e.target.value)} placeholder="e.g. Camry"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Year</label>
                <input type="number" value={form.year} onChange={e => handleChange("year", parseInt(e.target.value) || 2024)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Reg. Year</label>
                <input type="number" value={form.regYear} onChange={e => handleChange("regYear", parseInt(e.target.value) || 2024)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Condition</label>
                <select value={form.condition} onChange={e => handleChange("condition", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {CONDITIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Body Type</label>
                <select value={form.bodyType} onChange={e => handleChange("bodyType", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {BODY_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1 mt-3">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Chassis / VIN Number</label>
              <input value={form.chassisNumber} onChange={e => handleChange("chassisNumber", e.target.value)} placeholder="e.g. VIN or chassis number"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
              <DollarSign size={12} /> Pricing
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Price (ETB) *</label>
                <input type="number" required value={form.price || ""} onChange={e => handleChange("price", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">MSRP (ETB)</label>
                <input type="number" value={form.originalPrice || ""} onChange={e => handleChange("originalPrice", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Commission (%)</label>
                <input type="number" step="0.1" value={form.commissionRate} onChange={e => handleChange("commissionRate", parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
              <Settings size={12} /> Specifications
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mileage (km)</label>
                <input type="number" value={form.mileage || ""} onChange={e => handleChange("mileage", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Fuel Type</label>
                <select value={form.fuelType} onChange={e => handleChange("fuelType", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {FUEL_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Transmission</label>
                <select value={form.transmission} onChange={e => handleChange("transmission", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {TRANSMISSIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Drive Type</label>
                <select value={form.driveType} onChange={e => handleChange("driveType", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {DRIVE_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Color</label>
                <Combobox value={form.color} onChange={v => handleChange("color", v)} options={COLORS} placeholder="Select color..." />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Doors</label>
                <select value={form.doors} onChange={e => handleChange("doors", parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {DOOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Seats</label>
                <select value={form.seats} onChange={e => handleChange("seats", parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {SEAT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Engine Size</label>
                <input value={form.engineSize} onChange={e => handleChange("engineSize", e.target.value)} placeholder="e.g. 3.5L"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Engine Type</label>
                <select value={form.engineType} onChange={e => handleChange("engineType", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400">
                  {ENGINE_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Horsepower (HP)</label>
                <input type="number" value={form.horsepower || ""} onChange={e => handleChange("horsepower", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Location *</label>
                <Combobox value={form.location} onChange={v => handleChange("location", v)} options={LOCATIONS} placeholder="Select location..." />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
              <Plus size={12} /> Photos
            </p>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] font-bold cursor-pointer">×</button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-900/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Main</span>}
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <Plus size={18} className="text-slate-400" />
                <span className="text-[7px] font-bold text-slate-400 uppercase">Add Photo</span>
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
              <p className="text-[10px] text-slate-400 font-medium mt-2">Upload photos of the vehicle (first image will be the main photo)</p>
            )}
          </div>

          {/* Contact & Description */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
              <MessageCircle size={12} /> Contact & Description
            </p>
            <div className="space-y-1 mb-3">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Contact Phone</label>
              <input value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+251 9XX XXX XXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3}
                placeholder="Vehicle history, condition, features, tax status, service history..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-orange-400 resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="flex-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
