import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, Phone, MapPin, Star, Compass, Zap, Gauge, Cpu, Users, Car, BadgeCheck, FileText, Video, ClipboardCheck, AlertTriangle, UserCircle, Calendar, Flag, X, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/useLocale";
import { VehicleListing, VehicleDocument } from "../../../shared/types";
import { vehiclesApi, documentsApi, leadsApi, testDrivesApi } from "../lib/api";
import ReportModal from "../components/ui/ReportModal";
import { VehicleDetailSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollAnimations";
import SEO from "../components/common/SEO";
import { buildVehicleSchema } from "../lib/seo";

interface VehicleDetailProps {
  vehicle?: VehicleListing | null;
  onBack: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
  onViewBrokerProfile?: (brokerId: string) => void;
}

const CAR_PHOTOS = [
  "1533473359331-0135ef1b58bf", "1549399542-7e3f8b79c341", "1617814076367-b759c7d7e738",
  "1541899481282-d53bffe3c35d", "1503376780353-7e6692767b70", "1563720223185-11003d516935",
  "1486006920555-c77dce18193b", "1511919884226-fd3cad34687c", "1520050206274-a1ae446cb3cc",
  "1609521263047-f8f205293f24", "1555215695-3004980ad54e", "1618843479313-40f8afb4b4d8",
  "1563720223185-11003d516935", "1544631006-bc5e1e0b1b3e", "1494977581635-2a630beafae4",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
  return Math.abs(hash);
}

function getVehicleGallery(vehicle: VehicleListing): string[] {
  const seed = hashCode(vehicle.id);
  const count = 5;
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 7) % CAR_PHOTOS.length;
    images.push(`https://images.unsplash.com/photo-${CAR_PHOTOS[idx]}?auto=format&fit=crop&w=800&q=80`);
  }
  images[0] = vehicle.imageUrl;
  return images;
}

function getBrokerAvatar(name?: string, id?: string): string {
  const n = (name || id || "").toLowerCase();
  if (n.includes("beth") || n.includes("assefa") || n.includes("ev")) return "/images/brokers/bethzatha.jpg";
  if (n.includes("mesfin") || n.includes("fleet") || n.includes("commercial")) return "/images/brokers/mesfin.jpg";
  if (n.includes("dawit") || n.includes("lemma") || n.includes("legal")) return "/images/brokers/dawit.jpg";
  if (n.includes("almaz") || n.includes("bekele")) return "/images/brokers/almaz.jpg";
  return "/images/brokers/yonas.jpg";
}

export default function VehicleDetail({ vehicle: initialVehicle, onBack, onNotify, onViewDetails, onViewBrokerProfile }: VehicleDetailProps) {
  const { t } = useTranslation(["vehicles", "common", "navigation", "notifications"]);
  const { formatCurrency } = useLocale();
  const { id: paramId } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehicleListing | null>(initialVehicle || null);
  const [loading, setLoading] = useState<boolean>(!initialVehicle);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("+2519");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [similarVehicles, setSimilarVehicles] = useState<VehicleListing[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [tdName, setTdName] = useState("");
  const [tdEmail, setTdEmail] = useState("");
  const [tdPhone, setTdPhone] = useState("+2519");
  const [tdDate, setTdDate] = useState("");
  const [tdTime, setTdTime] = useState("");
  const [tdMessage, setTdMessage] = useState("");

  useEffect(() => {
    if (initialVehicle && (!paramId || initialVehicle.id === paramId)) {
      setVehicle(initialVehicle);
      setActiveImage(initialVehicle.imageUrl);
      setInquiryMsg(`I am interested in this ${initialVehicle.brand} ${initialVehicle.model}. Please let me know when I can inspect it.`);
      setTdMessage(`I would like to schedule a test drive for the ${initialVehicle.brand} ${initialVehicle.model}.`);
      setLoading(false);
      return;
    }

    if (paramId) {
      setLoading(true);
      setError(null);
      vehiclesApi.get(paramId)
        .then((data) => {
          setVehicle(data);
          setActiveImage(data.imageUrl);
          setInquiryMsg(`I am interested in this ${data.brand} ${data.model}. Please let me know when I can inspect it.`);
          setTdMessage(`I would like to schedule a test drive for the ${data.brand} ${data.model}.`);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Vehicle listing not found.");
          setLoading(false);
        });
    }
  }, [initialVehicle, paramId]);

  useEffect(() => {
    if (!vehicle) return;
    setActiveImage(vehicle.imageUrl);

    const fetchSimilar = async () => {
      try {
        const all = await vehiclesApi.list();
        setSimilarVehicles(all.filter(v => v.brand === vehicle.brand && v.id !== vehicle.id && v.status === "approved").slice(0, 4));
      } catch { /* ignore */ }
    };

    const fetchDocs = async () => {
      try {
        const docs = await documentsApi.list(vehicle.id);
        setDocuments(docs);
      } catch { /* ignore */ }
    };

    fetchSimilar();
    fetchDocs();
  }, [vehicle]);

  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-7xl mx-auto w-full p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-slate-900 dark:text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white tracking-tight">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md text-center">{error || "This vehicle listing may have been sold or removed."}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-[#FF4846]/20"
        >
          <ArrowLeft size={14} /> Back to Showroom
        </button>
      </div>
    );
  }

  const images = getVehicleGallery(vehicle);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsApi.create({
        vehicle_id: vehicle.id,
        buyer_name: buyerName,
        buyer_email: buyerEmail || `${buyerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        buyer_phone: buyerPhone,
        message: inquiryMsg,
      });
      onNotify("Inquiry sent successfully! The broker will contact you shortly.", "success");
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("+2519");
    } catch {
      onNotify("Failed to submit inquiry.", "error");
    }
  };

  const handleSubmitTestDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = localStorage.getItem("autobroker_user");
      const user = saved ? JSON.parse(saved) : null;
      await testDrivesApi.create({
        vehicle_id: vehicle.id,
        user_id: user?.id || null,
        name: tdName,
        email: tdEmail,
        phone: tdPhone,
        preferred_date: tdDate,
        preferred_time: tdTime,
        message: tdMessage,
      });
      onNotify("Test drive requested! The broker will confirm your appointment.", "success");
      setShowTestDriveModal(false);
      setTdName("");
      setTdEmail("");
      setTdPhone("+2519");
      setTdDate("");
      setTdTime("");
    } catch {
      onNotify("Failed to schedule test drive.", "error");
    }
  };

  const specItems: { label: string; value: string | number | undefined; icon: React.ReactNode }[] = [
    { label: "Year", value: vehicle.year, icon: <Star size={14} /> },
    { label: "Mileage", value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "0 km", icon: <Compass size={14} /> },
    { label: "Transmission", value: vehicle.transmission, icon: <Zap size={14} /> },
    { label: "Fuel Type", value: vehicle.fuelType, icon: <Zap size={14} /> },
    { label: "Engine", value: vehicle.engineSize || vehicle.engineType, icon: <Cpu size={14} /> },
    { label: "Horsepower", value: vehicle.horsepower ? `${vehicle.horsepower} HP` : undefined, icon: <Gauge size={14} /> },
    { label: "Drive Type", value: vehicle.driveType, icon: <Car size={14} /> },
    { label: "Color", value: vehicle.color, icon: <Star size={14} /> },
    { label: "Body Type", value: vehicle.bodyType, icon: <Car size={14} /> },
    { label: "Condition", value: vehicle.condition, icon: <ShieldCheck size={14} /> },
    { label: "Seats", value: vehicle.seats, icon: <Users size={14} /> },
    { label: "Location", value: vehicle.location, icon: <MapPin size={14} /> },
  ];

  const visibleSpecs = specItems.filter(s => s.value);

  const inspectionBadge = () => {
    const status = vehicle.inspectionStatus;
    if (!status || status === "not_inspected") return null;
    const colors: Record<string, string> = { passed: "bg-emerald-50 text-emerald-700 border-emerald-200", failed: "bg-rose-50 text-rose-700 border-rose-200", pending: "bg-amber-50 text-amber-700 border-amber-200" };
    return (
      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${colors[status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
        <ClipboardCheck size={12} />
        {status === "passed" ? "Inspected & Passed" : status === "failed" ? "Inspection Failed" : "Inspection Pending"}
      </div>
    );
  };

  const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-4 sm:py-8 space-y-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 pb-28 sm:pb-8 transition-colors">
      <SEO
        title={`${vehicle.year} ${vehicle.brand} ${vehicle.model} for Sale in ${vehicle.location || "Addis Ababa"} — ETB ${fmt(vehicle.price)}`}
        description={`${vehicle.year} ${vehicle.brand} ${vehicle.model} available in ${vehicle.location || "Addis Ababa"}. Price: ETB ${fmt(vehicle.price)}. Transmission: ${vehicle.transmission || "Automatic"}, Fuel: ${vehicle.fuelType || "Petrol"}, Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() + " km" : "Low"}. Inspected with verified Libre.`}
        keywords={`${vehicle.brand} ${vehicle.model}, buy ${vehicle.brand} Addis Ababa, ${vehicle.year} ${vehicle.model} Ethiopia, used ${vehicle.brand} Ethiopia, car price ETB`}
        canonical={`/vehicle/${vehicle.id}`}
        image={vehicle.imageUrl}
        type="product"
        schema={buildVehicleSchema(vehicle)}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Vehicles", url: "/vehicles" },
          { name: `${vehicle.year} ${vehicle.brand} ${vehicle.model}`, url: `/vehicle/${vehicle.id}` }
        ]}
      />
      <nav className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center space-x-2 overflow-x-auto whitespace-nowrap pb-1">
        <button onClick={onBack} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">{t("navigation:home")}</button>
        <span>&rsaquo;</span>
        <button onClick={onBack} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">{t("navigation:showroom")}</button>
        <span>&rsaquo;</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate">{vehicle.brand} {vehicle.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative h-64 sm:h-80 md:h-[460px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group">
            <img src={activeImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover transition-transform duration-500" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#FF4846] text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                <ShieldCheck size={11} /> <span>{t("common:states.verified")}</span>
              </span>
              {vehicle.condition === "New" && <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">{vehicle.condition}</span>}
              {inspectionBadge()}
            </div>
            {vehicle.videoUrl && (
              <button onClick={() => setShowVideo(!showVideo)} className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 hover:bg-white text-slate-800 dark:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer">
                <Video size={14} className="text-[#FF4846]" /> {showVideo ? "Hide Video" : "Watch Video"}
              </button>
            )}
          </div>

          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(img)}
                  className={`h-20 w-28 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img ? "border-[#FF4846] shadow-sm" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                  <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {images.length > 3 && (
              <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0B0F19] to-transparent sm:hidden" />
            )}
          </div>

          {showVideo && vehicle.videoUrl && (
            <div className="bg-black rounded-3xl overflow-hidden aspect-video border border-slate-800">
              <video src={vehicle.videoUrl} controls className="w-full h-full" />
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-slate-400 dark:text-slate-400 text-xs font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                  <MapPin size={12} className="text-[#FF4846]" /> {vehicle.location || "Addis Ababa"}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">{t("vehicles:detail.price")}</p>
                <p className="text-2xl md:text-3xl font-black text-[#E63D3B] dark:text-[#4ade80] mt-1">{formatCurrency(vehicle.price)}</p>
                {vehicle.originalPrice > vehicle.price && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Save {formatCurrency(vehicle.originalPrice - vehicle.price)}</p>
                )}
              </div>
            </div>

            {vehicle.status !== "approved" && (
              <div className={`text-xs font-bold px-3 py-2 rounded-xl border ${vehicle.status === "sold" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" : vehicle.status === "pending" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" : vehicle.status === "rejected" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"}`}>
                Status: {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                {vehicle.rejectionReason && <span className="ml-2 font-normal">— {vehicle.rejectionReason}</span>}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">{t("vehicles:detail.technicalSpecs")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {visibleSpecs.map(spec => (
                  <div key={spec.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">{spec.icon}</div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">{spec.label}</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {vehicle.chassisNumber && <div className="text-[11px] text-slate-400 font-mono font-medium">Chassis / VIN: {vehicle.chassisNumber}</div>}

            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">{t("vehicles:detail.overview")}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{vehicle.description || "Full option premium vehicle available for immediate sale."}</p>
            </div>

            {documents.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={14} className="text-[#FF4846]" /> Documents
                </h3>
                <div className="flex flex-wrap gap-2">
                  {documents.map(doc => (
                    <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#E63D3B] dark:text-[#4ade80] bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 transition">
                      <FileText size={12} /> {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <img
                src={getBrokerAvatar(vehicle.brokerName, vehicle.brokerId)}
                alt={vehicle.brokerName || "Verified Broker"}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#FF4846] shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{vehicle.brokerName || t("vehicles:detail.contactBrokerTitle")}</h3>
                  {(vehicle as any).brokerVerified && <BadgeCheck size={16} className="text-[#FF4846] shrink-0 ml-1" />}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}</div>
                  <span className="text-[10px] text-[#E63D3B] dark:text-[#4ade80] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{t("vehicles:detail.brokerVerified")}</span>
                </div>
                {vehicle.brokerLicense && <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">License: {vehicle.brokerLicense}</p>}
                {onViewBrokerProfile && (
                  <button onClick={() => onViewBrokerProfile(vehicle.brokerId)} className="text-[10px] font-bold text-[#E63D3B] dark:text-[#4ade80] hover:underline mt-1 flex items-center gap-1 cursor-pointer">
                    <UserCircle size={12} /> View Broker Profile
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {vehicle.brokerPhone && (
                <a href={`tel:${vehicle.brokerPhone}`} className="w-full bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF4846]/20 active:scale-95">
                  <Phone size={16} /> <span>{t("vehicles:detail.callBroker")}</span>
                </a>
              )}
              {vehicle.brokerPhone && (
                <a href={`https://wa.me/${vehicle.brokerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
                  <span>{t("vehicles:detail.chatWhatsApp")}</span>
                </a>
              )}
              <a href="https://t.me/+251998119134" target="_blank" rel="noreferrer"
                className="w-full bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-sky-200 dark:border-sky-800">
                <Send size={14} /> <span>Telegram</span>
              </a>
            </div>

            {vehicle.inspectionStatus === "passed" && (
              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 rounded-2xl p-3.5 flex items-center gap-2.5">
                <ClipboardCheck size={18} className="text-[#FF4846] shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">150-Point Inspection Passed</p>
                  {vehicle.inspectionNotes && <p className="text-[10px] text-emerald-700 dark:text-emerald-400">{vehicle.inspectionNotes}</p>}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowTestDriveModal(true)}
              className="w-full bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs tracking-wider transition-colors cursor-pointer shadow-md uppercase flex items-center justify-center gap-2 active:scale-95 border border-transparent dark:border-slate-700"
            >
              {t("vehicles:detail.scheduleTestDrive")}
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="w-full text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Flag size={12} /> {t("vehicles:detail.reportListing")}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{t("vehicles:detail.makeInquiry")}</h3>
            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{t("vehicles:detail.inquiryForm.nameLabel")} *</label>
                <input type="text" required value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Your name" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Email</label>
                <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{t("vehicles:detail.inquiryForm.phoneLabel")} *</label>
                <input type="tel" required value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+251 91 234 5678" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">{t("vehicles:detail.inquiryForm.messageLabel")}</label>
                <textarea required rows={4} value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black py-3 rounded-xl text-xs tracking-wider transition-colors cursor-pointer shadow-md shadow-[#FF4846]/20 uppercase">
                {t("vehicles:detail.inquiryForm.submitButton")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed sm:hidden bottom-12 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="min-w-0 pr-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Price</p>
          <p className="text-sm font-black text-slate-950 dark:text-white leading-tight truncate">
            ETB {fmt(vehicle.price)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {vehicle.brokerPhone && (
            <a
              href={`tel:${vehicle.brokerPhone}`}
              className="bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black p-2.5 rounded-xl transition shadow-sm flex items-center justify-center cursor-pointer"
              title="Call Broker"
            >
              <Phone size={16} />
            </a>
          )}
          <button
            onClick={() => setShowTestDriveModal(true)}
            className="bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            Test Drive
          </button>
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          targetType="listing"
          targetId={vehicle.id}
          targetLabel={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
          onClose={() => setShowReportModal(false)}
          onNotify={onNotify}
        />
      )}

      {showTestDriveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
            {/* Sheet Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Schedule Test Drive</h3>
              <button type="button" onClick={() => setShowTestDriveModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitTestDrive} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Full Name *</label>
                  <input type="text" required value={tdName} onChange={e => setTdName(e.target.value)} placeholder="Your name" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Email</label>
                  <input type="email" value={tdEmail} onChange={e => setTdEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Phone *</label>
                  <input type="tel" required value={tdPhone} onChange={e => setTdPhone(e.target.value)} placeholder="+251 91 234 5678" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Preferred Date *</label>
                  <input type="date" required value={tdDate} onChange={e => setTdDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Preferred Time *</label>
                  <input type="time" required value={tdTime} onChange={e => setTdTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Message (Optional)</label>
                <textarea rows={3} value={tdMessage} onChange={e => setTdMessage(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:border-[#FF4846] focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black py-3 rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-[#FF4846]/20 uppercase active:scale-95">Request Test Drive</button>
            </form>
          </div>
        </div>
      )}

      {similarVehicles.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">Similar {vehicle.brand} Vehicles</h2>
              <p className="text-slate-400 text-xs font-semibold">More {vehicle.brand} models available in Addis Ababa</p>
            </div>
            <button onClick={onBack} className="text-[#E63D3B] dark:text-[#4ade80] hover:underline font-bold text-xs md:text-sm flex items-center gap-1 transition-colors cursor-pointer"><span>View All</span><span>&rsaquo;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarVehicles.map(car => (
              <div key={car.id} onClick={() => onViewDetails(car)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#FF4846]/50 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group">
                <div className="h-36 sm:h-40 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-[#FF4846] border border-[#FF4846]/30 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <ShieldCheck size={10} className="text-[#FF4846]" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#FF4846] transition-colors truncate">{car.brand} {car.model}</h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{car.location || "Addis Ababa"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 py-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    <span className="truncate">{car.mileage?.toLocaleString()} km</span>
                    <span className="truncate text-right">{car.transmission}</span>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Price</span>
                      <p className="font-black text-xs text-slate-950 dark:text-white">ETB {fmt(car.price)}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#E63D3B] dark:text-[#4ade80] group-hover:underline">View &rsaquo;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MOBILE STICKY BOTTOM ACTION BAR (lg:hidden) ────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl safe-area-bottom">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Price</span>
          <p className="text-base font-black text-slate-950 dark:text-white leading-tight">
            ETB {fmt(vehicle.price)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {vehicle.brokerPhone && (
            <a
              href={`tel:${vehicle.brokerPhone}`}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-[#FF4846] transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              title="Call Broker"
            >
              <Phone size={17} className="text-[#FF4846]" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setShowTestDriveModal(true)}
            className="px-4 py-2.5 bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black text-xs rounded-xl shadow-md shadow-[#FF4846]/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Calendar size={14} strokeWidth={2.5} />
            <span>Book Test Drive</span>
          </button>
        </div>
      </div>
    </div>
  );
}
