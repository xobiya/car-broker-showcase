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
import { vehiclesApi, settingsApi, brandsApi, statsApi } from "../lib/api";
import { CarCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal, SectionDivider } from "../components/ui/ScrollAnimations";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/useLocale";
import SEO from "../components/common/SEO";
import { buildAutoDealerSchema, buildWebSiteSchema, buildFaqSchema } from "../lib/seo";

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
}

const BRAND_LOGOS: Record<string, React.ReactNode> = {
  Toyota: (
    <svg viewBox="0 0 100 70" className="w-10 h-7 fill-current">
      <path d="M50 0C22.4 0 0 13.4 0 30c0 16.5 22.4 30 50 30s50-13.5 50-30C100 13.4 77.6 0 50 0zm0 8c20.3 0 38 9.5 43.4 22H66.2C64.6 22 58 15 50 15s-14.6 7-16.2 15H6.6C12 17.5 29.7 8 50 8zm0 13c5.8 0 10.7 7.5 11.8 17H38.2C39.3 28.5 44.2 21 50 21zm-15.8 23c1.6 8 8.2 15 15.8 15s14.2-7 15.8-15h25.8C86 54.5 69.3 62 50 62S14 54.5 8.4 44h25.8z" />
    </svg>
  ),
  Hyundai: (
    <svg viewBox="0 0 100 70" className="w-10 h-7 text-current">
      <ellipse cx="50" cy="35" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(-12 50 35)" />
      <path d="M36 20 L40 50 M60 20 L64 50 M38 35 L62 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  Suzuki: (
    <svg viewBox="0 0 80 80" className="w-8 h-8 fill-current">
      <path d="M68 12 L12 36 L40 44 L12 68 L68 44 L40 36 Z" />
    </svg>
  ),
  BYD: (
    <div className="font-black text-sm tracking-widest border-2 border-current px-2.5 py-0.5 rounded-md">
      BYD
    </div>
  ),
  Volkswagen: (
    <svg viewBox="0 0 100 100" className="w-8 h-8 text-current">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M30 25 L42 62 L50 38 L58 62 L70 25 M36 75 L50 38 L64 75" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Isuzu: (
    <div className="font-black text-xs tracking-wider border-2 border-current px-2 py-0.5 rounded-md">
      ISUZU
    </div>
  ),
  "Mercedes-Benz": (
    <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M50 8 L50 50 L14 71 L50 50 L86 71 Z" fill="currentColor" />
    </svg>
  ),
  Lexus: (
    <svg viewBox="0 0 100 70" className="w-10 h-7 text-current">
      <ellipse cx="50" cy="35" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d="M38 20 L38 48 L68 48" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Nissan: (
    <svg viewBox="0 0 100 100" className="w-8 h-8 text-current">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="15" y="42" width="70" height="16" rx="2" fill="currentColor" />
    </svg>
  ),
  Kia: (
    <svg viewBox="0 0 100 50" className="w-10 h-5 text-current">
      <ellipse cx="50" cy="25" rx="48" ry="22" fill="none" stroke="currentColor" strokeWidth="4" />
      <text x="50" y="32" fontSize="20" fontWeight="900" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">KIA</text>
    </svg>
  ),
  Mitsubishi: (
    <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current">
      <polygon points="50,15 62,38 38,38" />
      <polygon points="62,38 88,38 75,60" />
      <polygon points="38,38 12,38 25,60" />
    </svg>
  ),
  Chery: (
    <div className="font-black text-xs tracking-wider border-2 border-current px-2 py-0.5 rounded-md">
      CHERY
    </div>
  )
};

const DEFAULT_BRAND_TAGS: Record<string, string> = {
  Toyota: "Corolla, RAV4, Hilux",
  Hyundai: "Tucson, Elantra, Atos",
  Suzuki: "Dzire, Swift, S-Presso",
  BYD: "Atto 3, Song Plus, Seagull",
  Volkswagen: "ID.4, ID.6, Tiguan",
  Isuzu: "D-Max, NPR, Forward",
  "Mercedes-Benz": "C-Class, E-Class, G-Wagon",
  Lexus: "LX 570, LX 600, RX 350",
  Nissan: "Patrol, X-Trail, Hardbody",
  Kia: "Sportage, Seltos, Pegas",
  Mitsubishi: "Pajero, L200 Pickup",
  Chery: "Tiggo 8, Jetour Dashing"
};

const CATEGORIES = [
  {
    id: "electric",
    title: "Electric & Hybrids",
    subtitle: "0% Ethiopian customs duty & low daily running costs.",
    filter: { fuelType: "Electric" },
    icon: Zap,
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
  onBecomeBroker
}: HomePageProps) {
  const { t } = useTranslation(["homepage", "common", "navigation", "metadata"]);
  const { formatCurrency, locale, setLocale, locales, localeMetadata } = useLocale();
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [dbBrands, setDbBrands] = useState<{ name: string; count: number; models: string[] }[]>([]);
  const [publicStats, setPublicStats] = useState<{ totalVehicles: number; totalBrokers: number; totalSales: number; totalUsers: number; clearanceRate: number } | null>(null);
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

  // Fetch Database Metadata (Brands & Public Stats)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandList, stats] = await Promise.all([
          brandsApi.list().catch(() => []),
          statsApi.public().catch(() => null)
        ]);
        if (brandList && brandList.length > 0) {
          setDbBrands(brandList);
        }
        if (stats) {
          setPublicStats(stats);
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Vehicles directly from Backend Database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const res = await vehiclesApi.list();
        if (res && res.length > 0) {
          const approved = res.filter((v: VehicleListing) => v.status === "approved");
          setVehicles(approved);
        } else {
          setVehicles([]);
        }
      } catch (err) {
        console.error("Failed to load vehicles for homepage", err);
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Compute Dynamic Brands from Backend
  const dynamicBrands = useMemo(() => {
    if (dbBrands.length > 0) {
      return dbBrands.map((b) => ({
        name: b.name,
        count: `${b.count} ${b.count === 1 ? "Car" : "Cars"}`,
        tagline: (Array.isArray(b.models) ? b.models.slice(0, 3).join(", ") : "") || DEFAULT_BRAND_TAGS[b.name] || "Available in Ethiopia",
        svg: BRAND_LOGOS[b.name] || (
          <div className="font-black text-xs tracking-wider border-2 border-current px-2 py-0.5 rounded-md uppercase">
            {(b.name || "").slice(0, 4)}
          </div>
        )
      }));
    }
    const counts: Record<string, number> = {};
    const modelsMap: Record<string, Set<string>> = {};
    vehicles.forEach((v) => {
      if (!v.brand) return;
      counts[v.brand] = (counts[v.brand] || 0) + 1;
      if (!modelsMap[v.brand]) modelsMap[v.brand] = new Set();
      if (v.model) modelsMap[v.brand].add(v.model);
    });
    return Object.keys(counts).map((name) => ({
      name,
      count: `${counts[name]} ${counts[name] === 1 ? "Car" : "Cars"}`,
      tagline: Array.from(modelsMap[name] || []).slice(0, 3).join(", ") || DEFAULT_BRAND_TAGS[name] || "Available in Ethiopia",
      svg: BRAND_LOGOS[name] || (
        <div className="font-black text-xs tracking-wider border-2 border-current px-2 py-0.5 rounded-md uppercase">
          {name.slice(0, 4)}
        </div>
      )
    }));
  }, [dbBrands, vehicles]);

  // Compute Unique Dynamic Locations from Live Database Listings
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.location && v.location.trim()) {
        locSet.add(v.location.trim());
      }
    });
    return ["Any Location", ...Array.from(locSet).sort()];
  }, [vehicles]);

  // Compute Real Database Counts for Body Types
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map((cat) => {
      let count = 0;
      if (cat.id === "electric") {
        count = vehicles.filter((v) => v.fuelType === "Electric" || v.fuelType === "Hybrid").length;
      } else if (cat.id === "suv") {
        count = vehicles.filter(
          (v) => (v.bodyType || "").toLowerCase() === "suv" || v.model.includes("RAV4") || v.model.includes("Tucson")
        ).length;
      } else if (cat.id === "luxury") {
        count = vehicles.filter(
          (v) => v.brand === "Mercedes-Benz" || v.brand === "Lexus" || (v.price && v.price >= 10000000)
        ).length;
      } else if (cat.id === "pickup") {
        count = vehicles.filter(
          (v) => (v.bodyType || "").toLowerCase() === "pickup" || v.model.toLowerCase().includes("hilux") || v.model.toLowerCase().includes("d-max")
        ).length;
      } else if (cat.id === "budget") {
        count = vehicles.filter((v) => v.price && v.price < 4000000).length;
      }
      return {
        ...cat,
        count: `${count} ${count === 1 ? "Car" : "Cars"}`
      };
    });
  }, [vehicles]);

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
      } catch { }
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
      <SEO
        title={t("metadata:pages.home", "Home — Verified Ethiopian Vehicle Marketplace")}
        description={t("metadata:descriptions.home", "Discover verified used and new cars for sale in Addis Ababa. Benefit from 150-point mechanic inspections, title deed verification, and 1.5% fixed commission.")}
        keywords={t("metadata:keywords.home", "cars for sale Ethiopia, buy car Addis Ababa, Ethiopian auto marketplace, Toyota Addis Ababa, BYD EV Ethiopia, verified used cars Addis Ababa")}
        canonical="/"
        schema={[
          buildAutoDealerSchema(),
          buildWebSiteSchema(),
          buildFaqSchema(FAQS)
        ]}
      />

      {/* 1. CINEMATIC HERO SECTION (MATCHING SCREENSHOT 1) */}
      <section id="section-hero" className="relative min-h-[440px] sm:min-h-[580px] lg:min-h-[660px] flex flex-col justify-center bg-slate-950 overflow-hidden px-4 sm:px-8 md:px-16 pt-8 sm:pt-16 pb-16 sm:pb-32">

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
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF4846] tracking-wide">
              <span>{t("homepage:hero.eyebrow")}</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[56px] font-black text-white tracking-tight leading-[1.15]">
              {t("homepage:hero.titleLine1")} <br />
              <span className="text-white">
                {t("homepage:hero.titleLine2")}
              </span>
            </h1>

            {/* 3 Bullet Checklist Highlights with Green Circle Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-x-6 sm:gap-y-3 pt-1.5 sm:pt-3 text-[11px] sm:text-sm font-semibold text-white">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FF4846] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#FF4846]/30">
                  <Check size={10} strokeWidth={3.5} className="text-slate-950" />
                </div>
                <span>{t("homepage:hero.highlight1")}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FF4846] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#FF4846]/30">
                  <Check size={10} strokeWidth={3.5} className="text-slate-950" />
                </div>
                <span>{t("homepage:hero.highlight2")}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FF4846] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#FF4846]/30">
                  <Check size={10} strokeWidth={3.5} className="text-slate-950" />
                </div>
                <span>{t("homepage:hero.highlight3")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING SEARCH BAR (MATCHING SCREENSHOT 2) */}
      <div id="section-search" className="relative z-20 max-w-6xl mx-auto px-3 sm:px-4 -mt-10 sm:-mt-20">
        <ScrollReveal direction="up" delay={0.08} distance={20}>
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 dark:border-slate-800">

            {/* Tabs Row: Condition Filter & Need Help Link */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setCarConditionTab("all")}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${carConditionTab === "all"
                      ? "bg-[#FF4846] text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  {t("homepage:search.allCars")}
                </button>
                <button
                  type="button"
                  onClick={() => setCarConditionTab("new")}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${carConditionTab === "new"
                      ? "bg-[#FF4846] text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  {t("homepage:search.newCars")}
                </button>
                <button
                  type="button"
                  onClick={() => setCarConditionTab("used")}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${carConditionTab === "used"
                      ? "bg-[#FF4846] text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  {t("homepage:search.usedCars")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#FF4846] transition cursor-pointer"
              >
                <UserIcon size={14} className="text-slate-500 dark:text-slate-400" />
                <span>{t("homepage:search.needHelp")}</span>
              </button>
            </div>

            {/* Search Inputs Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 items-center">

              {/* Pick Up Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {t("homepage:search.pickUpLocation")}
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4846] appearance-none cursor-pointer"
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Make / Brand */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {t("homepage:search.makeBrand")}
                </label>
                <div className="relative">
                  <Car size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4846] appearance-none cursor-pointer"
                  >
                    <option value="Any Brand">{t("homepage:search.allBrands")}</option>
                    {dynamicBrands.map((b) => (
                      <option key={b.name} value={b.name}>{b.name} ({b.count})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {t("homepage:search.vehicleType")}
                </label>
                <div className="relative">
                  <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedBodyType}
                    onChange={(e) => setSelectedBodyType(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4846] appearance-none cursor-pointer"
                  >
                    <option value="Any Type">{t("homepage:search.allTypes")}</option>
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
                  {t("homepage:search.maxBudget")}
                </label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4846] appearance-none cursor-pointer"
                  >
                    <option value="Any Price">{t("homepage:search.anyPrice")}</option>
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
                  className="w-full h-[40px] bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-bold px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-emerald-500/20 active:scale-95 text-xs sm:text-sm"
                >
                  <Search size={16} strokeWidth={2.5} />
                  <span>{t("homepage:search.findVehicleButton")}</span>
                </button>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </div>

      <SectionDivider />

      {/* 2. EXPLORE LEADING BRANDS - HORIZONTAL INFINITE CAROUSEL */}
      <section id="section-brands" className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <ScrollReveal direction="up" delay={0.1} className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-6">

          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {t("homepage:brands.title")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("homepage:brands.subtitle")}
              </p>
            </div>
            <button
              onClick={() => onBrowse()}
              className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-[#FF4846] transition flex items-center gap-1.5 cursor-pointer shrink-0 group"
            >
              <span>{t("homepage:brands.showAllBrands")}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Horizontal Continuous Marquee with Edge Fade Masks */}
          <div className="relative overflow-hidden w-full py-2">
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-[#0E1424] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-[#0E1424] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-infinite flex gap-4 sm:gap-5">
              {[...(dynamicBrands.length > 0 ? dynamicBrands : []), ...(dynamicBrands.length > 0 ? dynamicBrands : [])].map((b, idx) => (
                <button
                  key={`${b.name}-${idx}`}
                  onClick={() => onBrowse({ brand: b.name })}
                  className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 rounded-2xl p-4 min-w-[160px] sm:min-w-[180px] h-[95px] flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer text-slate-800 dark:text-slate-200 shrink-0"
                >
                  <div className="shrink-0 flex items-center justify-center group-hover:text-[#FF4846] transition-colors h-9">
                    {b.svg}
                  </div>
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#FF4846] transition-colors tracking-tight">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      {b.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </ScrollReveal>
      </section>

      <SectionDivider />

      {/* 3. MOST SEARCHED VEHICLES (FEATURED SHOWCASE) */}
      <section id="section-featured" className="py-14 sm:py-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {t("homepage:featured.title")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                {t("homepage:featured.subtitle")}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="relative max-w-full">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                  { id: "all", label: t("homepage:featured.tabs.all"), icon: Car },
                  { id: "electric", label: t("homepage:featured.tabs.electric"), icon: Zap },
                  { id: "suv", label: t("homepage:featured.tabs.suv"), icon: Car },
                  { id: "luxury", label: t("homepage:featured.tabs.luxury"), icon: Award },
                  { id: "budget", label: t("homepage:featured.tabs.budget"), icon: Tag }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-full font-bold transition-all cursor-pointer text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 ${activeTab === tab.id
                          ? "bg-slate-950 dark:bg-[#FF4846] text-white dark:text-slate-950 shadow-md font-black"
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
          {loadingVehicles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeaturedVehicles.map((car, idx) => {
                const isElectric = car.fuelType === "Electric";
                const isHybrid = car.fuelType === "Hybrid";
                const hasDiscount = car.originalPrice && car.originalPrice > car.price;
                const isFavorited = favorites.includes(car.id);
                const seats = (car as any).seats || (car.bodyType === "SUV" || car.model.toLowerCase().includes("prado") || car.model.toLowerCase().includes("patrol") ? "7 seats" : "5 seats");
                const reviewCount = 500 + Math.abs((car.price % 300));

                return (
                  <ScrollReveal key={car.id} direction="up" delay={Math.min(idx * 0.07, 0.35)} distance={20} className="h-full">
                    <div
                      onClick={() => onViewDetails(car)}
                      className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full"
                    >
                      {/* Image Container */}
                      <div className="h-52 sm:h-56 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"}
                          alt={`${car.brand} ${car.model}`}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallbackApplied) {
                              target.dataset.fallbackApplied = "true";
                              target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
                            }
                          }}
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
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#FF4846] transition-colors truncate">
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
                            <BadgeCheck size={14} className="text-[#FF4846] shrink-0" />
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
                              className="bg-slate-950 dark:bg-[#FF4846] hover:bg-slate-900 dark:hover:bg-[#E63D3B] text-white dark:text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95"
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
                              <PhoneCall size={13} className="text-[#FF4846]" />
                              <span>Call</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          {/* Showroom CTA */}
          <div className="text-center pt-2">
            <button
              onClick={() => onBrowse()}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-950 dark:bg-[#FF4846] hover:bg-slate-900 dark:hover:bg-[#E63D3B] text-white dark:text-slate-950 text-xs sm:text-sm font-black transition cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <span>{t("homepage:featured.exploreAllCta", { count: vehicles.length || 24 })}</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      <SectionDivider />

      {/* 4. HOW IT WORKS */}
      <section id="section-how-it-works" className="py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800">
        <ScrollReveal direction="up" delay={0.08} className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-9">

          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {t("homepage:howItWorks.title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {t("homepage:howItWorks.subtitle")}
            </p>

            {/* Action Segmented Control */}
            <div className="inline-flex p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xs mt-2">
              <button
                onClick={() => setHowItWorksTab("buyers")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${howItWorksTab === "buyers"
                    ? "bg-[#FF4846] text-slate-950 font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                {t("homepage:howItWorks.buyingTab")}
              </button>
              <button
                onClick={() => setHowItWorksTab("sellers")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${howItWorksTab === "sellers"
                    ? "bg-[#FF4846] text-slate-950 font-black shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                {t("homepage:howItWorks.sellingTab")}
              </button>
            </div>
          </div>

          {/* 3 Step Cards */}
          {howItWorksTab === "buyers" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#E63D3B] dark:text-[#FF4846] flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {t("homepage:howItWorks.buyerStep1Title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("homepage:howItWorks.buyerStep1Desc")}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-[#FF4846] flex items-center gap-1">
                  <ShieldCheck size={14} /> {t("homepage:howItWorks.buyerStep1Badge")}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {t("homepage:howItWorks.buyerStep2Title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("homepage:howItWorks.buyerStep2Desc")}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {t("homepage:howItWorks.buyerStep2Badge")}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {t("homepage:howItWorks.buyerStep3Title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("homepage:howItWorks.buyerStep3Desc")}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Percent size={14} /> {t("homepage:howItWorks.buyerStep3Badge")}
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#E63D3B] dark:text-[#FF4846] flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {t("homepage:howItWorks.sellerStep1Title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("homepage:howItWorks.sellerStep1Desc")}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-[#FF4846] flex items-center gap-1">
                  <Sparkles size={14} /> {t("homepage:howItWorks.sellerStep1Badge")}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {t("homepage:howItWorks.sellerStep2Title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("homepage:howItWorks.sellerStep2Desc")}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Users size={14} /> {t("homepage:howItWorks.sellerStep2Badge")}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative">
                <div className="w-12 h-12 rounded-2xl bg-[#FF4846]/20 text-[#E63D3B] dark:text-[#FF4846] flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {t("homepage:howItWorks.sellerStep3Title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("homepage:howItWorks.sellerStep3Desc")}
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-[#FF4846] flex items-center gap-1">
                  <CheckCheck size={14} /> {t("homepage:howItWorks.sellerStep3Badge")}
                </div>
              </div>

            </div>
          )}

        </ScrollReveal>
      </section>

      <SectionDivider />

      {/* 5. BROWSE BY BODY TYPE SECTION (WITH CLEAR HORIZONTAL SCROLL INDICATION) */}
      <section id="section-categories" className="py-14 sm:py-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800">
        <ScrollReveal direction="up" delay={0.08} className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-8">

          {/* Section Header with Title & Scroll Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4846] uppercase tracking-wider">
                <Car size={13} />
                <span>{t("homepage:categories.eyebrow")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                {t("homepage:categories.title")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                {t("homepage:categories.subtitle")}
              </p>
            </div>

            {/* Scroll Buttons (Arrows for desktop & mobile) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => scrollBodyType("left")}
                disabled={!bodyTypeCanScrollLeft}
                className={`w-9 h-9 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition ${bodyTypeCanScrollLeft
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs cursor-pointer active:scale-90 hover:border-[#FF4846]"
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
                className={`w-9 h-9 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition ${bodyTypeCanScrollRight
                    ? "bg-[#FF4846] text-slate-950 shadow-md shadow-[#FF4846]/20 cursor-pointer active:scale-90 hover:bg-[#E63D3B]"
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
              className={`pointer-events-none absolute left-0 top-0 bottom-2 w-10 sm:w-16 bg-gradient-to-r from-white dark:from-[#0B0F19] to-transparent z-10 transition-opacity duration-300 ${bodyTypeCanScrollLeft ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Scroll Track */}
            <div
              ref={bodyTypeScrollRef}
              onScroll={handleBodyTypeScroll}
              className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {categoriesWithCounts.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => onBrowse(cat.filter)}
                    className="min-w-[230px] w-[72vw] max-w-[280px] sm:min-w-0 sm:w-auto snap-start bg-slate-50/70 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-xs hover:shadow-xl hover:-translate-y-1 shrink-0 sm:shrink"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-[#FF4846] flex items-center justify-center shadow-xs">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                        {cat.count}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-[#FF4846] uppercase tracking-wider">
                        {cat.tag}
                      </div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#FF4846] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {cat.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-[#FF4846] pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>{t("homepage:featured.viewDetails")}</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Edge Fade Cue with Animated Pulse Arrow */}
            <div
              className={`pointer-events-none absolute right-0 top-0 bottom-2 w-12 sm:w-16 bg-gradient-to-l from-white dark:from-[#0B0F19] to-transparent z-10 flex items-center justify-end pr-1 transition-opacity duration-300 sm:hidden ${bodyTypeCanScrollRight ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-950/80 text-[#FF4846] flex items-center justify-center shadow-md animate-pulse">
                <ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* Visual Horizontal Scroll Indication Footer (Progress Bar & Indicator on Mobile) */}
          <div className="sm:hidden flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <ArrowRight size={12} className="text-[#FF4846] animate-pulse" />
              <span>{t("homepage:categories.scrollHint", { count: categoriesWithCounts.length })}</span>
            </div>

            {/* Scroll Progress Track */}
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#FF4846] rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(20, bodyTypeScrollProgress)}%` }}
                />
              </div>
            </div>
          </div>

        </ScrollReveal>
      </section>

      <SectionDivider />

      {/* 6. TRANSPARENCY COMPARISON */}
      <section id="section-comparison" className="py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800">
        <ScrollReveal direction="up" delay={0.08} className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">

          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {t("homepage:comparison.title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {t("homepage:comparison.subtitle")}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">

              {/* Header Titles */}
              <div className="md:col-span-4 p-5 sm:p-6 bg-slate-100/60 dark:bg-slate-800/40 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:block">
                {t("homepage:comparison.criteriaHeader")}
              </div>
              <div className="md:col-span-4 p-5 sm:p-6 bg-rose-50/40 dark:bg-rose-950/20 font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 hidden md:block">
                {t("homepage:comparison.roadsideHeader")}
              </div>
              <div className="md:col-span-4 p-5 sm:p-6 bg-emerald-50/40 dark:bg-emerald-950/20 font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-[#FF4846] hidden md:block">
                {t("homepage:comparison.arifHeader")}
              </div>

            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(["commission", "inspection", "legal", "escrow", "testDrive"] as const).map((key) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-12 p-5 sm:p-6 items-center gap-4">

                  <div className="md:col-span-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {t(`homepage:comparison.rows.${key}.feature`)}
                    </span>
                  </div>

                  <div className="md:col-span-4 text-xs text-rose-700 dark:text-rose-400/90 flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl md:bg-transparent md:p-0">
                    <span className="font-bold shrink-0">✕</span>
                    <span>{t(`homepage:comparison.rows.${key}.roadside`)}</span>
                  </div>

                  <div className="md:col-span-4 text-xs text-emerald-700 dark:text-[#FF4846] flex items-start gap-2 font-medium bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl md:bg-transparent md:p-0">
                    <CheckCircle2 size={16} className="text-[#FF4846] shrink-0 mt-0.5" />
                    <span>{t(`homepage:comparison.rows.${key}.arif`)}</span>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </ScrollReveal>
      </section>

      <SectionDivider />

      {/* 7. VERIFIED CUSTOMER TESTIMONIALS */}
      <section id="section-testimonials" className="py-14 sm:py-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800">
        <ScrollReveal direction="up" delay={0.08} className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">

          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {t("homepage:testimonials.title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {t("homepage:testimonials.subtitle")}
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
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#FF4846] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
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

        </ScrollReveal>
      </section>

      <SectionDivider />

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="section-faq" className="py-14 sm:py-20 bg-slate-50/70 dark:bg-[#0E1424] border-b border-slate-200/80 dark:border-slate-800">
        <ScrollReveal direction="up" delay={0.08} className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {t("homepage:faq.title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {t("homepage:faq.subtitle")}
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
                    className="w-full text-left p-4.5 sm:p-5 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between gap-3 cursor-pointer hover:text-[#FF4846] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF4846]" : ""
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

        </ScrollReveal>
      </section>

      <SectionDivider />

      {/* 9. BOTTOM CTA BANNER */}
      <section id="section-cta" className="py-14 sm:py-20 bg-slate-950 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        <ScrollReveal direction="up" delay={0.08} className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 text-center relative z-10 space-y-6">

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {t("homepage:cta.titleLine1")} <br className="hidden sm:inline" />
            {t("homepage:cta.titleLine2")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t("homepage:cta.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onBrowse()}
              className="w-full sm:w-auto bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black px-7 py-3.5 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <span>{t("homepage:cta.browseShowroom")}</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onBecomeBroker}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold px-7 py-3.5 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{t("homepage:cta.listCarBecomeBroker")}</span>
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* Concierge Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-[#FF4846] flex items-center justify-center">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{t("homepage:helpModal.title")}</h3>
                  <p className="text-xs text-slate-500">{t("homepage:helpModal.description")}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label={t("homepage:helpModal.close")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="tel:+251911234567"
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF4846]/15 text-[#E63D3B] dark:text-[#FF4846] flex items-center justify-center font-bold shrink-0">
                  <PhoneCall size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#FF4846] transition-colors">
                    {t("homepage:helpModal.callUs")}
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
                    {t("homepage:featured.exploreAllCta", { count: 1450 })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t("homepage:categories.subtitle")}</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              {t("homepage:helpModal.close")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
