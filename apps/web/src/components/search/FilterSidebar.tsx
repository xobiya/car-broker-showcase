import React, { useState, useMemo } from "react";
import {
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  ShieldCheck,
  Sparkles,
  Car,
  Settings2,
  Gauge,
  Fuel,
  MapPin,
  Calendar,
  Layers,
  Award
} from "lucide-react";
import type { VehicleListing } from "@autobroker/shared";
import {
  FilterState,
  ETHIOPIAN_PRICE_BRACKETS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVE_TYPES,
  CONDITION_TYPES,
  ETHIOPIAN_LOCATIONS,
  FEATURE_FLAGS,
  YEAR_OPTIONS,
  MILEAGE_BRACKETS,
} from "./filterTypes";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  onReset: () => void;
  allVehicles: VehicleListing[];
  totalMatches: number;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  allVehicles,
  totalMatches,
}: FilterSidebarProps) {
  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    makeModel: true,
    price: true,
    year: true,
    bodyType: true,
    fuel: false,
    transmission: false,
    mileage: false,
    driveType: false,
    condition: false,
    location: false,
    features: false,
  });

  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [modelSearchTerm, setModelSearchTerm] = useState("");

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

  // 1. Dynamic Counts: Calculate available makes and counts based on all other filters
  const makeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allVehicles.forEach(v => {
      counts[v.brand] = (counts[v.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }, [allVehicles]);

  // 2. Dependent Model Options:
  // If brands are selected, show only models belonging to the selected brands!
  const modelOptions = useMemo(() => {
    const selectedBrands = filters.brand;
    const relevantVehicles = selectedBrands.length > 0
      ? allVehicles.filter(v => selectedBrands.includes(v.brand))
      : allVehicles;

    const counts: Record<string, { model: string; brand: string; count: number }> = {};
    relevantVehicles.forEach(v => {
      const key = v.model;
      if (!counts[key]) {
        counts[key] = { model: v.model, brand: v.brand, count: 0 };
      }
      counts[key].count++;
    });

    return Object.values(counts).sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
  }, [allVehicles, filters.brand]);

  // Active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    count += filters.brand.length;
    count += filters.model.length;
    count += filters.condition.length;
    count += filters.bodyType.length;
    count += filters.fuel.length;
    count += filters.transmission.length;
    count += filters.driveType.length;
    count += filters.location.length;
    count += filters.features.length;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.minMileage || filters.maxMileage) count++;
    return count;
  }, [filters]);

  return (
    <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-5">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#FF4846]" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#FF4846] text-white text-[10px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* ── SECTION 1: MAKE & MODEL (DEPENDENT) ── */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("makeModel")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Car size={13} className="text-[#FF4846]" />
            Make & Model
            {(filters.brand.length > 0 || filters.model.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.makeModel ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.makeModel && (
          <div className="pt-3 space-y-4">
            {/* Make list */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                Make (Brand)
              </span>
              {makeOptions.length > 5 && (
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={brandSearchTerm}
                    onChange={e => setBrandSearchTerm(e.target.value)}
                    placeholder="Search makes..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4846]"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              )}
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {makeOptions
                  .filter(m => !brandSearchTerm || m.value.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                  .map(opt => {
                    const selected = filters.brand.includes(opt.value);
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
            </div>

            {/* Dependent Model List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Model {filters.brand.length > 0 && `(${filters.brand.join(", ")})`}
                </span>
                {filters.brand.length > 0 && (
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-semibold">
                    Dependent Filter
                  </span>
                )}
              </div>

              {modelOptions.length > 5 && (
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={modelSearchTerm}
                    onChange={e => setModelSearchTerm(e.target.value)}
                    placeholder="Search models..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4846]"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              )}

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {modelOptions
                  .filter(m => !modelSearchTerm || m.model.toLowerCase().includes(modelSearchTerm.toLowerCase()))
                  .map(opt => {
                    const selected = filters.model.includes(opt.model);
                    return (
                      <label
                        key={opt.model}
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
          </div>
        )}
      </div>

      {/* ── SECTION 2: PRICE RANGE (ETB) ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-[#FF4846] font-black text-xs">ETB</span>
            Price Range
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.price ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.price && (
          <div className="pt-3 space-y-3">
            {/* Quick Price Bracket Buttons */}
            <div className="space-y-1">
              {ETHIOPIAN_PRICE_BRACKETS.map(b => {
                const isSelected =
                  filters.minPrice === String(b.min) &&
                  filters.maxPrice === (b.max ? String(b.max) : "");
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onFilterChange(prev => ({ ...prev, minPrice: "", maxPrice: "" }));
                      } else {
                        onFilterChange(prev => ({
                          ...prev,
                          minPrice: String(b.min),
                          maxPrice: b.max ? String(b.max) : "",
                        }));
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF4846]/10 border-[#FF4846] text-[#FF4846]"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span>{b.label}</span>
                    {isSelected && <Check size={14} className="text-[#FF4846]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Price Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Min ETB</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e =>
                    onFilterChange(prev => ({ ...prev, minPrice: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Max ETB</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e =>
                    onFilterChange(prev => ({ ...prev, maxPrice: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: YEAR RANGE ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("year")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar size={13} className="text-[#FF4846]" />
            Year
            {(filters.minYear || filters.maxYear) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.year ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.year && (
          <div className="pt-3 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">From</span>
              <select
                value={filters.minYear}
                onChange={e => onFilterChange(prev => ({ ...prev, minYear: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
              >
                <option value="">Any Year</option>
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">To</span>
              <select
                value={filters.maxYear}
                onChange={e => onFilterChange(prev => ({ ...prev, maxYear: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
              >
                <option value="">Any Year</option>
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 4: BODY TYPE ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("bodyType")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className="text-[#FF4846]" />
            Body Type
            {filters.bodyType.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.bodyType ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.bodyType && (
          <div className="pt-3 grid grid-cols-2 gap-1.5">
            {BODY_TYPES.map(bt => {
              const selected = filters.bodyType.includes(bt);
              return (
                <button
                  key={bt}
                  type="button"
                  onClick={() => toggleArrayFacet("bodyType", bt)}
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
        )}
      </div>

      {/* ── SECTION 5: TRANSMISSION ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("transmission")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Settings2 size={13} className="text-[#FF4846]" />
            Transmission
            {filters.transmission.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.transmission ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.transmission && (
          <div className="pt-3 grid grid-cols-2 gap-1.5">
            {TRANSMISSION_TYPES.map(tr => {
              const selected = filters.transmission.includes(tr);
              return (
                <button
                  key={tr}
                  type="button"
                  onClick={() => toggleArrayFacet("transmission", tr)}
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
        )}
      </div>

      {/* ── SECTION 6: FUEL & POWERTRAIN ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("fuel")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Fuel size={13} className="text-[#FF4846]" />
            Fuel & Powertrain
            {filters.fuel.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.fuel ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.fuel && (
          <div className="pt-3 grid grid-cols-2 gap-1.5">
            {FUEL_TYPES.map(ft => {
              const selected = filters.fuel.includes(ft);
              return (
                <button
                  key={ft}
                  type="button"
                  onClick={() => toggleArrayFacet("fuel", ft)}
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
        )}
      </div>

      {/* ── SECTION 7: MILEAGE (KM) ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("mileage")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Gauge size={13} className="text-[#FF4846]" />
            Mileage (km)
            {(filters.minMileage || filters.maxMileage) && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.mileage ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.mileage && (
          <div className="pt-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {MILEAGE_BRACKETS.map(b => {
                const isSelected = filters.maxMileage === String(b.max);
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => {
                      onFilterChange(prev => ({
                        ...prev,
                        maxMileage: isSelected ? "" : String(b.max),
                      }));
                    }}
                    className={`text-center py-1.5 px-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF4846] text-white border-[#FF4846]"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Max Km</span>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={filters.maxMileage}
                onChange={e => onFilterChange(prev => ({ ...prev, maxMileage: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 8: DRIVE TYPE (4WD / AWD / FWD / RWD) ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("driveType")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Car size={13} className="text-[#FF4846]" />
            Drivetrain (4WD / AWD)
            {filters.driveType.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.driveType ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.driveType && (
          <div className="pt-3 grid grid-cols-2 gap-1.5">
            {DRIVE_TYPES.map(dt => {
              const selected = filters.driveType.includes(dt);
              return (
                <button
                  key={dt}
                  type="button"
                  onClick={() => toggleArrayFacet("driveType", dt)}
                  className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border truncate ${
                    selected
                      ? "bg-[#FF4846] text-white border-[#FF4846] shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {dt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 9: CONDITION ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("condition")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award size={13} className="text-[#FF4846]" />
            Condition
            {filters.condition.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.condition ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.condition && (
          <div className="pt-3 space-y-1">
            {CONDITION_TYPES.map(cond => {
              const selected = filters.condition.includes(cond);
              return (
                <label
                  key={cond}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    selected
                      ? "bg-[#FF4846]/10 text-[#FF4846] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleArrayFacet("condition", cond)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                    />
                    <span>{cond}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 10: LOCATION / SUB-CITY ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("location")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <MapPin size={13} className="text-[#FF4846]" />
            Location & Cities
            {filters.location.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.location ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.location && (
          <div className="pt-3 space-y-1 max-h-48 overflow-y-auto pr-1">
            {ETHIOPIAN_LOCATIONS.map(loc => {
              const selected = filters.location.includes(loc);
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
                      onChange={() => toggleArrayFacet("location", loc)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                    />
                    <span className="truncate">{loc}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 11: TRUST & VERIFIED FEATURES ── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection("features")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#FF4846]" />
            Trust & Guarantees
            {filters.features.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
            )}
          </span>
          {openSections.features ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {openSections.features && (
          <div className="pt-3 space-y-1.5">
            {FEATURE_FLAGS.map(feat => {
              const selected = filters.features.includes(feat.id);
              return (
                <label
                  key={feat.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    selected
                      ? "bg-[#FF4846]/10 text-[#FF4846]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleArrayFacet("features", feat.id)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-[#FF4846] focus:ring-0 cursor-pointer accent-[#FF4846]"
                  />
                  <span>{feat.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[11px] text-slate-400 font-medium">
          Showing <strong className="text-slate-700 dark:text-slate-200">{totalMatches}</strong> matching vehicle{totalMatches === 1 ? "" : "s"}
        </span>
      </div>
    </aside>
  );
}

