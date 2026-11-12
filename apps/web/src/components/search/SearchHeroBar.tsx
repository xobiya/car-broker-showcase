import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Search,
  X,
  History,
  Trash2,
  MapPin,
  Car,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";
import type { VehicleListing } from "@autobroker/shared";

// ── AFROMEKINA-STYLE BODY SHAPE DEFINITIONS ──
export interface BodyShapeOption {
  id: string;
  label: string;
  image: string;
}

export const BODY_SHAPE_TYPES: BodyShapeOption[] = [
  { id: "Sedan", label: "Sedan", image: "/car_body/sedan.png" },
  { id: "SUV", label: "SUV", image: "/car_body/suv.png" },
  { id: "Hatchback", label: "Hatchback", image: "/car_body/hatchback.png" },
  { id: "Pickup", label: "Pickup", image: "/car_body/pickup_truck.png" },
  { id: "Van", label: "Van", image: "/car_body/van.png" },
  { id: "Bus", label: "Bus", image: "/car_body/bus.png" },
  { id: "Truck", label: "Truck", image: "/car_body/dump_truck.png" },
  { id: "Machinery", label: "Machinery", image: "/car_body/machinery.png" },
  { id: "Motorcycle", label: "Motorcycle", image: "/car_body/motorcycle.png" },
];

export const QUICK_FILTERS: Array<{ id: string; label: string; icon: any }> = [];

const RECENT_SEARCHES_KEY = "autobroker_recent_searches";
const MAX_RECENT_SEARCHES = 8;

interface SearchHeroBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBodyTypes: string[];
  onToggleBodyType: (bodyType: string) => void;
  onSelectBrand?: (brand: string) => void;
  allVehicles: VehicleListing[];
  verifiedOnly?: boolean;
  onToggleVerifiedOnly?: () => void;
}

export default function SearchHeroBar({
  searchQuery,
  onSearchChange,
  selectedBodyTypes,
  onToggleBodyType,
  onSelectBrand,
  allVehicles,
  verifiedOnly = false,
  onToggleVerifiedOnly,
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Suggestions computation
  const queryLower = inputValue.trim().toLowerCase();

  const brandSuggestions = useMemo(() => {
    if (!queryLower) return [];
    const unique = Array.from(new Set(allVehicles.map(v => v.brand))).filter(Boolean);
    return unique
      .filter(b => b.toLowerCase().includes(queryLower))
      .slice(0, 4);
  }, [allVehicles, queryLower]);

  const modelSuggestions = useMemo(() => {
    if (!queryLower) return [];
    const map = new Map<string, { brand: string; model: string }>();
    allVehicles.forEach(v => {
      const key = `${v.brand} ${v.model}`.toLowerCase();
      if ((v.model.toLowerCase().includes(queryLower) || key.includes(queryLower)) && !map.has(key)) {
        map.set(key, { brand: v.brand, model: v.model });
      }
    });
    return Array.from(map.values()).slice(0, 5);
  }, [allVehicles, queryLower]);

  const locationSuggestions = useMemo(() => {
    if (!queryLower) return [];
    const unique = Array.from(
      new Set(allVehicles.map(v => v.location).filter(Boolean))
    );
    return unique
      .filter(loc => loc.toLowerCase().includes(queryLower))
      .slice(0, 3);
  }, [allVehicles, queryLower]);

  const vehiclePreviews = useMemo(() => {
    if (!queryLower) return [];
    return allVehicles
      .filter(v => {
        const full = `${v.brand} ${v.model} ${v.year}`.toLowerCase();
        return full.includes(queryLower);
      })
      .slice(0, 3);
  }, [allVehicles, queryLower]);

  // Flattened suggestions for keyboard navigation
  const flatSuggestions = useMemo(() => {
    const list: Array<{ type: string; value: string; display: string }> = [];
    if (!queryLower && recentSearches.length > 0) {
      recentSearches.forEach(term => list.push({ type: "recent", value: term, display: term }));
    } else if (queryLower) {
      brandSuggestions.forEach(b => list.push({ type: "brand", value: b, display: b }));
      modelSuggestions.forEach(m => list.push({ type: "model", value: `${m.brand} ${m.model}`, display: `${m.brand} ${m.model}` }));
      locationSuggestions.forEach(l => list.push({ type: "location", value: l, display: l }));
      vehiclePreviews.forEach(v => list.push({ type: "vehicle", value: `${v.brand} ${v.model}`, display: `${v.year} ${v.brand} ${v.model}` }));
    }
    return list;
  }, [queryLower, recentSearches, brandSuggestions, modelSuggestions, locationSuggestions, vehiclePreviews]);

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

  const totalListingCount = allVehicles.length > 0 ? `${allVehicles.length}+` : "1,200+";

  return (
    <section className="bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 pt-6 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── UNIFIED AFROMEKINA-STYLE SEARCH BAR ── */}
        <div ref={containerRef} className="relative z-30">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch"
            >
              {/* Left: Verified Listings Only Toggle Badge */}
              <button
                type="button"
                onClick={onToggleVerifiedOnly}
                className={`flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 text-[11px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 ${
                  verifiedOnly
                    ? "bg-[#FF4846] text-white"
                    : "bg-[#0B1528] text-white hover:bg-[#15233D]"
                }`}
                title="Toggle Verified Listings Only"
              >
                <ShieldCheck size={14} className={verifiedOnly ? "text-white" : "text-[#FF4846]"} />
                <span>VERIFIED LISTINGS ONLY</span>
                {verifiedOnly && <Check size={12} strokeWidth={3} />}
              </button>

              {/* Middle: Text Search Input */}
              <div className="relative flex-1 flex items-center min-w-0 bg-transparent px-3">
                <Search size={18} className="text-slate-400 shrink-0 ml-1" />
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
                  placeholder="Search make, model or city"
                  className="w-full py-3.5 px-3 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium border-0 outline-none ring-0 focus:outline-none focus:ring-0"
                  aria-autocomplete="list"
                  aria-expanded={isOpen}
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue("");
                      onSearchChange("");
                      inputRef.current?.focus();
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full transition mr-1"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Right: Solid Action Search Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm tracking-wide transition cursor-pointer shrink-0 active:scale-98"
              >
                <Search size={16} strokeWidth={2.5} className="sm:hidden" />
                <span>Search {totalListingCount} cars</span>
              </button>
            </form>

            {/* Stats Row Underneath Search Input */}
            <div className="hidden sm:grid grid-cols-4 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-left">
              <div className="p-3.5 px-4">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {totalListingCount}
                </div>
                <div className="text-xs text-slate-400 font-medium">Cars listed</div>
              </div>
              <div className="p-3.5 px-4">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  380+
                </div>
                <div className="text-xs text-slate-400 font-medium">Verified sellers</div>
              </div>
              <div className="p-3.5 px-4">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  45+
                </div>
                <div className="text-xs text-slate-400 font-medium">Dealerships onboard</div>
              </div>
              <div className="p-3.5 px-4">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  9+
                </div>
                <div className="text-xs text-slate-400 font-medium">Cities covered</div>
              </div>
            </div>
          </div>

          {/* Autocomplete Suggestions Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left z-50">
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
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold cursor-pointer transition ${
                          selectedIndex === idx
                            ? "bg-[#FF4846]/10 text-[#FF4846]"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <History size={13} className="text-slate-400" />
                          <span>{term}</span>
                        </span>
                        <button
                          type="button"
                          onClick={e => removeRecentSearch(term, e)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          title="Remove search"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queryLower && (
                <div className="p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                  {brandSuggestions.length > 0 && (
                    <div className="pb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Brands
                      </span>
                      {brandSuggestions.map((brand) => (
                        <div
                          key={brand}
                          onClick={() => handleSelectSuggestion(brand)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-slate-800 dark:text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Car size={13} className="text-[#FF4846]" />
                            {highlightMatch(brand, inputValue)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Make</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {modelSuggestions.length > 0 && (
                    <div className="py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Models
                      </span>
                      {modelSuggestions.map((m) => (
                        <div
                          key={`${m.brand}-${m.model}`}
                          onClick={() => handleSelectSuggestion(`${m.brand} ${m.model}`)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-slate-800 dark:text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Car size={13} className="text-slate-400" />
                            <span>
                              {m.brand} {highlightMatch(m.model, inputValue)}
                            </span>
                          </span>
                          <ChevronRight size={13} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {locationSuggestions.length > 0 && (
                    <div className="py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Locations
                      </span>
                      {locationSuggestions.map((loc) => (
                        <div
                          key={loc}
                          onClick={() => handleSelectSuggestion(loc)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-slate-800 dark:text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin size={13} className="text-[#FF4846]" />
                            {highlightMatch(loc, inputValue)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">City / Area</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {vehiclePreviews.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Matching Vehicles
                      </span>
                      {vehiclePreviews.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => handleSelectSuggestion(`${v.brand} ${v.model}`)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── AFROMEKINA-STYLE BODY TYPE ICONS & UX ROW ── */}
        <div className="pt-2 text-left">
          {/* Section Header */}
          <div className="mb-3">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-1">
              BY BODY TYPE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Or start with the shape you need
            </h2>
          </div>

          {/* Body Type Card Container with Dividers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800">
              {BODY_SHAPE_TYPES.map((shape) => {
                const isSelected = selectedBodyTypes.includes(shape.id);

                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => onToggleBodyType(shape.id)}
                    className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 text-center cursor-pointer transition-all ${
                      isSelected
                        ? "bg-sky-50/70 dark:bg-sky-950/30 text-[#0284C7] ring-2 ring-inset ring-[#0284C7]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    {/* Active check pill */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                        ✓
                      </span>
                    )}

                    {/* Realistic White Vehicle Profile Image */}
                    <div className="h-12 sm:h-14 w-full flex items-center justify-center px-1">
                      <img
                        src={shape.image}
                        alt={shape.label}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to avoid broken image display
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Shape Label */}
                    <span
                      className={`text-xs font-bold mt-2.5 transition-colors ${
                        isSelected
                          ? "text-[#0284C7] font-black"
                          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    >
                      {shape.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
