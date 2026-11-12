import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Search,
  X,
  History,
  Trash2,
  Sparkles,
  ShieldCheck,
  Zap,
  Star,
  DollarSign,
  Calendar,
  CheckCircle2,
  Bookmark,
  MapPin,
  Car,
  ChevronRight,
  Gauge
} from "lucide-react";
import type { VehicleListing } from "@autobroker/shared";

export interface QuickFilterOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const QUICK_FILTERS: QuickFilterOption[] = [
  { id: "available", label: "All Available", icon: Sparkles },
  { id: "verified", label: "Verified Libre", icon: ShieldCheck },
  { id: "electric", label: "Zero-Duty EV & Hybrid", icon: Zap },
  { id: "luxury", label: "Luxury & 4WD", icon: Star },
  { id: "budget", label: "Budget (< 3M ETB)", icon: DollarSign },
  { id: "newArrivals", label: "New Arrivals", icon: Calendar },
  { id: "sold", label: "Recently Sold", icon: CheckCircle2 },
];

export const POPULAR_BRANDS = [
  "Toyota",
  "Hyundai",
  "Suzuki",
  "Mercedes-Benz",
  "BYD",
  "Volkswagen",
  "Nissan",
  "Lexus",
  "Isuzu",
];

const RECENT_SEARCHES_KEY = "autobroker_recent_searches";
const MAX_RECENT_SEARCHES = 8;

interface SearchHeroBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  quickFilters: string[];
  onToggleQuickFilter: (id: string) => void;
  onSelectBrand?: (brand: string) => void;
  allVehicles: VehicleListing[];
  onSaveSearch?: () => void;
  savedSearchesCount?: number;
}

export default function SearchHeroBar({
  searchQuery,
  onSearchChange,
  quickFilters,
  onToggleQuickFilter,
  onSelectBrand,
  allVehicles,
  onSaveSearch,
  savedSearchesCount = 0,
}: SearchHeroBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when external searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const clearAllRecentSearches = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Compute matched autocomplete items
  const queryLower = inputValue.trim().toLowerCase();

  const brandSuggestions = useMemo(() => {
    if (!queryLower) return [];
    const makes = Array.from(new Set(allVehicles.map(v => v.brand)));
    return makes.filter(m => m.toLowerCase().includes(queryLower)).slice(0, 4);
  }, [allVehicles, queryLower]);

  const modelSuggestions = useMemo(() => {
    if (!queryLower) return [];
    const models = Array.from(new Set(allVehicles.map(v => `${v.brand} ${v.model}`)));
    return models.filter(m => m.toLowerCase().includes(queryLower)).slice(0, 4);
  }, [allVehicles, queryLower]);

  const locationSuggestions = useMemo(() => {
    if (!queryLower) return [];
    const locs = Array.from(new Set(allVehicles.map(v => v.location).filter(Boolean)));
    return locs.filter(l => l.toLowerCase().includes(queryLower)).slice(0, 3);
  }, [allVehicles, queryLower]);

  const vehiclePreviews = useMemo(() => {
    if (!queryLower || queryLower.length < 2) return [];
    return allVehicles
      .filter(v =>
        v.brand.toLowerCase().includes(queryLower) ||
        v.model.toLowerCase().includes(queryLower) ||
        (v.bodyType || "").toLowerCase().includes(queryLower) ||
        v.year.toString().includes(queryLower)
      )
      .slice(0, 3);
  }, [allVehicles, queryLower]);

  // Flattened list of interactive items for arrow key navigation
  const flatSuggestions = useMemo(() => {
    const list: Array<{ type: "brand" | "model" | "location" | "recent" | "vehicle"; value: string; data?: any }> = [];
    if (!queryLower) {
      recentSearches.forEach(s => list.push({ type: "recent", value: s }));
    } else {
      brandSuggestions.forEach(b => list.push({ type: "brand", value: b }));
      modelSuggestions.forEach(m => list.push({ type: "model", value: m }));
      locationSuggestions.forEach(l => list.push({ type: "location", value: l }));
      vehiclePreviews.forEach(v => list.push({ type: "vehicle", value: `${v.brand} ${v.model}`, data: v }));
    }
    return list;
  }, [queryLower, recentSearches, brandSuggestions, modelSuggestions, locationSuggestions, vehiclePreviews]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (value: string) => {
    setInputValue(value);
    onSearchChange(value);
    saveRecentSearch(value);
    setIsOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
      handleSelectSuggestion(flatSuggestions[selectedIndex].value);
    } else {
      onSearchChange(inputValue);
      if (inputValue.trim()) saveRecentSearch(inputValue);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatSuggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Match highlighter helper
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-[#FF4846] font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <section className="bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 pt-6 sm:pt-8 pb-5 sm:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 text-center">
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Vehicle Showroom
          </h1>
        </div>

        {/* Intelligent Search Capsule */}
        <div ref={containerRef} className="max-w-2xl mx-auto relative z-30">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-md hover:shadow-lg focus-within:border-[#FF4846] focus-within:ring-4 focus-within:ring-[#FF4846]/10 transition-all p-1.5 sm:p-2"
          >
            {/* Search Icon Badge */}
            <div className="w-10 h-10 rounded-full bg-[#FF4846]/10 text-[#FF4846] flex items-center justify-center shrink-0 ml-1">
              <Search size={18} strokeWidth={2.5} />
            </div>

            {/* Main Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                setIsOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search make, model, year, location, Bole..."
              className="w-full py-2.5 px-3 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium border-0 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
              style={{ outline: "none", border: "none", boxShadow: "none" }}
              aria-autocomplete="list"
              aria-expanded={isOpen}
            />

            {/* Clear Input Button */}
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  onSearchChange("");
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1"
                title="Clear search"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}

            {/* Save Search Button */}
            {onSaveSearch && (
              <button
                type="button"
                onClick={onSaveSearch}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700 mr-1.5"
                title="Save current search configuration"
              >
                <Bookmark size={13} />
                <span>Save</span>
                {savedSearchesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#FF4846]/15 text-[#FF4846] text-[10px] font-bold flex items-center justify-center">
                    {savedSearchesCount}
                  </span>
                )}
              </button>
            )}

            {/* Primary Search CTA */}
            <button
              type="submit"
              className="flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FF4846] hover:bg-[#e03d3b] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF4846]/25 hover:shadow-lg transition cursor-pointer shrink-0 active:scale-95"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Autocomplete Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* STATE A: Recent Searches (When input is empty or focused) */}
              {!queryLower && recentSearches.length > 0 && (
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between pb-2 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <History size={12} className="text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term, idx) => (
                      <div
                        key={term}
                        onClick={() => handleSelectSuggestion(term)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                          selectedIndex === idx
                            ? "bg-[#FF4846]/10 text-[#FF4846]"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <History size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{term}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Remove search"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATE B: Popular Brands Quick-Select Grid */}
              {!queryLower && (
                <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-2 px-1">
                    Popular Ethiopian Brands
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_BRANDS.map(brand => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          if (onSelectBrand) onSelectBrand(brand);
                          else handleSelectSuggestion(brand);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-[#FF4846] hover:text-[#FF4846] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Car size={12} className="text-slate-400" />
                        <span>{brand}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STATE C: Query Match Suggestions */}
              {queryLower && (
                <div className="p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/80">
                  {/* Brands match */}
                  {brandSuggestions.length > 0 && (
                    <div className="pt-1 first:pt-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Makes
                      </span>
                      {brandSuggestions.map((brand) => (
                        <div
                          key={brand}
                          onClick={() => handleSelectSuggestion(brand)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="flex items-center gap-2">
                            <Car size={13} className="text-[#FF4846]" />
                            <span>{highlightMatch(brand, inputValue.trim())}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Brand</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Models match */}
                  {modelSuggestions.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Models
                      </span>
                      {modelSuggestions.map((model) => (
                        <div
                          key={model}
                          onClick={() => handleSelectSuggestion(model)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="flex items-center gap-2">
                            <Search size={13} className="text-slate-400" />
                            <span>{highlightMatch(model, inputValue.trim())}</span>
                          </span>
                          <ChevronRight size={13} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Locations match */}
                  {locationSuggestions.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Locations
                      </span>
                      {locationSuggestions.map((loc) => (
                        <div
                          key={loc}
                          onClick={() => handleSelectSuggestion(loc)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin size={13} className="text-amber-500" />
                            <span>{highlightMatch(loc, inputValue.trim())}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">City / Area</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vehicle instant previews */}
                  {vehiclePreviews.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Matching Vehicles
                      </span>
                      {vehiclePreviews.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => handleSelectSuggestion(`${v.brand} ${v.model}`)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                        >
                          <img
                            src={v.imageUrl}
                            alt={`${v.brand} ${v.model}`}
                            className="w-10 h-8 object-cover rounded-md shrink-0 bg-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {v.year} {v.brand} {v.model}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span>{v.location}</span>
                              <span>•</span>
                              <span className="text-[#FF4846] font-bold">
                                {(v.price / 1000000).toFixed(2)}M ETB
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {brandSuggestions.length === 0 &&
                    modelSuggestions.length === 0 &&
                    locationSuggestions.length === 0 &&
                    vehiclePreviews.length === 0 && (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Press <span className="font-bold text-slate-600 dark:text-slate-300">Enter</span> to search for "{inputValue}"
                      </div>
                    )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Quick Discovery Categories Bar */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
          {QUICK_FILTERS.map((qf) => {
            const active = quickFilters.includes(qf.id);
            const Icon = qf.icon;
            return (
              <button
                key={qf.id}
                type="button"
                onClick={() => onToggleQuickFilter(qf.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? "bg-[#FF4846] text-white border-[#FF4846] shadow-xs shadow-[#FF4846]/20"
                    : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs"
                }`}
              >
                <Icon size={12} className={active ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                <span>{qf.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

