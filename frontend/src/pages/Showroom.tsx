import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, Compass, MapPin, ShieldCheck, X, Search, Heart, ChevronDown, ChevronLeft, ChevronRight, Star, SlidersHorizontal, Filter, Gauge, Fuel, Settings2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/useLocale";
import { VehicleListing } from "../../../shared/types";
import { vehiclesApi } from "../lib/api";
import { ShowroomSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollAnimations";

interface ShowroomProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onInquireCar: (car: VehicleListing) => void;
}

const QUICK_FILTERS = [
  { id: "available", label: "Available Cars" },
  { id: "verified", label: "Verified Cars" },
  { id: "sold", label: "Sold Cars" },
  { id: "featured", label: "Featured Cars" },
  { id: "newArrivals", label: "New Arrivals" },
  { id: "pending", label: "Pending Approval" },
];

const GROUP_OPTIONS = [
  { id: "", label: "None" },
  { id: "brand", label: "Brand" },
  { id: "model", label: "Model" },
  { id: "year", label: "Year" },
  { id: "location", label: "Location" },
  { id: "fuelType", label: "Fuel Type" },
  { id: "transmission", label: "Transmission" },
  { id: "priceRange", label: "Price Range" },
];

interface SavedSearch {
  name: string;
  query: string;
  quickFilters: string[];
  facets: Record<string, string[]>;
  sortBy: string;
}

export default function Showroom({ onNotify, onInquireCar }: ShowroomProps) {
  const { t } = useTranslation(["vehicles", "common", "navigation"]);
  const { formatCurrency } = useLocale();
  const location = useLocation();
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<Record<string, string[]>>({ brand: [], fuel: [], transmission: [], location: [], year: [], price: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [carFavorites, setCarFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState("");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 8;

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
      if (incomingFilters.model) {
        setSearchQuery(incomingFilters.model);
      }
      if (incomingFilters.bodyType) {
        setSearchQuery(incomingFilters.bodyType);
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
    } catch {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setShowAdvancedSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesApi.list();
      setVehicles(data.filter(v => v.status === "approved"));
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
    setActiveFacets({ brand: [], fuel: [], transmission: [], location: [], year: [], price: [] });
    setQuickFilters([]);
    setSearchQuery("");
    setGroupBy("");
    setPage(1);
  }, []);

  const facets = activeFacets as Record<string, string[]>;
  const hasActiveFacets = Object.values(facets).some(a => a.length > 0) || searchQuery.trim() !== "" || quickFilters.length > 0;

  const textFiltered = searchQuery.trim()
    ? vehicles.filter(car => {
        const q = searchQuery.toLowerCase();
        return [car.brand, car.model, car.description, car.fuelType, car.location].some(f => f.toLowerCase().includes(q));
      })
    : vehicles;

  const quickFiltered = textFiltered.filter(car => {
    if (quickFilters.length === 0) return true;
    for (const qf of quickFilters) {
      if (qf === "available" && car.status !== "approved") return false;
      if (qf === "verified" && car.status !== "approved") return false;
      if (qf === "sold" && car.status !== "sold") return false;
      if (qf === "featured" && car.model !== "RAV4" && car.model !== "ID.4" && car.model !== "Land Cruiser") return false;
      if (qf === "newArrivals" && car.year < 2023) return false;
      if (qf === "pending" && car.status !== "pending") return false;
    }
    return true;
  });

  const facetFiltered = quickFiltered.filter(car => {
    for (const [key, values] of Object.entries(facets) as [string, string[]][]) {
      if (values.length === 0) continue;
      if (key === "brand" && !values.includes(car.brand)) return false;
      if (key === "fuel" && !values.includes(car.fuelType)) return false;
      if (key === "transmission" && !values.includes(car.transmission)) return false;
      if (key === "location") {
        if (!values.some(v => v === car.location.split(" ")[0])) return false;
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

  const sorted = [...facetFiltered].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return b.year - a.year;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

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
      else if (groupBy === "priceRange") {
        const p = car.price;
        if (p < 3000000) key = "Under 3M";
        else if (p < 6000000) key = "3M - 6M";
        else if (p < 10000000) key = "6M - 10M";
        else if (p < 20000000) key = "10M - 20M";
        else key = "Over 20M";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(car);
    });
    return groups;
  }, [sorted, paginated, groupBy]);

  const facetOptions = useMemo(() => {
    const opts: Record<string, { value: string; count: number }[]> = {};
    const keys = ["brand", "fuel", "transmission", "location", "year", "price"];
    keys.forEach(key => {
      const counts: Record<string, number> = {};
      quickFiltered.forEach(car => {
        let val = "";
        if (key === "brand") val = car.brand;
        else if (key === "fuel") val = car.fuelType;
        else if (key === "transmission") val = car.transmission;
        else if (key === "location") val = car.location.split(" ")[0];
        else if (key === "year") val = car.year.toString();
        else if (key === "price") {
          const p = car.price;
          if (p < 3000000) val = "Under 3M";
          else if (p < 6000000) val = "3M - 6M";
          else if (p < 10000000) val = "6M - 10M";
          else if (p < 20000000) val = "10M - 20M";
          else val = "Over 20M";
        }
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      let entries = Object.entries(counts).map(([value, count]) => ({ value, count }));
      if (key === "year") entries.sort((a, b) => +b.value - +a.value);
      opts[key] = entries;
    });
    return opts;
  }, [quickFiltered]);

  const FACET_LABELS: Record<string, string> = { brand: "Brand", fuel: "Fuel", transmission: "Transmission", location: "Location", year: "Year", price: "Price" };

  const allFiltersCount = Object.values(facets).reduce((s, a) => s + a.length, 0) + quickFilters.length;

  const saveCurrentSearch = () => {
    const name = prompt("Save search as:");
    if (!name) return;
    const entry: SavedSearch = { name, query: searchQuery, quickFilters: [...quickFilters], facets: JSON.parse(JSON.stringify(facets)), sortBy };
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
    setPage(1);
    setOpenDropdown(null);
  };

  const deleteSavedSearch = (idx: number) => {
    const updated = savedSearches.filter((_, i) => i !== idx);
    setSavedSearches(updated);
    localStorage.setItem("showroom-saved-searches", JSON.stringify(updated));
  };

  if (loading) {
    return <ShowroomSkeleton />;
  }

  const renderCheckItem = (label: string, selected: boolean, onChange: () => void, count?: number) => (
    <label className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${selected ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
      <span className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded border flex items-center justify-center transition ${selected ? "bg-[#22c55e] border-[#22c55e]" : "border-slate-300 dark:border-slate-600"}`} onClick={onChange}>
          {selected && <span className="text-slate-950 text-[9px] font-black">&#10003;</span>}
        </span>
        {label}
      </span>
      {count !== undefined && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{count}</span>}
    </label>
  );

  // Pagination helpers
  const goToPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const pageNumbers: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) pageNumbers.push(p);
    else if (pageNumbers[pageNumbers.length - 1] !== "…") pageNumbers.push("…");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20 sm:pb-0">
      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X size={16} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Quick Filters</p>
                <div className="space-y-1">
                  {QUICK_FILTERS.map(qf => {
                    const active = quickFilters.includes(qf.id);
                    return (
                      <button key={qf.id} onClick={() => toggleQuickFilter(qf.id)}
                        className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${active ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition ${active ? "bg-[#0F4C81] border-[#0F4C81]" : "border-slate-300"}`}>
                          {active && <span className="text-white text-[8px] font-black">✓</span>}
                        </span>
                        {qf.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Group By</p>
                <div className="space-y-1">
                  {GROUP_OPTIONS.filter(g => g.id !== "").map(opt => {
                    const active = groupBy === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setGroupBy(active ? "" : opt.id)}
                        className={`w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${active ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <span>{opt.label}</span>
                        {active && <span className="text-blue-600 text-[11px] font-black">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Sort By</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
              {hasActiveFacets && (
                <button onClick={() => { clearAll(); setShowMobileFilters(false); }}
                  className="w-full text-sm font-bold text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg transition cursor-pointer"
                >Clear All Filters</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Odoo-style unified search bar */}
        <div className="w-full sm:max-w-3xl sm:mx-auto mb-6" ref={searchRef}>

          {/* ── Single pill bar ── */}
          <div
            className={`flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible transition-colors ${
              openDropdown ? "border-[#22c55e] ring-2 ring-[#22c55e]/20" : "hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {/* Search icon */}
            <div className="pl-3.5 pr-1.5 text-slate-400 shrink-0">
              <Search size={18} strokeWidth={2} />
            </div>

            {/* Active filter tags inline */}
            <div className="flex items-center gap-1 flex-wrap py-2 min-w-0 flex-1">
              {quickFilters.map(qfId => {
                const qf = QUICK_FILTERS.find(f => f.id === qfId);
                if (!qf) return null;
                return (
                  <span key={qf.id} className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                    {qf.label}
                    <button onClick={() => toggleQuickFilter(qf.id)} className="hover:text-red-600 transition-colors cursor-pointer ml-0.5"><X size={10} strokeWidth={3} /></button>
                  </span>
                );
              })}
              {(Object.entries(facets) as [string, string[]][]).map(([key, values]) =>
                values.map(v => (
                  <span key={`${key}-${v}`} className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                    {FACET_LABELS[key]}: {v}
                    <button onClick={() => removeFacet(key, v)} className="hover:text-red-600 transition-colors cursor-pointer ml-0.5"><X size={10} strokeWidth={3} /></button>
                  </span>
                ))
              )}

              {/* Text input */}
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                onFocus={() => setOpenDropdown("panel")}
                onKeyDown={e => e.key === "Escape" && setOpenDropdown(null)}
                placeholder={
                  quickFilters.length === 0 && Object.values(facets).every(v => v.length === 0)
                    ? t("vehicles:catalog.searchPlaceholder")
                    : ""
                }
                className="flex-1 min-w-[100px] sm:min-w-[140px] bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none py-1"
              />
            </div>

            {/* Result count */}
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-bold whitespace-nowrap shrink-0 px-2">
              {t("vehicles:catalog.showingResults", { count: sorted.length })}
            </span>

            {/* Sort */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none appearance-none cursor-pointer px-2 py-3 shrink-0 max-w-[85px] sm:max-w-none"
            >
              <option value="Newest" className="dark:bg-slate-900">{t("vehicles:catalog.sortOptions.newest")}</option>
              <option value="Price: Low to High" className="dark:bg-slate-900">{t("vehicles:catalog.sortOptions.priceLow")}</option>
              <option value="Price: High to Low" className="dark:bg-slate-900">{t("vehicles:catalog.sortOptions.priceHigh")}</option>
            </select>

            {/* Chevron toggle */}
            <button
              onClick={() => setOpenDropdown(openDropdown === "panel" ? null : "panel")}
              className="px-3 py-3 border-l border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
              title="Toggle filters panel"
            >
              <span className="hidden md:inline text-[11px] font-bold text-slate-600 dark:text-slate-300">{t("vehicles:catalog.filterHeading")}</span>
              <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${openDropdown === "panel" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* ── 3-column dropdown panel ── */}
          {openDropdown === "panel" && (
            <div className="relative z-30">
              <div className="absolute top-1 left-0 right-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">

                  {/* ── FILTERS column ── */}
                  <div className="p-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                      <Filter size={11} strokeWidth={2.5} /> Filters
                    </p>
                    <div className="space-y-0.5">
                      {QUICK_FILTERS.map(qf => {
                        const active = quickFilters.includes(qf.id);
                        return (
                          <button key={qf.id} onClick={() => toggleQuickFilter(qf.id)}
                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                              active ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                              active ? "bg-[#22c55e] border-[#22c55e]" : "border-slate-300 dark:border-slate-600"
                            }`}>
                              {active && <span className="text-slate-950 text-[8px] font-black">✓</span>}
                            </span>
                            {qf.label}
                          </button>
                        );
                      })}
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                        <button onClick={() => { setShowAdvancedSearch(true); setOpenDropdown(null); }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Filter size={12} className="text-slate-400 dark:text-slate-500" />
                          Custom Filter…
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── GROUP BY column ── */}
                  <div className="p-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                      <SlidersHorizontal size={11} strokeWidth={2.5} /> Group By
                    </p>
                    <div className="space-y-0.5">
                      {GROUP_OPTIONS.filter(g => g.id !== "").map(opt => {
                        const active = groupBy === opt.id;
                        return (
                          <button key={opt.id} onClick={() => { setGroupBy(active ? "" : opt.id); }}
                            className={`w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                              active ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {active && <span className="text-[#22c55e] text-[11px] font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── FAVORITES column ── */}
                  <div className="p-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                      <Star size={11} strokeWidth={2.5} /> Favorites
                    </p>

                    <button onClick={() => { saveCurrentSearch(); setOpenDropdown(null); }}
                      className="w-full flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer mb-3"
                    >
                      Save current search
                      <ChevronDown size={13} className="text-slate-400 shrink-0" />
                    </button>

                    {savedSearches.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic px-1">No saved searches</p>
                    ) : (
                      <div className="space-y-0.5">
                        {savedSearches.map((s, i) => (
                          <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group cursor-pointer"
                            onClick={() => { loadSavedSearch(s); setOpenDropdown(null); }}
                          >
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                              <Star size={11} className="text-amber-400 shrink-0" />
                              {s.name}
                            </span>
                            <button onClick={e => { e.stopPropagation(); deleteSavedSearch(i); }}
                              className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            ><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer: clear-all if anything active */}
                {hasActiveFacets && (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{allFiltersCount} filter{allFiltersCount > 1 ? "s" : ""} active</span>
                    <button onClick={() => { clearAll(); setOpenDropdown(null); }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors cursor-pointer"
                    >Clear all</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Search panel (shown when Custom Filter is clicked) */}
          {showAdvancedSearch && (
            <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm px-3 sm:px-4 py-3 sm:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {["brand", "fuel", "transmission", "location", "year", "price"].map(key => {
                  const options = facetOptions[key] || [];
                  const selected = facets[key] || [];
                  return (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">{FACET_LABELS[key]}</label>
                      <div className="relative">
                        <button onClick={() => setOpenDropdown(openDropdown === `adv-${key}` ? null : `adv-${key}`)}
                          className="w-full flex items-center justify-between gap-1 text-[11px] sm:text-xs font-semibold px-3 py-2.5 sm:py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200"
                        >
                          <span className="truncate">{selected.length > 0 ? selected.join(", ") : `All ${FACET_LABELS[key].toLowerCase()}`}</span>
                          <ChevronDown size={14} className={`text-slate-400 shrink-0 transition ${openDropdown === `adv-${key}` ? "rotate-180" : ""}`} />
                        </button>
                        {openDropdown === `adv-${key}` && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 p-2 max-h-48 overflow-y-auto">
                            {options.length === 0 && <p className="text-xs text-slate-400 px-3 py-2">No options</p>}
                            {options.map(opt => renderCheckItem(opt.value, selected.includes(opt.value), () => toggleFacet(key, opt.value), opt.count))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => { setShowAdvancedSearch(false); }}
                  className="text-[11px] sm:text-xs font-bold bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 px-5 sm:px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer transition flex-1 sm:flex-none shadow-xs"
                >Apply Filters</button>
                <button onClick={() => { Object.keys(facets).forEach(k => setActiveFacets(prev => ({ ...prev, [k]: [] }))); }}
                  className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-rose-600 px-4 sm:px-3 py-2.5 sm:py-2 cursor-pointer transition flex-1 sm:flex-none"
                >Clear</button>
              </div>
            </div>
          )}

          {/* Active filter pills row (below the bar when panel is closed) */}
          {hasActiveFacets && openDropdown !== "panel" && !showAdvancedSearch && (
            <div className="flex flex-wrap gap-1.5 mt-2 items-center">
              {quickFilters.map(qfId => {
                const qf = QUICK_FILTERS.find(f => f.id === qfId);
                if (!qf) return null;
                return (
                  <span key={qf.id} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {qf.label}
                    <button onClick={() => toggleQuickFilter(qf.id)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={12} /></button>
                  </span>
                );
              })}
              {(Object.entries(facets) as [string, string[]][]).map(([key, values]) =>
                values.map(v => (
                  <span key={`${key}-${v}`} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                    {FACET_LABELS[key]}: {v}
                    <button onClick={() => removeFacet(key, v)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={12} /></button>
                  </span>
                ))
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={12} /></button>
                </span>
              )}
              <button onClick={clearAll} className="text-[11px] font-medium text-slate-400 hover:text-rose-500 px-2.5 py-1 transition cursor-pointer">Clear all</button>
            </div>
          )}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, sorted.length)}</span> of <span className="font-bold text-slate-700">{sorted.length}</span> vehicles
          </p>
          {groupBy && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Grouped by {GROUP_OPTIONS.find(g => g.id === groupBy)?.label}
            </span>
          )}
        </div>

        {/* Vehicle grid */}
        <div>
          {groupBy && grouped ? (
            (Object.entries(grouped) as [string, VehicleListing[]][]).map(([group, cars]) => (
              <div key={group} className="mb-8">
                <h3 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#0F4C81] rounded-full" />
                  {group}
                  <span className="text-[10px] font-bold text-slate-400 normal-case">({cars.length})</span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                  {cars.map((car, idx) => (
                    <ScrollReveal key={car.id} direction="up" delay={Math.min(idx * 0.04, 0.25)} distance={20}>
                      <CarCard car={car} carFavorites={carFavorites} setCarFavorites={setCarFavorites} onInquireCar={onInquireCar} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {paginated.length === 0 && (
                  <div className="col-span-full py-16 sm:py-20 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                      <Search size={22} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t("vehicles:catalog.noVehiclesTitle")}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">{t("vehicles:catalog.noVehiclesDesc")}</p>
                    <button onClick={clearAll} className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm">{t("vehicles:catalog.resetFiltersButton")}</button>
                  </div>
                )}
                {paginated.map((car, idx) => (
                  <ScrollReveal key={car.id} direction="up" delay={Math.min(idx * 0.04, 0.25)} distance={20}>
                    <CarCard car={car} carFavorites={carFavorites} setCarFavorites={setCarFavorites} onInquireCar={onInquireCar} />
                  </ScrollReveal>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 mb-2">
                  <div className="border-t border-slate-200 dark:border-slate-800 mb-5" />
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium order-2 sm:order-1">
                      Page <span className="font-bold text-slate-700 dark:text-slate-200">{safePage}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <button onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <div className="flex items-center gap-1 mx-1">
                        {pageNumbers.map((p, i) =>
                          p === "…" ? (
                            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold">…</span>
                          ) : (
                            <button key={p} onClick={() => goToPage(p as number)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                                p === safePage
                                  ? "bg-[#22c55e] text-slate-950 font-black shadow-md shadow-emerald-500/20"
                                  : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >{p}</button>
                          )
                        )}
                      </div>
                      <button onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 order-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="hidden sm:inline font-medium">Go to</span>
                      <input type="number" min={1} max={totalPages} defaultValue={safePage} key={safePage}
                        onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)) goToPage(v); }}
                        onKeyDown={e => { if (e.key === "Enter") { const v = parseInt((e.target as HTMLInputElement).value); if (!isNaN(v)) goToPage(v); } }}
                        className="w-12 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-center text-xs font-bold py-1.5 focus:outline-none focus:ring-1 focus:ring-[#22c55e] text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CarCard({ car, carFavorites, setCarFavorites, onInquireCar }: {
  key?: string;
  car: VehicleListing;
  carFavorites: string[];
  setCarFavorites: React.Dispatch<React.SetStateAction<string[]>>;
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
    <div className="group bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* 1. Image Container */}
      <div className="relative h-32 xs:h-36 sm:h-48 md:h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-slate-950/85 backdrop-blur-md text-[#22c55e] border border-[#22c55e]/30 text-[8px] sm:text-[9px] font-black tracking-widest px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-sm uppercase">
          <ShieldCheck size={10} className="text-[#22c55e] sm:w-[11px] sm:h-[11px]" />
          <span>{t("common:states.verified")}</span>
        </div>

        {/* Top Right Action Buttons: Compare + Favorite */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={toggleCompare}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border shadow-sm ${
              isCompared
                ? "bg-[#22c55e] border-emerald-400 text-slate-950"
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
            aria-label="Compare vehicle"
          >
            <SlidersHorizontal size={12} className="sm:w-[14px] sm:h-[14px]" />
          </button>

          <button
            onClick={() => setCarFavorites(prev => prev.includes(car.id) ? prev.filter(f => f !== car.id) : [...prev, car.id])}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border shadow-sm ${
              carFavorites.includes(car.id)
                ? "bg-rose-500 border-rose-400 text-white"
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800"
            }`}
            aria-label="Save to favorites"
          >
            <Heart size={12} className="sm:w-[14px] sm:h-[14px]" fill={carFavorites.includes(car.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {car.condition === "New" && (
          <span className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-[#22c55e] text-slate-950 text-[7px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
            {car.condition}
          </span>
        )}
      </div>

      {/* Floating Centered Rating Pill */}
      <div className="flex justify-center -mt-2.5 sm:-mt-3.5 relative z-10">
        <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
          <Star size={11} className="text-amber-400 fill-amber-400 sm:w-[13px] sm:h-[13px]" />
          <span>4.96 <span className="text-slate-400 font-normal text-[9px] sm:text-[11px] hidden xs:inline">({reviewCount})</span></span>
        </div>
      </div>

      {/* 2. Description Part */}
      <div className="p-2.5 sm:p-5 pt-1.5 sm:pt-3 flex flex-col flex-1 justify-between space-y-2 sm:space-y-4">
        
        {/* Title and Location */}
        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-[#22c55e] transition-colors truncate">
            {car.brand} {car.model}
          </h3>

          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 font-medium">
            <MapPin size={11} className="text-slate-400 shrink-0 sm:w-[13px] sm:h-[13px]" />
            <span className="truncate">{car.location || "Addis Ababa"}</span>
          </div>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-2 gap-y-1 sm:gap-y-2.5 gap-x-1.5 sm:gap-x-4 py-1.5 sm:py-3 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Gauge size={12} className="text-slate-500 dark:text-slate-400 shrink-0 sm:w-[15px] sm:h-[15px]" />
            <span className="truncate">{(car.mileage || 0).toLocaleString()} km</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Settings2 size={12} className="text-slate-500 dark:text-slate-400 shrink-0 sm:w-[15px] sm:h-[15px]" />
            <span className="truncate">{car.transmission || "Automatic"}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Fuel size={12} className="text-slate-500 dark:text-slate-400 shrink-0 sm:w-[15px] sm:h-[15px]" />
            <span className="truncate">{car.fuelType || "Petrol"}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Users size={12} className="text-slate-500 dark:text-slate-400 shrink-0 sm:w-[15px] sm:h-[15px]" />
            <span className="truncate">{seats}</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{t("vehicles:detail.price")}</span>
            <div className="text-xs sm:text-base md:text-lg font-black text-slate-950 dark:text-white whitespace-nowrap">
              {formatCurrency(car.price)}
            </div>
          </div>

          <button
            onClick={() => onInquireCar(car)}
            className="w-full sm:w-auto px-2.5 sm:px-5 py-1.5 sm:py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#22c55e] dark:hover:bg-[#22c55e] text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-slate-950 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95 border border-slate-200/80 dark:border-slate-700 shadow-xs text-center"
          >
            {t("common:actions.viewDetails")}
          </button>
        </div>

      </div>

    </div>
  );
}
