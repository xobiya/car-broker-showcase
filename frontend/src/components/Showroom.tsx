import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Calendar, Compass, MapPin, ShieldCheck, X, Search, Heart, ChevronDown, Star, SlidersHorizontal, Filter } from "lucide-react";
import { VehicleListing } from "../../../shared/types";

interface ShowroomProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onInquireCar: (car: VehicleListing) => void;
}

const screenshotVehicles: VehicleListing[] = [
  { id: "scr-1", brokerId: "brk-1", brand: "Toyota", model: "RAV4", year: 2022, mileage: 12000, price: 7450000, originalPrice: 8000000, status: "approved", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80", description: "Limited Edition 2022", fuelType: "Electric", transmission: "Automatic", location: "Addis Ababa" },
  { id: "scr-2", brokerId: "brk-1", brand: "Hyundai", model: "Tucson", year: 2023, mileage: 0, price: 6200000, originalPrice: 6500000, status: "approved", imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80", description: "SmartStream 2023", fuelType: "Hybrid", transmission: "Automatic", location: "Addis Ababa" },
  { id: "scr-3", brokerId: "brk-2", brand: "Suzuki", model: "Dzire", year: 2021, mileage: 24000, price: 2850000, originalPrice: 3100000, status: "approved", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80", description: "VXI Plus 2021", fuelType: "Petrol", transmission: "Automatic", location: "Adama" },
  { id: "scr-4", brokerId: "brk-2", brand: "Mercedes-Benz", model: "C200", year: 2020, mileage: 45000, price: 12500000, originalPrice: 13000000, status: "approved", imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80", description: "Avantgarde 2020", fuelType: "Petrol", transmission: "Automatic", location: "Addis Ababa" },
  { id: "scr-5", brokerId: "brk-1", brand: "Volkswagen", model: "ID.4", year: 2023, mileage: 0, price: 8900000, originalPrice: 9500000, status: "approved", imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80", description: "Pro Performance 2023", fuelType: "Electric", transmission: "Automatic", location: "Addis Ababa" },
  { id: "scr-6", brokerId: "brk-2", brand: "Toyota", model: "Hilux", year: 2021, mileage: 32000, price: 9800000, originalPrice: 10500000, status: "approved", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80", description: "Double Cabin 2021", fuelType: "Diesel", transmission: "Manual", location: "Bishoftu" },
];

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
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFacets, setActiveFacets] = useState<Record<string, string[]>>({ brand: [], fuel: [], transmission: [], location: [], year: [], price: [] });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [carFavorites, setCarFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState("");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 8;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("showroom-saved-searches");
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
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
      const res = await fetch("/api/vehicles");
      let apiData: VehicleListing[] = [];
      if (res.ok) {
        apiData = await res.json();
        apiData = apiData.filter(v => v.status === "approved");
      }
      const merged = [...screenshotVehicles];
      apiData.forEach(apiCar => {
        if (!merged.some(m => m.brand === apiCar.brand && m.model === apiCar.model)) merged.push(apiCar);
      });
      setVehicles(merged);
    } catch {
      setVehicles(screenshotVehicles);
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
    return <div className="flex justify-center items-center py-20 text-slate-400 font-semibold text-xs">Loading Inventory...</div>;
  }

  const renderDropdown = (children: React.ReactNode, alignRight?: boolean) => (
    <div className={`absolute top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 max-h-80 overflow-y-auto ${alignRight ? "right-0" : "left-0 sm:left-0 right-0 sm:right-auto"}`}>
      {children}
    </div>
  );

  const renderCheckItem = (label: string, selected: boolean, onChange: () => void, count?: number) => (
    <label className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${selected ? "bg-blue-50 text-blue-900" : "text-slate-600 hover:bg-slate-50"}`}>
      <span className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded border flex items-center justify-center transition ${selected ? "bg-[#0F4C81] border-[#0F4C81]" : "border-slate-300"}`} onClick={onChange}>
          {selected && <span className="text-white text-[9px] font-black">&#10003;</span>}
        </span>
        {label}
      </span>
      {count !== undefined && <span className="text-[10px] font-bold text-slate-400">{count}</span>}
    </label>
  );

  const renderToolbarButton = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number, isOpen?: boolean) => (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 sm:px-3 py-2.5 sm:py-1.5 rounded-lg border cursor-pointer transition-colors w-full sm:w-auto justify-center ${
        active ? "border-[#0F4C81] bg-blue-50 text-[#0F4C81]" : "border-[#E5E7EB] hover:bg-slate-50 text-slate-600"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
      {count !== undefined && count > 0 && <span className="bg-[#0F4C81] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">{count}</span>}
      <ChevronDown size={14} className={`text-slate-400 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#111827] font-sans">
      <div className="w-full px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 pb-4 sm:pb-8">

        {/* Odoo-style search bar */}
        <div className="w-full sm:max-w-3xl sm:mx-auto mb-6" ref={searchRef}>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
            {/* Search input row */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3">
              <Search size={18} className="text-slate-400 shrink-0 sm:size-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search vehicles, brokers, customers..."
                className="flex-1 text-[15px] sm:text-sm text-[#111827] placeholder:text-slate-400 bg-transparent focus:outline-none min-w-0 py-1"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 shrink-0"><X size={16} /></button>
              )}
              <span className="text-[11px] sm:text-xs text-slate-400 font-semibold whitespace-nowrap shrink-0">{sorted.length}</span>
              <div className="h-6 w-px bg-[#E5E7EB] shrink-0" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-[11px] sm:text-xs font-semibold text-slate-500 bg-transparent focus:outline-none appearance-none cursor-pointer py-1.5 shrink-0 max-w-[90px] sm:max-w-none"
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {/* Toolbar */}
            {(searchFocused || allFiltersCount > 0) && (
              <div className="flex border-t border-[#E5E7EB] px-2 sm:px-4 py-2 flex-row flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Filters */}
                <div className="relative flex-1 sm:flex-none">
                  {renderToolbarButton(
                    quickFilters.length > 0,
                    () => setOpenDropdown(openDropdown === "filters" ? null : "filters"),
                    <Filter size={15} />, "Filters", quickFilters.length,
                    openDropdown === "filters"
                  )}
                  {openDropdown === "filters" && (
                    <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 min-w-full sm:w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 max-h-80 overflow-y-auto">
                      {QUICK_FILTERS.map(qf => renderCheckItem(qf.label, quickFilters.includes(qf.id), () => toggleQuickFilter(qf.id)))}
                    </div>
                  )}
                </div>

                {/* Group By */}
                <div className="relative flex-1 sm:flex-none">
                  {renderToolbarButton(
                    !!groupBy,
                    () => setOpenDropdown(openDropdown === "groupby" ? null : "groupby"),
                    <SlidersHorizontal size={15} />,
                    groupBy ? GROUP_OPTIONS.find(g => g.id === groupBy)?.label || "Group By" : "Group By",
                    undefined,
                    openDropdown === "groupby"
                  )}
                  {openDropdown === "groupby" && (
                    <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 min-w-full sm:w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 max-h-80 overflow-y-auto">
                      {GROUP_OPTIONS.map(opt => (
                        <div key={opt.id}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                            groupBy === opt.id ? "bg-blue-50 text-blue-900" : "text-slate-600 hover:bg-slate-50"
                          }`}
                          onClick={() => { setGroupBy(opt.id); setOpenDropdown(null); }}
                        >
                          {opt.label || "None"}
                          {groupBy === opt.id && <span className="text-blue-600 text-[10px]">&#10003;</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorites */}
                <div className="relative flex-1 sm:flex-none">
                  {renderToolbarButton(
                    false,
                    () => setOpenDropdown(openDropdown === "favorites" ? null : "favorites"),
                    <Star size={15} />, "Favorites",
                    undefined,
                    openDropdown === "favorites"
                  )}
                  {openDropdown === "favorites" && (
                    <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 min-w-full sm:w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 max-h-80 overflow-y-auto">
                      <button onClick={saveCurrentSearch}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#0F4C81] hover:bg-blue-50 cursor-pointer transition"
                      >+ Save Current Search</button>
                      {savedSearches.length > 0 && <div className="border-t border-slate-100 my-1" />}
                      {savedSearches.length > 0 && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">My Saved Searches</p>
                      )}
                      {savedSearches.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 group cursor-pointer"
                          onClick={() => loadSavedSearch(s)}
                        >
                          <span className="text-xs font-semibold text-slate-700">{s.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteSavedSearch(i); }}
                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          ><X size={12} /></button>
                        </div>
                      ))}
                      {savedSearches.length === 0 && (
                        <p className="text-xs text-slate-400 px-3 py-2">No saved searches yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced */}
                <div className="flex-1 sm:flex-none">
                {renderToolbarButton(
                  showAdvancedSearch,
                  () => setShowAdvancedSearch(!showAdvancedSearch),
                  <Filter size={15} />, "Advanced",
                  undefined,
                  showAdvancedSearch
                )}
                </div>
              </div>
            )}

            {/* Advanced Search panel */}
            {showAdvancedSearch && (
              <div className="border-t border-[#E5E7EB] px-3 sm:px-4 py-3 sm:py-4 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {["brand", "fuel", "transmission", "location", "year", "price"].map(key => {
                    const options = facetOptions[key] || [];
                    const selected = facets[key] || [];
                    return (
                      <div key={key}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{FACET_LABELS[key]}</label>
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === `adv-${key}` ? null : `adv-${key}`)}
                            className="w-full flex items-center justify-between gap-1 text-[11px] sm:text-xs font-semibold px-3 py-2.5 sm:py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 cursor-pointer text-slate-700"
                          >
                            <span className="truncate">{selected.length > 0 ? selected.join(", ") : `All ${FACET_LABELS[key].toLowerCase()}`}</span>
                            <ChevronDown size={14} className={`text-slate-400 shrink-0 transition ${openDropdown === `adv-${key}` ? "rotate-180" : ""}`} />
                          </button>
                          {openDropdown === `adv-${key}` && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 max-h-48 overflow-y-auto">
                              {options.length === 0 && <p className="text-xs text-slate-400 px-3 py-2">No options</p>}
                              {options.map(opt => renderCheckItem(
                                opt.value, selected.includes(opt.value), () => toggleFacet(key, opt.value), opt.count
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E7EB]">
                  <button onClick={() => setShowAdvancedSearch(false)}
                    className="text-[11px] sm:text-xs font-bold bg-[#0F4C81] hover:bg-blue-950 text-white px-5 sm:px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer transition flex-1 sm:flex-none"
                  >Apply Filters</button>
                  <button onClick={() => { Object.keys(facets).forEach(k => setActiveFacets(prev => ({ ...prev, [k]: [] }))); }}
                    className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-rose-600 px-4 sm:px-3 py-2.5 sm:py-2 cursor-pointer transition flex-1 sm:flex-none"
                  >Clear</button>
                </div>
              </div>
            )}
          </div>

          {/* Active filter pills */}
          {hasActiveFacets && (
            <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-2.5 items-center">
              {quickFilters.map(qfId => {
                const qf = QUICK_FILTERS.find(f => f.id === qfId);
                if (!qf) return null;
                return (
                  <span key={qf.id} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-slate-700 text-[11px] sm:text-xs font-medium px-2.5 sm:px-2.5 py-1 sm:py-1 rounded-full shadow-sm">
                    {qf.label}
                    <button onClick={() => toggleQuickFilter(qf.id)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={13} /></button>
                  </span>
                );
              })}
              {(Object.entries(facets) as [string, string[]][]).map(([key, values]) =>
                values.map(v => (
                  <span key={`${key}-${v}`} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-slate-700 text-[11px] sm:text-xs font-medium px-2.5 sm:px-2.5 py-1 sm:py-1 rounded-full shadow-sm">
                    {v}
                    <button onClick={() => removeFacet(key, v)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={13} /></button>
                  </span>
                ))
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-slate-700 text-[11px] sm:text-xs font-medium px-2.5 sm:px-2.5 py-1 sm:py-1 rounded-full shadow-sm">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={13} /></button>
                </span>
              )}
              <button onClick={clearAll} className="text-[11px] sm:text-xs font-medium text-slate-400 hover:text-rose-500 px-2.5 py-1 transition cursor-pointer">Clear all</button>
            </div>
          )}
        </div>

        {/* Vehicle grid */}
        <div>
          {groupBy && grouped ? (
            (Object.entries(grouped) as [string, VehicleListing[]][]).map(([group, cars]) => (
              <div key={group} className="mb-6 sm:mb-8">
                <h3 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 sm:h-4 bg-[#0F4C81] rounded-full" />
                  {group}
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 normal-case">({cars.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {cars.map(car => (
                    <CarCard key={car.id} car={car} carFavorites={carFavorites} setCarFavorites={setCarFavorites} onInquireCar={onInquireCar} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {paginated.length === 0 && (
                  <div className="col-span-full py-16 sm:py-20 text-center space-y-4">
                    <p className="text-slate-400 font-bold text-sm">No vehicles match your current filters.</p>
                    <button onClick={clearAll} className="bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors">Clear All Filters</button>
                  </div>
                )}
                {paginated.map(car => (
                  <CarCard key={car.id} car={car} carFavorites={carFavorites} setCarFavorites={setCarFavorites} onInquireCar={onInquireCar} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-6 sm:pt-8 pb-4">
                  <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer disabled:hover:bg-transparent"
                  >&lsaquo;</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                    const isActive = p === safePage;
                    if (Math.abs(p - safePage) > 1 && p !== 1 && p !== totalPages) {
                      return (p === 2 || p === totalPages - 1) ? <span key={p} className="text-[10px] sm:text-xs text-slate-400 font-bold px-1">&hellip;</span> : null;
                    }
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold cursor-pointer ${
                          isActive ? "bg-[#0F4C81] text-white shadow-sm" : "border border-[#E5E7EB] hover:bg-slate-50 text-slate-600"
                        }`}
                      >{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#E5E7EB] hover:bg-slate-50 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer disabled:hover:bg-transparent"
                  >&rsaquo;</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CarCard({ car, carFavorites, setCarFavorites, onInquireCar, key }: {
  car: VehicleListing;
  carFavorites: string[];
  setCarFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  onInquireCar: (car: VehicleListing) => void;
  key?: string;
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E5E7EB] hover:border-slate-300 hover:shadow-lg transition-all flex flex-col overflow-hidden group">
      <div className="h-36 sm:h-40 relative bg-slate-100 overflow-hidden">
        <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black tracking-widest py-0.5 px-1.5 sm:px-2 rounded flex items-center gap-1 shadow-sm uppercase">
          <ShieldCheck size={9} />
          <span>Verified</span>
        </div>
        <button onClick={() => setCarFavorites(prev => prev.includes(car.id) ? prev.filter(f => f !== car.id) : [...prev, car.id])}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border ${
            carFavorites.includes(car.id) ? "bg-rose-500 border-rose-400 text-white" : "bg-white/90 border-slate-200 text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart size={12} fill={carFavorites.includes(car.id) ? "currentColor" : "none"} />
        </button>
        {car.model === "RAV4" && <span className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-blue-600 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-sm">New</span>}
        {car.model === "Dzire" && <span className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-orange-500 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-sm">Top Rated</span>}
      </div>
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-xs sm:text-sm text-[#111827] truncate">{car.brand} {car.model}</h3>
            <span className="font-black text-xs sm:text-sm text-[#0F4C81] shrink-0">{Math.round(car.price / 100000) / 10}M ETB</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">{car.description}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 border-t border-[#E5E7EB] text-[10px] sm:text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1"><Calendar size={10} className="text-slate-400" /> {car.year}</span>
          <span className="flex items-center gap-1"><Compass size={10} className="text-slate-400" /> {(car.mileage / 1000).toFixed(0)}k km</span>
          <span className="flex items-center gap-1 ml-auto"><MapPin size={10} className="text-slate-400" /> {car.location.split(" ")[0]}</span>
        </div>
        <button onClick={() => onInquireCar(car)}
          className="w-full text-center bg-[#0F4C81] hover:bg-blue-950 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
        >View Details</button>
      </div>
    </div>
  );
}
