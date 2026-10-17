import React, { useState, useEffect } from "react";
import { Heart, Calendar, Trash2, Clock, MapPin, ArrowRight } from "lucide-react";
import { VehicleListing, SavedVehicle, TestDriveRequest } from "../../../shared/types";
import { savedVehiclesApi, testDrivesApi } from "../lib/api";

interface BuyerDashboardProps {
  currentUser: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

type BuyerTab = "saved" | "testdrives";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    confirmed: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    completed: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    cancelled: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${colors[status] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function BuyerDashboard({ currentUser, onNotify, onViewDetails }: BuyerDashboardProps) {
  const [tab, setTab] = useState<BuyerTab>("saved");
  const [savedVehicles, setSavedVehicles] = useState<(SavedVehicle & { vehicle?: VehicleListing })[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [savedData, tdData] = await Promise.all([
          savedVehiclesApi.list(userId).catch(() => [] as SavedVehicle[]),
          testDrivesApi.list().catch(() => [] as TestDriveRequest[]),
        ]);
        setSavedVehicles(savedData);
        setTestDrives(tdData);
      } catch {
        onNotify("Failed to load data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, onNotify]);

  const handleRemoveSaved = async (vehicleId: string) => {
    try {
      await savedVehiclesApi.remove(userId, vehicleId);
      setSavedVehicles(prev => prev.filter(s => s.vehicleId !== vehicleId));
      onNotify("Removed from saved.", "success");
    } catch {
      onNotify("Error removing vehicle.", "error");
    }
  };

  const handleCancelTestDrive = async (id: string) => {
    try {
      await testDrivesApi.updateStatus(id, "cancelled");
      setTestDrives(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
      onNotify("Test drive cancelled.", "info");
    } catch {
      onNotify("Error cancelling test drive.", "error");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400 font-semibold text-xs">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B0F19] transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 py-5 shrink-0 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">My Dashboard</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Welcome back, {currentUser?.name?.split(" ")[0]}</p>
          </div>
          <a href="/browse"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#22c55e] hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            Browse Vehicles <ArrowRight size={13} />
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full p-6 md:p-8">
          <div className="flex items-center gap-1 mb-6 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit border border-slate-200/60 dark:border-slate-800">
            <button onClick={() => setTab("saved")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                tab === "saved" 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Heart size={14} className={tab === "saved" ? "text-[#22c55e]" : ""} />
              Saved ({savedVehicles.length})
            </button>
            <button onClick={() => setTab("testdrives")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                tab === "testdrives" 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Calendar size={14} className={tab === "testdrives" ? "text-[#22c55e]" : ""} />
              Test Drives ({testDrives.length})
            </button>
          </div>

          {tab === "saved" && (
            savedVehicles.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Heart size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No saved vehicles yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">Browse vehicles and save your favorites</p>
                <a href="/browse" className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
                  Browse Vehicles <ArrowRight size={13} />
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedVehicles.map(sv => sv.vehicle && (
                  <div key={sv.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition cursor-pointer group"
                    onClick={() => onViewDetails(sv.vehicle!)}
                  >
                    <div className="w-full sm:w-44 h-44 sm:h-auto shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <img src={sv.vehicle.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute top-2.5 left-2.5 bg-[#22c55e] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                        Verified
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{sv.vehicle.brand} {sv.vehicle.model}</h3>
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveSaved(sv.vehicleId); }}
                            className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer p-1 shrink-0"
                            title="Remove from saved"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">{sv.vehicle.year} &bull; {sv.vehicle.transmission} &bull; {sv.vehicle.fuelType}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-black text-[#22c55e]">ETB {fmt(sv.vehicle.price)}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><MapPin size={10} /> {sv.vehicle.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "testdrives" && (
            testDrives.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Calendar size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No test drives scheduled</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">Request a test drive from any vehicle detail page</p>
                <a href="/browse" className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
                  Browse Vehicles <ArrowRight size={13} />
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {testDrives.map(td => (
                  <div key={td.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#22c55e] flex items-center justify-center shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{td.vehicleBrand} {td.vehicleModel}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(td.preferredDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {td.preferredTime}</span>
                        </div>
                        {td.message && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">"{td.message}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusPill status={td.status} />
                      {td.status === "pending" && (
                        <button onClick={() => handleCancelTestDrive(td.id)}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-3 py-1.5 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
