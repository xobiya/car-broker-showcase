import React, { useEffect, useState } from "react";
import {
  X,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Car,
  Layers,
  Settings2,
  Fuel,
  Gauge,
  MapPin,
  Calendar,
  Award,
  ShieldCheck
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

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  onReset: () => void;
  allVehicles: VehicleListing[];
  totalMatches: number;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  allVehicles,
  totalMatches,
}: MobileFilterDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    makeModel: true,
    price: true,
    year: false,
    bodyType: false,
    fuel: false,
    transmission: false,
    mileage: false,
    driveType: false,
    condition: false,
    location: false,
    features: false,
  });

  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayFacet = (key: keyof FilterState, value: string) => {
    onFilterChange(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  // Makes with counts
  const makeOptions = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allVehicles.forEach(v => {
      counts[v.brand] = (counts[v.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }, [allVehicles]);

  // Dependent Models
  const modelOptions = React.useMemo(() => {
    const selectedBrands = filters.brand;
    const relevantVehicles = selectedBrands.length > 0
      ? allVehicles.filter(v => selectedBrands.includes(v.brand))
      : allVehicles;

    const counts: Record<string, { model: string; count: number }> = {};
    relevantVehicles.forEach(v => {
      if (!counts[v.model]) {
        counts[v.model] = { model: v.model, count: 0 };
      }
      counts[v.model].count++;
    });

    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [allVehicles, filters.brand]);

  // Total active count
  const activeCount = React.useMemo(() => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-h-[90vh] flex flex-col rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-bottom duration-250">
        
        {/* Drawer Drag Bar */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Filter Vehicles
            </h2>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#FF4846] text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* SECTION 1: Make & Model */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("makeModel")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Car size={14} className="text-[#FF4846]" />
                Make & Model
                {(filters.brand.length > 0 || filters.model.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-[#FF4846]" />
                )}
              </span>
              {openSections.makeModel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.makeModel && (
              <div className="pt-3 space-y-4">
                {/* Brand */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Make</span>
                  {makeOptions.length > 5 && (
                    <div className="relative mb-2">
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={e => setBrandSearch(e.target.value)}
                        placeholder="Search makes..."
                        className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                      />
                      <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  )}
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {makeOptions
                      .filter(m => !brandSearch || m.value.toLowerCase().includes(brandSearch.toLowerCase()))
                      .map(opt => {
                        const selected = filters.brand.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                              selected ? "bg-[#FF4846]/10 text-[#FF4846] font-bold" : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleArrayFacet("brand", opt.value)}
                                className="w-4 h-4 rounded text-[#FF4846] accent-[#FF4846]"
                              />
                              <span>{opt.value}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">({opt.count})</span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {/* Model (Dependent) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                    Model {filters.brand.length > 0 && `(${filters.brand.join(", ")})`}
                  </span>
                  {modelOptions.length > 5 && (
                    <div className="relative mb-2">
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={e => setModelSearch(e.target.value)}
                        placeholder="Search models..."
                        className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                      />
                      <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  )}
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {modelOptions
                      .filter(m => !modelSearch || m.model.toLowerCase().includes(modelSearch.toLowerCase()))
                      .map(opt => {
                        const selected = filters.model.includes(opt.model);
                        return (
                          <label
                            key={opt.model}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                              selected ? "bg-[#FF4846]/10 text-[#FF4846] font-bold" : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleArrayFacet("model", opt.model)}
                                className="w-4 h-4 rounded text-[#FF4846] accent-[#FF4846]"
                              />
                              <span>{opt.model}</span>
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

          {/* SECTION 2: Price Range */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="text-[#FF4846] font-black text-xs">ETB</span>
                Price Range
                {(filters.minPrice || filters.maxPrice) && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.price && (
              <div className="pt-3 space-y-3">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border ${
                          isSelected ? "bg-[#FF4846]/10 border-[#FF4846] text-[#FF4846]" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{b.label}</span>
                        {isSelected && <Check size={14} className="text-[#FF4846]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Min ETB</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={e => onFilterChange(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Max ETB</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={e => onFilterChange(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#FF4846]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Body Type */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("bodyType")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers size={14} className="text-[#FF4846]" />
                Body Type
                {filters.bodyType.length > 0 && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.bodyType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      className={`text-center py-2 px-1 rounded-xl text-xs font-bold border truncate ${
                        selected ? "bg-[#FF4846] text-white border-[#FF4846]" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {bt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 4: Transmission */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("transmission")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Settings2 size={14} className="text-[#FF4846]" />
                Transmission
                {filters.transmission.length > 0 && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.transmission ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      className={`text-center py-2 px-1 rounded-xl text-xs font-bold border truncate ${
                        selected ? "bg-[#FF4846] text-white border-[#FF4846]" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {tr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 5: Fuel */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("fuel")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Fuel size={14} className="text-[#FF4846]" />
                Fuel & Powertrain
                {filters.fuel.length > 0 && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.fuel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      className={`text-center py-2 px-1 rounded-xl text-xs font-bold border truncate ${
                        selected ? "bg-[#FF4846] text-white border-[#FF4846]" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {ft}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 6: Year */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("year")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#FF4846]" />
                Year
                {(filters.minYear || filters.maxYear) && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.year ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.year && (
              <div className="pt-3 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">From</span>
                  <select
                    value={filters.minYear}
                    onChange={e => onFilterChange(prev => ({ ...prev, minYear: e.target.value }))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Any Year</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">To</span>
                  <select
                    value={filters.maxYear}
                    onChange={e => onFilterChange(prev => ({ ...prev, maxYear: e.target.value }))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Any Year</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 7: Location */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("location")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#FF4846]" />
                Location
                {filters.location.length > 0 && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.location ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.location && (
              <div className="pt-3 space-y-1 max-h-40 overflow-y-auto">
                {ETHIOPIAN_LOCATIONS.map(loc => {
                  const selected = filters.location.includes(loc);
                  return (
                    <label
                      key={loc}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                        selected ? "bg-[#FF4846]/10 text-[#FF4846] font-bold" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleArrayFacet("location", loc)}
                          className="w-4 h-4 rounded text-[#FF4846] accent-[#FF4846]"
                        />
                        <span>{loc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 8: Trust & Guarantees */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleSection("features")}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#FF4846]" />
                Trust & Guarantees
                {filters.features.length > 0 && <span className="w-2 h-2 rounded-full bg-[#FF4846]" />}
              </span>
              {openSections.features ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.features && (
              <div className="pt-3 space-y-1.5">
                {FEATURE_FLAGS.map(feat => {
                  const selected = filters.features.includes(feat.id);
                  return (
                    <label
                      key={feat.id}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                        selected ? "bg-[#FF4846]/10 text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleArrayFacet("features", feat.id)}
                        className="w-4 h-4 rounded text-[#FF4846] accent-[#FF4846]"
                      />
                      <span>{feat.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#FF4846] hover:bg-[#e03d3b] text-white font-extrabold text-xs shadow-md shadow-[#FF4846]/25 transition cursor-pointer active:scale-95"
          >
            <span>Show {totalMatches} Vehicles</span>
          </button>
        </div>

      </div>
    </div>
  );
}

