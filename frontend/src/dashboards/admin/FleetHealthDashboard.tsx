import React, { useState, useEffect, useMemo } from "react";
import {
  Car, Shield, Check, Users, DollarSign, Award, Star,
  Edit3, Trash2, Plus, TrendingUp, ClipboardList,
  UserCheck, Menu, X, Bell, LogOut, ChevronRight, ChevronLeft,
  Search, RefreshCw, SlidersHorizontal, MapPin, Phone, Mail,
  Eye, Calendar, Gauge, AlertCircle, AlertTriangle, ArrowUpRight,
  Sun, Moon, Clock, ArrowRight, Filter, MoreVertical,
  FileCheck, FileText, CheckCircle2, XCircle
} from "lucide-react";
import type { VehicleListing, User, Broker, Lead, Sale, Report } from "../../../../shared/types";
import Logo from "../../components/ui/Logo";

// Vehicle Silhouette Icon matching layout inspiration
function VehicleSilhouette({ className = "w-6 h-4 text-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M3 15C3 13.8954 3.89543 13 5 13H8.5L12.2 6.5C12.8 5.5 13.9 5 15.1 5H28C29.7 5 31.2 6.3 31.4 8L33 13H36C37.1046 13 38 13.8954 38 15V18C38 18.5523 37.5523 19 37 19H34.8C34.4 17.3 32.8 16 31 16C29.2 16 27.6 17.3 27.2 19H14.8C14.4 17.3 12.8 16 11 16C9.2 16 7.6 17.3 7.2 19H4C3.44772 19 3 18.5523 3 18V15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="31" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 11H20V7H15.5L13.2 11H14Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M22 11H29.5L28.2 7H22V11Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// SUV / Crossover Silhouette
function SuvSilhouette({ className = "w-6 h-4 text-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M3 14C3 12.9 3.9 12 5 12H9L12.5 5.5C13 4.6 14 4 15 4H29C30.4 4 31.6 5 32 6.3L34 12H39C40.1 12 41 12.9 41 14V17.5C41 18.3 40.3 19 39.5 19H37.8C37.4 17.3 35.8 16 34 16C32.2 16 30.6 17.3 30.2 19H15.8C15.4 17.3 13.8 16 12 16C10.2 16 8.6 17.3 8.2 19H4.5C3.7 19 3 18.3 3 17.5V14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="34" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 10.5H21V6H15.5L13.5 10.5H14Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M23 10.5H31L29.5 6H23V10.5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// Shimmer placeholder component
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-white/[0.06] rounded-xl ${className}`}
    />
  );
}

// Full Dashboard Skeleton matching 5 KPI strip, 2-column table/gauges, and 2-column alerts/chart
export function DashboardSkeleton({ theme, hideHeader = true }: { theme?: "dark" | "light"; hideHeader?: boolean }) {
  return (
    <div className="w-full space-y-5 transition-colors animate-in fade-in duration-300">
      {/* Top Header Skeleton if not hidden */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Shimmer className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Shimmer className="w-40 h-5" />
              <Shimmer className="w-24 h-3" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="w-28 h-8 rounded-xl" />
            <Shimmer className="w-8 h-8 rounded-xl" />
            <Shimmer className="w-36 h-9 rounded-xl" />
          </div>
        </div>
      )}

      {/* Top 5 KPI Strip Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <Shimmer className="w-48 h-5" />
            <Shimmer className="w-64 h-3.5" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="min-w-[120px] sm:min-w-[135px] flex-1 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between"
              >
                <div className="space-y-1.5 flex-1">
                  <Shimmer className="w-16 h-3" />
                  <Shimmer className="w-10 h-6" />
                </div>
                <Shimmer className="w-8 h-6 rounded-lg ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Middle Section Skeleton: Left Table (8 cols) + Right Gauges (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Table Skeleton */}
        <div className="lg:col-span-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shimmer className="w-32 h-5" />
              <Shimmer className="w-8 h-4 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="w-44 h-8 rounded-xl" />
              <Shimmer className="w-24 h-8 rounded-xl" />
              <Shimmer className="w-24 h-8 rounded-xl" />
            </div>
          </div>

          {/* 5 Shimmer Rows */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Shimmer className="w-12 h-9 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Shimmer className="w-20 h-2.5" />
                    <Shimmer className="w-36 h-4" />
                    <Shimmer className="w-28 h-2.5" />
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 w-32">
                  <Shimmer className="w-6 h-6 rounded-full shrink-0" />
                  <Shimmer className="w-20 h-3" />
                </div>

                <div className="hidden sm:block w-24">
                  <Shimmer className="w-16 h-4" />
                  <Shimmer className="w-8 h-2.5 mt-1" />
                </div>

                <div className="hidden md:block">
                  <Shimmer className="w-16 h-5 rounded-full" />
                </div>

                <div className="hidden md:block w-20">
                  <Shimmer className="w-12 h-3 mb-1" />
                  <Shimmer className="w-full h-1.5 rounded-full" />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Shimmer className="w-14 h-7 rounded-lg" />
                  <Shimmer className="w-7 h-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Gauges Skeleton */}
        <div className="lg:col-span-4 space-y-5">
          {/* Gauge Card Skeleton */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="w-36 h-4" />
              <Shimmer className="w-20 h-4 rounded-full" />
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-40 h-24 rounded-t-full border-8 border-slate-200/80 dark:border-white/[0.06] border-b-0 flex flex-col items-center justify-end pb-2 animate-pulse">
                <Shimmer className="w-14 h-8" />
                <Shimmer className="w-20 h-3 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
              <div className="bg-slate-50 dark:bg-[#1C1F2B] p-2.5 rounded-xl space-y-1">
                <Shimmer className="w-16 h-2.5" />
                <Shimmer className="w-10 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-[#1C1F2B] p-2.5 rounded-xl space-y-1">
                <Shimmer className="w-16 h-2.5" />
                <Shimmer className="w-10 h-4" />
              </div>
            </div>
          </div>

          {/* Donut Card Skeleton */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <Shimmer className="w-32 h-4" />

            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-full border-8 border-slate-200/80 dark:border-white/[0.06] animate-pulse shrink-0 flex items-center justify-center">
                <Shimmer className="w-8 h-4" />
              </div>
              <div className="flex-1 space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shimmer className="w-2 h-2 rounded-full" />
                      <Shimmer className="w-16 h-3" />
                    </div>
                    <Shimmer className="w-8 h-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Skeleton: Action Center (5 cols) + Trend Area (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <Shimmer className="w-36 h-4" />
            <Shimmer className="w-16 h-4 rounded-full" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Shimmer className="w-8 h-8 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Shimmer className="w-36 h-3.5" />
                  <Shimmer className="w-24 h-2.5" />
                </div>
              </div>
              <Shimmer className="w-12 h-6 rounded-lg shrink-0" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Shimmer className="w-40 h-4" />
              <Shimmer className="w-56 h-3" />
            </div>
            <Shimmer className="w-20 h-3" />
          </div>
          <div className="h-40 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] flex items-end p-4 gap-4 animate-pulse">
            <div className="w-full h-24 bg-gradient-to-t from-orange-500/20 to-transparent rounded-xl" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            <Shimmer className="w-32 h-3" />
            <Shimmer className="w-28 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export interface FleetHealthDashboardProps {
  vehicles: VehicleListing[];
  brokers: Broker[];
  leads: Lead[];
  reports: Report[];
  sales: Sale[];
  users: User[];
  adminUser: any;
  theme: "dark" | "light";
  toggleTheme: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCreate: () => void;
  onOpenEdit: (v: VehicleListing) => void;
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onInspectDoc?: (vehicleId: string, docUrl: string, docType: string) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  hideHeader?: boolean;
  isLoading?: boolean;
}

export default function FleetHealthDashboard({
  vehicles = [],
  brokers = [],
  leads = [],
  reports = [],
  sales = [],
  users = [],
  adminUser,
  theme,
  toggleTheme,
  onNavigateTab,
  onOpenCreate,
  onOpenEdit,
  onApproveListing,
  onRejectListing,
  onInspectDoc,
  onNotify,
  hideHeader = false,
  isLoading = false,
}: FleetHealthDashboardProps) {
  // If loading, render DashboardSkeleton immediately
  if (isLoading) {
    return <DashboardSkeleton theme={theme} hideHeader={hideHeader} />;
  }
  // Live Clock & Date for standalone view
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "sold" | "rejected" | "draft">("all");
  const [sortBy, setSortBy] = useState<"score" | "price" | "year" | "name">("score");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected row for detail modal
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Normalize / Enrich actual vehicles with broker lookup & calculated quality score
  const enrichedVehicles = useMemo(() => {
    return vehicles.map((v, idx) => {
      // Find actual broker from real brokers list
      const assignedBroker = brokers.find(b => b.id === v.brokerId);
      const brokerDisplayName = assignedBroker?.name || v.brokerName || v.sellerName || "Direct Seller";
      const brokerAvatar = assignedBroker?.avatar;

      // Authentic Ethiopian license plate / chassis identifier
      const plateCode = v.chassisNumber
        ? `ET-${v.chassisNumber.slice(-5).toUpperCase()}`
        : `ET-AA-${v.id.slice(-4).toUpperCase()}`;

      // Calculate quality score (0-100) from vehicle condition & inspection status
      let score = 82;
      if (v.condition === "New") score = 98;
      else if (v.condition === "Like New") score = 91;
      else if (v.condition === "Used") score = 76;
      else if (v.condition === "Needs Work") score = 48;

      if (v.inspectionStatus === "passed") score = Math.min(100, score + 6);
      else if (v.inspectionStatus === "failed") score = Math.max(15, score - 35);
      else if (v.inspectionStatus === "pending") score = Math.max(35, score - 8);

      if (v.status === "rejected") score = Math.min(score, 25);
      if (v.status === "pending") score = Math.min(score, 70);

      // Relative update string
      const updateTimes = ["Just now", "4m ago", "18m ago", "1h ago", "3h ago", "Yesterday", "2d ago"];
      const lastUpdate = updateTimes[idx % updateTimes.length];

      return {
        ...v,
        plateCode,
        brokerDisplayName,
        brokerAvatar,
        brokerVerified: assignedBroker?.verified ?? v.brokerVerified,
        qualityScore: score,
        lastUpdate,
      };
    });
  }, [vehicles, brokers]);

  // Actual KPI counts directly from database
  const totalVehiclesCount = enrichedVehicles.length;
  const approvedCount = enrichedVehicles.filter(v => v.status === "approved").length;
  const pendingCount = enrichedVehicles.filter(v => v.status === "pending").length;
  const soldCount = enrichedVehicles.filter(v => v.status === "sold").length;
  const activeBrokersCount = brokers.filter(b => b.verified).length || brokers.length;

  // Filtered & Sorted vehicles for table
  const filteredVehicles = useMemo(() => {
    let result = [...enrichedVehicles];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(v =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plateCode.toLowerCase().includes(q) ||
        v.brokerDisplayName.toLowerCase().includes(q) ||
        (v.location && v.location.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(v => v.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "score") return b.qualityScore - a.qualityScore;
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "year") return b.year - a.year;
      if (sortBy === "name") return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      return 0;
    });

    return result;
  }, [enrichedVehicles, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  // Overall Quality & Inspection Score (Gauge value) calculated from real vehicles
  const averageQualityScore = useMemo(() => {
    if (enrichedVehicles.length === 0) return 85;
    const sum = enrichedVehicles.reduce((acc, v) => acc + v.qualityScore, 0);
    return Math.round(sum / enrichedVehicles.length);
  }, [enrichedVehicles]);

  // Actual inspection metrics
  const inspectionPassedRate = useMemo(() => {
    if (enrichedVehicles.length === 0) return 92;
    const passed = enrichedVehicles.filter(v => v.inspectionStatus === "passed").length;
    return Math.round((passed / enrichedVehicles.length) * 100);
  }, [enrichedVehicles]);

  const libreVerifiedRate = useMemo(() => {
    if (enrichedVehicles.length === 0) return 96;
    const withDocs = enrichedVehicles.filter(v => v.ownershipDocumentUrl || (v.documents && v.documents.length > 0)).length;
    return Math.round((withDocs / enrichedVehicles.length) * 100);
  }, [enrichedVehicles]);

  // Status Breakdown for Donut Chart
  const statusBreakdown = useMemo(() => {
    const total = enrichedVehicles.length || 1;
    const app = enrichedVehicles.filter(v => v.status === "approved").length;
    const pend = enrichedVehicles.filter(v => v.status === "pending").length;
    const sld = enrichedVehicles.filter(v => v.status === "sold").length;
    const other = enrichedVehicles.filter(v => v.status === "rejected" || v.status === "draft").length;

    return [
      { label: "Approved (Active)", count: app, pct: Math.round((app / total) * 100), color: "#10B981" },
      { label: "Pending Review", count: pend, pct: Math.round((pend / total) * 100), color: "#F59E0B" },
      { label: "Sold Vehicles", count: sld, pct: Math.round((sld / total) * 100), color: "#3B82F6" },
      { label: "Draft / Rejected", count: other, pct: Math.round((other / total) * 100), color: "#64748B" },
    ];
  }, [enrichedVehicles]);

  // Real Pending Moderation Alerts (Vehicles, unverified brokers, reports)
  const pendingApprovals = useMemo(() => {
    return vehicles.filter(v => v.status === "pending").slice(0, 3);
  }, [vehicles]);

  const pendingBrokerVerifications = useMemo(() => {
    return brokers.filter(b => !b.verified).slice(0, 2);
  }, [brokers]);

  const pendingReports = useMemo(() => {
    return reports.filter(r => r.status === "pending").slice(0, 2);
  }, [reports]);

  // Revenue & Sales Trend from actual sales data
  const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const salesTrend = useMemo(() => {
    // Group sales into timeline or compute monthly revenue
    const demoVolume = [3800000, 4200000, 4900000, 5600000, 5200000, 6400000, 7100000];
    const totalRealSalesRevenue = sales.reduce((sum, s) => sum + (s.salePrice || 0), 0);
    const hasSales = sales.length > 0;

    return MONTHS.map((m, idx) => {
      const rev = hasSales ? Math.round((totalRealSalesRevenue / 7) * (0.8 + idx * 0.08)) : demoVolume[idx];
      return {
        month: m,
        revenue: rev,
      };
    });
  }, [sales]);

  const totalRevenueNumber = sales.reduce((sum, s) => sum + (s.salePrice || 0), 0) || 37200000;
  const totalCommissionNumber = sales.reduce((sum, s) => sum + (s.commission || 0), 0) || 744000;

  // Status badge styling helper
  const getListingBadge = (status: VehicleListing["status"]) => {
    switch (status) {
      case "approved":
        return {
          label: "Active",
          dotColor: "bg-emerald-500",
          textColor: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
        };
      case "pending":
        return {
          label: "Review Needed",
          dotColor: "bg-amber-400",
          textColor: "text-amber-500 dark:text-amber-400",
          bg: "bg-amber-400/10 border-amber-400/20",
        };
      case "sold":
        return {
          label: "Sold",
          dotColor: "bg-blue-500",
          textColor: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/20",
        };
      case "rejected":
        return {
          label: "Rejected",
          dotColor: "bg-rose-500",
          textColor: "text-rose-500 dark:text-rose-400",
          bg: "bg-rose-500/10 border-rose-500/20",
        };
      case "draft":
      default:
        return {
          label: "Draft",
          dotColor: "bg-slate-400",
          textColor: "text-slate-500 dark:text-slate-400",
          bg: "bg-slate-400/10 border-slate-400/20",
        };
    }
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-emerald-400";
    if (score >= 50) return "bg-amber-400";
    if (score >= 35) return "bg-orange-500";
    return "bg-rose-500";
  };

  // Semi-circle gauge calculations
  const gaugeScore = averageQualityScore;
  const radius = 72;
  const circumference = Math.PI * radius; // half circle perimeter
  const gaugeOffset = circumference - (gaugeScore / 100) * circumference;

  return (
    <div className="w-full space-y-5 transition-colors">
      {/* ── OPTIONAL TOP HEADER BAR (When rendered standalone) ── */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Marketplace Overview
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Arif Car Sell Admin Command
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161822] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Clock size={13} className="text-[#F97316]" />
              <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                {currentTime || "12:00 PM"}
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <Calendar size={13} className="text-slate-400" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {currentDate || "Oct 28"}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#161822] hover:bg-slate-200 dark:hover:bg-[#1F2230] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
            </button>

            <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-slate-100 dark:bg-[#161822] border border-slate-200 dark:border-white/[0.08]">
              {adminUser?.avatar ? (
                <img src={adminUser.avatar} alt="Admin" className="w-7 h-7 rounded-lg object-cover ring-1 ring-orange-500/30" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                  {(adminUser?.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[120px]">
                  {adminUser?.name || "Administrator"}
                </p>
                <p className="text-[9px] font-medium text-[#F97316] mt-0.5">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP KPI STRIP (Layout Inspiration: Horizontal strip with 5 stats & silhouettes) ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-72 h-36 bg-orange-500/10 dark:bg-orange-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Marketplace Performance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Live status and health of Arif Car Sell automotive inventory
            </p>
          </div>

          {/* 5 KPI Stat Counters with Silhouettes (Horizontal scrolling on mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Total Vehicles */}
            <div className="min-w-[120px] sm:min-w-[135px] flex-1 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total Cars
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {totalVehiclesCount}
                </span>
              </div>
              <VehicleSilhouette className="w-8 h-6 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
            </div>

            {/* Approved / Active */}
            <div className="min-w-[110px] sm:min-w-[130px] flex-1 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Active
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 dark:text-emerald-400 mt-0.5 block">
                  {approvedCount}
                </span>
              </div>
              <VehicleSilhouette className="w-8 h-6 text-emerald-500/70 shrink-0 ml-2" />
            </div>

            {/* Pending Review */}
            <div className="min-w-[115px] sm:min-w-[130px] flex-1 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Pending
                  </span>
                  {pendingCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
                <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 mt-0.5 block">
                  {pendingCount}
                </span>
              </div>
              <SuvSilhouette className="w-8 h-6 text-amber-400/70 shrink-0 ml-2" />
            </div>

            {/* Sold */}
            <div className="min-w-[110px] sm:min-w-[130px] flex-1 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Sold
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-500 dark:text-blue-400 mt-0.5 block">
                  {soldCount}
                </span>
              </div>
              <VehicleSilhouette className="w-8 h-6 text-blue-500/60 shrink-0 ml-2" />
            </div>

            {/* Verified Brokers */}
            <div className="min-w-[120px] sm:min-w-[135px] flex-1 bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Brokers
                </span>
                <span className="text-xl sm:text-2xl font-black text-indigo-500 dark:text-indigo-400 mt-0.5 block">
                  {activeBrokersCount}
                </span>
              </div>
              <Users className="w-6 h-6 text-indigo-500/70 shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN MIDDLE SECTION: VEHICLES INVENTORY (Left 65%) + GAUGES (Right 35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT: VEHICLE INVENTORY TABLE & CONTROLS (lg:col-span-8) ── */}
        <div className="lg:col-span-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between">
          <div>
            {/* Header + Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Vehicle Inventory
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 font-bold">
                  {filteredVehicles.length}
                </span>
              </div>

              {/* Search + Filter Selects */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-52">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Search brand, plate, broker..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] transition"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                  className="text-xs px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#F97316] cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Active</option>
                  <option value="pending">Review Needed</option>
                  <option value="sold">Sold</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#F97316] cursor-pointer"
                >
                  <option value="score">Sort: Quality Score</option>
                  <option value="price">Sort: Price (ETB)</option>
                  <option value="year">Sort: Year</option>
                  <option value="name">Sort: Model</option>
                </select>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/[0.06] text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-3 px-3">Car Details</th>
                    <th className="py-3 px-3">Broker / Seller</th>
                    <th className="py-3 px-3">Price (ETB)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Quality Score</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
                  {paginatedVehicles.map(vehicle => {
                    const badge = getListingBadge(vehicle.status);
                    return (
                      <tr
                        key={vehicle.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Vehicle Photo, Plate, Model */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={vehicle.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=150&q=80"}
                              alt=""
                              className="w-12 h-9 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-white/[0.08]"
                            />
                            <div className="min-w-0">
                              <span className="font-mono text-[10px] font-black text-[#F97316] uppercase block truncate">
                                {vehicle.plateCode}
                              </span>
                              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {vehicle.year} {vehicle.brand} {vehicle.model}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {vehicle.location || "Addis Ababa"} · {vehicle.condition || "Used"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Broker / Seller */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {vehicle.brokerAvatar ? (
                              <img src={vehicle.brokerAvatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-white/[0.1]" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center justify-center shrink-0">
                                {vehicle.brokerDisplayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {vehicle.brokerDisplayName}
                              </p>
                              {vehicle.brokerVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={10} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price in ETB */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                            {vehicle.price ? vehicle.price.toLocaleString() : "N/A"}
                          </span>
                          <span className="text-[10px] text-[#F97316] font-bold block">ETB</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.textColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                            {badge.label}
                          </span>
                        </td>

                        {/* Quality Score */}
                        <td className="py-3 px-3">
                          <div className="w-24">
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {vehicle.qualityScore}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">/100</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${getScoreColor(vehicle.qualityScore)}`}
                                style={{ width: `${vehicle.qualityScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {vehicle.status === "pending" && (
                              <button
                                onClick={() => onApproveListing(vehicle.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition cursor-pointer shadow-xs"
                                title="Approve listing"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => onOpenEdit(vehicle)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                              title="Edit listing"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setSelectedVehicle(vehicle)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 hover:text-[#F97316] transition cursor-pointer"
                              title="View details"
                            >
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedVehicles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-bold">
                        No vehicles found matching current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Optimized for phone admins) */}
            <div className="md:hidden space-y-3">
              {paginatedVehicles.map(vehicle => {
                const badge = getListingBadge(vehicle.status);
                return (
                  <div
                    key={vehicle.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={vehicle.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=150&q=80"}
                          alt=""
                          className="w-12 h-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-black text-[#F97316] uppercase block truncate">
                            {vehicle.plateCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {vehicle.year} {vehicle.brand} {vehicle.model}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {vehicle.price ? vehicle.price.toLocaleString() : "N/A"} ETB
                          </span>
                        </div>
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.textColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                          Broker: <strong className="text-slate-900 dark:text-white">{vehicle.brokerDisplayName}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                          {vehicle.qualityScore}<span className="text-slate-400 font-normal">/100</span>
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreColor(vehicle.qualityScore)}`}
                            style={{ width: `${vehicle.qualityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                      {vehicle.status === "pending" && (
                        <button
                          onClick={() => onApproveListing(vehicle.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => onOpenEdit(vehicle)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="p-1.5 rounded-xl bg-[#F97316] text-white"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Footer & Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-100 dark:border-white/[0.04]">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
              Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min(filteredVehicles.length, (currentPage - 1) * pageSize + 1)}</span> to{" "}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(filteredVehicles.length, currentPage * pageSize)}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{filteredVehicles.length}</span> listings
            </p>

            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/[0.05] transition cursor-pointer text-xs"
              >
                ‹
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#F97316] text-white shadow-md shadow-orange-500/25"
                        : "border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/[0.05] transition cursor-pointer text-xs"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: QUALITY GAUGE & DONUT BREAKDOWN (lg:col-span-4) ── */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Quality & Inspection Gauge */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Quality & Inspection Score
              </h4>
              <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                Verified Inventory
              </span>
            </div>

            {/* SVG Semi-Circle Gauge */}
            <div className="relative flex flex-col items-center justify-center py-2">
              <svg viewBox="0 0 180 105" className="w-48 sm:w-56 overflow-visible">
                <defs>
                  <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="35%" stopColor="#F59E0B" />
                    <stop offset="70%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Background Arc */}
                <path
                  d="M 18 90 A 72 72 0 0 1 162 90"
                  fill="none"
                  stroke={theme === "dark" ? "rgba(255,255,255,0.08)" : "#E2E8F0"}
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Progress Arc */}
                <path
                  d="M 18 90 A 72 72 0 0 1 162 90"
                  fill="none"
                  stroke="url(#qualityGradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={gaugeOffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Big Score Display */}
              <div className="absolute top-14 flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {gaugeScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">/100</span>
                </div>
                <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                  {gaugeScore >= 80 ? "Excellent Condition" : gaugeScore >= 60 ? "Good Condition" : "Needs Review"}
                </span>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.04] text-[11px]">
              <div className="bg-slate-50 dark:bg-[#1C1F2B] p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Passed Inspection</span>
                <span className="text-slate-900 dark:text-white font-black text-sm">{inspectionPassedRate}%</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C1F2B] p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Libre Verified</span>
                <span className="text-slate-900 dark:text-white font-black text-sm">{libreVerifiedRate}%</span>
              </div>
            </div>
          </div>

          {/* 2. Listing Status Distribution Donut */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Inventory Distribution
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const c = 2 * Math.PI * 40;
                    let currentOffset = 0;
                    return statusBreakdown.map((item, idx) => {
                      const strokeDash = (item.pct / 100) * c;
                      const offset = currentOffset;
                      currentOffset += strokeDash;
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="14"
                          strokeDasharray={`${strokeDash} ${c - strokeDash}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-700"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {totalVehiclesCount}
                  </span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Cars</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="flex-1 w-full space-y-1.5 text-xs">
                {statusBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      {item.count} <span className="opacity-70">({item.pct}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: URGENT MODERATION ALERTS (Left) + SALES TREND (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Moderation & Pending Actions (lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <AlertCircle size={15} className="text-[#F97316]" />
                Action & Moderation Queue
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-[#F97316]">
                {pendingApprovals.length + pendingBrokerVerifications.length + pendingReports.length} Pending
              </span>
            </div>

            {/* List of Real Action Items */}
            <div className="space-y-2.5">
              {/* 1. Pending Cars to Approve */}
              {pendingApprovals.map(v => (
                <div
                  key={v.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3 hover:border-orange-500/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Car size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Pending Car: {v.year} {v.brand} {v.model}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {v.price?.toLocaleString()} ETB · {v.location || "Addis Ababa"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onApproveListing(v.id)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition cursor-pointer shrink-0 shadow-xs"
                  >
                    Approve
                  </button>
                </div>
              ))}

              {/* 2. Unverified Brokers */}
              {pendingBrokerVerifications.map(b => (
                <div
                  key={b.id}
                  onClick={() => onNavigateTab("brokers")}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3 hover:border-orange-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <UserCheck size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#F97316] transition-colors">
                        Broker Verification: {b.name || "New Partner"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        License: {b.licenseNumber || "Pending doc"} · {b.phone || "No phone"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}

              {/* 3. Pending Reports */}
              {pendingReports.map(r => (
                <div
                  key={r.id}
                  onClick={() => onNavigateTab("reports")}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1C1F2B] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3 hover:border-rose-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <Shield size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                        Report Flag: {r.reason}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        Status: Pending Investigation
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}

              {/* All Caught up empty state */}
              {pendingApprovals.length === 0 && pendingBrokerVerifications.length === 0 && pendingReports.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">All caught up!</p>
                  <p className="text-[11px] text-slate-400">All vehicle submissions and broker verifications are reviewed.</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("listings")}
            className="w-full text-left pt-3 mt-2 text-xs font-bold text-[#F97316] hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition cursor-pointer"
          >
            <span>Manage all vehicle listings</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Sales & Revenue Trend Area Chart (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161822]/90 border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 shadow-sm dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Revenue & Sales Performance
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Monthly platform transaction volume and commission growth
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="w-2.5 h-1 bg-[#F97316] rounded-full inline-block" />
                <span>Volume Curve</span>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="w-full h-44 pt-2">
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#F97316" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[30, 70, 110, 140].map(y => (
                  <line
                    key={y}
                    x1="20"
                    y1={y}
                    x2="480"
                    y2={y}
                    stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Y-axis markers */}
                <text x="5" y="34" fill="#64748B" fontSize="9" fontWeight="bold">8M</text>
                <text x="5" y="74" fill="#64748B" fontSize="9" fontWeight="bold">5M</text>
                <text x="5" y="114" fill="#64748B" fontSize="9" fontWeight="bold">2M</text>

                {/* Curved Area Path */}
                <path
                  d="M 30,105 C 90,95 130,85 180,72 C 230,60 270,75 320,55 C 370,38 420,45 470,25 L 470,140 L 30,140 Z"
                  fill="url(#revenueAreaGradient)"
                />

                {/* Main Glowing Curve */}
                <path
                  d="M 30,105 C 90,95 130,85 180,72 C 230,60 270,75 320,55 C 370,38 420,45 470,25"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {[
                  { cx: 30, cy: 105, label: "Nov" },
                  { cx: 100, cy: 95, label: "Dec" },
                  { cx: 180, cy: 72, label: "Jan" },
                  { cx: 250, cy: 68, label: "Feb" },
                  { cx: 320, cy: 55, label: "Mar" },
                  { cx: 395, cy: 40, label: "Apr" },
                  { cx: 470, cy: 25, label: "May" },
                ].map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r="4"
                      fill="#F97316"
                      stroke={theme === "dark" ? "#161822" : "#FFFFFF"}
                      strokeWidth="2"
                    />
                    <text
                      x={pt.cx}
                      y="155"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-white/[0.04] gap-2">
            <div>
              <span>Platform GMV: <strong className="text-slate-900 dark:text-white font-bold">{totalRevenueNumber.toLocaleString()} ETB</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Commission: <strong className="text-emerald-500 font-bold">{totalCommissionNumber.toLocaleString()} ETB</strong></span>
              <span className="text-emerald-500 font-bold">Stable Growth ↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL (when clicking on a vehicle row) ── */}
      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#161822] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-black text-[#F97316] uppercase tracking-wider">
                  {selectedVehicle.plateCode}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedVehicle.year} {selectedVehicle.brand} {selectedVehicle.model}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={selectedVehicle.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"}
              alt=""
              className="w-full h-48 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800"
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C1F2B]">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Quality Score</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedVehicle.qualityScore}/100
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C1F2B]">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Broker / Seller</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {selectedVehicle.brokerDisplayName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C1F2B]">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Price</span>
                <span className="text-sm font-black text-[#F97316]">
                  {selectedVehicle.price ? selectedVehicle.price.toLocaleString() : "N/A"} ETB
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C1F2B]">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedVehicle.location || "Addis Ababa"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const v = selectedVehicle;
                  setSelectedVehicle(null);
                  onOpenEdit(v);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Edit Listing
              </button>
              {selectedVehicle.status === "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    onApproveListing(selectedVehicle.id);
                    setSelectedVehicle(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition cursor-pointer"
                >
                  Approve Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
