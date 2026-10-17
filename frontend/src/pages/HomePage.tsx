import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Settings2,
  Shield,
  Clock,
  FileCheck2,
  User as UserIcon,
  X
} from "lucide-react";
import { VehicleListing, User } from "../../../shared/types";
import { vehiclesApi, settingsApi } from "../lib/api";

const DEFAULT_HERO_BG = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85";

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

const ETHIOPIA_TOP_BRANDS = [
  {
    name: "Toyota",
    count: "120+ Cars",
    tagline: "Corolla, RAV4, Hilux",
    svg: (
      <svg viewBox="0 0 100 70" className="w-10 h-7 fill-current">
        <path d="M50 0C22.4 0 0 13.4 0 30c0 16.5 22.4 30 50 30s50-13.5 50-30C100 13.4 77.6 0 50 0zm0 8c20.3 0 38 9.5 43.4 22H66.2C64.6 22 58 15 50 15s-14.6 7-16.2 15H6.6C12 17.5 29.7 8 50 8zm0 13c5.8 0 10.7 7.5 11.8 17H38.2C39.3 28.5 44.2 21 50 21zm-15.8 23c1.6 8 8.2 15 15.8 15s14.2-7 15.8-15h25.8C86 54.5 69.3 62 50 62S14 54.5 8.4 44h25.8z" />
      </svg>
    )
  },
  {
    name: "Hyundai",
    count: "68+ Cars",
    tagline: "Tucson, Elantra, Atos",
    svg: (
      <svg viewBox="0 0 100 70" className="w-10 h-7 text-current">
        <ellipse cx="50" cy="35" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(-12 50 35)" />
        <path d="M36 20 L40 50 M60 20 L64 50 M38 35 L62 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    name: "Suzuki",
    count: "55+ Cars",
    tagline: "Dzire, Swift, S-Presso",
    svg: (
      <svg viewBox="0 0 80 80" className="w-8 h-8 fill-current">
        <path d="M68 12 L12 36 L40 44 L12 68 L68 44 L40 36 Z" />
      </svg>
    )
  },
  {
    name: "BYD",
    count: "42+ Cars",
    tagline: "Atto 3, Song Plus, Seagull",
    svg: (
      <div className="font-black text-sm tracking-widest border-2 border-current px-2.5 py-0.5 rounded-md">
        BYD
      </div>
    )
  },
  {
    name: "Volkswagen",
    count: "38+ Cars",
    tagline: "ID.4, ID.6, Tiguan",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 text-current">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M30 25 L42 62 L50 38 L58 62 L70 25 M36 75 L50 38 L64 75" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Isuzu",
    count: "34+ Cars",
    tagline: "D-Max, NPR, Forward",
    svg: (
      <div className="font-black text-xs tracking-wider border-2 border-current px-2 py-0.5 rounded-md">
        ISUZU
      </div>
    )
  },
  {
    name: "Mercedes-Benz",
    count: "26+ Cars",
    tagline: "C-Class, E-Class, G-Wagon",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M50 8 L50 50 L14 71 L50 50 L86 71 Z" fill="currentColor" />
      </svg>
    )
  },
  {
    name: "Lexus",
    count: "22+ Cars",
    tagline: "LX 570, LX 600, RX 350",
    svg: (
      <svg viewBox="0 0 100 70" className="w-10 h-7 text-current">
        <ellipse cx="50" cy="35" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="5" />
        <path d="M38 20 L38 48 L68 48" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Nissan",
    count: "20+ Cars",
    tagline: "Patrol, X-Trail, Hardbody",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 text-current">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="15" y="42" width="70" height="16" rx="2" fill="currentColor" />
      </svg>
    )
  },
  {
    name: "Kia",
    count: "18+ Cars",
    tagline: "Sportage, Seltos, Pegas",
    svg: (
      <svg viewBox="0 0 100 50" className="w-10 h-5 text-current">
        <ellipse cx="50" cy="25" rx="48" ry="22" fill="none" stroke="currentColor" strokeWidth="4" />
        <text x="50" y="32" fontSize="20" fontWeight="900" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">KIA</text>
      </svg>
    )
  },
  {
    name: "Mitsubishi",
    count: "16+ Cars",
    tagline: "Pajero, L200 Pickup",
    svg: (
      <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current">
        <polygon points="50,15 62,38 38,38" />
        <polygon points="62,38 88,38 75,60" />
        <polygon points="38,38 12,38 25,60" />
      </svg>
    )
  },
  {
    name: "Chery",
    count: "15+ Cars",
    tagline: "Tiggo 8, Jetour Dashing",
    svg: (
      <div className="font-black text-xs tracking-wider border-2 border-current px-2 py-0.5 rounded-md">
        CHERY
      </div>
    )
  }
];

const ETHIOPIAN_LOCATIONS = [
  "Any Location",
  "Addis Ababa (Bole)",
  "Addis Ababa (Kazanchis)",
  "Addis Ababa (Sarbet)",
  "Addis Ababa (CMC / Ayat)",
  "Addis Ababa (Gerji)",
  "Adama (Nazret)",
  "Hawassa",
  "Bahir Dar",
  "Dire Dawa"
];

const CATEGORIES = [
  {
    id: "electric",
    title: "Electric & Hybrids",
    subtitle: "0% Ethiopian customs duty & low daily running costs.",
    filter: { fuelType: "Electric" },
    icon: Zap,
    count: "45+ Cars",
    tag: "0% Customs Duty",
    color: "from-emerald-500/20 to-teal-500/5",
    accent: "text-emerald-500"
  },
  {
    id: "suv",
    title: "SUVs & 4x4 Off-Road",
    subtitle: "High ground clearance and AWD built for rough roads.",
    filter: { bodyType: "SUV" },
    icon: Car,
    count: "120+ Cars",
    tag: "High Clearance",
    color: "from-blue-500/20 to-indigo-500/5",
    accent: "text-blue-500"
  },
  {
    id: "luxury",
    title: "Executive & Luxury",
    subtitle: "Pristine German & premium sedans across Bole & Kazanchis.",
    filter: { brand: "Mercedes-Benz" },
    icon: Award,
    count: "35+ Cars",
    tag: "VIP Status",
    color: "from-purple-500/20 to-pink-500/5",
    accent: "text-purple-500"
  },
  {
    id: "pickup",
    title: "Heavy-Duty Pickups",
    subtitle: "Commercial & personal Double-Cabin 4x4 haulers.",
    filter: { bodyType: "Pickup" },
    icon: Gauge,
    count: "60+ Cars",
    tag: "Tough Utility",
    color: "from-amber-500/20 to-orange-500/5",
    accent: "text-amber-500"
  },
  {
    id: "budget",
    title: "Daily Drivers (< 4M)",
    subtitle: "Economical runabouts with ultra-low fuel consumption.",
    filter: { priceRange: "under-3m" },
    icon: Fuel,
    count: "80+ Cars",
    tag: "Best Value",
    color: "from-cyan-500/20 to-blue-500/5",
    accent: "text-cyan-500"
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

const COMPARISONS = [
  {
    feature: "Vehicle Price & Markups",
    roadside: "Inflated by 300,000 – 1,000,000 ETB by roadside delalas",
    arif: "Direct seller price with zero hidden middleman cuts",
    highlight: true
  },
  {
    feature: "Ownership (Libre) Verification",
    roadside: "High risk of duplicate papers, bank liens, or tax dispute",
    arif: "100% physically audited with Addis Ababa Transport Bureau",
    highlight: true
  },
  {
    feature: "Broker Commission",
    roadside: "Unregulated 3% – 10% cuts demanded from both sides",
    arif: "Strictly capped at 1.5% legally bound by written contract",
    highlight: true
  },
  {
    feature: "Mechanical Condition",
    roadside: "Zero diagnostic checks; sold strictly 'as-is'",
    arif: "150-Point OBD-II scan & battery health report provided",
    highlight: true
  },
  {
    feature: "Legal Safety & Contracts",
    roadside: "Informal street handshakes with zero legal accountability",
    arif: "Licensed brokers with TIN, legal contracts & escrow guidance",
    highlight: true
  }
];

const TESTIMONIALS = [
  {
    quote: "Purchased a 2023 VW ID.4 without the usual roadside broker chaos. The 0% customs duty paperwork was completely authentic and title transfer took less than 2 hours at the Transport Bureau.",
    name: "Dr. Meron Alemu",
    role: "Verified Customer",
    location: "Addis Ababa (Bole)",
    vehicle: "2023 VW ID.4 Pro",
    rating: 5
  },
  {
    quote: "Sold my Toyota RAV4 Hybrid through Dawit Automotive. Received 3 serious buyers within 48 hours and closed at 7.45M ETB without paying unfair delala cuts.",
    name: "Yared Getachew",
    role: "Verified Car Owner",
    location: "Addis Ababa (Kazanchis)",
    vehicle: "2023 Toyota RAV4 Hybrid",
    rating: 5
  },
  {
    quote: "As someone returning to Ethiopia, navigating local car markets was intimidating. Arif Car Sell's transparent 1.5% fee and mechanic inspection gave me complete confidence.",
    name: "Tigist Haile",
    role: "Diaspora Customer",
    location: "Addis Ababa (Old Airport)",
    vehicle: "2022 Hyundai Tucson",
    rating: 5
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
  const [howItWorksTab, setHowItWorksTab] = useState<"buyers" | "sellers">("buyers");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroBgImage, setHeroBgImage] = useState<string>(() => {
    return localStorage.getItem("autobroker_hero_bg") || DEFAULT_HERO_BG;
  });

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
  const [selectedLocation, setSelectedLocation] = useState("Any Location");
  const [selectedBodyType, setSelectedBodyType] = useState("Any Type");
  const [carConditionTab, setCarConditionTab] = useState<"all" | "new" | "used">("all");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Horizontal scroll tracking for Browse by Body Type
  const bodyTypeScrollRef = useRef<HTMLDivElement>(null);
  const [bodyTypeCanScrollLeft, setBodyTypeCanScrollLeft] = useState(false);
  const [bodyTypeCanScrollRight, setBodyTypeCanScrollRight] = useState(true);
  const [bodyTypeScrollProgress, setBodyTypeScrollProgress] = useState(0);

  const handleBodyTypeScroll = () => {
    const el = bodyTypeScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setBodyTypeCanScrollLeft(scrollLeft > 10);
    setBodyTypeCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setBodyTypeScrollProgress(progress);
  };

  const scrollBodyType = (direction: "left" | "right") => {
    if (bodyTypeScrollRef.current) {
      const amount = direction === "left" ? -280 : 280;
      bodyTypeScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Load Hero Background Image from Settings & Listen for Admin Updates
  useEffect(() => {
    const loadHeroSetting = async () => {
      try {
        const res = await settingsApi.get("hero_bg_image");
        if (res && res.value) {
          setHeroBgImage(res.value);
          localStorage.setItem("autobroker_hero_bg", res.value);
        }
      } catch {
        // keep fallback or cached
      }
    };
    loadHeroSetting();

    const handleHeroUpdate = (e: any) => {
      if (e?.detail) {
        setHeroBgImage(e.detail);
      }
    };
    window.addEventListener("autobroker:hero_bg_updated", handleHeroUpdate);
    return () => window.removeEventListener("autobroker:hero_bg_updated", handleHeroUpdate);
  }, []);

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
      priceRange: selectedPrice !== "Any Price" ? selectedPrice : undefined,
      bodyType: selectedBodyType !== "Any Type" ? selectedBodyType : undefined
    });
  };

  const handleQuickTagSearch = (tag: { brand?: string; model?: string; fuelType?: string; priceRange?: string; bodyType?: string }) => {
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
      const list = vehicles.filter((v) => v.brand === "Mercedes-Benz" || v.brand === "BMW" || v.price > 9000000);
      return list.length > 0 ? list.slice(0, 6) : vehicles.slice(0, 6);
    }
    if (activeTab === "budget") {
      const list = vehicles.filter((v) => v.price < 5000000);
      return list.length > 0 ? list.slice(0, 6) : vehicles.slice(0, 6);
    }
    return vehicles.slice(0, 6);
  }, [activeTab, vehicles]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white pb-16 transition-colors duration-200">
      
      {/* 1. CINEMATIC HERO SECTION (MATCHING SCREENSHOT 1) */}
      <section className="relative min-h-[440px] sm:min-h-[580px] lg:min-h-[660px] flex flex-col justify-center bg-slate-950 overflow-hidden px-4 sm:px-8 md:px-16 pt-8 sm:pt-16 pb-16 sm:pb-32">
        
        {/* Background Image — Showroom & Luxury Car visible on the right */}
        <div 
          className="absolute inset-0 bg-cover bg-right lg:bg-center bg-no-repeat transition-all duration-700 opacity-90"
          style={{
            backgroundImage: `url('${heroBgImage}')`
          }}
        />

        {/* Ambient Dark Gradients — Keep left side high contrast for typography while vehicle on right shines */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto relative z-10">
          
          {/* Left-Aligned Hero Content Area (Exact Layout from Screenshot 1) */}
          <div className="text-left max-w-2xl space-y-3 sm:space-y-4">

            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#22c55e] tracking-wide">
              <span>Find Your Perfect Car</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[56px] font-black text-white tracking-tight leading-[1.15]">
              Looking for a vehicle? <br />
              <span className="text-white">
                You're in the perfect spot.
              </span>
            </h1>

            {/* 3 Bullet Checklist Highlights with Green Circle Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-x-6 sm:gap-y-3 pt-1.5 sm:pt-3 text-[11px] sm:text-sm font-semibold text-white">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#22c55e] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#22c55e]/30">
                  <Check size={10} strokeWidth={3.5} className="text-slate-950" />
                </div>
                <span>High quality at a low cost.</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#22c55e] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#22c55e]/30">
                  <Check size={10} strokeWidth={3.5} className="text-slate-950" />
                </div>
                <span>Premium services.</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#22c55e] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#22c55e]/30">
                  <Check size={10} strokeWidth={3.5} className="text-slate-950" />
                </div>
                <span>24/7 roadside support.</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* FLOATING SEARCH BAR (MATCHING SCREENSHOT 2) */}
      <div className="relative z-20 max-w-6xl mx-auto px-3 sm:px-4 -mt-10 sm:-mt-20">
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 dark:border-slate-800">
          
          {/* Tabs Row: Condition Filter & Need Help Link */}
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCarConditionTab("all")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  carConditionTab === "all"
                    ? "bg-[#22c55e] text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                All cars
              </button>
              <button
                type="button"
                onClick={() => setCarConditionTab("new")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  carConditionTab === "new"
                    ? "bg-[#22c55e] text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                New cars
              </button>
              <button
                type="button"
                onClick={() => setCarConditionTab("used")}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  carConditionTab === "used"
                    ? "bg-[#22c55e] text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                Used cars
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#22c55e] transition cursor-pointer"
            >
              <UserIcon size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Need help?</span>
            </button>
          </div>

          {/* Search Inputs Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 items-center">
            
            {/* Pick Up Location */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Pick Up Location
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none cursor-pointer"
                >
                  {ETHIOPIAN_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Make / Brand */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Make / Brand
              </label>
              <div className="relative">
                <Car size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="Any Brand">All Brands</option>
                  {ETHIOPIA_TOP_BRANDS.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Vehicle Type
              </label>
              <div className="relative">
                <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="Any Type">All Types</option>
                  <option value="SUV">SUV & 4x4</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Electric">Electric / Hybrid</option>
                  <option value="Pickup">Pickup & Commercial</option>
                  <option value="Hatchback">Compact / Hatchback</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Max Budget */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Max Budget
              </label>
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="Any Price">Any Budget</option>
                  <option value="under-3m">Under 3.0M ETB</option>
                  <option value="3m-6m">3.0M – 6.0M ETB</option>
                  <option value="6m-10m">6.0M – 10.0M ETB</option>
                  <option value="10m-20m">10.0M – 20.0M ETB</option>
                  <option value="over-20m">Over 20.0M ETB</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Submit Search Button (exact pill green in screenshot) */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full h-[40px] bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-emerald-500/20 active:scale-95 text-xs sm:text-sm"
              >
                <Search size={16} strokeWidth={2.5} />
                <span>Find a Vehicle</span>
              </button>
            </div>

          </div>

        </div>
      </div>


      {/* 2. EXPLORE LEADING BRANDS - HORIZONTAL INFINITE CAROUSEL */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-6">
          
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Explore Leading Brands
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Unveil the Finest Selection of High-End & Popular Vehicles in Ethiopia
              </p>
            </div>
            <button
              onClick={() => onBrowse()}
              className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-[#22c55e] transition flex items-center gap-1.5 cursor-pointer shrink-0 group"
            >
              <span>Show All Brands</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Horizontal Continuous Marquee with Edge Fade Masks */}
          <div className="relative overflow-hidden w-full py-2">
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-[#0E1424] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-[#0E1424] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-infinite flex gap-4 sm:gap-5">
              {[...ETHIOPIA_TOP_BRANDS, ...ETHIOPIA_TOP_BRANDS].map((b, idx) => (
                <button
                  key={`${b.name}-${idx}`}
                  onClick={() => onBrowse({ brand: b.name })}
                  className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 rounded-2xl p-4 min-w-[160px] sm:min-w-[180px] h-[95px] flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer text-slate-800 dark:text-slate-200 shrink-0"
                >
                  <div className="shrink-0 flex items-center justify-center group-hover:text-[#22c55e] transition-colors h-9">
                    {b.svg}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#22c55e] transition-colors tracking-tight">
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* 3. MOST SEARCHED VEHICLES (FEATURED SHOWCASE) */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Most Searched Vehicles
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Handpicked models with verified ownership and guaranteed physical inspection.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="relative max-w-full">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0">
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
                          ? "bg-slate-950 dark:bg-[#22c55e] text-white dark:text-slate-950 shadow-md font-black"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon size={13} className={activeTab === tab.id ? "text-emerald-400 dark:text-slate-950" : "text-slate-500 dark:text-slate-400"} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white dark:from-[#0B0F19] to-transparent sm:hidden" />
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
                  className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="h-52 sm:h-56 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
                        <div className="bg-emerald-600/95 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded-full flex items-center gap-1 shadow-sm">
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
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-rose-500 flex items-center justify-center shadow-sm transition active:scale-90 cursor-pointer z-10 border border-slate-200 dark:border-slate-700"
                    >
                      <Heart
                        size={15}
                        className={isFavorited ? "fill-rose-500 text-rose-500" : "text-slate-600 dark:text-slate-300"}
                      />
                    </button>

                    {/* Discount Pill */}
                    {hasDiscount && (
                      <div className="absolute bottom-3 right-3 bg-rose-600 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-xs">
                        Save {Math.round((car.originalPrice - car.price) / 1000)}k ETB
                      </div>
                    )}
                  </div>

                  {/* Rating Pill */}
                  <div className="flex justify-center -mt-3.5 relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 px-3.5 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span>4.96 <span className="text-slate-400 font-normal text-[11px]">({reviewCount} reviews)</span></span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-5 pt-3 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#22c55e] transition-colors truncate">
                        {car.brand} {car.model}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{car.location || "Addis Ababa, Bole"}</span>
                      </div>

                      {/* 2x2 Feature Grid */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <Gauge size={15} className="text-slate-400 shrink-0" />
                          <span className="truncate">{car.mileage.toLocaleString()} km</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Settings2 size={15} className="text-slate-400 shrink-0" />
                          <span className="truncate">{car.transmission || "Automatic"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Fuel size={15} className="text-slate-400 shrink-0" />
                          <span className="truncate">{car.fuelType || "Petrol"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-slate-400 shrink-0" />
                          <span className="truncate">{seats}</span>
                        </div>
                      </div>

                      {/* Broker Attribution */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <BadgeCheck size={14} className="text-[#22c55e] shrink-0" />
                        <span className="truncate">
                          Broker: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{car.brokerName || "Verified Partner Broker"}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions Row */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
                        <div className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                          {(car.price / 1000000).toFixed(2)}M ETB
                        </div>
                        <span className="text-[10px] text-slate-400 block">{car.price.toLocaleString()} ETB</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(car);
                          }}
                          className="bg-slate-950 dark:bg-[#22c55e] hover:bg-slate-900 dark:hover:bg-[#16a34a] text-white dark:text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95"
                        >
                          <span>View</span>
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
                          className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        >
                          <PhoneCall size={13} className="text-[#22c55e]" />
                          <span>Call</span>
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
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-950 dark:bg-[#22c55e] hover:bg-slate-900 dark:hover:bg-[#16a34a] text-white dark:text-slate-950 text-xs sm:text-sm font-black transition cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Explore All {vehicles.length}+ Available Listings</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>


      {/* 4. HOW IT WORKS */}
      <section className="py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-9">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              How Arif Car Sell Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              We streamlined vehicle transactions in Ethiopia into three secure and transparent stages.
            </p>

            {/* Action Segmented Control */}
            <div className="inline-flex p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xs mt-2">
              <button
                onClick={() => setHowItWorksTab("buyers")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  howItWorksTab === "buyers"
                    ? "bg-[#22c55e] text-slate-950 font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                Buying a Car
              </button>
              <button
                onClick={() => setHowItWorksTab("sellers")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  howItWorksTab === "sellers"
                    ? "bg-[#22c55e] text-slate-950 font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                Selling a Car
              </button>
            </div>
          </div>

          {/* 3 Step Cards */}
          {howItWorksTab === "buyers" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#16a34a] dark:text-[#22c55e] flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Browse & Verify Libre
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Search through 100% physically inspected vehicles with ownership deed (Libre) cross-audited against Addis Transport records to ensure zero liens.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-[#22c55e] flex items-center gap-1">
                  <ShieldCheck size={14} /> Zero fake paperwork risks
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Road Test & Inspection
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Meet the licensed broker at a safe Addis location. Test drive the car and bring your personal technician or mechanic to run complete diagnostic checks.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> OBD-II & lift inspection friendly
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Legal Settlement & Handover
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pay through verified bank transfer with our legally capped 1.5% commission agreement. Our broker coordinates ownership title transfer at the bureau.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Percent size={14} /> Legally capped 1.5% fee
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#16a34a] dark:text-[#22c55e] flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  List Free in 3 Minutes
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Post vehicle specifications, mileage, photo gallery, and your asking price. No upfront listing fees or subscriptions required.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-[#22c55e] flex items-center gap-1">
                  <Sparkles size={14} /> 100% Free listing creation
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Local Broker Assignment
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  A certified broker in your sub-city (Bole, Yeka, Nifas Silk, etc.) manages calls, filters unserious offers, and coordinates pre-qualified buyer viewings.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Users size={14} /> Zero phone spam or tire-kickers
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/20 text-[#16a34a] dark:text-[#22c55e] flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Direct Bank Payout
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Receive 98.5% of the agreed vehicle price directly in your bank account upon signature. Zero hidden commission deductions or surprises.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-[#22c55e] flex items-center gap-1">
                  <CheckCheck size={14} /> Fast, safe bank settlement
                </div>
              </div>

            </div>
          )}

        </div>
      </section>


      {/* 5. BROWSE BY BODY TYPE SECTION (WITH CLEAR HORIZONTAL SCROLL INDICATION) */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-8">
          
          {/* Section Header with Title & Scroll Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22c55e] uppercase tracking-wider">
                <Car size={13} />
                <span>Vehicle Categories</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Browse by Body Type
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                From city driving across Addis to rugged regional trips.
              </p>
            </div>

            {/* Scroll Buttons (Arrows for desktop & mobile) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => scrollBodyType("left")}
                disabled={!bodyTypeCanScrollLeft}
                className={`w-9 h-9 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition ${
                  bodyTypeCanScrollLeft
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs cursor-pointer active:scale-90 hover:border-[#22c55e]"
                    : "opacity-40 text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                }`}
                aria-label="Scroll categories left"
                title="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollBodyType("right")}
                disabled={!bodyTypeCanScrollRight}
                className={`w-9 h-9 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition ${
                  bodyTypeCanScrollRight
                    ? "bg-[#22c55e] text-slate-950 shadow-md shadow-[#22c55e]/20 cursor-pointer active:scale-90 hover:bg-[#16a34a]"
                    : "opacity-40 text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                }`}
                aria-label="Scroll categories right"
                title="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Container with Edge Fade Indicators */}
          <div className="relative">
            {/* Left Edge Fade Cue */}
            <div
              className={`pointer-events-none absolute left-0 top-0 bottom-2 w-10 sm:w-16 bg-gradient-to-r from-white dark:from-[#0B0F19] to-transparent z-10 transition-opacity duration-300 ${
                bodyTypeCanScrollLeft ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Scroll Track */}
            <div
              ref={bodyTypeScrollRef}
              onScroll={handleBodyTypeScroll}
              className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => onBrowse(cat.filter)}
                    className="min-w-[230px] w-[72vw] max-w-[280px] sm:min-w-0 sm:w-auto snap-start bg-slate-50/70 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-xs hover:shadow-xl hover:-translate-y-1 shrink-0 sm:shrink"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-[#22c55e] flex items-center justify-center shadow-xs">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                        {cat.count}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-[#22c55e] uppercase tracking-wider">
                        {cat.tag}
                      </div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#22c55e] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {cat.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-[#22c55e] pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Browse Models</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Edge Fade Cue with Animated Pulse Arrow */}
            <div
              className={`pointer-events-none absolute right-0 top-0 bottom-2 w-12 sm:w-16 bg-gradient-to-l from-white dark:from-[#0B0F19] to-transparent z-10 flex items-center justify-end pr-1 transition-opacity duration-300 sm:hidden ${
                bodyTypeCanScrollRight ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-950/80 text-[#22c55e] flex items-center justify-center shadow-md animate-pulse">
                <ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* Visual Horizontal Scroll Indication Footer (Progress Bar & Indicator on Mobile) */}
          <div className="sm:hidden flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <ArrowRight size={12} className="text-[#22c55e] animate-pulse" />
              <span>Swipe to explore all {CATEGORIES.length} body types</span>
            </div>

            {/* Scroll Progress Track */}
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(20, bodyTypeScrollProgress)}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 6. TRANSPARENCY COMPARISON */}
      <section className="py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Why We Are Different
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              How Arif Car Sell protects you against the risks of informal roadside dealings.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              
              {/* Header Titles */}
              <div className="md:col-span-4 p-5 sm:p-6 bg-slate-100/60 dark:bg-slate-800/40 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:block">
                Standard Criteria
              </div>
              <div className="md:col-span-4 p-5 sm:p-6 bg-rose-50/40 dark:bg-rose-950/20 font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 hidden md:block">
                Informal Roadside Brokers
              </div>
              <div className="md:col-span-4 p-5 sm:p-6 bg-emerald-50/40 dark:bg-emerald-950/20 font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-[#22c55e] hidden md:block">
                Arif Car Sell Verified
              </div>

            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {COMPARISONS.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 p-5 sm:p-6 items-center gap-4">
                  
                  <div className="md:col-span-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {row.feature}
                    </span>
                  </div>

                  <div className="md:col-span-4 text-xs text-rose-700 dark:text-rose-400/90 flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl md:bg-transparent md:p-0">
                    <span className="font-bold shrink-0">✕</span>
                    <span>{row.roadside}</span>
                  </div>

                  <div className="md:col-span-4 text-xs text-emerald-700 dark:text-[#22c55e] flex items-start gap-2 font-medium bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl md:bg-transparent md:p-0">
                    <CheckCircle2 size={16} className="text-[#22c55e] shrink-0 mt-0.5" />
                    <span>{row.arif}</span>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* 7. VERIFIED CUSTOMER TESTIMONIALS */}
      <section className="py-14 sm:py-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Real Customer & Client Stories
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Read how people in Addis Ababa avoid middleman markups and close transactions securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-950 dark:text-white">
                      {t.name}
                    </h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#22c55e] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      {t.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {t.location} &middot; <span className="font-medium text-slate-600 dark:text-slate-300">{t.vehicle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Answers to common questions about buying and selling cars in Ethiopia.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4.5 sm:p-5 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between gap-3 cursor-pointer hover:text-[#22c55e] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#22c55e]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 sm:px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 9. BOTTOM CTA BANNER */}
      <section className="py-14 sm:py-20 bg-slate-950 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 text-center relative z-10 space-y-6">

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Find your next car or list yours <br className="hidden sm:inline" />
            with complete legal confidence.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join hundreds of satisfied car owners in Addis Ababa who chose transparent fees, verified ownership, and licensed brokers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onBrowse()}
              className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-7 py-3.5 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <span>Browse Showroom</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => (onChooseRole ? onChooseRole() : onBecomeBroker())}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold px-7 py-3.5 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>List a Car / Become a Broker</span>
            </button>
          </div>
        </div>
      </section>

      {/* Concierge Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-[#22c55e] flex items-center justify-center">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Vehicle Concierge Support</h3>
                  <p className="text-xs text-slate-500">Need help finding or listing a vehicle?</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="tel:+251911234567"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 text-[#16a34a] dark:text-[#22c55e] flex items-center justify-center font-bold shrink-0">
                  <PhoneCall size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#22c55e] transition-colors">
                    Direct Broker Advisory Hotline
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">+251 91 123 4567 (Addis Ababa)</div>
                </div>
              </a>

              <button
                onClick={() => {
                  setShowHelpModal(false);
                  onBrowse();
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 transition group text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                    Browse All 1,450+ Verified Cars
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Filter by brand, price range & fuel type</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
