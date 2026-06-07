import React, { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit3, Car, TrendingUp, Users, DollarSign,
  Bell, X, Save, Menu, LayoutDashboard, List, MessageSquare,
  Calculator, FileText, ClipboardCheck, Send, AlertTriangle, BarChart3,
  ChevronDown, ChevronLeft, ChevronRight, Clock, User, Camera,
} from "lucide-react";
import { VehicleListing, Lead, Sale, VehicleDocument } from "../../../shared/types";
import CommissionCalculator from "./CommissionCalculator";

interface BrokerDashboardProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onLogout?: () => void;
}

type Tab = "dashboard" | "listings" | "leads" | "earnings" | "inspection" | "documents" | "calculator" | "profile";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatCard = ({ icon, label, value, trend, trendUp, sub }: {
  icon: React.ReactNode; label: string; value: string; trend?: string; trendUp?: boolean; sub?: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">{icon}</div>
      {trend && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
          {trendUp ? <TrendingUp size={13} /> : <AlertTriangle size={13} />} {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    sold: "bg-blue-100 text-blue-700",
    new: "bg-orange-100 text-orange-700",
    contacted: "bg-sky-100 text-sky-700",
    negotiating: "bg-violet-100 text-violet-700",
    cancelled: "bg-red-100 text-red-700",
    not_inspected: "bg-slate-100 text-slate-600",
    passed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
      {status === "pending" && <Clock size={10} />}
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/, " ")}
    </span>
  );
};

const RevenueChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-36 mt-4">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
              <div
                style={{ height: `${h}%`, minHeight: "4px" }}
                className={`w-full rounded-sm transition-all duration-500 ${isLast ? "bg-indigo-600" : "bg-indigo-200"}`}
              />
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
      <input type="text" value={input} onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} placeholder={placeholder} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition" />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button key={o} type="button" onMouseDown={() => { setInput(o); onChange(o); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition cursor-pointer ${o === input ? "bg-indigo-50 font-semibold text-indigo-900" : "text-slate-700"}`}>{o}</button>
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
    brand: editing.brand, model: editing.model, year: editing.year, mileage: editing.mileage,
    price: editing.price, originalPrice: editing.originalPrice, imageUrl: editing.imageUrl,
    description: editing.description, fuelType: editing.fuelType, transmission: editing.transmission,
    location: editing.location, condition: "Used", bodyType: "SUV", driveType: "4WD",
    color: "", doors: 4, seats: 5, engineSize: "", engineType: "V6", horsepower: 0,
    chassisNumber: "", registrationYear: editing.year, commissionRate: 1.0,
    commissionType: "percentage", videoUrl: editing.videoUrl || "",
  } : {
    brand: "", model: "", year: new Date().getFullYear(), mileage: 0, price: 0,
    originalPrice: 0, imageUrl: "", description: "", fuelType: "Benzine",
    transmission: "Automatic", location: "Addis Ababa", condition: "Used", bodyType: "SUV",
    driveType: "4WD", color: "", doors: 4, seats: 5, engineSize: "", engineType: "V6",
    horsepower: 0, chassisNumber: "", registrationYear: new Date().getFullYear(),
    commissionRate: 1.0, commissionType: "percentage", videoUrl: "",
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h3 className="text-sm font-bold text-slate-800">{editing ? "Edit Listing" : "Add New Listing"}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3">Basic Information</p>
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
                <input type="number" value={f.year} onChange={e => upd("year", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Condition</label>
                <select value={f.condition} onChange={e => upd("condition", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["New", "Used", "Imported", "Damaged"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Body Type</label>
                <select value={f.bodyType} onChange={e => upd("bodyType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["SUV", "Sedan", "Hatchback", "Pickup", "Truck", "Van", "Coupe", "Convertible"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Chassis #</label>
                <input type="text" value={f.chassisNumber} onChange={e => upd("chassisNumber", e.target.value)} placeholder="VIN / Chassis #" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3">Specifications</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Mileage (km)</label>
                <input type="number" value={f.mileage} onChange={e => upd("mileage", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Fuel Type</label>
                <select value={f.fuelType} onChange={e => upd("fuelType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["Benzine", "Diesel", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Transmission</label>
                <select value={f.transmission} onChange={e => upd("transmission", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["Automatic", "Manual"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Drive Type</label>
                <select value={f.driveType} onChange={e => upd("driveType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["4WD", "AWD", "FWD", "RWD"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Color</label>
                <Combobox value={f.color} onChange={v => upd("color", v)} options={COLORS} placeholder="Select or type color..." />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Doors</label>
                <select value={f.doors} onChange={e => upd("doors", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {[2, 3, 4, 5].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Seats</label>
                <select value={f.seats} onChange={e => upd("seats", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {[2, 4, 5, 6, 7, 8].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Engine</label>
                <input type="text" value={f.engineSize} onChange={e => upd("engineSize", e.target.value)} placeholder="e.g. 3.5L" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Engine Type</label>
                <select value={f.engineType} onChange={e => upd("engineType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["V4", "V6", "V8", "V12", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Horsepower</label>
                <input type="number" value={f.horsepower} onChange={e => upd("horsepower", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reg. Year</label>
                <input type="number" value={f.registrationYear} onChange={e => upd("registrationYear", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Location *</label>
                <Combobox value={f.location} onChange={v => upd("location", v)} options={LOCATIONS} placeholder="Select or type location..." />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3">Pricing & Commission</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Price (ETB) *</label>
                <input type="number" required value={f.price} onChange={e => upd("price", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">MSRP (ETB)</label>
                <input type="number" value={f.originalPrice} onChange={e => upd("originalPrice", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Commission Type</label>
                <select value={f.commissionType} onChange={e => upd("commissionType", e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400">
                  {["percentage", "fixed"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{f.commissionType === "percentage" ? "Rate (%)" : "Amount (ETB)"}</label>
                <input type="number" value={f.commissionRate} onChange={e => upd("commissionRate", +e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3">Photos & Video</p>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer">×</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-indigo-900/80 text-white text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Main</span>}
                  </div>
                ))}
                <label className="w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
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
              <input type="text" value={f.imageUrl} onChange={e => upd("imageUrl", e.target.value)} placeholder="Primary image URL..." className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              <div className="flex items-center gap-2">
                <input type="text" value={f.videoUrl} onChange={e => upd("videoUrl", e.target.value)} placeholder="Video URL (YouTube/Vimeo/MP4)..." className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3">Description</p>
            <textarea value={f.description} onChange={e => upd("description", e.target.value)} rows={3} placeholder="Vehicle history, condition, imported features, tax status..." className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 resize-none" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 font-medium">Listings are saved as draft until submitted for approval.</p>
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 cursor-pointer">Cancel</button>
              <button type="submit" className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
                <Save size={14} /> {editing ? "Save Changes" : "Save as Draft"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "listings", label: "Listings", icon: <Car size={16} /> },
  { id: "leads", label: "Leads", icon: <Users size={16} /> },
  { id: "earnings", label: "Earnings", icon: <DollarSign size={16} /> },
  { id: "inspection", label: "Inspections", icon: <ClipboardCheck size={16} /> },
  { id: "documents", label: "Documents", icon: <FileText size={16} /> },
  { id: "calculator", label: "Calculator", icon: <Calculator size={16} /> },
  { id: "profile", label: "Profile", icon: <User size={16} /> },
];

export default function BrokerDashboard({ onNotify, onLogout }: BrokerDashboardProps) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);
  const [saleModal, setSaleModal] = useState<Lead | null>(null);
  const [salePrice, setSalePrice] = useState(0);
  const [docUploadModal, setDocUploadModal] = useState<{ vehicleId: string; open: boolean }>({ vehicleId: "", open: false });
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("other");
  const [docFileData, setDocFileData] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [brokerInfo, setBrokerInfo] = useState<{ id: string; userId: string; name: string; email: string; phone: string; licenseNumber: string; bio: string; avatar: string; verified: boolean; joinDate: string; } | null>(null);
  const [brokerProfile, setBrokerProfile] = useState({ name: "", email: "", phone: "", bio: "", licenseNumber: "", avatar: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const safeFetch = async (url: string) => { try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch { return null; } };
    const [allV, allL, allS, docs, allBrokers] = await Promise.all([
      safeFetch("/api/vehicles"), safeFetch("/api/leads"), safeFetch("/api/sales"), safeFetch("/api/documents"), safeFetch("/api/brokers"),
    ]);

    const me = allBrokers?.find((b: any) => b.id === "brk-1");
    if (me) {
      setBrokerInfo(me);
      setBrokerProfile({
        name: me.name || "Unknown",
        email: me.email || "",
        phone: me.phone || "",
        bio: me.bio || "",
        licenseNumber: me.licenseNumber || "",
        avatar: me.avatar || "",
      });
    }

    if (allV) {
      const myV: VehicleListing[] = allV.filter((v: VehicleListing) => v.brokerId === "brk-1");
      const myIds = new Set(myV.map(v => v.id));
      setVehicles(myV);
      if (allL) setLeads(allL.filter((l: Lead) => myIds.has(l.vehicleId)));
      if (allS) setSales(allS.filter((s: Sale) => s.brokerId === "brk-1"));
    }
    if (docs) setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (f: any) => {
    try {
      const payload = {
        broker_id: "brk-1", brand: f.brand, model: f.model, year: f.year,
        registration_year: f.registrationYear || f.year, mileage: f.mileage, price: f.price,
        original_price: f.originalPrice || f.price,
        image_url: f.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        gallery_images: f.gallery_images, description: f.description, fuel_type: f.fuelType,
        transmission: f.transmission, location: f.location, condition: f.condition,
        body_type: f.bodyType, drive_type: f.driveType, color: f.color, doors: f.doors,
        seats: f.seats, engine_size: f.engineSize, engine_type: f.engineType,
        horsepower: f.horsepower, chassis_number: f.chassisNumber, commission_rate: f.commissionRate,
        commission_type: f.commissionType, video_url: f.videoUrl,
      };
      const res = editingVehicle
        ? await fetch(`/api/vehicles/${editingVehicle.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        onNotify(editingVehicle ? "Listing updated!" : "Listing saved as draft!", "success");
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

  const handleSubmitForApproval = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}/submit`, { method: "PUT" });
      if (res.ok) { onNotify("Submitted for admin approval!", "success"); fetchData(); }
      else onNotify("Failed to submit.", "error");
    } catch { onNotify("Error submitting.", "error"); }
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
        body: JSON.stringify({ vehicle_id: saleModal.vehicleId, broker_id: "brk-1", buyer_id: saleModal.buyerId, sale_price: salePrice, commission, buyer_name: saleModal.buyerName }),
      });
      if (res.ok) {
        await fetch(`/api/leads/${saleModal.id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "sold" }) });
        onNotify("Sale recorded! Vehicle marked as SOLD.", "success");
        setSaleModal(null); fetchData();
      } else onNotify("Failed to record sale.", "error");
    } catch { onNotify("Error recording sale.", "error"); }
  };

  const handleUploadDoc = async () => {
    if (!docUploadModal.vehicleId || !docName) { onNotify("Please provide a document name and file.", "error"); return; }
    try {
      const res = await fetch("/api/documents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id: docUploadModal.vehicleId, name: docName, type: docType, file_url: docFileData || "" }),
      });
      if (res.ok) { onNotify("Document uploaded.", "success"); setDocUploadModal({ vehicleId: "", open: false }); setDocName(""); setDocFileData(""); fetchData(); }
      else onNotify("Failed to upload document.", "error");
    } catch { onNotify("Error uploading document.", "error"); }
  };

  const activeListings = vehicles.filter(v => v.status === "approved").length;
  const pendingListings = vehicles.filter(v => v.status === "pending").length;
  const draftListings = vehicles.filter(v => v.status === "draft").length;
  const totalCommission = sales.reduce((s, r) => s + Number(r.commission), 0);
  const totalRevenue = sales.reduce((s, r) => s + Number(r.salePrice), 0);
  const newLeads = leads.filter(l => l.status === "new");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyData = months.map((_, i) => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.saleDate);
      return d.getMonth() === i && d.getFullYear() === new Date().getFullYear();
    });
    return monthSales.reduce((sum, s) => sum + Number(s.salePrice), 0);
  });
  const maxRev = Math.max(...monthlyData, 1);
  const chartData = months.map((label, i) => ({
    label, value: monthlyData[i] || 0,
  }));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${sidebarCollapsed ? "w-16" : "w-60"}`}>
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center p-3" : "justify-between p-4"} border-b border-slate-100`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">AB</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">AB</div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">Arif Car Sell</p>
                <p className="text-[9px] font-semibold tracking-wider text-indigo-600 uppercase">Broker Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5 px-3"} py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                tab === id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              title={sidebarCollapsed ? label : undefined}>
              {icon}
              {!sidebarCollapsed && label}
            </button>
          ))}
        </nav>

        <div className={`${sidebarCollapsed ? "p-2 flex justify-center" : "p-3"} border-t border-slate-100`}>
          <button onClick={() => { setEditingVehicle(null); setShowForm(true); }}
            className={`flex items-center ${sidebarCollapsed ? "justify-center w-10 h-10" : "justify-center gap-1.5 w-full"} bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition cursor-pointer`}
            title={sidebarCollapsed ? "Add Listing" : undefined}>
            <Plus size={15} />
            {!sidebarCollapsed && "Add Listing"}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-3 md:px-6 h-14 md:h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer -ml-1 shrink-0">
              <Menu size={20} />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-900 truncate">
              {NAV_ITEMS.find(n => n.id === tab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <Bell size={18} />
                {newLeads.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {newLeads.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Notifications</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {newLeads.length > 0 ? newLeads.slice(0, 5).map(l => (
                        <div key={l.id} className="px-4 py-3 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">{l.buyerName}</span> sent an inquiry about <span className="font-semibold">{l.vehicleBrand} {l.vehicleModel}</span>
                        </div>
                      )) : (
                        <div className="px-4 py-8 text-center text-xs text-slate-400">No new notifications</div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">View All</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {(brokerInfo?.name || "B").split(" ").map(w => w[0]).join("")}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{brokerInfo?.name || "Loading..."}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">Licensed Broker</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-800">{brokerInfo?.name || "Unknown"}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-indigo-600">Licensed Broker</p>
                    </div>
                    <button onClick={() => { setProfileOpen(false); setTab("profile"); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer">Profile</button>
                    <button onClick={() => { setProfileOpen(false); onLogout?.(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition cursor-pointer">Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {tab === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Car size={18} />} label="Active Listings" value={String(activeListings)} trend={activeListings > 0 ? `${activeListings} active` : undefined} trendUp={activeListings > 0} />
              <StatCard icon={<List size={18} />} label="Pending Approval" value={String(pendingListings)} />
              <StatCard icon={<Users size={18} />} label="New Leads" value={String(newLeads.length)} trend={newLeads.length > 0 ? `${newLeads.length} new` : undefined} trendUp={newLeads.length > 0} />
              <StatCard icon={<DollarSign size={18} />} label="Commission Earned" value={`ETB ${fmt(totalCommission)}`} sub={`${sales.length} sales closed`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Revenue Overview</h2>
                    <p className="text-xs text-slate-400">6-month trend</p>
                  </div>
                  <BarChart3 size={18} className="text-slate-300" />
                </div>
                <RevenueChart data={chartData} />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Stats</h2>
                <div className="space-y-3">
                  {[
                    { label: "Total Vehicles", value: vehicles.length },
                    { label: "Drafts", value: draftListings },
                    { label: "Total Leads", value: leads.length },
                    { label: "Total Sales", value: sales.length },
                    { label: "Revenue", value: `ETB ${fmt(totalRevenue)}`, highlight: true },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className={`text-sm font-bold ${item.highlight ? "text-emerald-600" : "text-slate-800"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Recent Leads</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Latest buyer inquiries</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="text-left px-6 py-3">Buyer</th>
                      <th className="text-left px-4 py-3">Vehicle</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leads.slice(0, 6).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {l.buyerName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700">{l.buyerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-[13px]">{l.vehicleBrand} {l.vehicleModel}</td>
                        <td className="px-4 py-3.5"><StatusPill status={l.status} /></td>
                        <td className="px-4 py-3.5">
                          {l.status !== "sold" && l.status !== "cancelled" ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLeadStatus(l.id, "contacted")} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer">Contact</button>
                              <span className="text-slate-200">|</span>
                              <button onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition cursor-pointer">Sold</button>
                            </div>
                          ) : <span className="text-xs text-slate-300 font-medium">—</span>}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">My Listings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {vehicles.length} total &middot; {draftListings} drafts &middot; {pendingListings} pending
                </p>
              </div>
              <button onClick={() => { setEditingVehicle(null); setShowForm(true); }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm cursor-pointer">
                <Plus size={14} /> Add Listing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-2 right-2"><StatusPill status={v.status} /></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-bold drop-shadow-sm">{v.brand} {v.model}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-slate-800">ETB {fmt(v.price)}</p>
                      <p className="text-[11px] text-slate-400">{v.year} &middot; {v.mileage.toLocaleString()} km</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{v.fuelType}</span>
                      <span>&middot;</span>
                      <span>{v.transmission}</span>
                      <span>&middot;</span>
                      <span>{v.location}</span>
                    </div>
                    {(v.status === "rejected" && v.rejectionReason) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-1.5">
                        <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-red-700">{v.rejectionReason}</p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      {(v.status === "draft" || v.status === "rejected") && (
                        <button onClick={() => handleSubmitForApproval(v.id)} className="p-2 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-400 hover:text-indigo-600 transition cursor-pointer" title="Submit for Approval">
                          <Send size={13} />
                        </button>
                      )}
                      <button onClick={() => { setEditingVehicle(v); setShowForm(true); }} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Edit">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition cursor-pointer" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                  No listings yet. Click "Add Listing" to get started.
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {leads.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No leads yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leads.map(l => (
                    <div key={l.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">{l.buyerName.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{l.buyerName}</p>
                          <p className="text-xs text-slate-400">{l.buyerEmail} &middot; {l.buyerPhone}</p>
                          <p className="text-xs text-slate-500 mt-1 italic">"{l.message}"</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500 font-semibold">{l.vehicleBrand} {l.vehicleModel}</p>
                          {l.vehiclePrice ? <p className="text-xs font-bold text-indigo-600">ETB {fmt(l.vehiclePrice)}</p> : null}
                        </div>
                        <StatusPill status={l.status} />
                        {l.status !== "sold" && l.status !== "cancelled" && (
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleLeadStatus(l.id, "negotiating")} className="text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-100 px-3 py-1 rounded-lg transition cursor-pointer">Negotiating</button>
                            <button onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer">
                              <TrendingUp size={12} /> Record Sale
                            </button>
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs text-slate-500 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{sales.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs text-slate-500 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">ETB {fmt(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs text-slate-500 font-medium">Commission Earned</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">ETB {fmt(totalCommission)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Sales History</h3>
              </div>
              {sales.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-sm">No sales yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="text-left px-6 py-3">Vehicle</th>
                        <th className="text-left px-4 py-3">Sale Price</th>
                        <th className="text-left px-4 py-3">Commission</th>
                        <th className="text-left px-4 py-3">Buyer</th>
                        <th className="text-left px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-3.5 font-semibold text-slate-700">{s.vehicleBrand} {s.vehicleModel}</td>
                          <td className="px-4 py-3.5 text-slate-600">ETB {fmt(s.salePrice)}</td>
                          <td className="px-4 py-3.5 font-semibold text-emerald-600">ETB {fmt(s.commission)}</td>
                          <td className="px-4 py-3.5 text-slate-500">{s.buyerName || "—"}</td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{new Date(s.saleDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "inspection" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Vehicle Inspections</h2>
              <p className="text-xs text-slate-400 mt-0.5">Inspection status for your listings</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { status: "not_inspected", label: "Not Inspected", color: "bg-slate-50 border-slate-200 text-slate-600" },
                { status: "pending", label: "Pending", color: "bg-amber-50 border-amber-200 text-amber-700" },
                { status: "passed", label: "Passed", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                { status: "failed", label: "Failed", color: "bg-red-50 border-red-200 text-red-700" },
              ].map(({ status, label, color }) => {
                const count = vehicles.filter(v => (v.inspectionStatus || "not_inspected") === status).length;
                return (
                  <div key={status} className={`${color} border rounded-xl p-5`}>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">All Listings</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {vehicles.map(v => (
                  <div key={v.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={v.imageUrl} alt="" className="w-12 h-9 object-cover rounded-lg" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{v.brand} {v.model}</p>
                        <p className="text-xs text-slate-400">{v.year} &middot; {v.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={v.inspectionStatus || "not_inspected"} />
                      {v.inspectionStatus === "passed" && v.inspectionNotes && (
                        <p className="text-[10px] text-slate-400 max-w-[200px] truncate">{v.inspectionNotes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Vehicle Documents</h2>
              <p className="text-xs text-slate-400 mt-0.5">Upload and manage vehicle paperwork</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map(v => {
                const vehicleDocs = documents.filter(d => d.vehicleId === v.id);
                return (
                  <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img src={v.imageUrl} alt="" className="w-10 h-8 object-cover rounded" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{v.brand} {v.model}</p>
                          <p className="text-[10px] text-slate-400">{vehicleDocs.length} document(s)</p>
                        </div>
                      </div>
                      <button onClick={() => { setDocUploadModal({ vehicleId: v.id, open: true }); setDocName(""); setDocType("other"); setDocFileData(""); }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition cursor-pointer">
                        <Plus size={12} className="inline" /> Add
                      </button>
                    </div>
                    {vehicleDocs.length > 0 && (
                      <div className="space-y-1.5">
                        {vehicleDocs.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <FileText size={12} className="text-slate-400" />
                              <span className="text-xs font-semibold text-slate-700">{doc.name}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-bold">{doc.type}</span>
                            </div>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold hover:underline">View</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "calculator" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-2xl">
              <h2 className="text-base font-bold text-slate-800 mb-4">Commission Calculator</h2>
              <CommissionCalculator />
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Broker Profile</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage your personal and professional information</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 text-white">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold overflow-hidden">
                        {brokerProfile.avatar ? (
                          <img src={brokerProfile.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          brokerProfile.name.split(" ").map(w => w[0]).join("")
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setBrokerProfile(p => ({ ...p, avatar: reader.result as string }));
                          reader.readAsDataURL(file);
                        }} />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-bold">{brokerProfile.name}</h3>
                      <p className="text-sm text-indigo-200 font-medium">Licensed Broker</p>
                      <p className="text-xs text-indigo-200 mt-1">License: {brokerProfile.licenseNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Full Name</label>
                      <input type="text" value={brokerProfile.name}
                        onChange={e => setBrokerProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email</label>
                      <input type="email" value={brokerProfile.email}
                        onChange={e => setBrokerProfile(p => ({ ...p, email: e.target.value }))}
                        className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phone</label>
                      <input type="text" value={brokerProfile.phone}
                        onChange={e => setBrokerProfile(p => ({ ...p, phone: e.target.value }))}
                        className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">License Number</label>
                      <input type="text" value={brokerProfile.licenseNumber}
                        onChange={e => setBrokerProfile(p => ({ ...p, licenseNumber: e.target.value }))}
                        className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Bio</label>
                    <textarea value={brokerProfile.bio}
                      onChange={e => setBrokerProfile(p => ({ ...p, bio: e.target.value }))}
                      rows={4}
                      className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition resize-none" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800">{vehicles.length}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Listings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800">{sales.length}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-600">ETB {fmt(totalCommission)}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Commission</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => {
                      if (!brokerInfo) return;
                      setBrokerProfile({
                        name: brokerInfo.name,
                        email: brokerInfo.email,
                        phone: brokerInfo.phone,
                        bio: brokerInfo.bio,
                        licenseNumber: brokerInfo.licenseNumber,
                        avatar: brokerInfo.avatar || "",
                      });
                    }} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 cursor-pointer">
                      Reset
                    </button>
                    <button onClick={async () => {
                      if (!brokerInfo) return;
                      setSavingProfile(true);
                      try {
                        const res = await fetch(`/api/users/${brokerInfo.userId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: brokerProfile.name,
                            email: brokerProfile.email,
                            phone: brokerProfile.phone,
                            bio: brokerProfile.bio,
                            avatar: brokerProfile.avatar,
                          }),
                        });
                        if (res.ok) {
                          await fetch(`/api/brokers/${brokerInfo.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              license_number: brokerProfile.licenseNumber,
                              bio: brokerProfile.bio,
                              avatar: brokerProfile.avatar,
                            }),
                          });
                          onNotify("Profile updated successfully!", "success");
                          fetchData();
                        } else {
                          onNotify("Failed to save profile.", "error");
                        }
                      } catch {
                        onNotify("Network error.", "error");
                      }
                      setSavingProfile(false);
                    }} disabled={savingProfile}
                      className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && <VehicleFormModal editing={editingVehicle} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingVehicle(null); }} />}

      {saleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Record Sale</h3>
              <button onClick={() => setSaleModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-800">
              <strong>{saleModal.buyerName}</strong> &mdash; {saleModal.vehicleBrand} {saleModal.vehicleModel}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Sale Price (ETB)</label>
              <input type="number" value={salePrice} onChange={e => setSalePrice(+e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="text-xs text-slate-500">
              Commission (1%): <strong className="text-emerald-600">ETB {fmt(Math.round(salePrice * 0.01))}</strong>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setSaleModal(null)} className="text-sm text-slate-500 px-4 py-2 cursor-pointer">Cancel</button>
              <button onClick={handleRecordSale} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-5 py-2 rounded-lg transition cursor-pointer">Confirm Sale</button>
            </div>
          </div>
        </div>
      )}

      {docUploadModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Upload Document</h3>
              <button onClick={() => setDocUploadModal({ vehicleId: "", open: false })} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Document Name</label>
              <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Customs Clearance" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400">
                <option value="title">Title of Ownership</option>
                <option value="invoice">Invoice</option>
                <option value="customs">Customs Clearance</option>
                <option value="inspection">Inspection Certificate</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">File</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setDocFileData(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDocUploadModal({ vehicleId: "", open: false })} className="text-sm text-slate-500 px-4 py-2 cursor-pointer">Cancel</button>
              <button onClick={handleUploadDoc} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition cursor-pointer">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
