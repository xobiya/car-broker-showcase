import React, { useState, useEffect } from "react";
import { ArrowLeft, BadgeCheck, Star, Phone, Mail, MapPin, Shield, Car, DollarSign, Award, Flag } from "lucide-react";
import { VehicleListing } from "../../../shared/types";
import { brokersApi, vehiclesApi } from "../lib/api";
import ReportModal from "../components/ui/ReportModal";

interface BrokerProfilePageProps {
  brokerId: string;
  onBack: () => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

export default function BrokerProfilePage({ brokerId, onBack, onViewDetails }: BrokerProfilePageProps) {
  const [broker, setBroker] = useState<any>(null);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, vRes] = await Promise.all([
          brokersApi.list(),
          vehiclesApi.list(),
        ]);
        if (bRes && vRes) {
          const allBrokers = bRes;
          const allVehicles: VehicleListing[] = vRes;
          const found = allBrokers.find((b: any) => b.id === brokerId);
          setBroker(found);
          setVehicles(allVehicles.filter(v => v.brokerId === brokerId && v.status === "approved"));
        }
      } catch (err) {
        console.error("Failed to load broker profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [brokerId]);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;
  }

  if (!broker) {
    return <div className="max-w-3xl mx-auto p-8 text-center text-slate-400">Broker not found.</div>;
  }

  const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

  return (
    <div className="max-w-4xl mx-auto w-full p-6 md:p-8 flex-grow">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 transition cursor-pointer">
          <Flag size={14} /> Report
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-[#22c55e]/40 flex items-center justify-center text-3xl font-black shrink-0 text-[#22c55e]">
              {broker.name?.charAt(0)?.toUpperCase() || "B"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white">{broker.name}</h1>
                {broker.verified && <BadgeCheck size={20} className="text-[#22c55e]" />}
              </div>
              <p className="text-sm text-slate-300">Licensed Broker · {broker.licenseNumber || "N/A"}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Phone size={12} /> {broker.phone}</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {broker.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {broker.bio && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">About</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{broker.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800/80">
              <Car size={18} className="mx-auto text-[#22c55e] mb-1" />
              <p className="text-lg font-bold text-slate-800 dark:text-white">{vehicles.length}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Listings</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800/80">
              <Award size={18} className="mx-auto text-[#22c55e] mb-1" />
              <p className="text-lg font-bold text-slate-800 dark:text-white">{broker.totalSales || 0}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Sales</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800/80">
              <BadgeCheck size={18} className="mx-auto text-[#22c55e] mb-1" />
              <p className="text-lg font-bold text-[#22c55e]">{broker.verified ? "Verified" : "Pending"}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Status</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Active Listings ({vehicles.length})</h3>
            {vehicles.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No active listings.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map(v => (
                  <div key={v.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/60 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group" onClick={() => onViewDetails(v)}>
                    <div className="h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img src={v.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs text-slate-400 font-semibold">{v.year}</p>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{v.brand} {v.model}</h4>
                      <p className="text-xs text-[#22c55e] font-black">{fmt(v.price)} ETB</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{v.fuelType}</span><span>•</span><span>{v.transmission}</span><span>•</span><span>{v.mileage.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          targetType="broker"
          targetId={broker.id}
          targetLabel={broker.name}
          onClose={() => setShowReportModal(false)}
          onNotify={(msg, type) => {
            console.log(`[${type}] ${msg}`);
            setShowReportModal(false);
          }}
        />
      )}
    </div>
  );
}
