import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  Compass,
  MapPin,
  ShieldCheck,
  X,
  Search,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  SlidersHorizontal,
  Filter,
  Gauge,
  Fuel,
  Settings2,
  Users,
  Check,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  Zap,
  Bookmark,
  CheckCircle2,
  Car,
  DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/useLocale";
import { VehicleListing } from "@autobroker/shared";
import { vehiclesApi } from "../lib/api";
import { ShowroomSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollAnimations";
import SEO from "../components/common/SEO";

interface ShowroomProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onInquireCar: (car: VehicleListing) => void;
}

const QUICK_FILTERS = [
  { id: "available", label: "All Available", icon: Sparkles },
  { id: "verified", label: "Verified Libre", icon: ShieldCheck },
  { id: "electric", label: "EV & Hybrid", icon: Zap },
  { id: "luxury", label: "Luxury SUVs", icon: Star },
  { id: "budget", label: "Budget (< 3M)", icon: DollarSign },
  { id: "newArrivals", label: "New Arrivals", icon: Calendar },
  { id: "sold", label: "Sold Cars", icon: CheckCircle2 },
];

const GROUP_OPTIONS = [
  { id: "", label: "No Grouping" },
  { id: "brand", label: "Brand" },
  { id: "model", label: "Model" },
  { id: "year", label: "Year" },
  { id: "location", label: "Location" },
  { id: "fuelType", label: "Fuel Type" },
  { id: "transmission", label: "Transmission" },
  { id: "bodyType", label: "Body Type" },
  { id: "priceRange", label: "Price Range" },
];

const POPULAR_SEARCH_SUGGESTIONS = [
  "Toyota RAV4",
  "Hyundai Tucson",
  "Suzuki Dzire",
  "Volkswagen ID.4",
  "Toyota Land Cruiser",
  "Electric",
  "Addis Ababa",
];

const PRICE_BRACKETS = [
  "Under 3M ETB",
  "3M - 6M ETB",
  "6M - 10M ETB",
  "10M - 20M ETB",
  "Over 20M ETB",
];

const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Pickup",
  "Crossover",
  "Van",
];

const FUEL_TYPES = [
  "Benzine",
  "Diesel",
  "Electric",
  "Hybrid",
];

const TRANSMISSIONS = [
  "Automatic",
  "Manual",
];

interface SavedSearch {
  name: string;
  query: string;
  quickFilters: string[];
  facets: Record<string, string[]>;
  sortBy: string;
  minPrice?: string;
  maxPrice?: string;
}

export default function Showroom({ onNotify, onInquireCar }: ShowroomProps) {
  const { t } = useTranslation(["vehicles", "common", "navigation", "metadata"]);
  const { formatCurrency } = useLocale();
  const location = useLocation();
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<Record<string, string[]>>({
    brand: [],
    fuel: [],
    transmission: [],
    bodyType: [],
    location: [],
    year: [],
    price: [],
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [sortBy, setSortBy] = useState("Newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [carFavorites, setCarFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [groupBy, setGroupBy] = useState("");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const PER_PAGE = 12;

  // Sync favorites from localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("autobroker_favorites");
      if (storedFavs) setCarFavorites(JSON.parse(storedFavs));
    } catch {}
  }, []);

  const updateFavorites = useCallback((newFavs: string[] | ((prev: string[]) => string[])) => {
    setCarFavorites(prev => {
      const updated = typeof newFavs === "function" ? newFavs(prev) : newFavs;
      try {
        localStorage.setItem("autobroker_favorites", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  useEffect(() => {
    const incomingFilters = (location.state as any)?.filters;
    if (incomingFilters) {
      if (incomingFilters.brand) {
        setActiveFacets(prev => ({ ...prev, brand: [incomingFilters.brand] }));
      }
      if (incomingFilters.fuelType) {
        setActiveFacets(prev => ({ ...prev, fuel: [incomingFilters.fuelType] }));
      }
      if (incomingFilters.year) {
        setActiveFacets(prev => ({ ...prev, year: [incomingFilters.year] }));
      }
      if (incomingFilters.priceRange) {
        const pr = incomingFilters.priceRange;
        let mapped = pr;
        if (pr === "under-3m") mapped = "Under 3M ETB";
        else if (pr === "3m-6m") mapped = "3M - 6M ETB";
        else if (pr === "6m-10m") mapped = "6M - 10M ETB";
        else if (pr === "10m-20m") mapped = "10M - 20M ETB";
        else if (pr === "over-20m") mapped = "Over 20M ETB";
        setActiveFacets(prev => ({ ...prev, price: [mapped] }));
      }
      if (incomingFilters.bodyType) {
        setActiveFacets(prev => ({ ...prev, bodyType: [incomingFilters.bodyType] }));
      }
      if (incomingFilters.model) {
        setSearchQuery(incomingFilters.model);
      }
      if (incomingFilters.search) {
        setSearchQuery(incomingFilters.search);
      }
    }
  }, [location.state]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("showroom-saved-searches");
      if (stored) setSavedSearches(JSON.parse(stored));
      const storedView = localStorage.getItem("showroom-view-mode");
      if (storedView === "list" || storedView === "grid") setViewMode(storedView);
    } catch {}
  }, []);

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("showroom-view-mode", mode);
    } catch {}
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesApi.list();
      setVehicles(data.filter(v => v.status === "approved" || v.status === "sold"));
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const toggleFacet = useCallback((key: string, value: string) => {
    setActiveFacets(prev => {
      const current = prev[key] || [];
      return { ...prev, [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
    setPage(1);
  }, []);

  const removeFacet = useCallback((key: string, value: string) => {
    setActiveFacets(prev => ({ ...prev, [key]: (prev[key] || []).filter(v => v !== value) }));
    setPage(1);
  }, []);

  const toggleQuickFilter = useCallback((id: string) => {
    setQuickFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    setPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setActiveFacets({
      brand: [],
      fuel: [],
      transmission: [],
      bodyType: [],
      location: [],
      year: [],
      price: [],
    });
    setQuickFilters([]);
    setSearchQuery("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setGroupBy("");
    setPage(1);
  }, []);

  const facets = activeFacets;
  const hasActiveFacets =
    Object.values(facets).some(a => a.length > 0) ||
    searchQuery.trim() !== "" ||
    quickFilters.length > 0 ||
    Boolean(minPriceInput) ||
    Boolean(maxPriceInput);

  // 1. Text Query Filter
  const textFiltered = searchQuery.trim()
    ? vehicles.filter(car => {
        const q = searchQuery.toLowerCase();
        return [
          car.brand,
          car.model,
          car.description || "",
          car.fuelType || "",
          car.location || "",
          car.bodyType || "",
          car.year?.toString() || "",
        ].some(f => f.toLowerCase().includes(q));
      })
    : vehicles;

  // 2. Quick Category Filter
  const quickFiltered = textFiltered.filter(car => {
    if (quickFilters.length === 0) {
      return car.status === "approved";
    }
    for (const qf of quickFilters) {
      if (qf === "available" && car.status !== "approved") return false;
      if (qf === "verified" && car.status !== "approved") return false;
      if (qf === "sold" && car.status !== "sold") return false;
      if (qf === "electric") {
        const ft = (car.fuelType || "").toLowerCase();
        if (!ft.includes("electric") && !ft.includes("ev") && !ft.includes("hybrid")) return false;
      }
      if (qf === "luxury") {
        const isSuv = (car.bodyType || "").toLowerCase().includes("suv") || car.model.toLowerCase().includes("prado") || car.model.toLowerCase().includes("land cruiser") || car.model.toLowerCase().includes("patrol");
        if (!isSuv && car.price < 6000000) return false;
      }
      if (qf === "budget" && car.price >= 3000000) return false;
      if (qf === "newArrivals" && car.year < 2023) return false;
    }
    if (!quickFilters.includes("sold") && car.status !== "approved") return false;
    return true;
  });

  // 3. Facets Filter
  const facetFiltered = quickFiltered.filter(car => {
    // Custom Min/Max Price filter
    const minP = minPriceInput ? parseFloat(minPriceInput.replace(/,/g, "")) : NaN;
    const maxP = maxPriceInput ? parseFloat(maxPriceInput.replace(/,/g, "")) : NaN;
    if (!isNaN(minP) && car.price < minP) return false;
    if (!isNaN(maxP) && car.price > maxP) return false;

    for (const [key, values] of Object.entries(facets) as [string, string[]][]) {
      if (values.length === 0) continue;
      if (key === "brand" && !values.includes(car.brand)) return false;
      if (key === "fuel" && !values.includes(car.fuelType)) return false;
      if (key === "transmission" && !values.includes(car.transmission)) return false;
      if (key === "bodyType") {
        const b = (car.bodyType || "").toLowerCase();
        if (!values.some(v => b.includes(v.toLowerCase()))) return false;
      }
      if (key === "location") {
        if (!values.some(v => car.location && car.location.toLowerCase().includes(v.toLowerCase()))) return false;
      }
      if (key === "year" && !values.includes(car.year.toString())) return false;
      if (key === "price") {
        const p = car.price;
        if (!values.some(v => {
          if (v === "Under 3M ETB") return p < 3000000;
          if (v === "3M - 6M ETB") return p >= 3000000 && p < 6000000;
          if (v === "6M - 10M ETB") return p >= 6000000 && p < 10000000;
          if (v === "10M - 20M ETB") return p >= 10000000 && p < 20000000;
          if (v === "Over 20M ETB") return p >= 20000000;
          return false;
        })) return false;
      }
    }
    return true;
  });

  // 4. Sorting
  const sorted = [...facetFiltered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    if (sortBy === "Year: Newest") return b.year - a.year;
    if (sortBy === "Mileage: Low to High") return (a.mileage || 0) - (b.mileage || 0);
    return b.year - a.year;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Grouping
  const grouped = useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, VehicleListing[]> = {};
    (groupBy === "priceRange" ? sorted : paginated).forEach(car => {
      let key = "";
      if (groupBy === "brand") key = car.brand;
      else if (groupBy === "model") key = car.model;
      else if (groupBy === "year") key = car.year.toString();
      else if (groupBy === "location") key = car.location.split(" ")[0];
      else if (groupBy === "fuelType") key = car.fuelType;
      else if (groupBy === "transmission") key = car.transmission;
      else if (groupBy === "bodyType") key = car.bodyType || "Other";
      else if (groupBy === "priceRange") {
        const p = car.price;
        if (p < 3000000) key = "Under 3M ETB";
        else if (p < 6000000) key = "3M - 6M ETB";
        else if (p < 10000000) key = "6M - 10M ETB";
        else if (p < 20000000) key = "10M - 20M ETB";
        else key = "Over 20M ETB";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(car);
    });
    return groups;
  }, [sorted, paginated, groupBy]);

  // Facet counts
  const facetOptions = useMemo(() => {
    const opts: Record<string, { value: string; count: number }[]> = {};
    const keys = ["brand", "fuel", "transmission", "bodyType", "location", "year", "price"];
    keys.forEach(key => {
      const counts: Record<string, number> = {};
      quickFiltered.forEach(car => {
        let val = "";
        if (key === "brand") val = car.brand;
        else if (key === "fuel") val = car.fuelType;
        else if (key === "transmission") val = car.transmission;
        else if (key === "bodyType") val = car.bodyType || "SUV";
        else if (key === "location") val = car.location ? car.location.split(" ")[0] : "Addis Ababa";
        else if (key === "year") val = car.year.toString();
        else if (key === "price") {
          const p = car.price;
          if (p < 3000000) val = "Under 3M ETB";
          else if (p < 6000000) val = "3M - 6M ETB";
          else if (p < 10000000) val = "6M - 10M ETB";
          else if (p < 20000000) val = "10M - 20M ETB";
          else val = "Over 20M ETB";
        }
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      let entries = Object.entries(counts).map(([value, count]) => ({ value, count }));
      if (key === "year") entries.sort((a, b) => +b.value - +a.value);
      if (key === "brand") entries.sort((a, b) => b.count - a.count);
      opts[key] = entries;
    });
    return opts;
  }, [quickFiltered]);

  const FACET_LABELS: Record<string, string> = {
    brand: "Brand",
    fuel: "Fuel",
    transmission: "Transmission",
    bodyType: "Body Type",
    location: "Location",
    year: "Year",
    price: "Price",
  };

  const allFiltersCount =
    Object.values(facets).reduce((s, a) => s + a.length, 0) +
    quickFilters.length +
    (minPriceInput ? 1 : 0) +
    (maxPriceInput ? 1 : 0);

  const saveCurrentSearch = () => {
    const name = prompt("Save this filter configuration as:");
    if (!name) return;
    const entry: SavedSearch = {
      name,
      query: searchQuery,
      quickFilters: [...quickFilters],
      facets: JSON.parse(JSON.stringify(facets)),
      sortBy,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    };
    const updated = [...savedSearches, entry];
    setSavedSearches(updated);
    localStorage.setItem("showroom-saved-searches", JSON.stringify(updated));
    onNotify(`Search saved as "${name}"`, "success");
  };

  const loadSavedSearch = (s: SavedSearch) => {
    setSearchQuery(s.query);
    setQuickFilters(s.quickFilters);
    setActiveFacets(s.facets);
    setSortBy(s.sortBy);
    if (s.minPrice !== undefined) setMinPriceInput(s.minPrice);
    if (s.maxPrice !== undefined) setMaxPriceInput(s.maxPrice);
    setPage(1);
  };

  const deleteSavedSearch = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSearches.filter((_, i) => i !== idx);
    setSavedSearches(updated);
    localStorage.setItem("showroom-saved-searches", JSON.stringify(updated));
    onNotify("Saved search removed", "info");
  };

  const seoTitle = useMemo(() => {
    if (activeFacets.brand?.length === 1) {
      return `${activeFacets.brand[0]} Cars for Sale in Ethiopia — Arif Car Sell`;
    }
    if (searchQuery.trim()) {
      return `Search: ${searchQuery.trim()} — Arif Car Sell Showroom`;
    }
    return t("metadata:pages.showroom", "Showroom — Browse Verified Vehicles in Ethiopia");
  }, [activeFacets.brand, searchQuery, t]);

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  if (loading) {
    return <ShowroomSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      <SEO
        title={seoTitle}
        description="Browse certified pre-owned and new vehicles in Ethiopia with verified Libre inspection, broker guarantees, and secure bank escrow."
        canonical="/showroom"
      />

      {/* ── TOP HERO SEARCH & DISCOVERY BAR ── */}
      <section className="bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 pt-6 sm:pt-8 pb-5 sm:pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          
          {/* Centered Heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("vehicles:catalog.title", "Vehicle Showroom")}
            </h1>
          </div>

          {/* Centered Modern Search Capsule */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-md hover:shadow-lg focus-within:border-[#FF4846] focus-within:ring-4 focus-within:ring-[#FF4846]/10 transition-all p-1.5 sm:p-2">
              
              {/* Search Icon Badge */}
              <div className="w-10 h-10 rounded-full bg-[#FF4846]/10 text-[#FF4846] flex items-center justify-center shrink-0 ml-1">
                <Search size={18} strokeWidth={2.5} />
              </div>

              {/* Text Input - Explicit zero outline/border to eliminate ugly inner red box */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t("vehicles:catalog.searchPlaceholder", "Search by make, model, year, or keyword...")}
                className="w-full py-2.5 px-3 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium border-0 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
                style={{ outline: "none", border: "none", boxShadow: "none" }}
              />

              {/* Clear Input Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1"
                  title="Clear search"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}

              {/* Save Search Button */}
              <button
                type="button"
                onClick={saveCurrentSearch}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700 mr-1.5"
                title="Save this search configuration"
              >
                <Bookmark size={13} />
                <span>Save</span>
              </button>

              {/* Primary Search CTA Button */}
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                className="flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FF4846] hover:bg-[#e03d3b] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF4846]/25 hover:shadow-lg transition cursor-pointer shrink-0 active:scale-95"
              >
                <span>Search</span>
              </button>
            </div>

            {/* Popular Search Suggestions - Fully wrapped without ugly scrollbars */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mt-3 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-semibold shrink-0 flex items-center gap-1 mr-0.5">
                <Sparkles size={11} className="text-[#FF4846]" />
                Popular:
              </span>
              {POPULAR_SEARCH_SUGGESTIONS.map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => { setSearchQuery(sug); setPage(1); }}
                  className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories Bar - Wrapped pills without horizontal scrollbars */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
            {QUICK_FILTERS.map(qf => {
              const active = quickFilters.includes(qf.id);
              const IconComponent = qf.icon;
              return (
                <button
                  key={qf.id}
                  type="button"
                  onClick={() => toggleQuickFilter(qf.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846] shadow-xs shadow-[#FF4846]/20"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <IconComponent size={12} className={active ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                  <span>{qf.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── TWO-COLUMN MARKETPLACE LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── DESKTOP FILTER SIDEBAR (lg:col-span-3) ── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-6">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#FF4846]" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t("vehicles:catalog.filterHeading", "Filters")}
                  </h2>
                  {allFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#FF4846] text-white text-[10px] font-black flex items-center justify-center">
                      {allFiltersCount}
                    </span>
                  )}
                </div>
                {hasActiveFacets && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Facet 1: Make / Brand */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Make & Brand
                </label>
                {(facetOptions.brand || []).length > 5 && (
                  <input
                    type="text"
                    value={brandSearchTerm}
                    onChange={e => setBrandSearchTerm(e.target.value)}
                    placeholder="Search makes..."
                    className="w-full mb-2.5 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4846]"
                  />
                )}
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {(facetOptions.brand || [])
                    .filter(opt => !brandSearchTerm || opt.value.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                    .map(opt => {
                      const selected = (facets.brand || []).includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                            selected
                              ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleFacet("brand", opt.value)}
                              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                            />
                            <span className="truncate">{opt.value}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">({opt.count})</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Facet 2: Price Budget (ETB) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Price Budget (ETB)
                </label>
                <div className="space-y-1 mb-3">
                  {PRICE_BRACKETS.map(val => {
                    const selected = (facets.price || []).includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleFacet("price", val)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          selected
                            ? "bg-[#FF4846]/10 border-[#FF4846] text-[#FF4846]"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <span>{val}</span>
                        {selected && <Check size={14} className="text-[#FF4846]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Min / Max Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Min ETB</span>
                    <input
                      type="number"
                      placeholder="e.g. 1500000"
                      value={minPriceInput}
                      onChange={e => { setMinPriceInput(e.target.value); setPage(1); }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Max ETB</span>
                    <input
                      type="number"
                      placeholder="e.g. 8000000"
                      value={maxPriceInput}
                      onChange={e => { setMaxPriceInput(e.target.value); setPage(1); }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                    />
                  </div>
                </div>
              </div>

              {/* Facet 3: Body Type */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Body Type
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {BODY_TYPES.map(bt => {
                    const selected = (facets.bodyType || []).includes(bt);
                    return (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => toggleFacet("bodyType", bt)}
                        className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border truncate ${
                          selected
                            ? "bg-[#FF4846] text-white border-[#FF4846] shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {bt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facet 4: Fuel & Powertrain */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Fuel & Powertrain
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FUEL_TYPES.map(ft => {
                    const selected = (facets.fuel || []).includes(ft);
                    return (
                      <button
                        key={ft}
                        type="button"
                        onClick={() => toggleFacet("fuel", ft)}
                        className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border truncate ${
                          selected
                            ? "bg-[#FF4846] text-white border-[#FF4846] shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {ft}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facet 5: Transmission */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Transmission
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TRANSMISSIONS.map(tr => {
                    const selected = (facets.transmission || []).includes(tr);
                    return (
                      <button
                        key={tr}
                        type="button"
                        onClick={() => toggleFacet("transmission", tr)}
                        className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border truncate ${
                          selected
                            ? "bg-[#FF4846] text-white border-[#FF4846] shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {tr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facet 6: Location */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Location / City
                </label>
                <div className="space-y-1">
                  {["Addis Ababa", "Hawassa", "Adama", "Dire Dawa", "Bahir Dar"].map(loc => {
                    const selected = (facets.location || []).includes(loc);
                    return (
                      <label
                        key={loc}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                          selected
                            ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleFacet("location", loc)}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                          />
                          <span className="truncate">{loc}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Saved Searches List */}
              {savedSearches.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                    Saved Searches
                  </label>
                  <div className="space-y-1">
                    {savedSearches.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => loadSavedSearch(s)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer transition group"
                      >
                        <span className="font-semibold truncate">{s.name}</span>
                        <button
                          type="button"
                          onClick={(e) => deleteSavedSearch(idx, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5"
                          title="Delete saved search"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* ── RIGHT MAIN RESULTS COLUMN (lg:col-span-9) ── */}
          <main className="col-span-12 lg:col-span-9 space-y-5">
            
            {/* Active Filters Pill Bar */}
            {hasActiveFacets && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Active:</span>

                {/* Search Query Chip */}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FF4846]/10 text-[#FF4846] border border-[#FF4846]/30 text-xs font-bold px-2.5 py-1 rounded-full">
                    <span>"{searchQuery.trim()}"</span>
                    <button onClick={() => setSearchQuery("")} className="hover:text-red-700 cursor-pointer">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                )}

                {/* Quick Filters Chips */}
                {quickFilters.map(qfId => {
                  const qf = QUICK_FILTERS.find(q => q.id === qfId);
                  return (
                    <span key={qfId} className="inline-flex items-center gap-1.5 bg-[#FF4846] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs">
                      <span>{qf ? qf.label : qfId}</span>
                      <button onClick={() => toggleQuickFilter(qfId)} className="hover:opacity-75 cursor-pointer">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  );
                })}

                {/* Active Facets Chips */}
                {Object.entries(facets).map(([key, vals]) =>
                  (vals as string[]).map(val => (
                    <span key={`${key}-${val}`} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span>{FACET_LABELS[key] || key}: {val}</span>
                      <button onClick={() => removeFacet(key, val)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  ))
                )}

                {/* Custom Price Bounds */}
                {(minPriceInput || maxPriceInput) && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span>Budget: {minPriceInput ? `${minPriceInput} ETB` : "0"} - {maxPriceInput ? `${maxPriceInput} ETB` : "∞"}</span>
                    <button onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 ml-auto transition cursor-pointer px-2 py-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF4846] text-white text-xs font-bold shadow-xs hover:bg-[#e03d3b] transition cursor-pointer"
                >
                  <SlidersHorizontal size={13} />
                  <span>Filters</span>
                  {allFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-[#FF4846] text-[10px] font-black flex items-center justify-center">
                      {allFiltersCount}
                    </span>
                  )}
                </button>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{(safePage - 1) * PER_PAGE + (sorted.length > 0 ? 1 : 0)}–{Math.min(safePage * PER_PAGE, sorted.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{sorted.length}</span> vehicles
                </p>
                {groupBy && (
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                    Grouped
                  </span>
                )}
              </div>

              {/* Controls: Group By, Sort By, View Mode */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* View Mode Switcher */}
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSetViewMode("grid")}
                    className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetViewMode("list")}
                    className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="List View"
                  >
                    <List size={15} />
                  </button>
                </div>

                {/* Group By Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="hidden md:inline font-bold">Group:</span>
                  <select
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FF4846] cursor-pointer"
                  >
                    {GROUP_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id} className="dark:bg-slate-900">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="hidden md:inline font-bold">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FF4846] cursor-pointer"
                  >
                    <option value="Newest" className="dark:bg-slate-900">{t("vehicles:catalog.sortOptions.newest", "Newest")}</option>
                    <option value="Price: Low to High" className="dark:bg-slate-900">{t("vehicles:catalog.sortOptions.priceLow", "Price: Low to High")}</option>
                    <option value="Price: High to Low" className="dark:bg-slate-900">{t("vehicles:catalog.sortOptions.priceHigh", "Price: High to Low")}</option>
                    <option value="Year: Newest" className="dark:bg-slate-900">Year: Newest</option>
                    <option value="Mileage: Low to High" className="dark:bg-slate-900">Mileage: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── VEHICLE RESULTS DISPLAY ── */}
            <div>
              {groupBy && grouped ? (
                // Grouped presentation
                (Object.entries(grouped) as [string, VehicleListing[]][]).map(([groupName, cars]) => (
                  <div key={groupName} className="mb-8">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#FF4846] rounded-full" />
                      <span>{groupName}</span>
                      <span className="text-[10px] font-bold text-slate-400 normal-case">({cars.length} cars)</span>
                    </h3>
                    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4"}>
                      {cars.map((car, idx) => (
                        <ScrollReveal key={car.id} direction="up" delay={Math.min(idx * 0.03, 0.2)} distance={15}>
                          {viewMode === "grid" ? (
                            <CarCard
                              car={car}
                              carFavorites={carFavorites}
                              setCarFavorites={updateFavorites}
                              onInquireCar={onInquireCar}
                            />
                          ) : (
                            <CarListItem
                              car={car}
                              carFavorites={carFavorites}
                              setCarFavorites={updateFavorites}
                              onInquireCar={onInquireCar}
                            />
                          )}
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Normal Paginated Presentation
                <>
                  {paginated.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 py-16 px-6 text-center space-y-4 shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-[#FF4846]/10 flex items-center justify-center mx-auto text-[#FF4846]">
                        <Search size={26} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-slate-900 dark:text-white font-black text-base">
                          {t("vehicles:catalog.noVehiclesTitle", "No Vehicles Match Your Search")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
                          {t("vehicles:catalog.noVehiclesDesc", "Try removing some filters, adjusting your price budget, or searching for a different brand or model.")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="inline-flex items-center gap-2 bg-[#FF4846] hover:bg-[#e03d3b] text-white text-xs font-black px-6 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                      >
                        <RotateCcw size={13} />
                        <span>{t("vehicles:catalog.resetFiltersButton", "Reset All Filters")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4"}>
                      {paginated.map((car, idx) => (
                        <ScrollReveal key={car.id} direction="up" delay={Math.min(idx * 0.03, 0.2)} distance={15}>
                          {viewMode === "grid" ? (
                            <CarCard
                              car={car}
                              carFavorites={carFavorites}
                              setCarFavorites={updateFavorites}
                              onInquireCar={onInquireCar}
                            />
                          ) : (
                            <CarListItem
                              car={car}
                              carFavorites={carFavorites}
                              setCarFavorites={updateFavorites}
                              onInquireCar={onInquireCar}
                            />
                          )}
                        </ScrollReveal>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                        Page <span className="font-bold text-slate-800 dark:text-slate-200">{safePage}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span>
                      </p>
                      
                      <div className="flex items-center gap-1 order-1 sm:order-2">
                        <button
                          onClick={() => goToPage(safePage - 1)}
                          disabled={safePage <= 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                          <span>Prev</span>
                        </button>

                        <div className="flex items-center gap-1 mx-1">
                          {pageNumbers.map((p, i) =>
                            p === "…" ? (
                              <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400 font-bold">
                                …
                              </span>
                            ) : (
                              <button
                                key={p}
                                onClick={() => goToPage(p as number)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition cursor-pointer ${
                                  p === safePage
                                    ? "bg-[#FF4846] text-white shadow-xs"
                                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {p}
                              </button>
                            )
                          )}
                        </div>

                        <button
                          onClick={() => goToPage(safePage + 1)}
                          disabled={safePage >= totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          <span>Next</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 order-3 text-xs text-slate-500">
                        <span className="hidden md:inline font-medium">Go to:</span>
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          defaultValue={safePage}
                          key={safePage}
                          onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)) goToPage(v); }}
                          onKeyDown={e => { if (e.key === "Enter") { const v = parseInt((e.target as HTMLInputElement).value); if (!isNaN(v)) goToPage(v); } }}
                          className="w-12 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-center text-xs font-bold py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </main>

        </div>
      </div>

      {/* ── MOBILE SLIDING FILTER DRAWER ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Drawer Card */}
          <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#FF4846]" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Filter Vehicles
                </h3>
                {allFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#FF4846] text-white text-[10px] font-black flex items-center justify-center">
                    {allFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Quick Categories */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_FILTERS.map(qf => {
                    const active = quickFilters.includes(qf.id);
                    return (
                      <button
                        key={qf.id}
                        type="button"
                        onClick={() => toggleQuickFilter(qf.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          active
                            ? "bg-[#FF4846] text-white border-[#FF4846]"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          active ? "bg-white text-[#FF4846] border-white" : "border-slate-300 dark:border-slate-600"
                        }`}>
                          {active && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span className="truncate">{qf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand / Make */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Brand / Make
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {(facetOptions.brand || []).map(opt => {
                    const selected = (facets.brand || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleFacet("brand", opt.value)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border truncate ${
                          selected
                            ? "bg-[#FF4846]/10 border-[#FF4846] text-[#FF4846]"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="truncate">{opt.value}</span>
                        <span className="text-[10px] opacity-70 ml-1">({opt.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Budget */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Price Budget (ETB)
                </label>
                <div className="space-y-1.5 mb-2.5">
                  {PRICE_BRACKETS.map(val => {
                    const selected = (facets.price || []).includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleFacet("price", val)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          selected
                            ? "bg-[#FF4846]/10 border-[#FF4846] text-[#FF4846]"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{val}</span>
                        {selected && <Check size={14} className="text-[#FF4846]" />}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ETB"
                    value={minPriceInput}
                    onChange={e => setMinPriceInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Max ETB"
                    value={maxPriceInput}
                    onChange={e => setMaxPriceInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Body Type */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Body Type
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {BODY_TYPES.map(bt => {
                    const selected = (facets.bodyType || []).includes(bt);
                    return (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => toggleFacet("bodyType", bt)}
                        className={`text-center py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          selected
                            ? "bg-[#FF4846] text-white border-[#FF4846]"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {bt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fuel & Transmission */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Fuel
                  </label>
                  <div className="space-y-1">
                    {FUEL_TYPES.map(ft => {
                      const selected = (facets.fuel || []).includes(ft);
                      return (
                        <button
                          key={ft}
                          type="button"
                          onClick={() => toggleFacet("fuel", ft)}
                          className={`w-full text-center py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            selected
                              ? "bg-[#FF4846] text-white border-[#FF4846]"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {ft}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Transmission
                  </label>
                  <div className="space-y-1">
                    {TRANSMISSIONS.map(tr => {
                      const selected = (facets.transmission || []).includes(tr);
                      return (
                        <button
                          key={tr}
                          type="button"
                          onClick={() => toggleFacet("transmission", tr)}
                          className={`w-full text-center py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            selected
                              ? "bg-[#FF4846] text-white border-[#FF4846]"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {tr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-2 py-2.5 rounded-xl bg-[#FF4846] hover:bg-[#e03d3b] text-white text-xs font-black transition cursor-pointer shadow-sm text-center"
              >
                Show {sorted.length} Cars
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Mobile Filter Pill Button */}
      <div className="fixed bottom-6 right-5 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FF4846] hover:bg-[#E63D3B] text-white shadow-xl shadow-[#FF4846]/30 font-black text-xs cursor-pointer active:scale-95 transition"
          aria-label="Open filter menu"
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {allFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#FF4846] text-[10px] font-black flex items-center justify-center">
              {allFiltersCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}

// ── GRID VEHICLE CARD ──
function CarCard({
  car,
  carFavorites,
  setCarFavorites,
  onInquireCar,
}: {
  car: VehicleListing;
  carFavorites: string[];
  setCarFavorites: (favs: string[] | ((prev: string[]) => string[])) => void;
  onInquireCar: (car: VehicleListing) => void;
}) {
  const { t } = useTranslation(["vehicles", "common"]);
  const { formatCurrency } = useLocale();
  const seats = (car as any).seats || (car.bodyType === "SUV" || car.model.toLowerCase().includes("prado") || car.model.toLowerCase().includes("patrol") ? "7 seats" : "5 seats");
  const reviewCount = 500 + Math.abs((car.price % 300));

  const [isCompared, setIsCompared] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("autobroker_compare_list");
      return saved ? JSON.parse(saved).includes(car.id) : false;
    } catch {
      return false;
    }
  });

  const toggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("autobroker_compare_list");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(car.id)) {
        list = list.filter(id => id !== car.id);
        setIsCompared(false);
      } else {
        if (list.length >= 4) {
          alert("Maximum 4 vehicles can be compared simultaneously.");
          return;
        }
        list.push(car.id);
        setIsCompared(true);
      }
      localStorage.setItem("autobroker_compare_list", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("autobroker:compare_updated", { detail: list }));
    } catch {}
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 flex flex-col overflow-hidden h-full">
      
      {/* 1. Image Container */}
      <div className="relative h-44 sm:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallbackApplied) {
              target.dataset.fallbackApplied = "true";
              target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        {car.status === "sold" ? (
          <div className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur-xs text-rose-400 border border-rose-500/40 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>SOLD</span>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-xs text-[#FF4846] border border-[#FF4846]/30 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase">
            <ShieldCheck size={11} className="text-[#FF4846]" />
            <span>{t("common:states.verified", "Verified")}</span>
          </div>
        )}

        {/* Top Right Action Buttons: Compare + Favorite */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={toggleCompare}
            className={`p-1.5 rounded-full backdrop-blur-xs transition cursor-pointer border shadow-xs ${
              isCompared
                ? "bg-[#FF4846] border-[#FF4846] text-white"
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#FF4846]"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
            aria-label="Compare vehicle"
          >
            <SlidersHorizontal size={13} />
          </button>

          <button
            onClick={() => setCarFavorites(prev => prev.includes(car.id) ? prev.filter(f => f !== car.id) : [...prev, car.id])}
            className={`p-1.5 rounded-full backdrop-blur-xs transition cursor-pointer border shadow-xs ${
              carFavorites.includes(car.id)
                ? "bg-rose-500 border-rose-400 text-white"
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500"
            }`}
            aria-label="Save to favorites"
          >
            <Heart size={13} fill={carFavorites.includes(car.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {car.condition === "New" && (
          <span className="absolute bottom-2.5 left-2.5 bg-[#FF4846] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
            {car.condition}
          </span>
        )}
      </div>

      {/* Floating Centered Rating Pill */}
      <div className="flex justify-center -mt-3 relative z-10">
        <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-800 dark:text-slate-200">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span>4.96 <span className="text-slate-400 font-normal text-[10px]">({reviewCount})</span></span>
        </div>
      </div>

      {/* 2. Description Part */}
      <div className="p-4 pt-2 flex flex-col flex-1 justify-between space-y-3">
        
        {/* Title and Location */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#FF4846] transition-colors truncate">
            {car.brand} {car.model}
          </h3>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{car.location || "Addis Ababa"}</span>
          </div>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 py-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 min-w-0">
            <Gauge size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{(car.mileage || 0).toLocaleString()} km</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Settings2 size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{car.transmission || "Automatic"}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Fuel size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{car.fuelType || "Petrol"}</span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Users size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{seats}</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {t("vehicles:detail.price", "Price")}
            </span>
            <div className="text-sm sm:text-base font-black text-slate-950 dark:text-white whitespace-nowrap">
              {formatCurrency(car.price)}
            </div>
          </div>

          <button
            onClick={() => onInquireCar(car)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4846] dark:hover:bg-[#FF4846] text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            {t("common:actions.viewDetails", "Details")}
          </button>
        </div>

      </div>

    </div>
  );
}

// ── HORIZONTAL LIST VEHICLE CARD ──
function CarListItem({
  car,
  carFavorites,
  setCarFavorites,
  onInquireCar,
}: {
  car: VehicleListing;
  carFavorites: string[];
  setCarFavorites: (favs: string[] | ((prev: string[]) => string[])) => void;
  onInquireCar: (car: VehicleListing) => void;
}) {
  const { t } = useTranslation(["vehicles", "common"]);
  const { formatCurrency } = useLocale();
  const seats = (car as any).seats || (car.bodyType === "SUV" || car.model.toLowerCase().includes("prado") || car.model.toLowerCase().includes("patrol") ? "7 seats" : "5 seats");

  const [isCompared, setIsCompared] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("autobroker_compare_list");
      return saved ? JSON.parse(saved).includes(car.id) : false;
    } catch {
      return false;
    }
  });

  const toggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("autobroker_compare_list");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(car.id)) {
        list = list.filter(id => id !== car.id);
        setIsCompared(false);
      } else {
        if (list.length >= 4) {
          alert("Maximum 4 vehicles can be compared simultaneously.");
          return;
        }
        list.push(car.id);
        setIsCompared(true);
      }
      localStorage.setItem("autobroker_compare_list", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("autobroker:compare_updated", { detail: list }));
    } catch {}
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition flex flex-col md:flex-row overflow-hidden">
      
      {/* Image Part */}
      <div className="relative md:w-64 h-44 md:h-auto bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
        <img
          src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {car.status === "sold" ? (
          <div className="absolute top-2.5 left-2.5 bg-slate-950/90 text-rose-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
            SOLD
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 bg-slate-950/85 text-[#FF4846] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
            <ShieldCheck size={10} />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Middle Specs & Title */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-[#FF4846] transition truncate">
              {car.brand} {car.model}
              <span className="text-slate-400 text-xs font-normal ml-2">({car.year})</span>
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleCompare}
                className={`p-1.5 rounded-full border text-xs cursor-pointer ${
                  isCompared ? "bg-[#FF4846] text-white border-[#FF4846]" : "text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-700"
                }`}
                title="Compare"
              >
                <SlidersHorizontal size={13} />
              </button>
              <button
                onClick={() => setCarFavorites(prev => prev.includes(car.id) ? prev.filter(f => f !== car.id) : [...prev, car.id])}
                className={`p-1.5 rounded-full border text-xs cursor-pointer ${
                  carFavorites.includes(car.id) ? "bg-rose-500 text-white border-rose-400" : "text-slate-400 hover:text-rose-500 border-slate-200 dark:border-slate-700"
                }`}
                title="Favorite"
              >
                <Heart size={13} fill={carFavorites.includes(car.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <MapPin size={12} className="shrink-0" />
            <span>{car.location || "Addis Ababa"}</span>
            {car.bodyType && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold">
                {car.bodyType}
              </span>
            )}
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium py-1">
          <span className="flex items-center gap-1"><Gauge size={13} className="text-slate-400" /> {(car.mileage || 0).toLocaleString()} km</span>
          <span className="flex items-center gap-1"><Settings2 size={13} className="text-slate-400" /> {car.transmission || "Automatic"}</span>
          <span className="flex items-center gap-1"><Fuel size={13} className="text-slate-400" /> {car.fuelType || "Petrol"}</span>
          <span className="flex items-center gap-1"><Users size={13} className="text-slate-400" /> {seats}</span>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(car.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onInquireCar(car)}
              className="px-4 py-2 bg-[#FF4846] hover:bg-[#e03d3b] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              View Details & Inquire
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
