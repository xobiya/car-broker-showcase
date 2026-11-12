import React, { useState, useMemo } from "react";
import {
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Car,
  Settings2,
  Gauge,
  Fuel,
  MapPin,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2
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
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  allVehicles,
  totalMatches,
  isMinimized = false,
  onToggleMinimize,
}: FilterSidebarProps) {
  // Collapsible section states (compact, minimized defaults)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    makeModel: true,
    price: true,
    year: false,
    transmission: true,
    fuel: false,
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
    return count;
  }, [filters]);

  // ── MINIMIZED VIEW (COMPACT SLIM RAIL) ──
  if (isMinimized) {
    return (
      <aside className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-2 flex flex-col items-center gap-3">
        {onToggleMinimize && (
          <button
            type="button"
            onClick={onToggleMinimize}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4846] hover:text-white dark:hover:bg-[#FF4846] text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
            title="Expand Filters"
            aria-label="Expand Filters"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <div className="relative p-2 text-slate-700 dark:text-slate-300" title={`Filters (${activeCount} active)`}>
          <Filter size={18} className="text-[#FF4846]" />
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
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition cursor-pointer"
            title="Reset All Filters"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </aside>
    );
  }

  // ── EXPANDED MINIMALIST VIEW ──
  return (
    <aside className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 space-y-3.5">
      
      {/* Header with Minimize Toggle & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[#FF4846]" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#FF4846] text-white text-[9px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer mr-1"
              title="Reset all filters"
            >
              Reset
            </button>
          )}

          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Minimize sidebar"
              aria-label="Minimize sidebar"
            >
              <Minimize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 1: MAKE & DEPENDENT MODEL ── */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("makeModel")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Car size={13} className="text-[#FF4846]" />
            Make & Model
            {(filters.brand.length > 0 || filters.model.length > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.makeModel ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.makeModel && (
          <div className="pt-2 space-y-2.5">
            {/* Makes list */}
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {makeOptions.map(opt => {
                const selected = filters.brand.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs cursor-pointer transition ${
                      selected
                        ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    <span className="text-[10px] text-slate-400">({opt.count})</span>
                  </label>
                );
              })}
            </div>

            {/* Dependent Model list (Shows when brand is selected or available) */}
            {modelOptions.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Model {filters.brand.length > 0 && `(${filters.brand.join(", ")})`}
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {modelOptions.map(opt => {
                    const selected = filters.model.includes(opt.model);
                    return (
                      <label
                        key={opt.model}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs cursor-pointer transition ${
                          selected
                            ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                        <span className="text-[10px] text-slate-400">({opt.count})</span>
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
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="text-[#FF4846] font-bold text-[10px]">ETB</span>
            Price Range
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.price ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.price && (
          <div className="pt-2 space-y-2">
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
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition truncate text-center border cursor-pointer ${
                      active
                        ? "bg-[#FF4846] text-white border-[#FF4846]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {bracket.label}
                  </button>
                );
              })}
            </div>

            {/* Min & Max Inputs Row */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div>
                <input
                  type="number"
                  placeholder="Min ETB"
                  value={filters.minPrice || ""}
                  onChange={e =>
                    onFilterChange(prev => ({ ...prev, minPrice: e.target.value }))
                  }
                  className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max ETB"
                  value={filters.maxPrice || ""}
                  onChange={e =>
                    onFilterChange(prev => ({ ...prev, maxPrice: e.target.value }))
                  }
                  className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: TRANSMISSION (COMPACT PILLS) ── */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("transmission")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Settings2 size={13} className="text-[#FF4846]" />
            Transmission
            {filters.transmission.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.transmission ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.transmission && (
          <div className="pt-2 flex gap-1.5">
            {TRANSMISSION_TYPES.map(type => {
              const active = filters.transmission.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayFacet("transmission", type)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer text-center ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 4: FUEL TYPE (COMPACT PILLS) ── */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("fuel")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Fuel size={13} className="text-[#FF4846]" />
            Fuel Type
            {filters.fuel.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.fuel ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.fuel && (
          <div className="pt-2 grid grid-cols-2 gap-1.5">
            {FUEL_TYPES.map(type => {
              const active = filters.fuel.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayFacet("fuel", type)}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border cursor-pointer text-center truncate ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 5: YEAR (COMPACT ROW) ── */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("year")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Calendar size={13} className="text-[#FF4846]" />
            Year
            {(filters.minYear || filters.maxYear) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.year ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.year && (
          <div className="pt-2 grid grid-cols-2 gap-1.5">
            <select
              value={filters.minYear || ""}
              onChange={e =>
                onFilterChange(prev => ({ ...prev, minYear: e.target.value }))
              }
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Min Year</option>
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={filters.maxYear || ""}
              onChange={e =>
                onFilterChange(prev => ({ ...prev, maxYear: e.target.value }))
              }
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Max Year</option>
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── SECTION 6: LOCATION ── */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("location")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <MapPin size={13} className="text-[#FF4846]" />
            Location
            {filters.location.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.location ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.location && (
          <div className="pt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
            {ETHIOPIAN_LOCATIONS.map(loc => {
              const selected = filters.location.includes(loc);
              return (
                <label
                  key={loc}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer transition ${
                    selected
                      ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("mileage")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Gauge size={13} className="text-[#FF4846]" />
            Mileage
            {(filters.minMileage || filters.maxMileage) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.mileage ? (
            <ChevronUp size={13} className="text-slate-400" />
          ) : (
            <ChevronDown size={13} className="text-slate-400" />
          )}
        </button>

        {openSections.mileage && (
          <div className="pt-2 grid grid-cols-2 gap-1.5">
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
                  className={`py-1 px-2 rounded-lg text-[10px] font-bold transition border cursor-pointer text-center truncate ${
                    active
                      ? "bg-[#FF4846] text-white border-[#FF4846]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
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
