import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Search,
  X,
  History,
  Trash2,
  MapPin,
  Car,
  ChevronRight,
  Gauge
} from "lucide-react";
import type { VehicleListing } from "@autobroker/shared";

// ── CUSTOM HIGH-FIDELITY AUTOMOTIVE SILHOUETTE ICONS ──
export function SuvIcon({ className = "w-8 h-5.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M29 11l-2.2-4.4C26.3 5.6 25.3 5 24.2 5H14c-.6 0-1.1.3-1.5.8L9.8 9.5H4c-1.1 0-2 .9-2 2v2.5c0 .6.4 1 1 1h1.1c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h8.2c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3H29c.6 0 1-.4 1-1V12c0-.5-.4-.9-.9-1zM14 6.8h9.8c.4 0 .7.2.9.6l1.8 3.6H13.6l2.3-3.6c.2-.4.5-.6.9-.6zM8 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export function SedanIcon({ className = "w-8 h-5.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M29 12l-3-4.5c-.5-.7-1.3-1.2-2.1-1.3l-7-.7-5.4 1.5c-.8.2-1.5.8-1.9 1.5L6.5 12H3c-.6 0-1 .4-1 1v1.5c0 .6.4 1 1 1h1.1c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h8.2c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3H29c.6 0 1-.4 1-1V13c0-.6-.4-1-.9-1zM11.5 8.2l4.8-1.3 6.2.6 2.3 3.5H10.1l1.4-2.8zM8 17.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export function PickupIcon({ className = "w-8 h-5.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M29.5 11.5H23V6.2c0-.7-.5-1.2-1.2-1.2H14c-.6 0-1.1.3-1.5.8L9.8 9.5H4c-1.1 0-2 .9-2 2v3c0 .6.4 1 1 1h1.1c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h8.2c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h2.6c.6 0 1-.4 1-1v-2.5c0-.6-.4-1-.9-1zM13.8 6.8h7.4v4.2H11.2l2.6-4.2zm-5.8 10.7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export function HatchbackIcon({ className = "w-8 h-5.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M28.5 12.5l-2.2-5c-.4-.9-1.2-1.5-2.2-1.5H16c-.7 0-1.3.4-1.7 1L10.5 11H4c-1.1 0-2 .9-2 2v1.5c0 .6.4 1 1 1h1.1c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h8.2c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h1.6c.6 0 1-.4 1-1V13c0-.3-.1-.4-.2-.5zM15.8 7.5h8.1l1.7 3.5H13.6l2.2-3.5zm-7.8 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export function CrossoverIcon({ className = "w-8 h-5.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M29 11.5l-2.6-4.8c-.4-.7-1.1-1.2-1.9-1.2H15c-.6 0-1.2.3-1.6.8L10 10H4c-1.1 0-2 .9-2 2v2.5c0 .6.4 1 1 1h1.1c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h8.2c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3H29c.6 0 1-.4 1-1V12c0-.3-.4-.5-.9-.5zm-14.2-4.5h9.4l1.9 3.5H12.2l2.6-3.5zm-6.8 10.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export function VanIcon({ className = "w-8 h-5.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M28.8 9.5l-2.3-4.2c-.4-.7-1.1-1.2-1.9-1.3H5c-1.1 0-2 .9-2 2v9.5c0 .6.4 1 1 1h1.1c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3h8.2c.4-1.8 2-3 3.9-3s3.5 1.2 3.9 3H29c.6 0 1-.4 1-1v-6c0-.4-.1-.8-.2-1zM5 5.5h19.2l1.9 3.5H5V5.5zm3 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm16 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

// ── TOP FILTERING CAR MODELS (ONLY ICONS USED) ──
export interface CarModelTypeOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TOP_CAR_MODELS: CarModelTypeOption[] = [
  { id: "SUV", label: "SUV", icon: SuvIcon },
  { id: "Sedan", label: "Sedan", icon: SedanIcon },
  { id: "Pickup", label: "Pickup Truck", icon: PickupIcon },
  { id: "Hatchback", label: "Hatchback", icon: HatchbackIcon },
  { id: "Crossover", label: "Crossover", icon: CrossoverIcon },
  { id: "Van", label: "Van / Minivan", icon: VanIcon },
];

export const QUICK_FILTERS: Array<{ id: string; label: string; icon: any }> = [];

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
  selectedBodyTypes: string[];
  onToggleBodyType: (bodyType: string) => void;
  onSelectBrand?: (brand: string) => void;
  allVehicles: VehicleListing[];
}

export default function SearchHeroBar({
  searchQuery,
  onSearchChange,
  selectedBodyTypes,
  onToggleBodyType,
  onSelectBrand,
  allVehicles,
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
    <section className="bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 pt-5 pb-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-3.5 text-center">
        
        {/* Sleek Minimalist Search Capsule (No search text button; Icon only) */}
        <div ref={containerRef} className="max-w-2xl mx-auto relative z-30">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-md hover:shadow-lg focus-within:border-[#FF4846] focus-within:ring-4 focus-within:ring-[#FF4846]/10 transition-all p-1.5"
          >
            {/* Input Field */}
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
              placeholder="Search make, model, year, location..."
              className="w-full py-2.5 px-4 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium border-0 outline-none ring-0 focus:outline-none focus:ring-0"
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
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}

            {/* Submit Button: ONLY ICON (Text removed as requested) */}
            <button
              type="submit"
              title="Search"
              aria-label="Search"
              className="w-10 h-10 rounded-full bg-[#FF4846] hover:bg-[#e03d3b] text-white flex items-center justify-center shadow-md shadow-[#FF4846]/25 hover:shadow-lg transition cursor-pointer shrink-0 active:scale-95"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </form>

          {/* Autocomplete Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* STATE A: Recent Searches */}
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

              {/* STATE B: Live Matching Results */}
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
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-slate-800 dark:text-slate-200"
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
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-slate-800 dark:text-slate-200"
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
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-slate-800 dark:text-slate-200"
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
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── TOP FILTERING: VEHICLE MODELS (ONLY ICONS USED) ── */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 pt-1">
          {TOP_CAR_MODELS.map((model) => {
            const active = selectedBodyTypes.includes(model.id);
            const Icon = model.icon;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => onToggleBodyType(model.id)}
                title={model.label}
                aria-label={model.label}
                className={`relative group p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer border ${
                  active
                    ? "bg-[#FF4846] text-white border-[#FF4846] shadow-md shadow-[#FF4846]/25 scale-105"
                    : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white shadow-2xs"
                }`}
              >
                {/* ONLY ICON IS RENDERED HERE */}
                <Icon className={`w-8 h-5 sm:w-9 sm:h-5.5 transition-colors ${active ? "text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white"}`} />
                
                {/* Floating Tooltip with vehicle model name */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md z-40">
                  {model.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
