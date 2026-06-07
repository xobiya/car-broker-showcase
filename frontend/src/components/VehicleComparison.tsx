import React, { useState, useEffect } from "react";
import { X, Plus, Car, Compass, Star, Zap, Cpu, Gauge, Users, MapPin, ShieldCheck } from "lucide-react";
import { VehicleListing } from "../../../shared/types";

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
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const data: VehicleListing[] = await res.json();
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
    <div className="max-w-7xl mx-auto w-full p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Compare Vehicles</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Compare up to 4 vehicles side by side</p>
        </div>
        {selected.length < 4 && (
          <button onClick={() => setShowAddPanel(true)}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Plus size={14} /> Add Vehicle
          </button>
        )}
      </div>

      {showAddPanel && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by brand or model..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400"
              autoFocus
            />
            <button onClick={() => { setShowAddPanel(false); setSearch(""); }} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtered.slice(0, 8).map(v => (
              <button key={v.id} onClick={() => addVehicle(v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <Car size={13} className="text-slate-400" />
                {v.brand} {v.model} ({v.year})
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-slate-400 py-2">No more vehicles to add.</p>}
          </div>
        </div>
      )}

      {selected.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Car size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-sm font-bold text-slate-400">No vehicles to compare</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add Vehicle" to start comparing</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50 w-40">Specification</th>
                  {selected.map(v => (
                    <th key={v.id} className="p-4 min-w-[200px] relative">
                      <button onClick={() => removeVehicle(v.id)}
                        className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 mb-3">
                          <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">{v.brand} {v.model}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{v.year}</p>
                        <span className="mt-2 text-sm font-black text-blue-900">ETB {v.price.toLocaleString()}</span>
                        <button onClick={() => onViewDetails(v)}
                          className="mt-2 text-[10px] font-bold text-orange-500 hover:text-orange-600 transition cursor-pointer"
                        >
                          View Details &rarr;
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {COMPARE_FIELDS.map(field => (
                  <tr key={field.key} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50/50">
                      {field.label}
                    </td>
                    {selected.map(v => (
                      <td key={v.id} className="p-4 text-slate-700 font-medium">
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