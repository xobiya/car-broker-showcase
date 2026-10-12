import React, { useState, useEffect } from "react";
import { X, Plus, Car, Compass, Star, Zap, Cpu, Gauge, Users, MapPin, ShieldCheck } from "lucide-react";
import { VehicleListing } from "../../../shared/types";
import { vehiclesApi } from "../lib/api";

interface VehicleComparisonProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

const COMPARE_FIELDS: { label: string; key: keyof VehicleListing | "priceFormatted" | "mileageFormatted"; }[] = [
  { label: "Price", key: "price" },
  { label: "Year", key: "year" },
  { label: "Mileage", key: "mileage" },
  { label: "Fuel Type", key: "fuelType" },
  { label: "Transmission", key: "transmission" },
  { label: "Condition", key: "condition" },
  { label: "Body Type", key: "bodyType" },
  { label: "Drive Type", key: "driveType" },
  { label: "Engine", key: "engineSize" },
  { label: "Horsepower", key: "horsepower" },
  { label: "Color", key: "color" },
  { label: "Seats", key: "seats" },
  { label: "Location", key: "location" },
];

function getFieldValue(vehicle: VehicleListing, key: string): string {
  if (key === "price") return `ETB ${vehicle.price.toLocaleString()}`;
  if (key === "mileage") return vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "—";
  const val = (vehicle as any)[key];
  return val != null && val !== "" ? String(val) : "—";
}

export default function VehicleComparison({ onNotify, onViewDetails }: VehicleComparisonProps) {
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [selected, setSelected] = useState<VehicleListing[]>([]);
  const [search, setSearch] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehiclesApi.list();
        if (res) {
          const data = res;
          setVehicles(data.filter(v => v.status === "approved"));
        }
      } catch { /* ignore */ }
    };
    fetchVehicles();
  }, []);

  const addVehicle = (v: VehicleListing) => {
    if (selected.length >= 4) {
      onNotify("Maximum 4 vehicles can be compared.", "error");
      return;
    }
    if (selected.some(s => s.id === v.id)) {
      onNotify("Vehicle already added.", "info");
      return;
    }
    setSelected(prev => [...prev, v]);
    setShowAddPanel(false);
    setSearch("");
  };

  const removeVehicle = (id: string) => {
    setSelected(prev => prev.filter(v => v.id !== id));
  };

  const filtered = vehicles.filter(v =>
    !selected.some(s => s.id === v.id) &&
    (v.brand.toLowerCase().includes(search.toLowerCase()) ||
     v.model.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 pb-24 sm:pb-8 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">Compare Vehicles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Compare up to 4 vehicles side by side</p>
        </div>
        {selected.length < 4 && (
          <button onClick={() => setShowAddPanel(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-[#22c55e]/20"
          >
            <Plus size={14} /> Add Vehicle
          </button>
        )}
      </div>

      {showAddPanel && (
        <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by brand or model..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
              autoFocus
            />
            <button onClick={() => { setShowAddPanel(false); setSearch(""); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"><X size={18} /></button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filtered.slice(0, 8).map(v => (
              <button key={v.id} onClick={() => addVehicle(v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#22c55e]/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <Car size={13} className="text-[#22c55e]" />
                {v.brand} {v.model} ({v.year})
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-slate-400 py-2">No more vehicles to add.</p>}
          </div>
        </div>
      )}

      {selected.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <Car size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No vehicles to compare</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Select vehicles from the inventory to view differences side by side.</p>
          <button onClick={() => setShowAddPanel(true)} className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl cursor-pointer transition shadow-md shadow-[#22c55e]/20">
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3 sm:p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50 dark:bg-slate-800/80 w-32 sm:w-44 sticky left-0 z-20 border-r border-slate-200 dark:border-slate-800">
                    Specification
                  </th>
                  {selected.map(v => (
                    <th key={v.id} className="p-3 sm:p-4 min-w-[170px] sm:min-w-[210px] relative">
                      <button onClick={() => removeVehicle(v.id)}
                        className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition cursor-pointer p-1"
                        title="Remove vehicle"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-transparent dark:border-slate-800">
                          <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[180px]">{v.brand} {v.model}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{v.year}</p>
                        <span className="mt-2 text-sm font-black text-[#16a34a] dark:text-[#4ade80]">ETB {v.price.toLocaleString()}</span>
                        <button onClick={() => onViewDetails(v)}
                          className="mt-2 text-[10px] font-bold text-[#22c55e] hover:underline transition cursor-pointer"
                        >
                          View Details &rarr;
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {COMPARE_FIELDS.map(field => (
                  <tr key={field.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 sm:p-4 font-bold text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] uppercase tracking-wider bg-slate-50/90 dark:bg-slate-800/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                      {field.label}
                    </td>
                    {selected.map(v => (
                      <td key={v.id} className="p-3 sm:p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {getFieldValue(v, field.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}