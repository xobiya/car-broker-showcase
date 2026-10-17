import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Car,
  Check,
  Star,
  Zap,
  Gauge,
  Users,
  MapPin,
  ShieldCheck,
  FileCheck2,
  Share2,
  Printer,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  PhoneCall,
  Search,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  Fuel,
  Briefcase,
  Crown,
  DollarSign,
  Copy,
  Send,
  CheckCheck,
  MessageCircle,
  ArrowLeftRight,
  Columns,
  Layers,
  ChevronDown
} from "lucide-react";
import { VehicleListing } from "../../../shared/types";
import { vehiclesApi } from "../lib/api";

interface VehicleComparisonProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

// Curated 1-click head-to-head comparison presets matching real database inventory
const PRESET_DEFINITIONS = [
  {
    id: "preset-suv",
    titleFallback: "Toyota RAV4 Hybrid vs. Hyundai Tucson",
    category: "Family SUVs",
    tagline: "Top compact hybrid & AWD SUVs compared side-by-side",
    findVehicles: (list: VehicleListing[]) => {
      const suvs = list.filter((v) => (v.bodyType || "").toLowerCase() === "suv" || v.model.toLowerCase().includes("rav4") || v.model.toLowerCase().includes("tucson"));
      return suvs.slice(0, 2);
    },
    icon: Car,
    borderHover: "hover:border-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-[#22c55e]"
  },
  {
    id: "preset-ev",
    titleFallback: "VW ID.4 Pro vs. Toyota RAV4 Hybrid",
    category: "Electric vs. Hybrid",
    tagline: "100% Electric (0% Customs Duty) vs. Proven Hybrid Reliability",
    findVehicles: (list: VehicleListing[]) => {
      const ev = list.find((v) => v.fuelType === "Electric");
      const hybrid = list.find((v) => v.fuelType === "Hybrid");
      return [ev, hybrid].filter(Boolean) as VehicleListing[];
    },
    icon: Zap,
    borderHover: "hover:border-sky-500",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
  },
  {
    id: "preset-commute",
    titleFallback: "Suzuki Dzire vs. Hyundai Tucson",
    category: "City Commuter vs SUV",
    tagline: "Ultra fuel-efficient city driver vs. versatile family capability",
    findVehicles: (list: VehicleListing[]) => {
      const sedan = list.find((v) => (v.bodyType || "").toLowerCase() === "sedan" || v.brand === "Suzuki");
      const suv = list.find((v) => (v.bodyType || "").toLowerCase() === "suv");
      return [sedan, suv].filter(Boolean) as VehicleListing[];
    },
    icon: Briefcase,
    borderHover: "hover:border-amber-500",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  },
  {
    id: "preset-luxury",
    titleFallback: "Mercedes-Benz vs. VW ID.4 Pro",
    category: "Executive Sedan vs Modern EV",
    tagline: "Prestige German luxury engineering vs. modern electric tech",
    findVehicles: (list: VehicleListing[]) => {
      const merc = list.find((v) => v.brand === "Mercedes-Benz" || v.brand === "Lexus");
      const modern = list.find((v) => v.fuelType === "Electric" || v.brand === "Volkswagen");
      return [merc, modern].filter(Boolean) as VehicleListing[];
    },
    icon: Crown,
    borderHover: "hover:border-purple-500",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  }
];

// Specification Field Interface
interface SpecField {
  label: string;
  getValue: (v: VehicleListing) => React.ReactNode;
  getRawValue?: (v: VehicleListing) => any;
}

interface SpecSection {
  title: string;
  icon: any;
  fields: SpecField[];
}

export default function VehicleComparison({ onNotify, onViewDetails }: VehicleComparisonProps) {
  const [allVehicles, setAllVehicles] = useState<VehicleListing[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // 1. Try URL parameters first (?ids=id1,id2)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlIds = params.get("ids");
      if (urlIds) {
        const parsed = urlIds.split(",").filter(Boolean);
        if (parsed.length > 0) return parsed.slice(0, 4);
      }
    } catch {}

    // 2. Try LocalStorage
    try {
      const saved = localStorage.getItem("autobroker_compare_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4);
      }
    } catch {}

    return [];
  });

  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(false);
  const [showSelectorModal, setShowSelectorModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [inquireVehicle, setInquireVehicle] = useState<VehicleListing | null>(null);

  // Load all vehicles directly from backend API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehiclesApi.list();
        if (res && res.length > 0) {
          const approved = res.filter((v: VehicleListing) => v.status === "approved");
          setAllVehicles(approved);

          // If no selectedIds or current selection is invalid, default to first two available vehicles
          setSelectedIds(prev => {
            const valid = prev.filter(id => approved.some(v => v.id === id));
            if (valid.length >= 2) return valid;
            if (approved.length >= 2) return [approved[0].id, approved[1].id];
            return approved.map(v => v.id);
          });
        }
      } catch (err) {
        console.error("Failed to fetch vehicles for comparison", err);
      }
    };
    fetchVehicles();
  }, []);

  // Dynamic 1-click popular presets computed directly from loaded database inventory
  const popularPresets = useMemo(() => {
    return PRESET_DEFINITIONS.map(def => {
      const matched = def.findVehicles(allVehicles);
      const ids = matched.length >= 2 
        ? [matched[0].id, matched[1].id] 
        : (allVehicles.length >= 2 ? [allVehicles[0].id, allVehicles[1].id] : []);
      const title = matched.length >= 2 
        ? `${matched[0].brand} ${matched[0].model} vs. ${matched[1].brand} ${matched[1].model}`
        : def.titleFallback;
      return {
        id: def.id,
        title,
        category: def.category,
        tagline: def.tagline,
        ids,
        icon: def.icon,
        borderHover: def.borderHover,
        badgeColor: def.badgeColor
      };
    });
  }, [allVehicles]);

  // Sync selected IDs to localStorage & URL
  const [mobileViewMode, setMobileViewMode] = useState<"dual" | "table" | "cards">("dual");
  const [mobileLeftIndex, setMobileLeftIndex] = useState<number>(0);
  const [mobileRightIndex, setMobileRightIndex] = useState<number>(1);

  useEffect(() => {
    try {
      localStorage.setItem("autobroker_compare_list", JSON.stringify(selectedIds));
      const newUrl = selectedIds.length > 0
        ? `${window.location.pathname}?ids=${selectedIds.join(",")}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      window.dispatchEvent(new CustomEvent("autobroker:compare_updated", { detail: selectedIds }));
    } catch {}
  }, [selectedIds]);

  // Selected Vehicles Array
  const selectedVehicles = useMemo(() => {
    return selectedIds
      .map(id => allVehicles.find(v => v.id === id))
      .filter((v): v is VehicleListing => v !== undefined);
  }, [selectedIds, allVehicles]);

  // Keep mobile comparison indices within range
  useEffect(() => {
    if (selectedVehicles.length <= 1) {
      setMobileLeftIndex(0);
      setMobileRightIndex(1);
      return;
    }
    if (mobileLeftIndex >= selectedVehicles.length) {
      setMobileLeftIndex(0);
    }
    if (mobileRightIndex >= selectedVehicles.length || mobileRightIndex === mobileLeftIndex) {
      const nextIdx = (mobileLeftIndex + 1) % selectedVehicles.length;
      setMobileRightIndex(nextIdx);
    }
  }, [selectedVehicles.length, mobileLeftIndex, mobileRightIndex]);

  const vLeft = selectedVehicles[mobileLeftIndex] || selectedVehicles[0];
  const vRight = selectedVehicles[mobileRightIndex] || (selectedVehicles.length > 1 ? selectedVehicles[1] : null);

  // Helper actions
  const addVehicle = (v: VehicleListing) => {
    if (selectedIds.length >= 4) {
      onNotify("You can compare up to 4 vehicles simultaneously.", "error");
      return;
    }
    if (selectedIds.includes(v.id)) {
      onNotify(`${v.brand} ${v.model} is already in comparison.`, "info");
      return;
    }
    setSelectedIds(prev => [...prev, v.id]);
    setShowSelectorModal(false);
    onNotify(`Added ${v.brand} ${v.model} to comparison`, "success");
  };

  const removeVehicle = (id: string) => {
    setSelectedIds(prev => prev.filter(vId => vId !== id));
    onNotify("Vehicle removed from comparison", "info");
  };

  const clearAll = () => {
    setSelectedIds([]);
    onNotify("Cleared comparison list", "info");
  };

  const loadPreset = (ids: string[]) => {
    setSelectedIds(ids);
    onNotify("Loaded preset comparison", "success");
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const shareTitle = useMemo(() => {
    if (selectedVehicles.length === 0) return "Car Comparison on Arif Car Sell";
    return "Car Comparison: " + selectedVehicles.map(v => `${v.year} ${v.brand} ${v.model}`).join(" vs ");
  }, [selectedVehicles]);

  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/compare";
    return selectedIds.length > 0
      ? `${origin}${pathname}?ids=${selectedIds.join(",")}`
      : `${origin}${pathname}`;
  }, [selectedIds]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onNotify("Comparison link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onNotify("Copy link from the input field", "info");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Compare ${selectedVehicles.map(v => `${v.year} ${v.brand} ${v.model}`).join(" vs ")} side-by-side with verified Libre title audit on Arif Car Sell:`,
          url: shareUrl
        });
        onNotify("Shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          onNotify("Could not open native share sheet", "info");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Best-in-class auto badges calculation (Lowest Price, Lowest Mileage, Newest Year)
  const bestValueStats = useMemo(() => {
    if (selectedVehicles.length < 2) return { lowestPriceId: null, lowestMileageId: null, newestYearId: null };
    const minPrice = Math.min(...selectedVehicles.map(v => v.price));
    const minMileage = Math.min(...selectedVehicles.map(v => v.mileage || 0));
    const maxYear = Math.max(...selectedVehicles.map(v => v.year));

    return {
      lowestPriceId: selectedVehicles.find(v => v.price === minPrice)?.id || null,
      lowestMileageId: selectedVehicles.find(v => (v.mileage || 0) === minMileage)?.id || null,
      newestYearId: selectedVehicles.find(v => v.year === maxYear)?.id || null,
    };
  }, [selectedVehicles]);

  // Streamlined Specification Sections — Clean, High-Value, Zero Unnecessary Info
  const SPEC_SECTIONS: SpecSection[] = [
    {
      title: "Pricing & Customs",
      icon: DollarSign,
      fields: [
        {
          label: "Price (ETB)",
          getRawValue: v => v.price,
          getValue: v => (
            <div className="space-y-0.5">
              <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                ETB {v.price.toLocaleString()}
              </span>
              {v.originalPrice && v.originalPrice > v.price && (
                <div className="text-[10px] text-slate-400 line-through">
                  ETB {v.originalPrice.toLocaleString()}
                </div>
              )}
            </div>
          )
        },
        {
          label: "Broker Fee (1.5% Cap)",
          getRawValue: v => v.price * 0.015,
          getValue: v => (
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              ETB {(v.price * 0.015).toLocaleString()}
              <span className="block text-[10px] text-emerald-600 dark:text-[#22c55e]">Legal Max</span>
            </div>
          )
        },
        {
          label: "Customs Duty Status",
          getRawValue: v => v.fuelType,
          getValue: v =>
            v.fuelType === "Electric" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-[#22c55e] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Zap size={11} className="text-[#22c55e]" />
                0% Duty (EV Exemption)
              </span>
            ) : v.fuelType === "Hybrid" ? (
              <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
                Reduced Hybrid Tariff
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Standard Tariff
              </span>
            )
        }
      ]
    },
    {
      title: "Vehicle Specifications",
      icon: Car,
      fields: [
        {
          label: "Model Year",
          getRawValue: v => v.year,
          getValue: v => <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{v.year}</span>
        },
        {
          label: "Mileage",
          getRawValue: v => v.mileage,
          getValue: v => (
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
              <Gauge size={13} className="text-slate-400 shrink-0" />
              <span>{v.mileage ? `${v.mileage.toLocaleString()} km` : "0 km (Brand New)"}</span>
            </div>
          )
        },
        {
          label: "Fuel Type",
          getRawValue: v => v.fuelType,
          getValue: v => (
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
              <Fuel size={13} className={v.fuelType === "Electric" ? "text-emerald-500 shrink-0" : "text-amber-500 shrink-0"} />
              <span>{v.fuelType}</span>
            </div>
          )
        },
        {
          label: "Transmission",
          getRawValue: v => v.transmission,
          getValue: v => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{v.transmission || "Automatic"}</span>
        },
        {
          label: "Condition",
          getRawValue: v => v.condition,
          getValue: v => (
            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {v.condition || "Excellent"}
            </span>
          )
        },
        {
          label: "Body Type",
          getRawValue: v => v.bodyType,
          getValue: v => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{v.bodyType || "SUV"}</span>
        },
        {
          label: "Engine / Battery",
          getRawValue: v => v.engineSize,
          getValue: v => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{v.engineSize || "2.0L"}</span>
        },
        {
          label: "Horsepower",
          getRawValue: v => v.horsepower,
          getValue: v => <span className="font-bold text-xs text-slate-900 dark:text-white">{v.horsepower ? `${v.horsepower} HP` : "—"}</span>
        },
        {
          label: "Seats",
          getRawValue: v => v.seats,
          getValue: v => (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Users size={13} className="text-slate-400 shrink-0" />
              <span>{v.seats || 5} Seats</span>
            </div>
          )
        },
        {
          label: "Location",
          getRawValue: v => v.location,
          getValue: v => (
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <MapPin size={12} className="text-emerald-500 shrink-0" />
              <span className="truncate">{v.location || "Addis Ababa"}</span>
            </div>
          )
        }
      ]
    },
    {
      title: "Verification & Audit",
      icon: ShieldCheck,
      fields: [
        {
          label: "Libre Title Audit",
          getRawValue: () => "Verified",
          getValue: () => (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-[#22c55e] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <FileCheck2 size={12} className="text-[#22c55e]" />
              <span>100% Libre Verified</span>
            </div>
          )
        },
        {
          label: "Physical Inspection",
          getRawValue: () => "Passed",
          getValue: () => (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Check size={13} className="text-[#22c55e]" strokeWidth={3} />
              <span>150-Point Audit Passed</span>
            </div>
          )
        },
        {
          label: "Assigned Broker",
          getRawValue: v => v.brokerName,
          getValue: v => (
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white truncate">{v.brokerName || "Verified Broker"}</div>
              <div className="text-[11px] text-slate-400">{v.brokerPhone || "+251 91 123 4567"}</div>
            </div>
          )
        }
      ]
    }
  ];

  // Filter vehicles for selector modal
  const filteredModalVehicles = useMemo(() => {
    return allVehicles.filter(v => {
      const matchesSearch =
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.year.toString().includes(searchQuery) ||
        (v.bodyType || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilterCategory === "toyota") return v.brand === "Toyota";
      if (selectedFilterCategory === "hyundai") return v.brand === "Hyundai";
      if (selectedFilterCategory === "suzuki") return v.brand === "Suzuki";
      if (selectedFilterCategory === "electric") return v.fuelType === "Electric" || v.fuelType === "Hybrid";
      if (selectedFilterCategory === "suv") return (v.bodyType || "").toLowerCase() === "suv" || v.model.includes("RAV4") || v.model.includes("Tucson");
      if (selectedFilterCategory === "budget") return v.price < 5000000;

      return true;
    });
  }, [allVehicles, searchQuery, selectedFilterCategory]);

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 py-6 sm:py-10 pb-32 sm:pb-24 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="space-y-3 mb-6 sm:mb-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="hover:text-[#22c55e] cursor-pointer" onClick={() => window.location.href = "/"}>Home</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 dark:text-slate-200">Vehicle Comparison</span>
        </div>

        {/* Title & Toolbar Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22c55e] uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              <span>Automotive Comparator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Compare Vehicles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl mt-0.5">
              Side-by-side specification benchmark, pricing evaluation, and legal Libre status check.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            
            {/* Toggle Highlight Differences */}
            {selectedVehicles.length >= 2 && (
              <button
                type="button"
                onClick={() => setHighlightDiffs(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  highlightDiffs
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                <SlidersHorizontal size={13} className={highlightDiffs ? "text-amber-500" : "text-slate-400"} />
                <span>Diffs</span>
              </button>
            )}

            {/* Share Link */}
            {selectedVehicles.length > 0 && (
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#22c55e] transition cursor-pointer shadow-xs"
                title="Copy shareable link"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            )}

            {/* Print View */}
            {selectedVehicles.length > 0 && (
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#22c55e] transition cursor-pointer shadow-xs"
                title="Print Comparison sheet"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
            )}

            {/* Reset */}
            {selectedVehicles.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
                title="Clear all vehicles"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}

            {/* Add Vehicle Button */}
            {selectedVehicles.length < 4 && (
              <button
                type="button"
                onClick={() => setShowSelectorModal(true)}
                className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-black px-3.5 py-1.5 sm:py-2 rounded-xl transition cursor-pointer shadow-md shadow-[#22c55e]/25 active:scale-95"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Add ({selectedVehicles.length}/4)</span>
              </button>
            )}

          </div>
        </div>
      </div>


      {/* ── MOBILE CONTROLS & VIEW TOGGLE ── */}
      {selectedVehicles.length > 0 && (
        <div className="md:hidden space-y-2 mb-3">
          {/* View Mode Toggle: Dual (50/50), Table View, Cards View */}
          <div className="flex items-center justify-between text-xs bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileViewMode("dual")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                  mobileViewMode === "dual"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Columns size={12} className={mobileViewMode === "dual" ? "text-[#22c55e]" : ""} />
                <span>Side-by-Side</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                  mobileViewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode("cards")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                  mobileViewMode === "cards"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Layers size={12} />
                <span>Cards</span>
              </button>
            </div>

            <span className="text-[10px] font-bold text-slate-400 px-2">
              {selectedVehicles.length} of 4 cars
            </span>
          </div>

          {/* Quick Jump Car Pills (in Table mode on mobile) */}
          {mobileViewMode === "table" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">Jump:</span>
              {selectedVehicles.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`col-mob-${v.id}`);
                    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 shrink-0 shadow-xs active:scale-95 cursor-pointer"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-[#22c55e] text-[9px] flex items-center justify-center font-black">
                    {i + 1}
                  </span>
                  <span className="truncate max-w-[90px]">{v.brand} {v.model}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ── MAIN COMPARISON OR EMPTY STATE ── */}
      {selectedVehicles.length === 0 ? (
        
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 sm:p-14 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] flex items-center justify-center mx-auto shadow-inner">
            <Car size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">No Vehicles in Comparison</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select vehicles from inventory or load one of the top Ethiopian matchups below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSelectorModal(true)}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-[#22c55e]/25 active:scale-95 inline-flex items-center gap-1.5"
          >
            <Plus size={15} strokeWidth={3} />
            <span>Select Vehicles</span>
          </button>
        </div>

      ) : (

        <>
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── 1. MOBILE RESPONSIVE VIEWS (md:hidden) ── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="md:hidden space-y-4">

            {/* ── A. 50/50 DUAL SIDE-BY-SIDE MOBILE VIEW (DEFAULT) ── */}
            {mobileViewMode === "dual" && (
              <div className="space-y-3.5">
                
                {/* Multi-car Pairing Switcher (when 3 or 4 cars are loaded) */}
                {selectedVehicles.length > 2 && (
                  <div className="relative">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] -mx-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">Compare Pairs:</span>
                      {selectedVehicles.map((v1, i) =>
                        selectedVehicles.slice(i + 1).map((v2, j) => {
                          const idx2 = i + 1 + j;
                          const isActive =
                            (mobileLeftIndex === i && mobileRightIndex === idx2) ||
                            (mobileLeftIndex === idx2 && mobileRightIndex === i);
                          return (
                            <button
                              key={`${v1.id}-${v2.id}`}
                              type="button"
                              onClick={() => {
                                setMobileLeftIndex(i);
                                setMobileRightIndex(idx2);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer border ${
                                isActive
                                  ? "bg-[#22c55e] text-slate-950 border-[#22c55e] shadow-xs"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {i + 1} vs {idx2 + 1}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-slate-50 dark:from-[#0B0F19] to-transparent" />
                  </div>
                )}

                {/* Dual Vehicle Cards Header (Exactly 50% / 50% Split) */}
                <div className="grid grid-cols-2 gap-2.5 items-stretch">
                  {[vLeft, vRight].map((v, slotIdx) => {
                    if (!v) {
                      return (
                        <div
                          key="empty-mobile-slot"
                          onClick={() => setShowSelectorModal(true)}
                          className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-[#22c55e] transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                            <Plus size={18} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Vehicle</span>
                          <span className="text-[10px] text-slate-400">Tap to select from inventory</span>
                        </div>
                      );
                    }

                    const isLeft = slotIdx === 0;
                    const currentIdx = isLeft ? mobileLeftIndex : mobileRightIndex;
                    const isLowestPrice = bestValueStats.lowestPriceId === v.id;
                    const isLowestMileage = bestValueStats.lowestMileageId === v.id;
                    const isNewest = bestValueStats.newestYearId === v.id;

                    return (
                      <div
                        key={v.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm space-y-2 flex flex-col justify-between relative"
                      >
                        {/* Slot Header: Dropdown selector if > 2 cars, and remove button */}
                        <div className="flex items-center justify-between gap-1">
                          {selectedVehicles.length > 2 ? (
                            <div className="relative flex-1">
                              <select
                                value={currentIdx}
                                onChange={(e) => {
                                  const newIdx = Number(e.target.value);
                                  if (isLeft) {
                                    setMobileLeftIndex(newIdx);
                                    if (newIdx === mobileRightIndex) {
                                      setMobileRightIndex((newIdx + 1) % selectedVehicles.length);
                                    }
                                  } else {
                                    setMobileRightIndex(newIdx);
                                    if (newIdx === mobileLeftIndex) {
                                      setMobileLeftIndex((newIdx + 1) % selectedVehicles.length);
                                    }
                                  }
                                }}
                                className="w-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg border-none focus:ring-1 focus:ring-emerald-500 truncate"
                              >
                                {selectedVehicles.map((c, i) => (
                                  <option key={c.id} value={i}>
                                    {i + 1}. {c.brand} {c.model}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#22c55e] text-[11px] flex items-center justify-center font-black">
                              {currentIdx + 1}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeVehicle(v.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-md"
                            title="Remove"
                          >
                            <X size={13} />
                          </button>
                        </div>

                        {/* Thumbnail & Badges */}
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 flex flex-col gap-0.5 z-10">
                            {isLowestPrice && selectedVehicles.length > 1 && (
                              <span className="bg-emerald-500 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded shadow-xs">
                                Lowest Price
                              </span>
                            )}
                            {isLowestMileage && selectedVehicles.length > 1 && (
                              <span className="bg-sky-500 text-white font-black text-[8px] px-1.5 py-0.2 rounded shadow-xs">
                                Lowest Km
                              </span>
                            )}
                            {isNewest && selectedVehicles.length > 1 && (
                              <span className="bg-purple-600 text-white font-black text-[8px] px-1.5 py-0.2 rounded shadow-xs">
                                Newest
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-1 right-1 bg-slate-950/80 text-white font-bold text-[8px] px-1.5 py-0.2 rounded">
                            {v.fuelType}
                          </div>
                        </div>

                        {/* Title & Price */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-bold">{v.year} Model</div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 leading-tight">
                            {v.brand} {v.model}
                          </h4>
                          <div className="text-xs sm:text-sm font-black text-[#16a34a] dark:text-[#22c55e] pt-0.5">
                            ETB {v.price.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            1.5% Fee: ETB {(v.price * 0.015).toLocaleString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-1 pt-1">
                          <button
                            type="button"
                            onClick={() => onViewDetails(v)}
                            className="w-full py-1.5 px-2 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black rounded-lg text-[11px] transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                          >
                            <span>View Details</span>
                            <ArrowRight size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInquireVehicle(v)}
                            className="w-full py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <PhoneCall size={10} className="text-[#22c55e]" />
                            <span>Contact</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dual 50/50 Spec Rows (Zero Horizontal Panning Required) */}
                {vLeft && vRight && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-4">
                    {SPEC_SECTIONS.map((section, sIdx) => {
                      const SectionIcon = section.icon;

                      return (
                        <div key={sIdx} className="space-y-2">
                          {/* Full-width Section Title Banner */}
                          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            <SectionIcon size={12} className="text-[#22c55e]" />
                            <span>{section.title}</span>
                          </div>

                          {/* Spec Items in 50/50 split */}
                          <div className="space-y-2">
                            {section.fields.map((field, fIdx) => {
                              let isDifferent = false;
                              if (field.getRawValue) {
                                const rawL = field.getRawValue(vLeft);
                                const rawR = field.getRawValue(vRight);
                                isDifferent = rawL !== rawR;
                              }
                              const highlightRow = highlightDiffs && isDifferent;

                              return (
                                <div
                                  key={`${sIdx}-${fIdx}`}
                                  className={`p-2 rounded-xl border transition-colors ${
                                    highlightRow
                                      ? "bg-amber-500/10 border-amber-500/30"
                                      : "bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/80"
                                  }`}
                                >
                                  {/* Full-width Label Header */}
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
                                    <span>{field.label}</span>
                                    {highlightRow && (
                                      <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1 py-0.2 rounded">
                                        Diff
                                      </span>
                                    )}
                                  </div>

                                  {/* Two 50% Columns side-by-side */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="font-semibold text-slate-900 dark:text-white break-words pr-1">
                                      {field.getValue(vLeft)}
                                    </div>
                                    <div className="font-semibold text-slate-900 dark:text-white break-words pl-2 border-l border-slate-200 dark:border-slate-700/60">
                                      {field.getValue(vRight)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── B. MOBILE CARDS BREAKDOWN VIEW ── */}
            {mobileViewMode === "cards" && (
              <div className="space-y-4">
                {selectedVehicles.map((v, idx) => {
                  const isLowestPrice = bestValueStats.lowestPriceId === v.id;
                  const isLowestMileage = bestValueStats.lowestMileageId === v.id;
                  const isNewest = bestValueStats.newestYearId === v.id;

                  return (
                    <div
                      key={v.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5 relative overflow-hidden"
                    >
                      {/* Header with Photo & Badges */}
                      <div className="flex gap-3">
                        <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-slate-950/80 text-white text-[10px] font-black w-4 h-4 rounded flex items-center justify-center">
                            {idx + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400">{v.year} Model</div>
                              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white truncate">
                                {v.brand} {v.model}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVehicle(v.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                              title="Remove"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          <div className="text-base font-black text-[#16a34a] dark:text-[#22c55e]">
                            ETB {v.price.toLocaleString()}
                          </div>

                          {/* Best Badges */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {isLowestPrice && selectedVehicles.length > 1 && (
                              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                                Lowest Price
                              </span>
                            )}
                            {isLowestMileage && selectedVehicles.length > 1 && (
                              <span className="bg-sky-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                                Lowest Km
                              </span>
                            )}
                            {isNewest && selectedVehicles.length > 1 && (
                              <span className="bg-purple-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                                Newest Year
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Specs List for this vehicle */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        {SPEC_SECTIONS.map((sec, sI) => (
                          <div key={sI} className="space-y-1.5">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <span>{sec.title}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              {sec.fields.slice(0, 4).map((f, fI) => (
                                <div key={fI} className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 block">{f.label}</span>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {f.getValue(v)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action button */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(v)}
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#22c55e] hover:text-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
                      >
                        View Full Vehicle Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── C. MOBILE TABLE VIEW (SLIM STICKY HEADER & SMOOTH SWIPE) ── */}
            {mobileViewMode === "table" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ArrowRight size={12} className="text-[#22c55e] animate-pulse" />
                    Swipe horizontally to view all {selectedVehicles.length} vehicles
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">1 to {selectedVehicles.length}</span>
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
                        <th className="p-2 w-20 sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Matrix</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{selectedVehicles.length} cars</span>
                        </th>
                        {selectedVehicles.map(v => (
                          <th
                            key={v.id}
                            id={`col-mob-${v.id}`}
                            className="p-2.5 min-w-[150px] max-w-[170px] align-top border-r border-slate-100 dark:border-slate-800"
                          >
                            <div className="space-y-1.5">
                              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold">{v.year}</div>
                              <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                                {v.brand} {v.model}
                              </h4>
                              <div className="text-xs font-black text-[#16a34a] dark:text-[#22c55e]">
                                ETB {v.price.toLocaleString()}
                              </div>
                              <button
                                type="button"
                                onClick={() => onViewDetails(v)}
                                className="w-full py-1 bg-[#22c55e] text-slate-950 font-black rounded text-[10px]"
                              >
                                Details
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SPEC_SECTIONS.map((section, sIdx) => {
                        const SectionIcon = section.icon;
                        return (
                          <React.Fragment key={sIdx}>
                            <tr className="bg-slate-100 dark:bg-slate-800/80 border-t border-b border-slate-200 dark:border-slate-700">
                              <td colSpan={selectedVehicles.length + 1} className="p-1.5 px-2 text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                                <div className="flex items-center gap-1">
                                  <SectionIcon size={11} className="text-[#22c55e]" />
                                  <span>{section.title}</span>
                                </div>
                              </td>
                            </tr>
                            {section.fields.map((field, fIdx) => (
                              <tr key={`${sIdx}-${fIdx}`} className="border-b border-slate-100 dark:border-slate-800/60">
                                <td className="w-20 p-2 sticky left-0 z-10 bg-slate-50/98 dark:bg-slate-900/98 border-r border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                  {field.label}
                                </td>
                                {selectedVehicles.map(v => (
                                  <td key={v.id} className="p-2 text-[11px] text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/60">
                                    {field.getValue(v)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>


          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ── 2. DESKTOP FULL MATRIX TABLE VIEW (hidden md:block) ── */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg shadow-slate-950/5">
            <div className="overflow-x-auto scrollbar-thin scroll-smooth">
              <table className="w-full text-left border-collapse">
                
                {/* ── THEAD: VEHICLE HEADER CARDS ── */}
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
                    
                    {/* Sticky Corner Column */}
                    <th className="p-5 w-44 md:w-52 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[3px_0_10px_rgba(0,0,0,0.06)] align-top">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                          Matrix
                        </span>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          {selectedVehicles.length} of 4
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Side-by-side evaluation
                        </p>
                      </div>
                    </th>

                    {/* Vehicle Header Columns */}
                    {selectedVehicles.map((v) => {
                      const isLowestPrice = bestValueStats.lowestPriceId === v.id;
                      const isLowestMileage = bestValueStats.lowestMileageId === v.id;
                      const isNewest = bestValueStats.newestYearId === v.id;

                      return (
                        <th
                          key={v.id}
                          id={`col-${v.id}`}
                          className="p-5 min-w-[240px] md:min-w-[260px] max-w-[290px] align-top relative border-r border-slate-100 dark:border-slate-800/80 last:border-r-0"
                        >
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeVehicle(v.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-full transition cursor-pointer z-10"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>

                          <div className="space-y-3">
                            
                            {/* Image Thumbnail with Auto Badges */}
                            <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 group">
                              <img
                                src={v.imageUrl}
                                alt={`${v.brand} ${v.model}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Best Badge Overlays using Lucide Icons */}
                              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                {isLowestPrice && selectedVehicles.length > 1 && (
                                  <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                    <Award size={10} /> Lowest Price
                                  </span>
                                )}
                                {isLowestMileage && selectedVehicles.length > 1 && (
                                  <span className="bg-sky-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                    <Gauge size={10} /> Lowest Km
                                  </span>
                                )}
                                {isNewest && selectedVehicles.length > 1 && (
                                  <span className="bg-purple-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                    <Clock size={10} /> Newest
                                  </span>
                                )}
                              </div>

                              {/* Fuel type pill */}
                              <div className="absolute bottom-1.5 right-1.5 bg-slate-950/80 backdrop-blur-sm text-white font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                {v.fuelType === "Electric" && <Zap size={10} className="text-[#22c55e]" />}
                                <span>{v.fuelType}</span>
                              </div>
                            </div>

                            {/* Vehicle Title & Year */}
                            <div>
                              <div className="text-[11px] font-bold text-slate-400">{v.year} Model</div>
                              <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                                {v.brand} {v.model}
                              </h3>
                            </div>

                            {/* Price Tag */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                              <div className="text-[9px] uppercase font-bold text-slate-400">Price</div>
                              <div className="text-base font-black text-[#16a34a] dark:text-[#22c55e]">
                                ETB {v.price.toLocaleString()}
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium">
                                1.5% Fee: ETB {(v.price * 0.015).toLocaleString()}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => onViewDetails(v)}
                                className="w-full py-2 px-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                              >
                                <span>View Details</span>
                                <ArrowRight size={12} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setInquireVehicle(v)}
                                className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <PhoneCall size={11} className="text-[#22c55e]" />
                                <span>Contact</span>
                              </button>
                            </div>

                          </div>
                        </th>
                      );
                    })}

                    {/* Empty Slot (if less than 4 cars) */}
                    {selectedVehicles.length < 4 && (
                      <th className="p-5 min-w-[220px] align-middle text-center border-dashed border-2 border-slate-200 dark:border-slate-800 m-2 rounded-2xl bg-slate-50/20 dark:bg-slate-900/20">
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                            <Plus size={18} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Add Vehicle
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Slot {selectedVehicles.length + 1} of 4
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSelectorModal(true)}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs active:scale-95"
                          >
                            + Select
                          </button>
                        </div>
                      </th>
                    )}

                  </tr>
                </thead>

                {/* ── TBODY: STRUCTURED SPECIFICATION SECTIONS ── */}
                <tbody>
                  {SPEC_SECTIONS.map((section, sIdx) => {
                    const SectionIcon = section.icon;

                    return (
                      <React.Fragment key={sIdx}>
                        
                        {/* Section Header Divider */}
                        <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-t-2 border-b border-slate-200 dark:border-slate-700/80">
                          <td
                            colSpan={selectedVehicles.length + (selectedVehicles.length < 4 ? 2 : 1)}
                            className="px-5 py-2"
                          >
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                              <SectionIcon size={13} className="text-[#22c55e]" />
                              <span>{section.title}</span>
                            </div>
                          </td>
                        </tr>

                        {/* Section Spec Rows */}
                        {section.fields.map((field, fIdx) => {
                          let isDifferent = false;
                          if (selectedVehicles.length > 1 && field.getRawValue) {
                            const values = selectedVehicles.map(v => field.getRawValue!(v));
                            const firstVal = values[0];
                            isDifferent = values.some(v => v !== firstVal);
                          }

                          const highlightRow = highlightDiffs && isDifferent;

                          return (
                            <tr
                              key={`${sIdx}-${fIdx}`}
                              className={`border-b border-slate-100 dark:border-slate-800/80 transition-colors ${
                                highlightRow
                                  ? "bg-amber-500/10 dark:bg-amber-500/15"
                                  : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              {/* Sticky Spec Label */}
                              <td className="w-44 md:w-52 px-5 py-2.5 sticky left-0 z-20 bg-slate-50/98 dark:bg-slate-900/98 border-r border-slate-200 dark:border-slate-800 shadow-[3px_0_10px_rgba(0,0,0,0.06)] align-middle">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                                    {field.label}
                                  </span>
                                  {highlightRow && (
                                    <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1 py-0.2 rounded shrink-0">
                                      Diff
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Spec Values for each vehicle */}
                              {selectedVehicles.map(v => (
                                <td
                                  key={v.id}
                                  className="px-5 py-2.5 text-xs text-slate-700 dark:text-slate-300 align-middle border-r border-slate-100 dark:border-slate-800/80 last:border-r-0"
                                >
                                  {field.getValue(v)}
                                </td>
                              ))}

                              {/* Empty column balance */}
                              {selectedVehicles.length < 4 && (
                                <td className="p-3 text-center text-slate-300 dark:text-slate-700">
                                  —
                                </td>
                              )}
                            </tr>
                          );
                        })}

                      </React.Fragment>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>
        </>
      )}


      {/* ── 1-CLICK POPULAR MATCHUPS PRESETS (NO EMOJIS, CLEAN SVG ICONS) ── */}
      <div className="mt-12 sm:mt-16 space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22c55e] uppercase tracking-wider mb-0.5">
            <Star size={12} className="fill-[#22c55e]" />
            <span>Ethiopian Automotive Matchups</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Popular Head-to-Head Comparisons
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Click any matchup to immediately benchmark Ethiopia's most demanded models side-by-side.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {popularPresets.map(preset => {
            const PresetIcon = preset.icon;

            return (
              <div
                key={preset.id}
                className={`p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md flex flex-col justify-between space-y-3.5 group ${preset.borderHover}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {preset.category}
                    </span>
                    <div className={`p-1.5 rounded-lg ${preset.badgeColor}`}>
                      <PresetIcon size={14} />
                    </div>
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#22c55e] transition-colors leading-snug">
                    {preset.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {preset.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadPreset(preset.ids)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#22c55e] hover:text-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 group-hover:bg-[#22c55e] group-hover:text-slate-950"
                >
                  <span>Load Matchup</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>


      {/* ── MODAL 1: VEHICLE PICKER / SELECTOR MODAL ── */}
      {showSelectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                  Add Vehicle to Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Select a car ({selectedVehicles.length}/4 selected)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSelectorModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search & Filter Chips */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search brand, model, year..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: "all", label: "All" },
                  { id: "toyota", label: "Toyota" },
                  { id: "hyundai", label: "Hyundai" },
                  { id: "suzuki", label: "Suzuki" },
                  { id: "electric", label: "Electric & Hybrid" },
                  { id: "suv", label: "SUVs" },
                  { id: "budget", label: "Under 5M ETB" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedFilterCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap cursor-pointer transition text-[11px] ${
                      selectedFilterCategory === cat.id
                        ? "bg-[#22c55e] text-slate-950 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Modal Vehicle Grid List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredModalVehicles.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No vehicles found matching your search.
                </div>
              ) : (
                filteredModalVehicles.map(v => {
                  const isAlreadySelected = selectedIds.includes(v.id);

                  return (
                    <div
                      key={v.id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={v.imageUrl}
                          alt={v.model}
                          className="w-14 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {v.year} {v.brand} {v.model}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span>{v.fuelType}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-[#22c55e] font-bold">
                              ETB {v.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAlreadySelected ? (
                        <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                          Added
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addVehicle(v)}
                          className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-[11px] px-3 py-1 rounded-xl transition cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1"
                        >
                          <Plus size={12} strokeWidth={3} />
                          <span>Compare</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSelectorModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ── MODAL 2: QUICK BROKER CONTACT MODAL ── */}
      {inquireVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-[#22c55e] flex items-center justify-center">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Contact Broker
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {inquireVehicle.brand} {inquireVehicle.model} ({inquireVehicle.year})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInquireVehicle(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                <div className="text-[9px] font-black uppercase text-slate-400">Assigned Broker</div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  {inquireVehicle.brokerName || "Abebe Kebede"}
                </div>
                <div className="text-[11px] text-slate-500">
                  Government License Verified
                </div>
              </div>

              <a
                href={`tel:${inquireVehicle.brokerPhone || "+251911234567"}`}
                className="w-full py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <PhoneCall size={14} />
                <span>Call {inquireVehicle.brokerPhone || "+251 91 123 4567"}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setInquireVehicle(null);
                  onViewDetails(inquireVehicle);
                }}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                View Full Details & Title Audit
              </button>
            </div>

            <button
              type="button"
              onClick={() => setInquireVehicle(null)}
              className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* ── MODAL 3: SHARE COMPARISON MODAL ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-[#22c55e] flex items-center justify-center">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Share Comparison
                  </h3>
                  <p className="text-xs text-slate-500">
                    Share this side-by-side spec evaluation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Vehicle Preview Chips */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Compared Vehicles ({selectedVehicles.length})
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {selectedVehicles.map(v => (
                  <div key={v.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                    <img src={v.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                      {v.brand} {v.model}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Link Input with 1-Click Copy */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Direct Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    copiedLink
                      ? "bg-emerald-600 text-white"
                      : "bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 shadow-xs"
                  }`}
                >
                  {copiedLink ? <CheckCheck size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Social Share Apps */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Share via App
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle + " on Arif Car Sell")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
                >
                  <Send size={14} className="text-sky-500" />
                  <span>Telegram</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + "\n" + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  <MessageCircle size={14} className="text-[#22c55e]" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Native System Share if supported */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full mt-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>More Sharing Options...</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer pt-1"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}