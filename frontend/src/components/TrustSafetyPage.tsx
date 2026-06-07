import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, BadgeCheck, FileSearch, Users, Lock, ArrowLeft, Camera, FileText, Car, Flag } from "lucide-react";

interface TrustSafetyPageProps {
  onBack: () => void;
}

export default function TrustSafetyPage({ onBack }: TrustSafetyPageProps) {
  const [resolvedCount, setResolvedCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setResolvedCount(data.filter((r: any) => r.status === "resolved").length);
        }
      } catch {}
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-4xl mx-auto w-full p-6 md:p-8 flex-grow">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition cursor-pointer">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="space-y-8">
        <div className="text-center space-y-3 pb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
            <ShieldCheck size={32} className="text-blue-900" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Trust & Safety</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            How we ensure a secure, transparent marketplace for every transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            icon={<BadgeCheck size={24} />}
            title="Broker Verification"
            description="Every broker is vetted with license verification, background checks, and identity confirmation before they can list vehicles."
          />
          <Card
            icon={<FileSearch size={24} />}
            title="Vehicle Inspection"
            description="Listings undergo professional inspection to verify condition, mileage accuracy, and roadworthiness."
          />
          <Card
            icon={<Camera size={24} />}
            title="Photo Verification"
            description="Listings require actual vehicle photos. Stock photos are clearly labeled and limited to one per listing."
          />
          <Card
            icon={<FileText size={24} />}
            title="Document Verification"
            description="All ownership, customs, and import documents are verified before a listing can be approved."
          />
          <Card
            icon={<Users size={24} />}
            title="Buyer Protection"
            description="Buyers can request independent inspections, verify vehicle history, and communicate directly with brokers."
          />
          <Card
            icon={<Lock size={24} />}
            title="Secure Platform"
            description="End-to-end encrypted communications, secure data storage, and regular security audits protect your information."
          />
          <Card
            icon={<Car size={24} />}
            title="Clear Title Guarantee"
            description="All vehicles listed must have clear title documentation. Title issues result in immediate listing removal."
          />
          <Card
            icon={<Shield size={24} />}
            title="Dispute Resolution"
            description="Our mediation team handles disputes fairly. We maintain a detailed audit trail for every transaction."
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 text-center space-y-5">
          <div className="flex items-center justify-center gap-2">
            <Flag size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-blue-900">Report a Concern</h2>
          </div>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            If you encounter suspicious activity, inaccurate listings, or any safety concern, report it immediately. Our team reviews all reports within 24 hours.
          </p>
          {resolvedCount !== null && (
            <p className="text-xs text-slate-500 font-semibold">
              {resolvedCount} report{resolvedCount !== 1 ? "s" : ""} resolved to date
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-xs font-bold bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200">safety@arifcarsell.et</span>
            <span className="text-xs font-bold bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200">+251 91 234 5678</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            You can also report a listing or broker directly from their profile page using the <Flag size={12} className="inline text-amber-500" /> Report button.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
