import React, { useState, useEffect } from "react";
import { Car, Store, Eye, MessageCircle, TrendingUp, Plus, X, LogOut, ChevronRight } from "lucide-react";
import type { VehicleListing, Lead } from "../../../shared/types";

interface SellerDashboardProps {
  currentUser: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onLogout: () => void;
}

type SellerTab = "listings" | "inquiries" | "activity";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

export default function SellerDashboard({ currentUser, onNotify, onLogout }: SellerDashboardProps) {
  const [tab, setTab] = useState<SellerTab>("listings");
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [inquiries, setInquiries] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
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
    fetchData();
  }, [userId, onNotify]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 font-semibold text-xs">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
            <Store size={16} />
          </div>
          <span className="text-sm font-black tracking-tight uppercase">Seller Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-800">{currentUser?.name}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">Seller</p>
          </div>
          <button onClick={onLogout} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition cursor-pointer">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full p-6 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Listings", value: listings.filter(v => v.status === "approved").length, icon: Car, color: "text-blue-900 bg-blue-50" },
              { label: "Total Views", value: "—", icon: Eye, color: "text-emerald-600 bg-emerald-50" },
              { label: "Inquiries", value: inquiries.length, icon: MessageCircle, color: "text-orange-500 bg-orange-50" },
              { label: "Listed This Month", value: listings.filter(v => v.status !== "draft").length, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{s.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                      <Icon size={15} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            {([
              { id: "listings" as const, label: "My Listings", icon: Car },
              { id: "inquiries" as const, label: "Inquiries", icon: MessageCircle },
              { id: "activity" as const, label: "Activity", icon: TrendingUp },
            ]).map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    tab === t.id ? "bg-orange-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {tab === "listings" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500 font-semibold">{listings.length} vehicle{listings.length !== 1 ? "s" : ""}</p>
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Plus size={14} />
                  Add Listing
                </button>
              </div>
              {listings.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                  <Car size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No listings yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first vehicle listing to start selling</p>
                  <button onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    Add Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.map(v => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition">
                      <div className="w-20 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 truncate">{v.brand} {v.model}</h3>
                            <p className="text-[11px] text-slate-400 font-medium">{v.year} &bull; {v.transmission} &bull; {v.fuelType}</p>
                          </div>
                          <span className="text-sm font-black text-orange-500 shrink-0">ETB {fmt(v.price)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            v.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                            v.status === "pending" ? "bg-amber-100 text-amber-700" :
                            v.status === "sold" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Eye size={10} /> {v.status === "approved" ? "Active" : "—"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "inquiries" && (
            <div>
              {inquiries.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                  <MessageCircle size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No inquiries yet</p>
                  <p className="text-xs text-slate-400 mt-1">When buyers reach out, inquiries will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map(inq => (
                    <div key={inq.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{inq.buyerName}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{inq.buyerEmail} &bull; {inq.buyerPhone}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inq.status === "new" ? "bg-blue-100 text-blue-700" :
                          inq.status === "contacted" ? "bg-amber-100 text-amber-700" :
                          inq.status === "negotiating" ? "bg-purple-100 text-purple-700" :
                          inq.status === "sold" ? "bg-emerald-100 text-emerald-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>{inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}</span>
                      </div>
                      {inq.message && <p className="text-xs text-slate-500 mt-2 italic">"{inq.message}"</p>}
                      <p className="text-[10px] text-slate-400 font-medium mt-2">
                        {inq.vehicleBrand && `Re: ${inq.vehicleBrand} ${inq.vehicleModel || ""} `}
                        &bull; {new Date(inq.inquiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "activity" && (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
              <TrendingUp size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-400">Activity log coming soon</p>
              <p className="text-xs text-slate-400 mt-1">Track views, interest, and buyer engagement over time</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Listing Modal */}
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
    brand: "", model: "", year: new Date().getFullYear(), price: 0, mileage: 0,
    fuelType: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    description: "", imageUrl: "", color: "", phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || form.price <= 0) {
      onNotify("Brand, model, and price are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broker_id: sellerId,
          brand: form.brand,
          model: form.model,
          year: form.year,
          price: form.price,
          mileage: form.mileage,
          fuel_type: form.fuelType,
          transmission: form.transmission,
          location: form.location,
          description: form.description,
          image_url: form.imageUrl || undefined,
          color: form.color || undefined,
          status: "pending",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onCreated(data);
      } else {
        const err = await res.json();
        onNotify(err.error || "Failed to create listing.", "error");
      }
    } catch {
      onNotify("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
              <Car size={15} />
            </div>
            <h2 className="text-base font-black text-slate-900">Add Listing</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Brand</label>
              <input required value={form.brand} onChange={e => handleChange("brand", e.target.value)} placeholder="e.g. Toyota" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Model</label>
              <input required value={form.model} onChange={e => handleChange("model", e.target.value)} placeholder="e.g. Camry" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Year</label>
              <input type="number" value={form.year} onChange={e => handleChange("year", parseInt(e.target.value) || 2024)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price (ETB)</label>
              <input type="number" required value={form.price || ""} onChange={e => handleChange("price", parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mileage (km)</label>
              <input type="number" value={form.mileage || ""} onChange={e => handleChange("mileage", parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fuel Type</label>
              <select value={form.fuelType} onChange={e => handleChange("fuelType", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400">
                {["Benzine", "Diesel", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transmission</label>
              <select value={form.transmission} onChange={e => handleChange("transmission", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400">
                {["Automatic", "Manual"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</label>
            <input value={form.location} onChange={e => handleChange("location", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Image URL (optional)</label>
            <input value={form.imageUrl} onChange={e => handleChange("imageUrl", e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description (optional)</label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-400 resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>
      </div>
    </div>
  );
}
