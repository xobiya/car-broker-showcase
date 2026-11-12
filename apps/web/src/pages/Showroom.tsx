import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  X,
  Search,
  Heart,
  SlidersHorizontal,
  Filter,
  Gauge,
  Fuel,
  Settings2,
  Users,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  Zap,
  Bookmark,
  CheckCircle2,
  Car,
  ChevronLeft,
  ChevronRight,
  Star,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/useLocale";
import { VehicleListing } from "@autobroker/shared";
import { vehiclesApi } from "../lib/api";
import { ShowroomSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollAnimations";
import SEO from "../components/common/SEO";

import {
  FilterState,
  initialFilterState,
  FEATURE_FLAGS,
  filterVehiclesClientSide
} from "../components/search/filterTypes";
import SearchHeroBar, { QUICK_FILTERS } from "../components/search/SearchHeroBar";
import FilterSidebar from "../components/search/FilterSidebar";
import MobileFilterDrawer from "../components/search/MobileFilterDrawer";
import ActiveFilterBar, { SortOption } from "../components/search/ActiveFilterBar";

interface ShowroomProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onInquireCar: (car: VehicleListing) => void;
}

const PER_PAGE = 12;

export default function Showroom({ onNotify, onInquireCar }: ShowroomProps) {
  const { t } = useTranslation(["vehicles", "common", "navigation", "metadata"]);
  const { formatCurrency } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary data states
  const [allVehicles, setAllVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get("q") || "");
  const [quickFilters, setQuickFilters] = useState<string[]>(() => {
    const qf = searchParams.get("quick");
    return qf ? qf.split(",").filter(Boolean) : [];
  });

  const [filters, setFilters] = useState<FilterState>(() => {
    const parseArrayParam = (param: string | null): string[] =>
      param ? param.split(",").map(s => s.trim()).filter(Boolean) : [];

    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minYear = searchParams.get("minYear") ? Number(searchParams.get("minYear")) : undefined;
    const maxYear = searchParams.get("maxYear") ? Number(searchParams.get("maxYear")) : undefined;
    const minMileage = searchParams.get("minMileage") ? Number(searchParams.get("minMileage")) : undefined;
    const maxMileage = searchParams.get("maxMileage") ? Number(searchParams.get("maxMileage")) : undefined;

    return {
      brand: parseArrayParam(searchParams.get("brand")),
      model: parseArrayParam(searchParams.get("model")),
      minPrice: isNaN(minPrice as number) ? "" : String(minPrice),
      maxPrice: isNaN(maxPrice as number) ? "" : String(maxPrice),
      minYear: isNaN(minYear as number) ? "" : String(minYear),
      maxYear: isNaN(maxYear as number) ? "" : String(maxYear),
      bodyType: parseArrayParam(searchParams.get("bodyType")),
      fuel: parseArrayParam(searchParams.get("fuel")),
      transmission: parseArrayParam(searchParams.get("transmission")),
      minMileage: isNaN(minMileage as number) ? "" : String(minMileage),
      maxMileage: isNaN(maxMileage as number) ? "" : String(maxMileage),
      driveType: parseArrayParam(searchParams.get("driveType")),
      condition: parseArrayParam(searchParams.get("condition")),
      location: parseArrayParam(searchParams.get("location")),
      features: parseArrayParam(searchParams.get("features")),
    };
  });

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sort = searchParams.get("sort") as SortOption;
    const validSorts: SortOption[] = [
      "relevance",
      "newest",
      "price_asc",
      "price_desc",
      "mileage_asc",
      "year_desc",
      "year_asc",
    ];
    return validSorts.includes(sort) ? sort : "relevance";
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const v = searchParams.get("view");
    return v === "list" ? "list" : "grid";
  });

  const [page, setPage] = useState<number>(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Favorites & Compare
  const [carFavorites, setCarFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("autobroker_favorites");
      if (storedFavs) setCarFavorites(JSON.parse(storedFavs));
    } catch {}
  }, []);

  const handleUpdateFavorites = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setCarFavorites(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("autobroker_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Fetch initial master vehicle catalog
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehiclesApi.list({ limit: 200 });
      setAllVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch vehicles:", err);
      setError(err?.message || "Failed to load vehicles from marketplace database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Sync state to URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (quickFilters.length > 0) params.set("quick", quickFilters.join(","));
    if (filters.brand.length > 0) params.set("brand", filters.brand.join(","));
    if (filters.model.length > 0) params.set("model", filters.model.join(","));
    if (filters.bodyType.length > 0) params.set("bodyType", filters.bodyType.join(","));
    if (filters.fuel.length > 0) params.set("fuel", filters.fuel.join(","));
    if (filters.transmission.length > 0) params.set("transmission", filters.transmission.join(","));
    if (filters.driveType.length > 0) params.set("driveType", filters.driveType.join(","));
    if (filters.condition.length > 0) params.set("condition", filters.condition.join(","));
    if (filters.location.length > 0) params.set("location", filters.location.join(","));
    if (filters.features.length > 0) params.set("features", filters.features.join(","));

    if (filters.minPrice !== undefined && filters.minPrice !== "") params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined && filters.maxPrice !== "") params.set("maxPrice", String(filters.maxPrice));
    if (filters.minYear !== undefined && filters.minYear !== "") params.set("minYear", String(filters.minYear));
    if (filters.maxYear !== undefined && filters.maxYear !== "") params.set("maxYear", String(filters.maxYear));
    if (filters.minMileage !== undefined && filters.minMileage !== "") params.set("minMileage", String(filters.minMileage));
    if (filters.maxMileage !== undefined && filters.maxMileage !== "") params.set("maxMileage", String(filters.maxMileage));

    if (sortBy !== "relevance") params.set("sort", sortBy);
    if (viewMode !== "grid") params.set("view", viewMode);
    if (page > 1) params.set("page", String(page));

    setSearchParams(params, { replace: true });
  }, [searchQuery, quickFilters, filters, sortBy, viewMode, page, setSearchParams]);

  // Client-side filtering & sorting of vehicles
  const filteredVehicles = useMemo(() => {
    let result = filterVehiclesClientSide(allVehicles, filters, searchQuery, quickFilters);

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "mileage_asc":
          return (a.mileage || 0) - (b.mileage || 0);
        case "year_desc":
          return (b.year || 0) - (a.year || 0);
        case "year_asc":
          return (a.year || 0) - (b.year || 0);
        case "newest": {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        case "relevance":
        default: {
          // If searching, prioritize exact brand/model match
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const aExact = `${a.brand} ${a.model}`.toLowerCase().includes(q) ? 1 : 0;
            const bExact = `${b.brand} ${b.model}`.toLowerCase().includes(q) ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact;
          }
          // Default: available first, then verified, then newest
          if (a.status !== b.status) {
            if (a.status === "sold") return 1;
            if (b.status === "sold") return -1;
          }
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
      }
    });

    return result;
  }, [allVehicles, filters, searchQuery, quickFilters, sortBy]);

  // Reset page when filters or search change
  const handleFilterChange = useCallback((newFilters: FilterState | ((prev: FilterState) => FilterState)) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleToggleQuickFilter = useCallback((id: string) => {
    setQuickFilters(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
    setPage(1);
  }, []);

  const handleSelectBrand = useCallback((brand: string) => {
    setFilters(prev => {
      const exists = prev.brand.includes(brand);
      return {
        ...prev,
        brand: exists ? prev.brand.filter(b => b !== brand) : [...prev.brand, brand],
      };
    });
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilterState);
    setSearchQuery("");
    setQuickFilters([]);
    setPage(1);
  }, []);

  const handleRemoveFacet = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[key];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [key]: (current as string[]).filter(item => item !== value),
        };
      }
      return prev;
    });
    setPage(1);
  }, []);

  const handleClearPrice = useCallback(() => {
    setFilters(prev => ({ ...prev, minPrice: "", maxPrice: "" }));
    setPage(1);
  }, []);

  const handleClearYear = useCallback(() => {
    setFilters(prev => ({ ...prev, minYear: "", maxYear: "" }));
    setPage(1);
  }, []);

  const handleClearMileage = useCallback(() => {
    setFilters(prev => ({ ...prev, minMileage: "", maxMileage: "" }));
    setPage(1);
  }, []);

  // Pagination calculation
  const totalMatches = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filteredVehicles.slice(start, start + PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <SEO
        title="Find & Filter Verified Cars in Ethiopia | Addis Ababa Auto Broker"
        description="Search hundreds of verified pre-owned and new cars in Ethiopia. Filter by brand, price, year, mileage, Libre inspection, and EV status. Transparent pricing in ETB."
      />

      {/* Hero Search Section */}
      <SearchHeroBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        quickFilters={quickFilters}
        onToggleQuickFilter={handleToggleQuickFilter}
        onSelectBrand={handleSelectBrand}
        allVehicles={allVehicles}
      />

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Active Filters, Sort & Layout Switcher Bar */}
        <ActiveFilterBar
          searchQuery={searchQuery}
          onClearSearchQuery={() => setSearchQuery("")}
          quickFilters={quickFilters}
          onToggleQuickFilter={handleToggleQuickFilter}
          filters={filters}
          onRemoveFacet={handleRemoveFacet}
          onClearPrice={handleClearPrice}
          onClearYear={handleClearYear}
          onClearMileage={handleClearMileage}
          onClearAll={handleResetFilters}
          totalFiltered={totalMatches}
          totalAvailable={allVehicles.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenMobileFilters={() => setShowMobileFilters(true)}
        />

        {/* Content Columns: Desktop Sidebar + Vehicle Grid/List */}
        <div className="mt-6 flex gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              allVehicles={allVehicles}
              totalMatches={totalMatches}
            />
          </aside>

          {/* Vehicle Listings Main Area */}
          <main className="flex-1 min-w-0">
            {error ? (
              <div className="p-8 text-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Unable to load vehicles</h3>
                <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{error}</p>
                <button
                  onClick={fetchInventory}
                  className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Retry Loading
                </button>
              </div>
            ) : loading ? (
              <ShowroomSkeleton count={6} />
            ) : paginatedVehicles.length === 0 ? (
              <EmptySearchState
                searchQuery={searchQuery}
                onReset={handleResetFilters}
                onSelectBrand={handleSelectBrand}
              />
            ) : (
              <div>
                {/* Grid or List View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedVehicles.map(car => (
                      <ShowroomGridCard
                        key={car.id}
                        car={car}
                        carFavorites={carFavorites}
                        setCarFavorites={handleUpdateFavorites}
                        onInquireCar={onInquireCar}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedVehicles.map(car => (
                      <ShowroomListCard
                        key={car.id}
                        car={car}
                        carFavorites={carFavorites}
                        setCarFavorites={handleUpdateFavorites}
                        onInquireCar={onInquireCar}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Showing{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(currentPage - 1) * PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.min(currentPage * PER_PAGE, totalMatches)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {totalMatches}
                      </span>{" "}
                      vehicles
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                            acc.push("...");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, index) =>
                          typeof item === "string" ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-slate-400 text-xs">
                              ...
                            </span>
                          ) : (
                            <button
                              key={`page-${item}`}
                              onClick={() => handlePageChange(item)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                                currentPage === item
                                  ? "bg-[#FF4846] text-white shadow-xs"
                                  : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        aria-label="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile & Tablet Fullscreen Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        allVehicles={allVehicles}
        totalMatches={totalMatches}
      />
    </div>
  );
}

// ── EMPTY STATE COMPONENT ──
function EmptySearchState({
  searchQuery,
  onReset,
  onSelectBrand,
}: {
  searchQuery: string;
  onReset: () => void;
  onSelectBrand: (brand: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#FF4846] flex items-center justify-center mx-auto mb-4">
        <Car size={32} />
      </div>

      <h3 className="text-xl font-black text-slate-900 dark:text-white">
        No vehicles found
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
        {searchQuery ? (
          <>
            We couldn't find any listings matching{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              "{searchQuery}"
            </span>
            . Try broadening your criteria or reset filters.
          </>
        ) : (
          "No vehicles currently match the specific combination of filters selected. Try relaxing some filters."
        )}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF4846] hover:bg-[#e03d3b] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Popular Brands in Addis Ababa
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {["Toyota", "Hyundai", "Suzuki", "Mercedes-Benz", "BYD", "Volkswagen"].map(brand => (
            <button
              key={brand}
              onClick={() => {
                onReset();
                onSelectBrand(brand);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4846]/10 hover:text-[#FF4846] dark:hover:text-[#FF4846] transition cursor-pointer text-slate-600 dark:text-slate-300"
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MODERN VEHICLE GRID CARD ──
function ShowroomGridCard({
  car,
  carFavorites,
  setCarFavorites,
  onInquireCar,
}: {
  car: VehicleListing;
  carFavorites: string[];
  setCarFavorites: (updater: string[] | ((prev: string[]) => string[])) => void;
  onInquireCar: (car: VehicleListing) => void;
}) {
  const { formatCurrency } = useLocale();

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

  const isFavorite = carFavorites.includes(car.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarFavorites(prev =>
      prev.includes(car.id) ? prev.filter(f => f !== car.id) : [...prev, car.id]
    );
  };

  const seats = (car as any).seats || (car.bodyType === "SUV" || car.model?.toLowerCase().includes("prado") ? "7 seats" : "5 seats");

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Vehicle Media Header */}
      <div className="relative aspect-16/10 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallbackApplied) {
              target.dataset.fallbackApplied = "true";
              target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
            }
          }}
        />

        {/* Top Badges */}
        {car.status === "sold" ? (
          <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-xs text-rose-400 border border-rose-500/40 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>SOLD</span>
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-xs text-[#FF4846] border border-[#FF4846]/30 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs uppercase">
            <ShieldCheck size={11} className="text-[#FF4846]" />
            <span>Verified Libre</span>
          </div>
        )}

        {/* Action Buttons: Compare & Favorite */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={toggleCompare}
            className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer border shadow-xs ${
              isCompared
                ? "bg-[#FF4846] border-[#FF4846] text-white"
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#FF4846]"
            }`}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
            aria-label="Compare vehicle"
          >
            <SlidersHorizontal size={13} />
          </button>

          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer border shadow-xs ${
              isFavorite
                ? "bg-rose-500 border-rose-400 text-white"
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500"
            }`}
            aria-label="Save to favorites"
          >
            <Heart size={13} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Condition Tag */}
        {car.condition && (
          <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase border border-white/10">
            {car.condition}
          </span>
        )}

        {car.bodyType && (
          <span className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {car.bodyType}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        
        {/* Title & Location */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#FF4846] transition truncate">
              {car.brand} {car.model}
            </h3>
            <span className="text-xs font-bold text-slate-400 shrink-0">
              {car.year}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 font-medium">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{car.location || "Addis Ababa"}</span>
          </div>
        </div>

        {/* Specs 2x2 Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 py-2.5 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Gauge size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{(car.mileage || 0).toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Settings2 size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{car.transmission || "Automatic"}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Fuel size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{car.fuelType || "Petrol"}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Users size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{seats}</span>
          </div>
        </div>

        {/* Pricing & Details Action */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Price (ETB)
            </span>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(car.price)}
            </div>
          </div>

          <button
            onClick={() => onInquireCar(car)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4846] dark:hover:bg-[#FF4846] text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            Details
          </button>
        </div>

      </div>

    </div>
  );
}

// ── MODERN VEHICLE LIST CARD ──
function ShowroomListCard({
  car,
  carFavorites,
  setCarFavorites,
  onInquireCar,
}: {
  car: VehicleListing;
  carFavorites: string[];
  setCarFavorites: (updater: string[] | ((prev: string[]) => string[])) => void;
  onInquireCar: (car: VehicleListing) => void;
}) {
  const { formatCurrency } = useLocale();

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

  const isFavorite = carFavorites.includes(car.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarFavorites(prev =>
      prev.includes(car.id) ? prev.filter(f => f !== car.id) : [...prev, car.id]
    );
  };

  const seats = (car as any).seats || (car.bodyType === "SUV" || car.model?.toLowerCase().includes("prado") ? "7 seats" : "5 seats");

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition flex flex-col md:flex-row overflow-hidden">
      
      {/* Image Part */}
      <div className="relative md:w-72 h-48 md:h-auto bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
        <img
          src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallbackApplied) {
              target.dataset.fallbackApplied = "true";
              target.src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
            }
          }}
        />

        {car.status === "sold" ? (
          <div className="absolute top-3 left-3 bg-slate-950/90 text-rose-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
            SOLD
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-slate-950/85 text-[#FF4846] text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase">
            <ShieldCheck size={11} />
            <span>Verified</span>
          </div>
        )}

        {car.bodyType && (
          <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {car.bodyType}
          </span>
        )}
      </div>

      {/* Middle Specs & Title */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-[#FF4846] transition truncate">
              {car.brand} {car.model}
              <span className="text-slate-400 text-xs font-normal ml-2">({car.year})</span>
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleCompare}
                className={`p-1.5 rounded-full border text-xs cursor-pointer transition ${
                  isCompared
                    ? "bg-[#FF4846] text-white border-[#FF4846]"
                    : "text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-700"
                }`}
                title="Compare"
              >
                <SlidersHorizontal size={13} />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded-full border text-xs cursor-pointer transition ${
                  isFavorite
                    ? "bg-rose-500 text-white border-rose-400"
                    : "text-slate-400 hover:text-rose-500 border-slate-200 dark:border-slate-700"
                }`}
                title="Favorite"
              >
                <Heart size={13} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <MapPin size={12} className="shrink-0" />
            <span>{car.location || "Addis Ababa"}</span>
            {car.condition && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold">
                {car.condition}
              </span>
            )}
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-medium py-1">
          <span className="flex items-center gap-1.5">
            <Gauge size={13} className="text-slate-400" />
            {(car.mileage || 0).toLocaleString()} km
          </span>
          <span className="flex items-center gap-1.5">
            <Settings2 size={13} className="text-slate-400" />
            {car.transmission || "Automatic"}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={13} className="text-slate-400" />
            {car.fuelType || "Petrol"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-400" />
            {seats}
          </span>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Price (ETB)
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(car.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onInquireCar(car)}
              className="px-4 py-2 bg-[#FF4846] hover:bg-[#e03d3b] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              View Details & Inquire
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
