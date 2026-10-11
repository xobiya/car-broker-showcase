import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShieldCheck,
  Users,
  Lock,
  ArrowRight,
  Car,
  Zap,
  CheckCircle2,
  Sparkles,
  MapPin,
  Gauge,
  Fuel,
  ArrowUpRight,
  Award,
  Check,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calculator,
  PhoneCall,
  BadgeCheck,
  Percent,
  Heart,
  Star,
  HelpCircle,
  TrendingUp,
  Tag,
  SlidersHorizontal,
  CheckCheck,
  Settings2
} from "lucide-react";
import { VehicleListing, User } from "../../../shared/types";
import { vehiclesApi } from "../lib/api";

interface HomePageProps {
  currentUser?: User | null;
  onViewDetails: (vehicle: VehicleListing) => void;
  onBrowse: (filters?: {
    brand?: string;
    model?: string;
    year?: string;
    priceRange?: string;
    fuelType?: string;
    bodyType?: string;
    search?: string;
  }) => void;
  onBecomeBroker: () => void;
  onViewBrokerProfile?: (brokerId: string) => void;
  onChooseRole?: () => void;
}

const FALLBACK_VEHICLES: VehicleListing[] = [
  {
    id: "fb-1",
    brokerId: "brk-1",
    brokerName: "Abebe Kebede (Licensed Broker)",
    brokerPhone: "+251 91 123 4567",
    brand: "Toyota",
    model: "RAV4 Hybrid",
    year: 2023,
    mileage: 12500,
    price: 7450000,
    originalPrice: 8000000,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    description: "Limited Edition Hybrid 2023 with Panoramic Sunroof & AWD",
    fuelType: "Hybrid",
    transmission: "Automatic",
    location: "Addis Ababa (Bole)",
    color: "Silver Metallic",
    engineSize: "2.5L Hybrid",
    engineType: "Hybrid Synergy",
    horsepower: 219,
    condition: "Like New",
    bodyType: "SUV"
  },
  {
    id: "fb-2",
    brokerId: "brk-2",
    brokerName: "Dawit Automotive",
    brokerPhone: "+251 92 234 5678",
    brand: "Volkswagen",
    model: "ID.4 Pro",
    year: 2023,
    mileage: 4000,
    price: 8900000,
    originalPrice: 9400000,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    description: "100% Electric, Zero Ethiopian Customs Duty, 520km Range",
    fuelType: "Electric",
    transmission: "Automatic",
    location: "Addis Ababa (Kazanchis)",
    color: "Glacier White",
    engineSize: "Electric 82kWh",
    engineType: "Electric",
    horsepower: 204,
    condition: "Brand New",
    bodyType: "Electric"
  },
  {
    id: "fb-3",
    brokerId: "brk-3",
    brokerName: "Solomon Tadesse",
    brokerPhone: "+251 93 345 6789",
    brand: "Hyundai",
    model: "Tucson SmartStream",
    year: 2023,
    mileage: 0,
    price: 6200000,
    originalPrice: 6500000,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    description: "Brand New 0km, SmartSense safety suite & digital cockpit",
    fuelType: "Hybrid",
    transmission: "Automatic",
    location: "Addis Ababa (Sarbet)",
    color: "Phantom Black",
    engineSize: "1.6L Turbo Hybrid",
    engineType: "Turbo V4",
    horsepower: 226,
    condition: "Brand New",
    bodyType: "SUV"
  },
  {
    id: "fb-4",
    brokerId: "brk-1",
    brokerName: "Abebe Kebede",
    brokerPhone: "+251 91 123 4567",
    brand: "Mercedes-Benz",
    model: "C200 Avantgarde",
    year: 2021,
    mileage: 38000,
    price: 12500000,
    originalPrice: 13200000,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
    description: "Executive Sedan, Full Leather, AMG Line Styling & Ambient Lighting",
    fuelType: "Benzine",
    transmission: "Automatic",
    location: "Addis Ababa (Old Airport)",
    color: "Obsidian Black",
    engineSize: "2.0L Turbo",
    engineType: "Turbo V4",
    horsepower: 204,
    condition: "Excellent",
    bodyType: "Sedan"
  },
  {
    id: "fb-5",
    brokerId: "brk-4",
    brokerName: "Addis Premier Motors",
    brokerPhone: "+251 94 456 7890",
    brand: "Toyota",
    model: "Hilux Double Cabin",
    year: 2022,
    mileage: 29000,
    price: 9800000,
    originalPrice: 10400000,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80",
    description: "4x4 Heavy Duty Double Cabin, 2.8L D-4D Diesel, Bullbar & Rollcage",
    fuelType: "Diesel",
    transmission: "Manual",
    location: "Hawassa",
    color: "Desert Bronze",
    engineSize: "2.8L Diesel",
    engineType: "Turbo Diesel",
    horsepower: 201,
    condition: "Certified Used",
    bodyType: "Pickup"
  },
  {
    id: "fb-6",
    brokerId: "brk-2",
    brokerName: "Dawit Automotive",
    brokerPhone: "+251 92 234 5678",
    brand: "Suzuki",
    model: "Dzire VXI Plus",
    year: 2022,
    mileage: 21000,
    price: 2850000,
    originalPrice: 3100000,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    description: "Extremely fuel-efficient daily driver (22 km/L), Touchscreen & Camera",
    fuelType: "Benzine",
    transmission: "Automatic",
    location: "Adama",
    color: "Glacier White",
    engineSize: "1.2L DualJet",
    engineType: "Inline 4",
    horsepower: 89,
    condition: "Excellent",
    bodyType: "Sedan"
  }
];

const PREMIUM_BRANDS = [
  {
    name: "Toyota",
    tagline: "RAV4, Hilux, Land Cruiser",
    svg: (
      <svg viewBox="0 0 100 70" className="w-10 h-7 fill-slate-800 group-hover:fill-emerald-600 transition-colors">
        <path d="M50 0C22.4 0 0 13.4 0 30c0 16.5 22.4 30 50 30s50-13.5 50-30C100 13.4 77.6 0 50 0zm0 8c20.3 0 38 9.5 43.4 22H66.2C64.6 22 58 15 50 15s-14.6 7-16.2 15H6.6C12 17.5 29.7 8 50 8zm0 13c5.8 0 10.7 7.5 11.8 17H38.2C39.3 28.5 44.2 21 50 21zm-15.8 23c1.6 8 8.2 15 15.8 15s14.2-7 15.8-15h25.8C86 54.5 69.3 62 50 62S14 54.5 8.4 44h25.8z" />
      </svg>
    )
  },
  {
    name: "Mercedes-Benz",
    tagline: "C-Class, E-Class, GLE",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 fill-slate-800 group-hover:fill-emerald-600 transition-colors">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M50 8 L50 50 L14 71 L50 50 L86 71 Z" fill="currentColor" />
      </svg>
    )
  },
  {
    name: "Volkswagen",
    tagline: "ID.4, ID.6, Tiguan",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-800 group-hover:text-emerald-600 transition-colors">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M30 25 L42 62 L50 38 L58 62 L70 25 M36 75 L50 38 L64 75" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Hyundai",
    tagline: "Tucson, Elantra, Santa Fe",
    svg: (
      <svg viewBox="0 0 100 70" className="w-10 h-7 text-slate-800 group-hover:text-emerald-600 transition-colors">
        <ellipse cx="50" cy="35" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(-12 50 35)" />
        <path d="M36 20 L40 50 M60 20 L64 50 M38 35 L62 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: "Suzuki",
    tagline: "Dzire, Swift, Jimny",
    svg: (
      <svg viewBox="0 0 80 80" className="w-7 h-7 fill-slate-800 group-hover:fill-emerald-600 transition-colors">
        <path d="M68 12 L12 36 L40 44 L12 68 L68 44 L40 36 Z" />
      </svg>
    )
  },
  {
    name: "BYD",
    tagline: "Song Plus, Han, Atto 3",
    svg: (
      <div className="font-black text-sm tracking-widest text-slate-900 group-hover:text-emerald-600 transition-colors border-2 border-current px-2.5 py-0.5 rounded-md">
        BYD
      </div>
    )
  },
  {
    name: "Lexus",
    tagline: "RX, NX, LX Series",
    svg: (
      <svg viewBox="0 0 100 70" className="w-10 h-7 text-slate-800 group-hover:text-emerald-600 transition-colors">
        <ellipse cx="50" cy="35" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="5" />
        <path d="M38 20 L38 48 L68 48" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "BMW",
    tagline: "X5, 3 Series, 5 Series",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 fill-slate-800 group-hover:fill-emerald-600 transition-colors">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M50 18 A32 32 0 0 1 82 50 L50 50 Z M18 50 A32 32 0 0 1 50 82 L50 50 Z" fill="currentColor" opacity="0.8" />
      </svg>
    )
  }
];

const CATEGORIES = [
  {
    id: "electric",
    title: "Electric & Hybrids",
    subtitle: "0% Ethiopian customs duty & low daily running costs.",
    filter: { fuelType: "Electric" },
    icon: Zap,
    count: "45+ Cars",
    tag: "Tax Saver"
  },
  {
    id: "suv",
    title: "SUVs & 4x4 Off-Road",
    subtitle: "High ground clearance and AWD built for rough roads.",
    filter: { bodyType: "SUV" },
    icon: Car,
    count: "120+ Cars",
    tag: "High Clearance"
  },
  {
    id: "luxury",
    title: "Executive & Luxury",
    subtitle: "Pristine German & premium sedans across Bole & Kazanchis.",
    filter: { brand: "Mercedes-Benz" },
    icon: Award,
    count: "35+ Cars",
    tag: "VIP Status"
  },
  {
    id: "pickup",
    title: "Heavy-Duty Pickups",
    subtitle: "Commercial & personal Double-Cabin 4x4 haulers.",
    filter: { bodyType: "Pickup" },
    icon: Gauge,
    count: "60+ Cars",
    tag: "Tough Utility"
  },
  {
    id: "budget",
    title: "Daily Drivers (< 4M)",
    subtitle: "Economical runabouts with ultra-low fuel consumption.",
    filter: { priceRange: "under-3m" },
    icon: Fuel,
    count: "80+ Cars",
    tag: "Best Value"
  }
];

const FAQS = [
  {
    q: "How do you verify the car's Libre (ownership title) before sale?",
    a: "Every listed vehicle goes through a mandatory title deed audit. Our licensed brokers cross-verify the Libre with the Addis Ababa Transport Bureau records to guarantee no duplicate registration, outstanding bank liens, or customs duty disputes exist."
  },
  {
    q: "Are electric vehicles (EVs) really exempt from customs duty in Ethiopia?",
    a: "Yes. Under current Ethiopian Ministry of Finance directives, fully electric passenger vehicles (like VW ID.4, BYD Song Plus) enjoy zero customs duty and heavily reduced VAT, making them significantly cheaper to acquire than comparable gasoline vehicles."
  },
  {
    q: "Can I bring my own technician or mechanic for an inspection?",
    a: "Absolutely, we strongly encourage it. The verified broker will arrange an in-person viewing at a safe location where your trusted mechanic can use diagnostic tools, lift checks, and test-drive the vehicle on the road."
  },
  {
    q: "How does the strict 1.5% broker commission cap protect me?",
    a: "Informal roadside brokers routinely inflate car prices by 300,000 to 1,000,000 ETB or take secret margins from both sides. On Arif Car Sell, the vehicle price is direct from the seller, and the broker's compensation is capped at a transparent 1.5% legally disclosed fee."
  },
  {
    q: "What is the process for private sellers listing their car?",
    a: "Private sellers can list their car for free in under 3 minutes. A certified broker in their sub-city (Bole, Yeka, Nifas Silk, etc.) reviews the photos and Libre, schedules a quick 15-minute verification, and brings pre-screened buyers."
  }
];

export default function HomePage({
  onViewDetails,
  onBrowse,
  onBecomeBroker,
  onChooseRole
}: HomePageProps) {
  const [vehicles, setVehicles] = useState<VehicleListing[]>(FALLBACK_VEHICLES);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "electric" | "suv" | "luxury" | "budget">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("autobroker_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search form state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Any Brand");
  const [selectedModel, setSelectedModel] = useState("Any Model");
  const [selectedPrice, setSelectedPrice] = useState("Any Price");

  // Commission Calculator state
  const [calcPrice, setCalcPrice] = useState<number>(6500000);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehiclesApi.list();
        if (res && res.length > 0) {
          const approved = res.filter((v: VehicleListing) => v.status === "approved");
          if (approved.length > 0) {
            setVehicles(approved);
          }
        }
      } catch (err) {
        console.error("Failed to load vehicles for homepage", err);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const uniqueBrands = Array.from(new Set(vehicles.map((v) => v.brand))).filter(Boolean);
    setBrands(uniqueBrands);
  }, [vehicles]);

  useEffect(() => {
    if (selectedBrand === "Any Brand") {
      setModels([]);
      setSelectedModel("Any Model");
    } else {
      const filteredModels = Array.from(
        new Set(vehicles.filter((v) => v.brand === selectedBrand).map((v) => v.model))
      ).filter(Boolean);
      setModels(filteredModels);
      setSelectedModel("Any Model");
    }
  }, [selectedBrand, vehicles]);

  const toggleFavorite = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId];
      try {
        localStorage.setItem("autobroker_favorites", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSearch = () => {
    onBrowse({
      search: searchTerm.trim() ? searchTerm.trim() : undefined,
      brand: selectedBrand !== "Any Brand" ? selectedBrand : undefined,
      model: selectedModel !== "Any Model" ? selectedModel : undefined,
      priceRange: selectedPrice !== "Any Price" ? selectedPrice : undefined
    });
  };

  const handleQuickTagSearch = (tag: { brand?: string; model?: string; fuelType?: string; priceRange?: string }) => {
    onBrowse(tag);
  };

  // Filtered featured vehicles for the active showcase tab
  const filteredFeaturedVehicles = useMemo(() => {
    if (activeTab === "all") return vehicles.slice(0, 6);
    if (activeTab === "electric") {
      const list = vehicles.filter((v) => v.fuelType === "Electric" || v.fuelType === "Hybrid");
      return list.length > 0 ? list.slice(0, 6) : vehicles.slice(0, 6);
    }
    if (activeTab === "suv") {
      const list = vehicles.filter(
        (v) => (v.bodyType || "").toLowerCase() === "suv" || v.model.includes("RAV4") || v.model.includes("Tucson")
      );
      return list.length > 0 ? list.slice(0, 6) : vehicles.slice(0, 6);
    }
    if (activeTab === "luxury") {
      const list = vehicles.filter((v) => v.brand === "Mercedes-Benz" || v.price > 9000000);
      return list.length > 0 ? list.slice(0, 6) : vehicles.slice(0, 6);
    }
    if (activeTab === "budget") {
      const list = vehicles.filter((v) => v.price < 5000000);
      return list.length > 0 ? list.slice(0, 6) : vehicles.slice(0, 6);
    }
    return vehicles.slice(0, 6);
  }, [activeTab, vehicles]);

  // Commission calculations
  const brokerFee = Math.round(calcPrice * 0.015);
  const transferFeeEst = Math.round(calcPrice * 0.012);
  const totalEstimatedCost = calcPrice + brokerFee + transferFeeEst;

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-emerald-500 selection:text-white pb-20 sm:pb-8">
      
      {/* 1. HERO SECTION (Carento Aesthetic: Dark Showroom Architectural Backdrop with Green Accents) */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950 overflow-hidden px-4 sm:px-6 md:px-12 pt-14 pb-20">
        
        {/* Background Dark Architectural Showroom Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80')`
          }}
        />

        {/* Ambient Gradient Overlays for High-Contrast Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto relative z-10 space-y-8">
          
          {/* Main Hero Header Content */}
          <div className="max-w-2xl space-y-5">
            
            {/* Green Sub-tag */}
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Find Your Perfect Car</span>
            </div>

            {/* Carento Signature Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Looking for a vehicle? <br />
              <span className="text-white">You're in the perfect spot.</span>
            </h1>

            {/* 3 Checkmark Bullet Points (Clean Lucide Icons, NO EMOJIS) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-2 text-xs sm:text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                <span>High quality at a low cost.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                <span>Audited Libre & inspections</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                <span>Capped 1.5% broker fee</span>
              </div>
            </div>

          </div>

          {/* Floating Search Pod (Carento Clean Rounded Card Layout) */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200/80 max-w-4xl space-y-4">
            
            {/* Search Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 pb-3">
              {[
                { label: "All Vehicles", val: undefined, icon: Car },
                { label: "Electric & Hybrid", val: "Electric", icon: Zap },
                { label: "SUVs & 4x4", val: "SUV", icon: Car },
                { label: "Executive Sedans", val: "Sedan", icon: Award },
                { label: "Double-Cabin Pickups", val: "Pickup", icon: Gauge }
              ].map((tab, idx) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onBrowse(tab.val ? { bodyType: tab.val } : undefined)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold cursor-pointer transition whitespace-nowrap flex items-center gap-1.5 shrink-0"
                  >
                    <Icon size={13} className="text-emerald-600" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Keyword / Search Text Input */}
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Keyword, model or tag..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Brand Select */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                  Brand / Make
                </label>
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8"
                  >
                    <option value="Any Brand">All Brands</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Model Select */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                  Model
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={selectedBrand === "Any Brand"}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8 disabled:opacity-40"
                  >
                    <option value="Any Model">All Models</option>
                    {models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Bracket Select & Search Button */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-emerald-500/25 active:scale-95 h-[38px] mt-auto"
                >
                  <Search size={15} />
                  <span>Search Vehicles</span>
                </button>
              </div>

            </div>

            {/* Quick Trending Searches */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-600" /> Popular:
              </span>
              <button
                onClick={() => handleQuickTagSearch({ brand: "Toyota", model: "RAV4" })}
                className="hover:text-emerald-600 underline decoration-slate-300 cursor-pointer"
              >
                Toyota RAV4 Hybrid
              </button>
              <span>•</span>
              <button
                onClick={() => handleQuickTagSearch({ fuelType: "Electric" })}
                className="hover:text-emerald-600 underline decoration-emerald-200 cursor-pointer font-semibold text-emerald-700 flex items-center gap-1"
              >
                <Zap size={11} className="text-emerald-600" />
                VW ID.4 (0% Duty)
              </button>
              <span>•</span>
              <button
                onClick={() => handleQuickTagSearch({ brand: "Hyundai", model: "Tucson" })}
                className="hover:text-emerald-600 underline decoration-slate-300 cursor-pointer"
              >
                Hyundai Tucson
              </button>
              <span>•</span>
              <button
                onClick={() => handleQuickTagSearch({ brand: "Mercedes-Benz" })}
                className="hover:text-emerald-600 underline decoration-slate-300 cursor-pointer"
              >
                Mercedes C-Class
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* 2. PREMIUM BRANDS SECTION (Carento Signature Logo Strip: No Emojis, Clean SVG Marks) */}
      <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Premium Brands
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Unveil the Finest Selection of High-End Vehicles
              </p>
            </div>
            <button
              onClick={() => onBrowse()}
              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-600 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto group"
            >
              <span>Show All Brands</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Clean White Rounded Logo Cards (Identical to Carento) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {PREMIUM_BRANDS.map((b) => (
              <button
                key={b.name}
                onClick={() => onBrowse({ brand: b.name })}
                className="group bg-white hover:bg-white border border-slate-200/90 hover:border-emerald-500 rounded-2xl p-4 h-24 flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="shrink-0 flex items-center justify-center">
                  {b.svg}
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
                  {b.name}
                </span>
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* 3. MOST SEARCHED VEHICLES (Carento Signature Featured Section) */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Most Searched Vehicles
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                The world's leading car brands inspected and available in Addis Ababa
              </p>
            </div>

            {/* Filter Pills with Clean Lucide Icons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: "all", label: "All Featured", icon: Car },
                { id: "electric", label: "Electric & Hybrid", icon: Zap },
                { id: "suv", label: "SUVs & 4x4", icon: Car },
                { id: "luxury", label: "Luxury Sedans", icon: Award },
                { id: "budget", label: "Under 5M ETB", icon: Tag }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-full font-bold transition-all cursor-pointer text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 ${
                      activeTab === tab.id
                        ? "bg-slate-950 text-white shadow-md"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Icon size={13} className={activeTab === tab.id ? "text-emerald-400" : "text-slate-500"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeaturedVehicles.map((car) => {
              const isElectric = car.fuelType === "Electric";
              const isHybrid = car.fuelType === "Hybrid";
              const hasDiscount = car.originalPrice && car.originalPrice > car.price;
              const isFavorited = favorites.includes(car.id);
              const seats = (car as any).seats || (car.bodyType === "SUV" || car.model.toLowerCase().includes("prado") || car.model.toLowerCase().includes("patrol") ? "7 seats" : "5 seats");
              const reviewCount = 500 + Math.abs((car.price % 300));

              return (
                <div
                  key={car.id}
                  onClick={() => onViewDetails(car)}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="h-52 sm:h-56 relative bg-slate-100 overflow-hidden">
                    <img
                      src={car.imageUrl}
                      alt={`${car.brand} ${car.model}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <div className="bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={11} className="text-amber-400" />
                        <span>Inspected</span>
                      </div>
                      {isElectric && (
                        <div className="bg-teal-600/95 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded-full flex items-center gap-1 shadow-sm">
                          <Zap size={11} />
                          <span>0% Duty</span>
                        </div>
                      )}
                      {isHybrid && (
                        <div className="bg-blue-600/95 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded-full flex items-center gap-1 shadow-sm">
                          <span>Hybrid</span>
                        </div>
                      )}
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => toggleFavorite(car.id, e)}
                      aria-label="Save vehicle"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-500 flex items-center justify-center shadow-sm transition active:scale-90 cursor-pointer z-10 border border-slate-200"
                    >
                      <Heart
                        size={15}
                        className={isFavorited ? "fill-rose-500 text-rose-500" : "text-slate-600"}
                      />
                    </button>

                    {/* Discount Pill */}
                    {hasDiscount && (
                      <div className="absolute bottom-3 right-3 bg-rose-600 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-xs">
                        Save {Math.round((car.originalPrice - car.price) / 1000)}k ETB
                      </div>
                    )}
                  </div>

                  {/* Floating Centered Rating Pill (Exact Carento Match) */}
                  <div className="flex justify-center -mt-3.5 relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white shadow-md border border-slate-100 px-3.5 py-1 rounded-full text-xs font-bold text-slate-800">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span>4.96 <span className="text-slate-400 font-normal text-[11px]">({reviewCount} reviews)</span></span>
                    </div>
                  </div>

                  {/* Vehicle Details / Description Part */}
                  <div className="p-5 pt-3 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-2">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                        {car.brand} {car.model}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{car.location || "Addis Ababa, Bole"}</span>
                      </div>

                      {/* 2x2 Feature Grid (Speedometer, Transmission, Fuel, Seats) */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 py-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
                        <div className="flex items-center gap-2">
                          <Gauge size={15} className="text-slate-700 shrink-0" />
                          <span className="truncate">{car.mileage.toLocaleString()} km</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Settings2 size={15} className="text-slate-700 shrink-0" />
                          <span className="truncate">{car.transmission || "Automatic"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Fuel size={15} className="text-slate-700 shrink-0" />
                          <span className="truncate">{car.fuelType || "Petrol"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-slate-700 shrink-0" />
                          <span className="truncate">{seats}</span>
                        </div>
                      </div>

                      {/* Broker Attribution */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <BadgeCheck size={14} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                          Broker: <strong className="text-slate-800 font-semibold">{car.brokerName || "Verified Partner Broker"}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions Row (strictly preserving "View Details" and "Inquire" button labels) */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
                        <div className="text-base sm:text-lg font-black text-slate-950">
                          {(car.price / 1000000).toFixed(2)}M ETB
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(car);
                          }}
                          className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95"
                        >
                          <span>View Details</span>
                          <ArrowUpRight size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (car.brokerPhone) {
                              window.location.href = `tel:${car.brokerPhone}`;
                            } else {
                              onViewDetails(car);
                            }
                          }}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        >
                          <PhoneCall size={13} className="text-amber-500" />
                          <span>Inquire</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Showroom CTA */}
          <div className="text-center pt-2">
            <button
              onClick={() => onBrowse()}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Explore All {vehicles.length}+ Available Listings</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>


      {/* 4. CATEGORIES / BODY TYPE SECTION */}
      <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Browse by Body Type
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              From city driving across Addis to rugged regional trips
            </p>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => onBrowse(cat.filter)}
                  className="min-w-[240px] sm:min-w-0 snap-start bg-white border border-slate-200/90 hover:border-emerald-500 rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-xs hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {cat.count}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      {cat.tag}
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1 border-t border-slate-100">
                    <span>Browse Models</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 5. PRICE & COMMISSION ESTIMATOR */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Transparent Cost Calculator
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Calculate exact out-of-pocket acquisition costs and capped fees
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
            
            {/* Quick Price Preset Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider shrink-0 mr-1">
                Presets:
              </span>
              {[
                { label: "2.8M (Dzire)", val: 2850000 },
                { label: "6.2M (Tucson)", val: 6200000 },
                { label: "7.5M (RAV4)", val: 7450000 },
                { label: "8.9M (ID.4 EV)", val: 8900000 },
                { label: "12.5M (C-Class)", val: 12500000 }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setCalcPrice(p.val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition ${
                    calcPrice === p.val
                      ? "bg-slate-950 text-white font-bold shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Vehicle Price:
                </label>
                <div className="text-xl sm:text-2xl font-black text-slate-950">
                  {(calcPrice / 1000000).toFixed(2)} Million ETB{" "}
                  <span className="text-xs font-normal text-slate-500">({calcPrice.toLocaleString()} ETB)</span>
                </div>
              </div>
              
              <input
                type="range"
                min="1000000"
                max="25000000"
                step="250000"
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>1.0M ETB (Compact)</span>
                <span>6.5M ETB (Average SUV)</span>
                <span>25.0M ETB (Luxury/Commercial)</span>
              </div>
            </div>

            {/* Computation Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-200">
              
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  Capped Broker Fee (1.5% max)
                </span>
                <p className="text-xl font-black text-slate-900">
                  {brokerFee.toLocaleString()} ETB
                </p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check size={12} /> Capped legally by contract
                </span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  Est. Govt Title Stamp (~1.2%)
                </span>
                <p className="text-xl font-black text-slate-900">
                  {transferFeeEst.toLocaleString()} ETB
                </p>
                <span className="text-[10px] text-slate-500">Addis Transport Bureau stamp</span>
              </div>

              <div className="bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block tracking-wider">
                  Estimated Total Acquisition
                </span>
                <p className="text-xl font-black text-emerald-700">
                  {totalEstimatedCost.toLocaleString()} ETB
                </p>
                <span className="text-[10px] text-emerald-800 font-semibold">Zero surprise middleman cuts</span>
              </div>

            </div>

            {/* Bottom Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-600 text-center sm:text-left">
                Ready to find verified cars that match this budget?
              </p>
              <button
                onClick={() => {
                  let range = "under-3m";
                  if (calcPrice >= 3000000 && calcPrice < 6000000) range = "3m-6m";
                  else if (calcPrice >= 6000000 && calcPrice < 10000000) range = "6m-10m";
                  else if (calcPrice >= 10000000 && calcPrice < 20000000) range = "10m-20m";
                  else if (calcPrice >= 20000000) range = "over-20m";
                  onBrowse({ priceRange: range });
                }}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <span>Browse Listings Around {(calcPrice / 1000000).toFixed(1)}M ETB</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* 6. WHY CHOOSE ARIF CAR SELL */}
      <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-9">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Why Choose Arif Car Sell
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              We eliminated the shady practices, ghost listings, and surprise markups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">
                150-Point Diagnostic Check
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chassis alignment, OBD-II computer scans, and battery health tests on every vehicle.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <Users size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Licensed Addis Brokers
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accredited professionals with registered tax IDs accompany you to viewings and signings.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <Lock size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Authentic Libre Audits
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physically verified in Addis Ababa with verified ownership deeds and zero bank liens.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                <Percent size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Capped 1.5% Fee
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent legal contracts with zero hidden commission splits or roadside markups.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Answers to common questions about buying and selling cars in Ethiopia.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4.5 sm:p-5 font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:text-emerald-600 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
