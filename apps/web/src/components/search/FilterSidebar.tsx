import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Car,
  Settings2,
  Gauge,
  Fuel,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
  Minimize2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { VehicleListing } from "@autobroker/shared";
import {
  FilterState,
  ETHIOPIAN_PRICE_BRACKETS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  ETHIOPIAN_LOCATIONS,
  YEAR_OPTIONS,
  MILEAGE_BRACKETS,
} from "./filterTypes";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  onReset: () => void;
  allVehicles: VehicleListing[];
  totalMatches: number;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  verifiedOnly?: boolean;
  onToggleVerifiedOnly?: () => void;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  allVehicles,
  totalMatches,
  isMinimized = false,
  onToggleMinimize,
  verifiedOnly = false,
  onToggleVerifiedOnly,
}: FilterSidebarProps) {
  // Collapsible section states (compact, minimized defaults)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    verification: true,
    makeModel: true,
    price: true,
    transmission: true,
    fuel: false,
    year: false,
    location: false,
    mileage: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle array facet item
  const toggleArrayFacet = (key: keyof FilterState, value: string) => {
    onFilterChange(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  // Dynamic Makes & Counts
  const makeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allVehicles.forEach(v => {
      if (v.brand) counts[v.brand] = (counts[v.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }, [allVehicles]);

  // Dependent Model Options
  const modelOptions = useMemo(() => {
    const selectedBrands = filters.brand;
    const relevantVehicles = selectedBrands.length > 0
      ? allVehicles.filter(v => selectedBrands.includes(v.brand))
      : allVehicles;

    const counts: Record<string, { model: string; brand: string; count: number }> = {};
    relevantVehicles.forEach(v => {
      if (v.model) {
        if (!counts[v.model]) {
          counts[v.model] = { model: v.model, brand: v.brand, count: 0 };
        }
        counts[v.model].count++;
      }
    });

    return Object.values(counts).sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
  }, [allVehicles, filters.brand]);

  // Active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    count += filters.brand.length;
    count += filters.model.length;
    count += filters.bodyType.length;
    count += filters.fuel.length;
    count += filters.transmission.length;
    count += filters.location.length;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.minMileage || filters.maxMileage) count++;
    if (verifiedOnly) count++;
    return count;
  }, [filters, verifiedOnly]);

  // ── MINIMIZED VIEW (COMPACT SLIM RAIL) ──
  if (isMinimized) {
    return (
      <aside className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-2 flex flex-col items-center gap-3">
        {onToggleMinimize && (
          <button
            type="button"
            onClick={onToggleMinimize}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4846] hover:text-white dark:hover:bg-[#FF4846] text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
            title="Expand Filters"
            aria-label="Expand Filters"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <div className="relative p-2 text-slate-700 dark:text-slate-300" title={`Filters (${activeCount} active)`}>
          <SlidersHorizontal size={18} className="text-[#FF4846]" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4846] text-white text-[9px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition cursor-pointer"
            title="Reset All Filters"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </aside>
    );
  }

  // ── MODERN EXPANDED SIDEBAR VIEW ──
  return (
    <aside className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)] p-4 sm:p-5 space-y-4">
      
      {/* ── HEADER WITH ACTIVE COUNT, RESET & MINIMIZE ── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF4846]/10 text-[#FF4846] flex items-center justify-center">
            <SlidersHorizontal size={14} />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FF4846] text-white text-[10px] font-black shadow-2xs">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}

          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Minimize sidebar"
              aria-label="Minimize sidebar"
            >
              <Minimize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION: VERIFICATION & TITLE QUALITY ── */}
      {onToggleVerifiedOnly && (
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleVerifiedOnly}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
              verifiedOnly
                ? "bg-[#FF4846]/10 border-[#FF4846] text-[#FF4846] shadow-sm shadow-[#FF4846]/15"
                : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <ShieldCheck size={18} className={verifiedOnly ? "text-[#FF4846]" : "text-emerald-500"} />
              <div>
                <span className="text-xs font-black block">Verified Libre Only</span>
                <span className="text-[10px] text-slate-400 font-medium">Title deed audited</span>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                verifiedOnly
                  ? "bg-[#FF4846] border-[#FF4846] text-white"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              }`}
            >
              {verifiedOnly && <Check size={13} strokeWidth={3} />}
            </div>
          </button>
        </div>
      )}

      {/* ── SECTION 1: MAKE & DEPENDENT MODEL ── */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("makeModel")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Car size={14} className="text-[#FF4846]" />
            <span>Make & Model</span>
            {(filters.brand.length > 0 || filters.model.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.makeModel ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.makeModel && (
          <div className="pt-2.5 space-y-3">
            {/* Makes list */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {makeOptions.map(opt => {
                const selected = filters.brand.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                      selected
                        ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleArrayFacet("brand", opt.value)}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                      />
                      <span className="truncate">{opt.value}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-semibold">
                      {opt.count}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Dependent Model list */}
            {modelOptions.length > 0 && (
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Models {filters.brand.length > 0 && `(${filters.brand.join(", ")})`}
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {modelOptions.map(opt => {
                    const selected = filters.model.includes(opt.model);
                    return (
                      <label
                        key={opt.model}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                          selected
                            ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleArrayFacet("model", opt.model)}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                          />
                          <span className="truncate">{opt.model}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-semibold">
                          {opt.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 2: PRICE RANGE (ETB) ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="text-[#FF4846] font-black text-xs">ETB</span>
            <span>Price Range</span>
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.price ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.price && (
          <div className="pt-2.5 space-y-2.5">
            {/* Quick Brackets */}
            <div className="grid grid-cols-2 gap-1.5">
              {ETHIOPIAN_PRICE_BRACKETS.slice(0, 4).map(bracket => {
                const active =
                  Number(filters.minPrice || 0) === bracket.min &&
                  (bracket.max === undefined
                    ? !filters.maxPrice
                    : Number(filters.maxPrice) === bracket.max);

                return (
                  <button
                    key={bracket.label}
                    type="button"
                    onClick={() => {
                      if (active) {
                        onFilterChange(prev => ({ ...prev, minPrice: "", maxPrice: "" }));
                      } else {
                        onFilterChange(prev => ({
                          ...prev,
                          minPrice: bracket.min ? String(bracket.min) : "",
                          maxPrice: bracket.max ? String(bracket.max) : "",
                        }));
                      }
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition truncate text-center border cursor-pointer ${
                      active
                        ? "bg-[#FF4846] text-white border-[#FF4846] shadow-2xs shadow-[#FF4846]/20"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {bracket.label}
                  </button>
                );
              })}
            </div>

            {/* Min & Max Inputs Row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Min ETB</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ""}
                  onChange={e =>
                    onFilterChange(prev => ({ ...prev, minPrice: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846] focus:ring-1 focus:ring-[#FF4846]"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Max ETB</span>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.maxPrice || ""}
                  onChange={e =>
                    onFilterChange(prev => ({ ...prev, maxPrice: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846] focus:ring-1 focus:ring-[#FF4846]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: TRANSMISSION (SEGMENTED PILLS) ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("transmission")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Settings2 size={14} className="text-[#FF4846]" />
            <span>Transmission</span>
            {filters.transmission.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.transmission ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.transmission && (
          <div className="pt-2.5 flex gap-2">
            {TRANSMISSION_TYPES.map(type => {
              const active = filters.transmission.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayFacet("transmission", type)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846] shadow-sm shadow-[#FF4846]/20"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 4: FUEL TYPE (GRID PILLS) ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("fuel")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Fuel size={14} className="text-[#FF4846]" />
            <span>Fuel Type</span>
            {filters.fuel.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.fuel ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.fuel && (
          <div className="pt-2.5 grid grid-cols-2 gap-2">
            {FUEL_TYPES.map(type => {
              const active = filters.fuel.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayFacet("fuel", type)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition border cursor-pointer text-center truncate ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846] shadow-sm shadow-[#FF4846]/20"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 5: YEAR (DROPDOWNS) ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("year")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calendar size={14} className="text-[#FF4846]" />
            <span>Year</span>
            {(filters.minYear || filters.maxYear) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.year ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.year && (
          <div className="pt-2.5 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">From</span>
              <select
                value={filters.minYear || ""}
                onChange={e =>
                  onFilterChange(prev => ({ ...prev, minYear: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
              >
                <option value="">Any</option>
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">To</span>
              <select
                value={filters.maxYear || ""}
                onChange={e =>
                  onFilterChange(prev => ({ ...prev, maxYear: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
              >
                <option value="">Present</option>
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 6: LOCATION ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("location")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <MapPin size={14} className="text-[#FF4846]" />
            <span>Location</span>
            {filters.location.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.location ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.location && (
          <div className="pt-2.5 space-y-1 max-h-36 overflow-y-auto pr-1">
            {ETHIOPIAN_LOCATIONS.map(loc => {
              const selected = filters.location.includes(loc);
              return (
                <label
                  key={loc}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                    selected
                      ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleArrayFacet("location", loc)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                  />
                  <span className="truncate">{loc}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 7: MILEAGE ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("mileage")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Gauge size={14} className="text-[#FF4846]" />
            <span>Mileage</span>
            {(filters.minMileage || filters.maxMileage) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.mileage ? (
            <ChevronUp size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          ) : (
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
          )}
        </button>

        {openSections.mileage && (
          <div className="pt-2.5 grid grid-cols-2 gap-2">
            {MILEAGE_BRACKETS.map(b => {
              const active = Number(filters.maxMileage) === b.max;
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => {
                    onFilterChange(prev => ({
                      ...prev,
                      maxMileage: active ? "" : String(b.max),
                    }));
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition border cursor-pointer text-center truncate ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846] shadow-sm shadow-[#FF4846]/20"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
