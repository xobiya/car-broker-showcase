import VehicleFormModal from "../components/ui/VehicleFormModal";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Edit3, Car, TrendingUp, Users, DollarSign,
  Bell, X, Save, Menu, LayoutDashboard, List, MessageSquare,
  Calculator, FileText, ClipboardCheck, Send, AlertTriangle, BarChart3,
  ChevronDown, ChevronLeft, ChevronRight, Clock, User, Camera, Check, CheckCheck,
  Mail, AlertCircle, CheckCircle2, XCircle, SlidersHorizontal, LogOut, Phone, MapPin, Gauge,
} from "lucide-react";
import { VehicleListing, Lead, Sale, VehicleDocument } from "@autobroker/shared";
import { api, vehiclesApi, leadsApi, salesApi, brokersApi } from "../lib/api";
import CommissionCalculator from "../components/ui/CommissionCalculator";
import Logo from "../components/ui/Logo";
import SEO from "../components/common/SEO";

// Read the authenticated user stored by AuthModal after login
const getStoredUser = (): { id: string; name: string; email: string; role: string } | null => {
  try { return JSON.parse(localStorage.getItem("autobroker_user") || "null"); } catch { return null; }
};

interface BrokerDashboardProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onLogout?: () => void;
}

type Tab = "dashboard" | "listings" | "leads" | "earnings" | "inspection" | "documents" | "calculator" | "profile" | "notifications";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatCard = ({ icon, label, value, trend, trendUp, sub }: {
  icon: React.ReactNode; label: string; value: string; trend?: string; trendUp?: boolean; sub?: string;
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm transition-colors">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-[#FF4846]">{icon}</div>
      {trend && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trendUp ? "text-[#FF4846]" : "text-rose-500"}`}>
          {trendUp ? <TrendingUp size={13} /> : <AlertTriangle size={13} />} {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    draft: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    approved: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    pending: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    rejected: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
    sold: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    new: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
    contacted: "bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
    negotiating: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
    cancelled: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
    not_inspected: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    passed: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    failed: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colors[status] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
      {status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
      {status === "pending" && <Clock size={10} />}
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/, " ")}
    </span>
  );
};

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
                className={`w-full rounded-sm transition-all duration-500 ${isLast ? "bg-[#FF4846]" : "bg-emerald-200 dark:bg-emerald-950/50"}`}
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

// VehicleFormModal is imported from ../components/ui/VehicleFormModal

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "listings", label: "Listings", icon: <Car size={16} /> },
  { id: "leads", label: "Leads", icon: <Users size={16} /> },
  { id: "earnings", label: "Earnings", icon: <DollarSign size={16} /> },
  { id: "inspection", label: "Inspections", icon: <ClipboardCheck size={16} /> },
  { id: "documents", label: "Documents", icon: <FileText size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [listingFilter, setListingFilter] = useState("all");
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");

  const [brokerInfo, setBrokerInfo] = useState<{ id: string; userId: string; name: string; email: string; phone: string; licenseNumber: string; bio: string; avatar: string; verified: boolean; joinDate: string; } | null>(null);
  const [brokerProfile, setBrokerProfile] = useState({ name: "", email: "", phone: "", bio: "", licenseNumber: "", avatar: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [inspectingDoc, setInspectingDoc] = useState<{ vehicleTitle: string; docUrl: string; docName: string; price: number } | null>(null);

  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id ?? null;

  const fetchData = async () => {
    setLoading(true);
    const [allV, allL, allS, allBrokers] = await Promise.all([
      vehiclesApi.list().catch(() => []),
      leadsApi.list().catch(() => []),
      salesApi.list().catch(() => []),
      brokersApi.list().catch(() => []),
    ]);

    // Match the broker record to the current logged-in user
    const me = allBrokers?.find((b: any) => b.userId === currentUserId);
    const myBrokerId = me?.id ?? null;

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

    if (allV && myBrokerId) {
      const myV: VehicleListing[] = allV.filter((v: VehicleListing) => v.brokerId === myBrokerId);
      const myIds = new Set(myV.map(v => v.id));
      setVehicles(myV);
      if (allL) setLeads(allL.filter((l: Lead) => myIds.has(l.vehicleId)));
      if (allS) setSales(allS.filter((s: Sale) => s.brokerId === myBrokerId));
    }
    // Documents are fetched per-vehicle, not in bulk
    setDocuments([]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (f: any) => {
    if (!brokerInfo) { onNotify("Broker profile not found. Please ensure your account is fully set up.", "error"); return; }
    try {
      const payload: Record<string, unknown> = {
        broker_id: brokerInfo.id, brand: f.brand, model: f.model, year: f.year,
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
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, payload);
      } else {
        await vehiclesApi.create(payload);
      }
      onNotify(editingVehicle ? "Listing updated!" : "Listing saved as draft!", "success");
      setShowForm(false); setEditingVehicle(null); fetchData();
    } catch (err: any) {
      onNotify(err.message || "Error saving listing.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await vehiclesApi.delete(id);
      onNotify("Listing removed.", "success");
      fetchData();
    } catch (err: any) {
      onNotify(err.message || "Error deleting listing.", "error");
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      await vehiclesApi.submit(id);
      onNotify("Submitted for admin approval!", "success");
      fetchData();
    } catch (err: any) {
      onNotify(err.message || "Error submitting listing.", "error");
    }
  };

  const handleLeadStatus = async (id: string, status: Lead["status"]) => {
    try {
      await leadsApi.updateStatus(id, status);
      onNotify(`Lead marked as ${status}.`, "success");
      fetchData();
    } catch (err: any) {
      onNotify(err.message || "Failed to update lead status.", "error");
    }
  };

  const handleRecordSale = async () => {
    if (!saleModal) return;
    try {
      const commission = Math.round(salePrice * 0.01);
      await salesApi.create({
        vehicle_id: saleModal.vehicleId,
        broker_id: brokerInfo?.id || "brk-1",
        buyer_id: saleModal.buyerId,
        sale_price: salePrice,
        commission,
        buyer_name: saleModal.buyerName
      });
      await leadsApi.updateStatus(saleModal.id, "sold");
      onNotify("Sale recorded! Vehicle marked as SOLD.", "success");
      setSaleModal(null);
      fetchData();
    } catch (err: any) {
      onNotify(err.message || "Error recording sale.", "error");
    }
  };

  const handleUploadDoc = async () => {
    if (!docUploadModal.vehicleId || !docName) { onNotify("Please provide a document name and file.", "error"); return; }
    try {
      await api.post("/api/documents", {
        vehicle_id: docUploadModal.vehicleId,
        name: docName,
        type: docType,
        file_url: docFileData || ""
      });
      onNotify("Document uploaded.", "success");
      setDocUploadModal({ vehicleId: "", open: false });
      setDocName("");
      setDocFileData("");
      fetchData();
    } catch (err: any) {
      onNotify(err.message || "Error uploading document.", "error");
    }
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

  const notifications = useMemo(() => {
    const items: Array<{
      id: string; type: "lead" | "listing_pending" | "listing_approved" | "listing_rejected" | "sale";
      title: string; description: string; time: Date; relatedId?: string;
    }> = [];

    leads
      .filter(l => l.status === "new" || l.status === "contacted")
      .forEach(l => {
        items.push({
          id: `lead-${l.id}`,
          type: "lead",
          title: "New Buyer Inquiry",
          description: `${l.buyerName} is interested in ${l.vehicleBrand} ${l.vehicleModel}`,
          time: new Date(l.inquiryDate),
          relatedId: l.vehicleId,
        });
      });

    vehicles
      .filter(v => v.status === "pending" || v.status === "approved" || v.status === "rejected")
      .forEach(v => {
        const key = `listing-${v.id}-${v.status}`;
        if (v.status === "pending") {
          items.push({
            id: key,
            type: "listing_pending",
            title: "Listing Pending Approval",
            description: `${v.brand} ${v.model} (${v.year}) is under review`,
            time: new Date(v.createdAt || Date.now()),
            relatedId: v.id,
          });
        } else if (v.status === "approved") {
          items.push({
            id: key,
            type: "listing_approved",
            title: "Listing Approved",
            description: `${v.brand} ${v.model} is now live on the marketplace`,
            time: new Date(v.createdAt || Date.now()),
            relatedId: v.id,
          });
        } else if (v.status === "rejected") {
          items.push({
            id: key,
            type: "listing_rejected",
            title: "Listing Rejected",
            description: `${v.brand} ${v.model} was not approved${v.rejectionReason ? `: ${v.rejectionReason}` : ""}`,
            time: new Date(v.createdAt || Date.now()),
            relatedId: v.id,
          });
        }
      });

    sales.forEach(s => {
      items.push({
        id: `sale-${s.id}`,
        type: "sale",
        title: "Sale Completed",
        description: `${s.vehicleBrand} ${s.vehicleModel} sold${s.buyerName ? ` to ${s.buyerName}` : ""} — ETB ${fmt(s.salePrice)}`,
        time: new Date(s.saleDate),
        relatedId: s.vehicleId,
      });
    });

    return items.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [leads, vehicles, sales]);

  const markAllRead = () => {
    setReadNotifs(new Set(notifications.map(n => n.id)));
  };

  const toggleRead = (id: string) => {
    setReadNotifs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearNotifs = () => {
    setReadNotifs(new Set(notifications.map(n => n.id)));
  };

  const filteredNotifs = notifFilter === "unread"
    ? notifications.filter(n => !readNotifs.has(n.id))
    : notifications;

  const unreadNotifCount = notifications.filter(n => !readNotifs.has(n.id)).length;

  const groupNotifs = (items: typeof notifications) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const groups: { label: string; items: typeof items }[] = [];
    const todayItems = items.filter(n => n.time >= today);
    const yesterdayItems = items.filter(n => n.time >= yesterday && n.time < today);
    const weekItems = items.filter(n => n.time >= weekAgo && n.time < yesterday);
    const olderItems = items.filter(n => n.time < weekAgo);
    if (todayItems.length) groups.push({ label: "Today", items: todayItems });
    if (yesterdayItems.length) groups.push({ label: "Yesterday", items: yesterdayItems });
    if (weekItems.length) groups.push({ label: "This Week", items: weekItems });
    if (olderItems.length) groups.push({ label: "Earlier", items: olderItems });
    return groups;
  };

  const notifGroups = groupNotifs(filteredNotifs);

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
    <div className="flex h-full bg-slate-50 dark:bg-[#0B0F19] transition-colors">
      <SEO title="Broker Dashboard — Arif Car Sell" noIndex={true} />
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ${sidebarCollapsed ? "w-16" : "w-60"}`}>
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center p-3" : "justify-between p-4"} border-b border-slate-100 dark:border-slate-800`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 bg-[#FF4846] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="8" fill="white" />
                <path d="M24 18C28.4183 18 32 20.6863 32 24C32 27.3137 28.4183 30 24 30C19.5817 30 16 27.3137 16 24C16 20.6863 19.5817 18 24 18Z" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
          ) : (
            <div>
              <Logo size="sm" />
              <p className="text-[9px] font-semibold tracking-wider text-[#FF4846] uppercase mt-0.5">Broker Portal</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shrink-0 transition"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5 px-3"} py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                tab === id ? "bg-[#FF4846] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
              }`}
              title={sidebarCollapsed ? label : undefined}>
              <span className="relative">
                {icon}
                {id === "notifications" && unreadNotifCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center ${tab === id ? "" : ""}`}>
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </span>
              {!sidebarCollapsed && (
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate">{label}</span>
                  {id === "notifications" && unreadNotifCount > 0 && (
                    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? "bg-white/20 text-white" : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"}`}>
                      {unreadNotifCount}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={`${sidebarCollapsed ? "p-2 flex justify-center" : "p-3"} border-t border-slate-100 dark:border-slate-800`}>
          <button onClick={() => { setEditingVehicle(null); setShowForm(true); }}
            className={`flex items-center ${sidebarCollapsed ? "justify-center w-10 h-10" : "justify-center gap-1.5 w-full"} bg-[#FF4846] hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg transition cursor-pointer shadow-sm`}
            title={sidebarCollapsed ? "Add Listing" : undefined}>
            <Plus size={15} />
            {!sidebarCollapsed && "Add Listing"}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 md:px-6 h-14 md:h-16 flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer -ml-1 shrink-0">
              <Menu size={20} />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
              {NAV_ITEMS.find(n => n.id === tab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => { setEditingVehicle(null); setShowForm(true); }}
              className="lg:hidden flex items-center gap-1 bg-[#FF4846] hover:bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Notifications</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                      {newLeads.length > 0 ? newLeads.slice(0, 5).map(l => (
                        <div key={l.id} className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-white">{l.buyerName}</span> sent an inquiry about <span className="font-semibold">{l.vehicleBrand} {l.vehicleModel}</span>
                        </div>
                      )) : (
                        <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">No new notifications</div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center">
                      <button onClick={() => { setNotifOpen(false); setTab("notifications"); }} className="text-xs font-semibold text-[#FF4846] hover:text-emerald-400 cursor-pointer">View All</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-[#FF4846] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {(brokerInfo?.name || "B").split(" ").map(w => w[0]).join("")}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{brokerInfo?.name || "Loading..."}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">Licensed Broker</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{brokerInfo?.name || "Unknown"}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#FF4846]">Licensed Broker</p>
                    </div>
                    <button onClick={() => { setProfileOpen(false); setTab("profile"); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">Profile</button>
                    <button onClick={() => { setProfileOpen(false); onLogout?.(); }} className="w-full text-left px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer">Logout</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {tab === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8 space-y-6">
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

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Recent Leads</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest buyer inquiries</p>
                </div>
              </div>

              {/* Mobile Lead Cards (< md) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {leads.slice(0, 6).map(l => (
                  <div key={l.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#FF4846] text-xs font-bold flex items-center justify-center shrink-0">
                          {l.buyerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{l.buyerName}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{l.vehicleBrand} {l.vehicleModel}</p>
                        </div>
                      </div>
                      <StatusPill status={l.status} />
                    </div>
                    {l.status !== "sold" && l.status !== "cancelled" && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleLeadStatus(l.id, "contacted")}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold text-center transition cursor-pointer"
                        >
                          Contact Buyer
                        </button>
                        <button
                          onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#FF4846] hover:bg-emerald-600 text-white text-xs font-bold text-center transition cursor-pointer"
                        >
                          Mark Sold
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {leads.length === 0 && (
                  <div className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-xs">No leads yet.</div>
                )}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left px-6 py-3">Buyer</th>
                      <th className="text-left px-4 py-3">Vehicle</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {leads.slice(0, 6).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#FF4846] text-xs font-bold flex items-center justify-center shrink-0">
                              {l.buyerName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{l.buyerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-[13px]">{l.vehicleBrand} {l.vehicleModel}</td>
                        <td className="px-4 py-3.5"><StatusPill status={l.status} /></td>
                        <td className="px-4 py-3.5">
                          {l.status !== "sold" && l.status !== "cancelled" ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleLeadStatus(l.id, "contacted")} className="text-xs font-semibold text-[#FF4846] hover:text-emerald-700 transition cursor-pointer">Contact</button>
                              <span className="text-slate-200 dark:text-slate-700">|</span>
                              <button onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition cursor-pointer">Sold</button>
                            </div>
                          ) : <span className="text-xs text-slate-300 dark:text-slate-600 font-medium">—</span>}
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No leads yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "listings" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">My Vehicle Listings</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {vehicles.length} total &middot; {draftListings} drafts &middot; {pendingListings} pending approval
                </p>
              </div>
              <button 
                type="button"
                onClick={() => { setEditingVehicle(null); setShowForm(true); }}
                className="flex items-center justify-center gap-1.5 bg-[#FF4846] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer active:scale-95 w-full sm:w-auto"
              >
                <Plus size={16} /> Add New Listing
              </button>
            </div>

            {/* Horizontal Filter Pill Bar (Native Mobile Feel) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {[
                { id: "all", label: "All Vehicles", count: vehicles.length },
                { id: "approved", label: "Approved", count: activeListings },
                { id: "pending", label: "Pending", count: pendingListings },
                { id: "draft", label: "Drafts", count: draftListings },
                { id: "rejected", label: "Rejected", count: vehicles.filter(v => v.status === "rejected").length },
                { id: "sold", label: "Sold", count: vehicles.filter(v => v.status === "sold").length }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setListingFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    listingFilter === f.id
                      ? "bg-[#FF4846] text-white shadow-sm shadow-[#FF4846]/25"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    listingFilter === f.id ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
              {vehicles.filter(v => listingFilter === "all" ? true : v.status === listingFilter).map(v => (
                <div key={v.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                  <div className="relative h-44 sm:h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <div className="absolute top-2.5 right-2.5"><StatusPill status={v.status} /></div>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="text-white text-base sm:text-sm font-black drop-shadow">{v.brand} {v.model}</p>
                      <p className="text-emerald-300 text-xs font-bold drop-shadow">ETB {fmt(v.price)}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Specs Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">{v.year}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">{v.mileage.toLocaleString()} km</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">{v.fuelType}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">{v.transmission}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">{v.location}</span>
                      </div>

                      {/* Libre Ownership Document Indicator */}
                      {v.ownershipDocumentUrl && (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-2.5 py-1.5 mt-2">
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 truncate">
                            <FileText size={12} /> Libre Attached
                          </span>
                          <button
                            type="button"
                            onClick={() => setInspectingDoc({
                              vehicleTitle: `${v.brand} ${v.model} (${v.year})`,
                              docUrl: v.ownershipDocumentUrl!,
                              docName: v.ownershipDocumentName || "Ownership Libre Document",
                              price: v.price,
                            })}
                            className="text-[11px] font-black text-[#FF4846] hover:underline shrink-0 cursor-pointer"
                          >
                            View Libre
                          </button>
                        </div>
                      )}

                      {(v.status === "rejected" && v.rejectionReason) && (
                        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-2.5 flex items-start gap-2 mt-2.5">
                          <AlertTriangle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-rose-700 dark:text-rose-300">{v.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Touch Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {(v.status === "draft" || v.status === "rejected") && (
                        <button 
                          type="button"
                          onClick={() => handleSubmitForApproval(v.id)} 
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#FF4846] hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-xs font-bold transition cursor-pointer"
                        >
                          <Send size={13} />
                          <span>Submit</span>
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => { setEditingVehicle(v); setShowForm(true); }} 
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(v.id)} 
                        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shrink-0" 
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {vehicles.filter(v => listingFilter === "all" ? true : v.status === listingFilter).length === 0 && (
                <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
                  No listings found for this filter. Click "Add New Listing" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "leads" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Buyer Leads & Inquiries</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{leads.length} total inquiries across your vehicle listings</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {leads.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">No leads yet. When buyers inquire, they will appear here.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leads.map(l => (
                    <div key={l.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#FF4846] text-base font-black flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                          {l.buyerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black text-slate-800 dark:text-white">{l.buyerName}</p>
                            <StatusPill status={l.status} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {l.buyerPhone && (
                              <a href={`tel:${l.buyerPhone}`} className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 hover:underline">
                                <Phone size={12} /> {l.buyerPhone}
                              </a>
                            )}
                            {l.buyerEmail && (
                              <a href={`mailto:${l.buyerEmail}`} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white truncate">
                                <Mail size={12} /> <span className="truncate">{l.buyerEmail}</span>
                              </a>
                            )}
                          </div>
                          {l.message && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-1.5">
                              "{l.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between md:justify-end gap-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{l.vehicleBrand} {l.vehicleModel}</p>
                          {l.vehiclePrice ? <p className="text-xs font-black text-[#FF4846]">ETB {fmt(l.vehiclePrice)}</p> : null}
                        </div>
                        {l.status !== "sold" && l.status !== "cancelled" && (
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <button 
                              type="button"
                              onClick={() => handleLeadStatus(l.id, "negotiating")} 
                              className="flex-1 md:flex-initial text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer text-center"
                            >
                              Negotiating
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setSaleModal(l); setSalePrice(l.vehiclePrice || 0); }} 
                              className="flex-1 md:flex-initial text-xs font-bold bg-[#FF4846] hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-center"
                            >
                              <TrendingUp size={13} /> Record Sale
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
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Earnings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sales and commission breakdown</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{sales.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">ETB {fmt(totalRevenue)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Commission Earned</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">ETB {fmt(totalCommission)}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sales History</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{sales.length} Closed</span>
              </div>
              {sales.length === 0 ? (
                <div className="py-14 text-center text-slate-400 dark:text-slate-500 text-sm">No sales yet.</div>
              ) : (
                <>
                  {/* Mobile Sales Cards (< md) */}
                  <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {sales.map(s => (
                      <div key={s.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{s.vehicleBrand} {s.vehicleModel}</p>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            +ETB {fmt(s.commission)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                          <span>Sale: ETB {fmt(s.salePrice)}</span>
                          <span>{new Date(s.saleDate).toLocaleDateString()}</span>
                        </div>
                        {s.buyerName && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Buyer: {s.buyerName}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table (>= md) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                          <th className="text-left px-6 py-3">Vehicle</th>
                          <th className="text-left px-4 py-3">Sale Price</th>
                          <th className="text-left px-4 py-3">Commission</th>
                          <th className="text-left px-4 py-3">Buyer</th>
                          <th className="text-left px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                        {sales.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200">{s.vehicleBrand} {s.vehicleModel}</td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">ETB {fmt(s.salePrice)}</td>
                            <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">ETB {fmt(s.commission)}</td>
                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{s.buyerName || "—"}</td>
                            <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 text-xs">{new Date(s.saleDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "inspection" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8 space-y-6">
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
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8 space-y-6">
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
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8">
            <div className="max-w-2xl">
              <h2 className="text-base font-bold text-slate-800 mb-4">Commission Calculator</h2>
              <CommissionCalculator />
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8">
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
                        await api.put(`/api/users/${brokerInfo.userId}`, {
                          name: brokerProfile.name,
                          phone: brokerProfile.phone,
                          bio: brokerProfile.bio,
                          avatar: brokerProfile.avatar,
                        });
                        await brokersApi.update(brokerInfo.id, {
                          license_number: brokerProfile.licenseNumber,
                          bio: brokerProfile.bio,
                          avatar: brokerProfile.avatar,
                        });
                        onNotify("Profile updated successfully!", "success");
                        fetchData();
                      } catch (err: any) {
                        onNotify(err.message || "Failed to save profile.", "error");
                      } finally {
                        setSavingProfile(false);
                      }
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

        {tab === "notifications" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 lg:pb-8">
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Notifications</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {unreadNotifCount > 0
                      ? `${unreadNotifCount} unread notification${unreadNotifCount !== 1 ? "s" : ""}`
                      : "All caught up!"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 rounded-lg p-0.5">
                    {(["all", "unread"] as const).map(f => (
                      <button key={f} onClick={() => setNotifFilter(f)}
                        className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer ${
                          notifFilter === f ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <CheckCheck size={14} /> Mark All Read
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No notifications yet</h3>
                  <p className="text-xs text-slate-400 mt-1">Activities like inquiries, approvals, and sales will appear here.</p>
                </div>
              ) : filteredNotifs.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">All caught up!</h3>
                  <p className="text-xs text-slate-400 mt-1">You have no unread notifications.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {notifGroups.map(group => (
                    <div key={group.label}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{group.label}</span>
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] font-bold text-slate-300">{group.items.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        <AnimatePresence initial={false}>
                          {group.items.map(n => {
                            const isRead = readNotifs.has(n.id);
                            const typeConfig = {
                              lead: { icon: Mail, color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
                              listing_pending: { icon: Clock, color: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500" },
                              listing_approved: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
                              listing_rejected: { icon: XCircle, color: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500" },
                              sale: { icon: DollarSign, color: "bg-indigo-50 text-indigo-600 border-indigo-100", dot: "bg-indigo-500" },
                            }[n.type];
                            const Icon = typeConfig.icon;
                            return (
                              <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => toggleRead(n.id)}
                                className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                                  isRead
                                    ? "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                                    : "bg-indigo-50/40 border-indigo-100/60 hover:border-indigo-200 hover:shadow-sm"
                                }`}
                              >
                                {!isRead && (
                                  <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 -ml-0.5" />
                                )}
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${typeConfig.color} ${isRead ? "opacity-70" : ""}`}>
                                  <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex items-start justify-between gap-3">
                                    <h4 className={`text-sm ${isRead ? "font-semibold text-slate-500" : "font-bold text-slate-800"}`}>
                                      {n.title}
                                    </h4>
                                    <span className={`text-[10px] font-medium whitespace-nowrap shrink-0 ${isRead ? "text-slate-300" : "text-slate-400"}`}>
                                      {formatTimeAgo(n.time)}
                                    </span>
                                  </div>
                                  <p className={`text-xs mt-0.5 leading-relaxed ${isRead ? "text-slate-400" : "text-slate-600"}`}>
                                    {n.description}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleRead(n.id); }}
                                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer opacity-0 group-hover:opacity-100 ${
                                    isRead ? "text-slate-300 hover:text-indigo-500 hover:bg-indigo-50" : "text-indigo-400 hover:text-indigo-700 hover:bg-white"
                                  }`}
                                  title={isRead ? "Mark as unread" : "Mark as read"}
                                >
                                  {isRead ? <X size={13} /> : <Check size={13} />}
                                </button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}

                  {notifications.length > 0 && (
                    <div className="text-center pt-2">
                      <button onClick={clearNotifs}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        Clear All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── NATIVE MOBILE APP BOTTOM NAVIGATION BAR ─────────────────────────── */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]"
      >
        <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => { setTab("dashboard"); setMobileMoreOpen(false); }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer ${
              tab === "dashboard" && !mobileMoreOpen
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition ${tab === "dashboard" && !mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
          </button>

          {/* 2. Listings */}
          <button
            type="button"
            onClick={() => { setTab("listings"); setMobileMoreOpen(false); }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              tab === "listings" && !mobileMoreOpen
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${tab === "listings" && !mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <Car size={20} />
              {pendingListings > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {pendingListings}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Listings</span>
          </button>

          {/* 3. Center Floating Action Button: + Add Car */}
          <div className="flex justify-center -mt-5">
            <button
              type="button"
              onClick={() => { setEditingVehicle(null); setShowForm(true); setMobileMoreOpen(false); }}
              aria-label="Add New Car Listing"
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF4846] to-emerald-400 text-white shadow-lg shadow-[#FF4846]/35 flex items-center justify-center active:scale-95 transition-transform cursor-pointer border-2 border-white dark:border-slate-950"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 4. Leads */}
          <button
            type="button"
            onClick={() => { setTab("leads"); setMobileMoreOpen(false); }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              tab === "leads" && !mobileMoreOpen
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${tab === "leads" && !mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <Users size={20} />
              {newLeads.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {newLeads.length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Leads</span>
          </button>

          {/* 5. More */}
          <button
            type="button"
            onClick={() => setMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative ${
              mobileMoreOpen || ["earnings", "inspection", "documents", "calculator", "profile", "notifications"].includes(tab)
                ? "text-[#FF4846] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${mobileMoreOpen ? "bg-emerald-50 dark:bg-emerald-950/40" : ""}`}>
              <SlidersHorizontal size={20} />
              {unreadNotifCount > 0 && (
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
                <h4 className="text-base font-black text-slate-900 dark:text-white">Broker Workspace</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Arif Car Sell Partner Portal</p>
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
                  id: "earnings",
                  label: "Earnings & Sales",
                  desc: `${sales.length} Closed Deals`,
                  icon: DollarSign,
                  color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
                  badge: totalCommission > 0 ? `+ETB ${fmt(totalCommission)}` : null
                },
                {
                  id: "inspection",
                  label: "Inspections",
                  desc: "Vehicle checkups",
                  icon: ClipboardCheck,
                  color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
                  badge: null
                },
                {
                  id: "documents",
                  label: "Documents",
                  desc: `${documents.length} Vehicle papers`,
                  icon: FileText,
                  color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
                  badge: null
                },
                {
                  id: "calculator",
                  label: "Calculator",
                  desc: "Commission & quotes",
                  icon: Calculator,
                  color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
                  badge: null
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  desc: `${unreadNotifCount} Alerts`,
                  icon: Bell,
                  color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
                  badge: unreadNotifCount > 0 ? `${unreadNotifCount}` : null
                },
                {
                  id: "profile",
                  label: "Broker Profile",
                  desc: "License & bio",
                  icon: User,
                  color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40",
                  badge: brokerInfo?.verified ? "Verified" : "Pending"
                }
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id as Tab);
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
                        <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
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

            {/* Quick Profile & Logout */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF4846] text-white font-black flex items-center justify-center text-sm shadow-sm">
                  {(brokerInfo?.name || "B").split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{brokerInfo?.name || "Broker"}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${brokerInfo?.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {brokerInfo?.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{brokerInfo?.phone || brokerInfo?.email || "Licensed Broker"}</p>
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

      {showForm && (
        <VehicleFormModal
          sellerId={brokerInfo?.id || currentUserId || "broker"}
          editing={editingVehicle}
          role="broker"
          onClose={() => { setShowForm(false); setEditingVehicle(null); }}
          onSaved={() => {
            setShowForm(false);
            setEditingVehicle(null);
            fetchData();
            onNotify(editingVehicle ? "Listing updated!" : "Listing submitted successfully!", "success");
          }}
          onNotify={onNotify}
        />
      )}

      {saleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            {/* Sheet Handle */}
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Record Sale</h3>
              <button 
                type="button"
                onClick={() => setSaleModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <strong>{saleModal.buyerName}</strong> &mdash; {saleModal.vehicleBrand} {saleModal.vehicleModel}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Sale Price (ETB)</label>
              <input 
                type="number" 
                value={salePrice} 
                onChange={e => setSalePrice(+e.target.value)} 
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] font-mono font-bold" 
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Commission (1%): <strong className="text-emerald-600 dark:text-emerald-400 font-bold">ETB {fmt(Math.round(salePrice * 0.01))}</strong>
            </div>
            <div className="flex gap-2.5 justify-end pt-2">
              <button 
                type="button"
                onClick={() => setSaleModal(null)} 
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleRecordSale} 
                className="bg-[#FF4846] hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {docUploadModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            {/* Sheet Handle */}
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Upload Document</h3>
              <button 
                type="button"
                onClick={() => setDocUploadModal({ vehicleId: "", open: false })} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Document Name</label>
              <input 
                type="text" 
                value={docName} 
                onChange={e => setDocName(e.target.value)} 
                placeholder="e.g. Customs Clearance" 
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846]" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Document Type</label>
              <select 
                value={docType} 
                onChange={e => setDocType(e.target.value)} 
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846]"
              >
                <option value="title">Title of Ownership</option>
                <option value="invoice">Invoice</option>
                <option value="customs">Customs Clearance</option>
                <option value="inspection">Inspection Certificate</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">File</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setDocFileData(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FF4846] file:text-white hover:file:bg-emerald-600 file:cursor-pointer cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setDocUploadModal({ vehicleId: "", open: false })} 
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleUploadDoc} 
                className="bg-[#FF4846] hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Libre Ownership Document Modal */}
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
                  <FileText size={13} />
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
    </div>
  );
}
