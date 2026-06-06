import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Edit3, CheckCircle, Car, TrendingUp, Users, DollarSign,
  Bell, ArrowUpRight, ArrowDownRight, X, Save, Menu, ChevronLeft,
  LayoutDashboard, List, MessageSquare, Settings,
} from "lucide-react";
import { VehicleListing, Lead, Sale } from "../../../shared/types";

interface BrokerDashboardProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

type Tab = "dashboard" | "listings" | "leads" | "earnings";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    sold: "bg-blue-100 text-blue-700 border-blue-200",
    new: "bg-orange-100 text-orange-600 border-orange-200",
    contacted: "bg-sky-100 text-sky-700 border-sky-200",
    negotiating: "bg-violet-100 text-violet-700 border-violet-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colors[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({ icon, label, value, trend, trendUp, sub }: {
  icon: React.ReactNode; label: string; value: string; trend?: string; trendUp?: boolean; sub?: string;
}) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold flex items-center gap-0.5 ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
          {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const RevenueChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-40 mt-4">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
              <div style={{ height: `${h}%`, minHeight: "6px" }} className={`w-full rounded-t-md transition-all duration-500 ${isLast ? "bg-gradient-to-t from-orange-500 to-orange-300" : "bg-gradient-to-t from-slate-400 to-slate-300"}`} />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

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

function VehicleFormModal({ editing, onSave, onCancel }: {
  editing: VehicleListing | null; onSave: (p: any) => void; onCancel: () => void;
}) {
  const init = editing ? {
    brand: editing.brand, model: editing.model, year: editing.year,
    mileage: editing.mileage, price: editing.price,
    originalPrice: editing.originalPrice, imageUrl: editing.imageUrl,
    description: editing.description, fuelType: editing.fuelType,
    transmission: editing.transmission, location: editing.location,
    condition: "Used", bodyType: "SUV", driveType: "4WD",
    color: "", doors: 4, seats: 5, engineSize: "", engineType: "V6",
    horsepower: 0, chassisNumber: "", registrationYear: editing.year,
    commissionRate: 1.0, commissionType: "percentage",
  } : {
    brand: "", model: "", year: new Date().getFullYear(), mileage: 0,
    price: 0, originalPrice: 0, imageUrl: "", description: "",
    fuelType: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    condition: "Used", bodyType: "SUV", driveType: "4WD",
    color: "", doors: 4, seats: 5, engineSize: "", engineType: "V6",
    horsepower: 0, chassisNumber: "", registrationYear: new Date().getFullYear(),
    commissionRate: 1.0, commissionType: "percentage",
  };
  const [f, setF] = useState(init);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const upd = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryImage = uploadedImages.length > 0 ? uploadedImages[0] : f.imageUrl;
    onSave({ ...f, imageUrl: primaryImage, gallery_images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h3 className="text-sm font-bold text-slate-800">{editing ? "Edit Listing" : "Add New Listing"}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* ── Basic Info ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Basic Information</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Brand *</label>
                <Combobox value={f.brand} onChange={v => upd("brand", v)} options={BRANDS} placeholder="Select or type brand..." />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Model *</label>
                <Combobox value={f.model} onChange={v => upd("model", v)} options={["Yaris", "Vitz", "Passo", "Corolla", "Premio", "Allion", "Fielder", "Harrier", "Land Cruiser", "Prado", "Rush", "Hilux", "Hiace", "Camry", "RAV4", "Atto 3", "Seagull", "Dolphin", "Han", "Tucson", "Elantra", "Santa Fe", "Accent", "Grand i10", "Creta", "Swift", "Dzire", "Alto", "Ertiga", "Vitara", "Jimny", "Sportage", "Sorento", "Picanto", "Rio", "Cerato", "Fit", "Civic", "CR-V", "Vezel", "Grace", "Freed", "Note", "X-Trail", "Patrol", "Sunny", "Juke", "C-Class", "E-Class", "Golf", "Passat", "Polo", "Tiguan", "Ranger", "L200", "D-Max"]} placeholder="Select or type model..." />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Year</label>
                <input type="number" value={f.year} onChange={e => upd("year", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Condition</label>
                <select value={f.condition} onChange={e => upd("condition", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["New", "Used", "Imported", "Damaged"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Body Type</label>
                <select value={f.bodyType} onChange={e => upd("bodyType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["SUV", "Sedan", "Hatchback", "Pickup", "Truck", "Van", "Coupe", "Convertible"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chassis Number</label>
                <input type="text" value={f.chassisNumber} onChange={e => upd("chassisNumber", e.target.value)} placeholder="VIN / Chassis #" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>

          {/* ── Specs ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Specifications</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Mileage (km)</label>
                <input type="number" value={f.mileage} onChange={e => upd("mileage", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Fuel Type</label>
                <select value={f.fuelType} onChange={e => upd("fuelType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["Benzine", "Diesel", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Transmission</label>
                <select value={f.transmission} onChange={e => upd("transmission", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["Automatic", "Manual"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Drive Type</label>
                <select value={f.driveType} onChange={e => upd("driveType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["4WD", "AWD", "FWD", "RWD"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Color</label>
                <Combobox value={f.color} onChange={v => upd("color", v)} options={COLORS} placeholder="Select or type color..." />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Doors</label>
                <select value={f.doors} onChange={e => upd("doors", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {[2, 3, 4, 5].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Seats</label>
                <select value={f.seats} onChange={e => upd("seats", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {[2, 4, 5, 6, 7, 8].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Engine</label>
                <input type="text" value={f.engineSize} onChange={e => upd("engineSize", e.target.value)} placeholder="e.g. 3.5L" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Engine Type</label>
                <select value={f.engineType} onChange={e => upd("engineType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["V4", "V6", "V8", "V12", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Horsepower (HP)</label>
                <input type="number" value={f.horsepower} onChange={e => upd("horsepower", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reg. Year</label>
                <input type="number" value={f.registrationYear} onChange={e => upd("registrationYear", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Location *</label>
                <Combobox value={f.location} onChange={v => upd("location", v)} options={LOCATIONS} placeholder="Select or type location..." />
              </div>
            </div>
          </div>

          {/* ── Pricing & Commission ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Pricing & Commission</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Price (ETB) *</label>
                <input type="number" required value={f.price} onChange={e => upd("price", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">MSRP (ETB)</label>
                <input type="number" value={f.originalPrice} onChange={e => upd("originalPrice", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Commission Type</label>
                <select value={f.commissionType} onChange={e => upd("commissionType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
                  {["percentage", "fixed"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{f.commissionType === "percentage" ? "Rate (%)" : "Amount (ETB)"}</label>
                <input type="number" value={f.commissionRate} onChange={e => upd("commissionRate", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
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
                <input type="text" value={f.imageUrl} onChange={e => upd("imageUrl", e.target.value)} placeholder="https://..." className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Description</p>
            <textarea value={f.description} onChange={e => upd("description", e.target.value)} rows={3} placeholder="Vehicle history, condition, imported features, tax status..." className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 cursor-pointer">Cancel</button>
            <button type="submit" className="flex items-center gap-1.5 text-sm bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
              <Save size={14} /> {editing ? "Save Changes" : "Submit Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BrokerDashboard({ onNotify }: BrokerDashboardProps) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);
  const [saleModal, setSaleModal] = useState<Lead | null>(null);
  const [salePrice, setSalePrice] = useState(0);

  const BROKER_ID = "brk-1";
  const BROKER_NAME = "Abebe Bikila";
  const BROKER_TITLE = "Senior Broker";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [vRes, lRes, sRes] = await Promise.all([
        fetch("/api/vehicles"), fetch("/api/leads"), fetch("/api/sales"),
      ]);
      if (vRes.ok && lRes.ok && sRes.ok) {
        const allV: VehicleListing[] = await vRes.json();
        const allL: Lead[] = await lRes.json();
        const allS: Sale[] = await sRes.json();
        const myV = allV.filter(v => v.brokerId === BROKER_ID);
        const myIds = new Set(myV.map(v => v.id));
        setVehicles(myV);
        setLeads(allL.filter(l => myIds.has(l.vehicleId)));
        setSales(allS.filter(s => s.brokerId === BROKER_ID));
      }
    } catch {
      onNotify("Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (f: any) => {
    try {
      const payload = {
        broker_id: BROKER_ID, brand: f.brand, model: f.model, year: f.year,
        registration_year: f.registrationYear || f.year,
        mileage: f.mileage, price: f.price, original_price: f.originalPrice || f.price,
        image_url: f.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        gallery_images: f.gallery_images,
        description: f.description, fuel_type: f.fuelType, transmission: f.transmission,
        location: f.location, condition: f.condition, body_type: f.bodyType,
        drive_type: f.driveType, color: f.color, doors: f.doors, seats: f.seats,
        engine_size: f.engineSize, engine_type: f.engineType, horsepower: f.horsepower,
        chassis_number: f.chassisNumber, commission_rate: f.commissionRate,
        commission_type: f.commissionType,
      };
      const res = editingVehicle
        ? await fetch(`/api/vehicles/${editingVehicle.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        onNotify(editingVehicle ? "Listing updated!" : "Listing submitted for approval!", "success");
        setShowForm(false); setEditingVehicle(null); fetchData();
      } else onNotify("Error saving listing.", "error");
    } catch { onNotify("Network error.", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) { onNotify("Listing removed.", "success"); fetchData(); }
      else onNotify("Failed to delete.", "error");
    } catch { onNotify("Error deleting.", "error"); }
  };

  const handleLeadStatus = async (id: string, status: Lead["status"]) => {
    try {
      const res = await fetch(`/api/leads/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) { onNotify(`Lead marked as ${status}.`, "success"); fetchData(); }
    } catch { onNotify("Failed to update lead.", "error"); }
  };

  const handleRecordSale = async () => {
    if (!saleModal) return;
    try {
      const commission = Math.round(salePrice * 0.01);
      const res = await fetch("/api/sales", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id: saleModal.vehicleId, broker_id: BROKER_ID, buyer_id: saleModal.buyerId, sale_price: salePrice, commission }),
      });
      if (res.ok) {
        await fetch(`/api/leads/${saleModal.id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "sold" }) });
        onNotify("Sale recorded! Vehicle marked as SOLD.", "success");
        setSaleModal(null); fetchData();
      } else onNotify("Failed to record sale.", "error");
    } catch { onNotify("Error recording sale.", "error"); }
  };

  const activeListings = vehicles.filter(v => v.status === "approved").length;
  const pendingListings = vehicles.filter(v => v.status === "pending").length;
  const totalCommission = sales.reduce((s, r) => s + Number(r.commission), 0);
  const totalRevenue = sales.reduce((s, r) => s + Number(r.salePrice), 0);
  const newLeads = leads.filter(l => l.status === "new");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const baseRev = Math.max(totalRevenue, 50000);
  const chartData = months.map((label, i) => ({
    label, value: i === 5 ? baseRev : Math.round(baseRev * (0.5 + Math.random() * 0.5)),
  }));

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "listings", label: "Listings", icon: <Car size={16} /> },
    { id: "leads", label: "Leads", icon: <Users size={16} /> },
    { id: "earnings", label: "Earnings", icon: <DollarSign size={16} /> },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F4F6FB]">
        <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
          <div className="w-4 h-4 rounded-full bg-slate-300" /> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#F4F6FB] font-sans">

      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-56"} shrink-0 bg-white border-r border-slate-100 flex flex-col py-6 ${sidebarCollapsed ? "px-2" : "px-3"} shadow-sm transition-all duration-300 relative`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm z-10 cursor-pointer"
        >
          {sidebarCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div className={`${sidebarCollapsed ? "text-center" : "px-2"} mb-6`}>
          {sidebarCollapsed ? (
            <div className="w-9 h-9 mx-auto flex items-center justify-center rounded-xl bg-blue-900 text-white text-sm font-black">AB</div>
          ) : (
            <>
              <p className="text-base font-black text-slate-900 leading-none">Arif Car</p>
              <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase">SELL</p>
            </>
          )}
        </div>

        {/* Profile card */}
        <div className={`${sidebarCollapsed ? "justify-center" : "mx-2"} mb-6 rounded-xl bg-gradient-to-br from-blue-900 to-blue-800 text-white p-3 flex items-center ${sidebarCollapsed ? "flex-col gap-1" : "gap-3"}`}>
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black shrink-0">
            {BROKER_NAME.split(" ").map(w => w[0]).join("")}
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold truncate">{BROKER_NAME}</p>
              <p className="text-[10px] text-blue-200 font-medium truncate">{BROKER_TITLE}</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="space-y-0.5 flex-1">
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5 px-3"} py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                tab === id ? "bg-blue-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              title={sidebarCollapsed ? label : undefined}
            >
              {icon} {!sidebarCollapsed && label}
            </button>
          ))}
        </nav>

        {/* Add button */}
        <button
          onClick={() => { setEditingVehicle(null); setShowForm(true); }}
          className={`${sidebarCollapsed ? "justify-center" : "mx-2"} mt-4 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-bold py-2.5 rounded-xl transition cursor-pointer shadow-sm`}
          title={sidebarCollapsed ? "Add Listing" : undefined}
        >
          <Plus size={15} /> {!sidebarCollapsed && "Add Listing"}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 md:px-8 h-14 md:h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base md:text-lg font-bold text-slate-800">
              {tab === "dashboard" && "Dashboard"}
              {tab === "listings" && "My Listings"}
              {tab === "leads" && "Leads"}
              {tab === "earnings" && "Earnings"}
            </h1>
            <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="relative text-slate-400 hover:text-slate-700 transition cursor-pointer">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-bold text-slate-800 leading-none">{BROKER_NAME}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">{BROKER_TITLE}</p>
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center text-xs font-black">
                {BROKER_NAME.split(" ").map(w => w[0]).join("")}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {tab === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Car size={18} />} label="Active Listings" value={String(activeListings)} trend={activeListings > 0 ? "+Active" : undefined} trendUp />
              <StatCard icon={<List size={18} />} label="Pending Approval" value={String(pendingListings)} />
              <StatCard icon={<Users size={18} />} label="New Leads" value={String(newLeads.length)} trend={newLeads.length > 0 ? "+New" : undefined} trendUp />
              <StatCard icon={<DollarSign size={18} />} label="Commission Earned" value={`ETB ${fmt(totalCommission)}`} sub={`${sales.length} sales closed`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Revenue</h2>
                    <p className="text-xs text-slate-400 mt-0.5">6-month trend</p>
                  </div>
                </div>
                <RevenueChart data={chartData} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <h2 className="text-base font-bold text-slate-800 mb-1">Quick Stats</h2>
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Total Vehicles</span>
                    <span className="text-sm font-bold text-slate-800">{vehicles.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Total Leads</span>
                    <span className="text-sm font-bold text-slate-800">{leads.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Total Sales</span>
                    <span className="text-sm font-bold text-slate-800">{sales.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">Revenue</span>
                    <span className="text-sm font-bold text-emerald-600">ETB {fmt(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Recent Leads</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Latest buyer inquiries</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="text-left px-6 py-3">Buyer</th>
                      <th className="text-left px-4 py-3">Vehicle</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leads.slice(0, 6).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center shrink-0">{l.buyerName.charAt(0)}</div>
                            <span className="font-semibold text-slate-700">{l.buyerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-[13px]">{l.vehicleBrand} {l.vehicleModel}</td>
                        <td className="px-4 py-3.5"><StatusPill status={l.status} /></td>
                        <td className="px-4 py-3.5">
                          {l.status !== "sold" && l.status !== "cancelled" ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLeadStatus(l.id, "contacted")} className="text-[12px] font-semibold text-blue-700 hover:text-blue-900 transition cursor-pointer">Contact</button>
                              <span className="text-slate-200">|</span>
                              <button onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }} className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-800 transition cursor-pointer">Sold</button>
                            </div>
                          ) : <span className="text-[12px] text-slate-300 font-medium">—</span>}
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No leads yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800">My Listings</h2>
                <p className="text-xs text-slate-400 mt-0.5">{vehicles.length} total</p>
              </div>
              <button
                onClick={() => { setEditingVehicle(null); setShowForm(true); }}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2"><StatusPill status={v.status} /></div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">{v.year}</p>
                      <h3 className="text-sm font-bold text-slate-800">{v.brand} {v.model}</h3>
                      <p className="text-[13px] font-bold text-blue-900 mt-1">ETB {fmt(v.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{v.fuelType}</span><span>•</span><span>{v.transmission}</span><span>•</span><span>{v.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button onClick={() => { setEditingVehicle(v); setShowForm(true); }} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer" title="Edit"><Edit3 size={13} /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && (
                <div className="col-span-3 text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  No listings yet. Click "Add" to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "leads" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Buyer Leads</h2>
              <p className="text-xs text-slate-400 mt-0.5">{leads.length} total across your listings</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {leads.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No leads yet.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {leads.map(l => (
                    <div key={l.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 text-sm font-black flex items-center justify-center shrink-0">{l.buyerName.charAt(0)}</div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-800">{l.buyerName}</p>
                          <p className="text-[11px] text-slate-400">{l.buyerEmail} · {l.buyerPhone}</p>
                          <p className="text-[11px] text-slate-500 mt-1 italic">"{l.message}"</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <p className="text-[12px] text-slate-500 font-semibold">{l.vehicleBrand} {l.vehicleModel}{l.vehiclePrice ? ` — ETB ${fmt(l.vehiclePrice)}` : ""}</p>
                        <StatusPill status={l.status} />
                        {l.status !== "sold" && l.status !== "cancelled" && (
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleLeadStatus(l.id, "negotiating")} className="text-[12px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-lg transition cursor-pointer">Negotiating</button>
                            <button onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }} className="text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"><TrendingUp size={12} /> Record Sale</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "earnings" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Earnings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sales and commission breakdown</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs text-slate-400">Total Sales</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{sales.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">ETB {fmt(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs text-slate-400">Commission</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">ETB {fmt(totalCommission)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Sales History</h3>
              </div>
              {sales.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-sm">No sales yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                        <th className="text-left px-6 py-3">Vehicle</th>
                        <th className="text-left px-4 py-3">Sale Price</th>
                        <th className="text-left px-4 py-3">Commission</th>
                        <th className="text-left px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-3.5 font-semibold text-slate-700">{s.vehicleBrand} {s.vehicleModel}</td>
                          <td className="px-4 py-3.5 text-slate-600">ETB {fmt(s.salePrice)}</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-600">ETB {fmt(s.commission)}</td>
                          <td className="px-4 py-3.5 text-slate-400 text-[12px]">{new Date(s.saleDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Form Modal */}
      {showForm && <VehicleFormModal editing={editingVehicle} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingVehicle(null); }} />}

      {/* Record Sale Modal */}
      {saleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500" /> Record Sale</h3>
              <button onClick={() => setSaleModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={17} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Final sale price for <strong>{saleModal.vehicleBrand} {saleModal.vehicleModel}</strong>.</p>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Sale Price (ETB)</label>
                <input type="number" value={salePrice} onChange={e => setSalePrice(+e.target.value)} className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Commission (1%)</p>
                <p className="text-xl font-black text-emerald-700 mt-1">ETB {fmt(Math.round(salePrice * 0.01))}</p>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setSaleModal(null)} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 cursor-pointer">Cancel</button>
                <button onClick={handleRecordSale} className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg transition cursor-pointer">Confirm Sold</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
