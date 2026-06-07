import React, { useState, useEffect } from "react";
import { ArrowLeft, BadgeCheck, Star, Phone, Mail, MapPin, Shield, Car, DollarSign, Award, Flag } from "lucide-react";
import { VehicleListing } from "../../../shared/types";
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
          fetch("/api/brokers"),
          fetch("/api/vehicles"),
        ]);
        if (bRes.ok && vRes.ok) {
          const allBrokers = await bRes.json();
          const allVehicles: VehicleListing[] = await vRes.json();
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
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 transition cursor-pointer">
          <Flag size={14} /> Report
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 md:p-8 text-white">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-black shrink-0">
              {broker.name?.charAt(0)?.toUpperCase() || "B"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{broker.name}</h1>
                {broker.verified && <BadgeCheck size={20} className="text-blue-300" />}
              </div>
              <p className="text-sm text-blue-200">Licensed Broker · {broker.licenseNumber || "N/A"}</p>
              <div className="flex items-center gap-4 text-xs text-blue-200/80 mt-2">
                <span className="flex items-center gap-1"><Phone size={12} /> {broker.phone}</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {broker.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {broker.bio && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">About</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{broker.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Car size={18} className="mx-auto text-blue-900 mb-1" />
              <p className="text-lg font-bold text-slate-800">{vehicles.length}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Listings</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Award size={18} className="mx-auto text-blue-900 mb-1" />
              <p className="text-lg font-bold text-slate-800">{broker.totalSales || 0}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Sales</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <BadgeCheck size={18} className="mx-auto text-blue-900 mb-1" />
              <p className="text-lg font-bold text-emerald-600">{broker.verified ? "Verified" : "Pending"}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Active Listings ({vehicles.length})</h3>
            {vehicles.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No active listings.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map(v => (
                  <div key={v.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => onViewDetails(v)}>
                    <div className="h-36 bg-slate-100 overflow-hidden">
                      <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs text-slate-400 font-semibold">{v.year}</p>
                      <h4 className="text-sm font-bold text-slate-800">{v.brand} {v.model}</h4>
                      <p className="text-xs text-blue-900 font-bold">{fmt(v.price)} ETB</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
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
