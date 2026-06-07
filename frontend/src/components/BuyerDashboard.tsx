import React, { useState, useEffect } from "react";
import { Heart, Calendar, Trash2, Car, Clock, MapPin, ShieldCheck, X, ChevronRight } from "lucide-react";
import { VehicleListing, SavedVehicle, TestDriveRequest } from "../../../shared/types";

interface BuyerDashboardProps {
  currentUser: any;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

type BuyerTab = "saved" | "testdrives";

const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colors[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
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
        const [savedRes, tdRes] = await Promise.all([
          fetch(`/api/saved-vehicles?userId=${userId}`),
          fetch(`/api/test-drives?userId=${userId}`),
        ]);
        if (savedRes.ok) setSavedVehicles(await savedRes.json());
        if (tdRes.ok) setTestDrives(await tdRes.json());
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
      const res = await fetch("/api/saved-vehicles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vehicleId }),
      });
      if (res.ok) {
        setSavedVehicles(prev => prev.filter(s => s.vehicleId !== vehicleId));
        onNotify("Removed from saved.", "success");
      }
    } catch {
      onNotify("Error removing vehicle.", "error");
    }
  };

  const handleCancelTestDrive = async (id: string) => {
    try {
      const res = await fetch(`/api/test-drives/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setTestDrives(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
        onNotify("Test drive cancelled.", "info");
      }
    } catch {
      onNotify("Error cancelling test drive.", "error");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20 text-slate-400 font-semibold text-xs">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-black">
          {currentUser?.name?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-900">My Account</h1>
          <p className="text-xs text-slate-400 font-medium">{currentUser?.email}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("saved")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === "saved" ? "bg-blue-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Heart size={14} />
          Saved Vehicles ({savedVehicles.length})
        </button>
        <button onClick={() => setTab("testdrives")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === "testdrives" ? "bg-blue-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Calendar size={14} />
          Test Drives ({testDrives.length})
        </button>
      </div>

      {tab === "saved" && (
        <div className="space-y-4">
          {savedVehicles.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <Heart size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-400">No saved vehicles yet</p>
              <p className="text-xs text-slate-400 mt-1">Browse vehicles and save your favorites</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVehicles.map(sv => sv.vehicle && (
                <div key={sv.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex hover:shadow-md transition cursor-pointer"
                  onClick={() => onViewDetails(sv.vehicle!)}
                >
                  <div className="w-36 h-28 shrink-0 bg-slate-100">
                    <img src={sv.vehicle.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-slate-800">{sv.vehicle.brand} {sv.vehicle.model}</h3>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveSaved(sv.vehicleId); }}
                          className="text-slate-300 hover:text-rose-500 transition cursor-pointer p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{sv.vehicle.year} &bull; {sv.vehicle.transmission} &bull; {sv.vehicle.fuelType}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-blue-900">ETB {fmt(sv.vehicle.price)}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10} /> {sv.vehicle.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "testdrives" && (
        <div className="space-y-4">
          {testDrives.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-400">No test drives scheduled</p>
              <p className="text-xs text-slate-400 mt-1">Request a test drive from any vehicle detail page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testDrives.map(td => (
                <div key={td.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{td.vehicleBrand} {td.vehicleModel}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-1">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(td.preferredDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {td.preferredTime}</span>
                      </div>
                      {td.message && <p className="text-[11px] text-slate-500 mt-1 italic">"{td.message}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={td.status} />
                    {td.status === "pending" && (
                      <button onClick={() => handleCancelTestDrive(td.id)}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 px-3 py-1.5 border border-rose-200 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}