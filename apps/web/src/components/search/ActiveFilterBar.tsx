import React from "react";
import {
  X,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { FilterState, FEATURE_FLAGS } from "./filterTypes";
import { QUICK_FILTERS } from "./SearchHeroBar";

export type SortOption =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "mileage_asc"
  | "year_desc"
  | "year_asc";

interface ActiveFilterBarProps {
  searchQuery: string;
  onClearSearchQuery: () => void;
  quickFilters: string[];
  onToggleQuickFilter: (id: string) => void;
  filters: FilterState;
  onRemoveFacet: (key: keyof FilterState, value: string) => void;
  onClearPrice: () => void;
  onClearYear: () => void;
  onClearMileage: () => void;
  onClearAll: () => void;
  totalFiltered: number;
  totalAvailable: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenMobileFilters: () => void;
}

export default function ActiveFilterBar({
  searchQuery,
  onClearSearchQuery,
  quickFilters,
  onToggleQuickFilter,
  filters,
  onRemoveFacet,
  onClearPrice,
  onClearYear,
  onClearMileage,
  onClearAll,
  totalFiltered,
  totalAvailable,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
}: ActiveFilterBarProps) {
  // Count active filters
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    quickFilters.length > 0 ||
    filters.brand.length > 0 ||
    filters.model.length > 0 ||
    filters.bodyType.length > 0 ||
    filters.fuel.length > 0 ||
    filters.transmission.length > 0 ||
    filters.driveType.length > 0 ||
    filters.condition.length > 0 ||
    filters.location.length > 0 ||
    filters.features.length > 0 ||
    Boolean(filters.minPrice || filters.maxPrice) ||
    Boolean(filters.minYear || filters.maxYear) ||
    Boolean(filters.minMileage || filters.maxMileage);

  const activeCount =
    (searchQuery.trim() ? 1 : 0) +
    quickFilters.length +
    filters.brand.length +
    filters.model.length +
    filters.bodyType.length +
    filters.fuel.length +
    filters.transmission.length +
    filters.driveType.length +
    filters.condition.length +
    filters.location.length +
    filters.features.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.minYear || filters.maxYear ? 1 : 0) +
    (filters.minMileage || filters.maxMileage ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Top Results Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:px-4 shadow-2xs">
        
        {/* Left: Results Count Indicator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 cursor-pointer"
          >
            <Filter size={13} className="text-[#FF4846]" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FF4846] text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            Showing <strong className="text-slate-900 dark:text-white font-black">{totalFiltered}</strong> of {totalAvailable} vehicles
          </span>
        </div>

        {/* Right: Sort and Layout Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown size={13} className="text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none outline-none cursor-pointer focus:ring-0 pr-1"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="mileage_asc">Mileage: Low to High</option>
              <option value="year_desc">Year: Newest</option>
              <option value="year_asc">Year: Oldest</option>
            </select>
          </div>

          {/* Grid vs List View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-[#FF4846] shadow-xs"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-[#FF4846] shadow-xs"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="List View"
              aria-label="Switch to list view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* Active Filter Chips Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active:</span>

          {/* Search Query Chip */}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 bg-[#FF4846]/10 text-[#FF4846] border border-[#FF4846]/30 text-xs font-bold px-2.5 py-1 rounded-full">
              <span>"{searchQuery.trim()}"</span>
              <button
                type="button"
                onClick={onClearSearchQuery}
                className="hover:text-red-700 cursor-pointer"
                aria-label="Remove search term"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          )}

          {/* Quick Filters Chips */}
          {quickFilters.map(qfId => {
            const qf = QUICK_FILTERS.find(q => q.id === qfId);
            return (
              <span
                key={qfId}
                className="inline-flex items-center gap-1.5 bg-[#FF4846] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-2xs"
              >
                <span>{qf ? qf.label : qfId}</span>
                <button
                  type="button"
                  onClick={() => onToggleQuickFilter(qfId)}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Remove filter"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            );
          })}

          {/* Brand Chips */}
          {filters.brand.map(b => (
            <span
              key={`brand-${b}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>Make: {b}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("brand", b)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={`Remove ${b} filter`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Model Chips */}
          {filters.model.map(m => (
            <span
              key={`model-${m}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>Model: {m}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("model", m)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={`Remove ${m} filter`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Price Range Chip */}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span>
                Budget: {filters.minPrice ? `${Number(filters.minPrice).toLocaleString()} ETB` : "0"} – {filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} ETB` : "Any"}
              </span>
              <button
                type="button"
                onClick={onClearPrice}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Remove price filter"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          )}

          {/* Year Range Chip */}
          {(filters.minYear || filters.maxYear) && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span>
                Year: {filters.minYear || "Any"} – {filters.maxYear || "Present"}
              </span>
              <button
                type="button"
                onClick={onClearYear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Remove year filter"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          )}

          {/* Mileage Chip */}
          {(filters.minMileage || filters.maxMileage) && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span>
                Mileage: {filters.minMileage ? `${filters.minMileage} km` : "0"} – {filters.maxMileage ? `${filters.maxMileage} km` : "Any"}
              </span>
              <button
                type="button"
                onClick={onClearMileage}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Remove mileage filter"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          )}

          {/* Body Type Chips */}
          {filters.bodyType.map(bt => (
            <span
              key={`bodyType-${bt}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>Body: {bt}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("bodyType", bt)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Transmission Chips */}
          {filters.transmission.map(tr => (
            <span
              key={`trans-${tr}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>{tr}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("transmission", tr)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Fuel Chips */}
          {filters.fuel.map(f => (
            <span
              key={`fuel-${f}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>Fuel: {f}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("fuel", f)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Drive Type Chips */}
          {filters.driveType.map(dt => (
            <span
              key={`drive-${dt}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>{dt}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("driveType", dt)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Condition Chips */}
          {filters.condition.map(c => (
            <span
              key={`cond-${c}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>Condition: {c}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("condition", c)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Location Chips */}
          {filters.location.map(loc => (
            <span
              key={`loc-${loc}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              <span>Location: {loc}</span>
              <button
                type="button"
                onClick={() => onRemoveFacet("location", loc)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Feature Chips */}
          {filters.features.map(featId => {
            const feat = FEATURE_FLAGS.find(f => f.id === featId);
            return (
              <span
                key={`feat-${featId}`}
                className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                <span>{feat ? feat.label : featId}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFacet("features", featId)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            );
          })}

          {/* Clear All Action */}
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 ml-auto transition cursor-pointer px-2 py-1"
          >
            <RotateCcw size={12} />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
}

