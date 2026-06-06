import React, { useState, useEffect } from "react";
import { ShieldCheck, Phone, MapPin, Star, Compass, Zap, Gauge, Cpu, Users, Car } from "lucide-react";
import { VehicleListing } from "../../../shared/types";

interface VehicleDetailProps {
  vehicle: VehicleListing;
  onBack: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

const CAR_PHOTOS = [
  "1533473359331-0135ef1b58bf",
  "1549399542-7e3f8b79c341",
  "1617814076367-b759c7d7e738",
  "1541899481282-d53bffe3c35d",
  "1503376780353-7e6692767b70",
  "1563720223185-11003d516935",
  "1486006920555-c77dce18193b",
  "1511919884226-fd3cad34687c",
  "1520050206274-a1ae446cb3cc",
  "1609521263047-f8f205293f24",
  "1555215695-3004980ad54e",
  "1618843479313-40f8afb4b4d8",
  "1563720223185-11003d516935",
  "1544631006-bc5e1e0b1b3e",
  "1494977581635-2a630beafae4",
  "1544631006-bc5e1e0b1b3e",
  "155251112-5b1b8b7b2f9e",
  "1558618666-8f3b5a8b9c0d",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
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

export default function VehicleDetail({ vehicle, onBack, onNotify, onViewDetails }: VehicleDetailProps) {
  const images = getVehicleGallery(vehicle);
  const [activeImage, setActiveImage] = useState(images[0]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState(
    `I am interested in this ${vehicle.brand} ${vehicle.model}. Please let me know when I can inspect it.`
  );
  const [similarVehicles, setSimilarVehicles] = useState<VehicleListing[]>([]);

  useEffect(() => {
    setActiveImage(vehicle.imageUrl);
    const fetchSimilar = async () => {
      try {
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const all: VehicleListing[] = await res.json();
          const sameBrand = all.filter(
            v => v.brand === vehicle.brand && v.id !== vehicle.id && v.status === "approved"
          );
          setSimilarVehicles(sameBrand.slice(0, 4));
        }
      } catch { /* ignore */ }
    };
    fetchSimilar();
  }, [vehicle]);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          buyer_name: buyerName,
          buyer_email: buyerEmail || `${buyerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          buyer_phone: buyerPhone,
          message: inquiryMsg
        })
      });
      if (res.ok) {
        onNotify("Inquiry sent successfully! The broker will contact you shortly.", "success");
        setBuyerName(""); setBuyerEmail(""); setBuyerPhone("");
      } else {
        onNotify("Failed to submit inquiry.", "error");
      }
    } catch {
      onNotify("Error submitting inquiry.", "error");
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

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6 bg-slate-50 text-slate-800">

      <nav className="text-xs font-semibold text-slate-400 flex items-center space-x-2">
        <button onClick={onBack} className="hover:text-slate-600 transition-colors">Home</button>
        <span>&rsaquo;</span>
        <button onClick={onBack} className="hover:text-slate-600 transition-colors">Arif Car Sell</button>
        <span>&rsaquo;</span>
        <span className="text-slate-600">{vehicle.brand} {vehicle.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Image */}
          <div className="relative h-64 md:h-[480px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <img
              src={activeImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>Verified</span>
              </span>
              {vehicle.condition === "New" && (
                <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                  New
                </span>
              )}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`h-20 w-28 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img ? "border-orange-500 shadow-sm" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img src={img} alt={`${vehicle.brand} view ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                  <MapPin size={12} />
                  {vehicle.location || "Addis Ababa"}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Asking Price</p>
                <p className="text-2xl md:text-3xl font-black text-blue-950 mt-1">
                  ETB {vehicle.price.toLocaleString()}
                </p>
                {vehicle.originalPrice > vehicle.price && (
                  <p className="text-[11px] text-orange-500 font-bold mt-1">
                    Save ETB {(vehicle.originalPrice - vehicle.price).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm border-b border-slate-100 pb-2 text-slate-800">Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {visibleSpecs.map(spec => (
                  <div key={spec.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      {spec.icon}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">{spec.label}</p>
                      <p className="text-xs font-bold text-slate-700">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chassis Number */}
            {vehicle.chassisNumber && (
              <div className="text-[11px] text-slate-400 font-mono font-medium">
                Chassis / VIN: {vehicle.chassisNumber}
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-sm border-b border-slate-100 pb-2 text-slate-800">Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {vehicle.description || "Full option premium vehicle available for immediate sale."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">

          {/* Broker Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center text-blue-900 font-black text-lg">
                {(vehicle.brokerName || "B").charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{vehicle.brokerName || "Arif Car Sell Broker"}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Verified</span>
                </div>
                {vehicle.brokerLicense && (
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">License: {vehicle.brokerLicense}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {vehicle.brokerPhone && (
                <a
                  href={`tel:${vehicle.brokerPhone}`}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Phone size={16} />
                  <span>Call Now</span>
                </a>
              )}
              {vehicle.brokerPhone && (
                <a
                  href={`https://wa.me/${vehicle.brokerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-800 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-green-200"
                >
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">Send Inquiry</h3>
            <form onSubmit={handleSubmitInquiry} className="space-y-4">

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Full Name *</label>
                <input
                  type="text" required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Email</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Phone Number *</label>
                <input
                  type="tel" required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+251 91 234 5678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Message</label>
                <textarea
                  required rows={4}
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-lg text-xs tracking-wider transition-colors cursor-pointer shadow-sm uppercase"
              >
                Send Inquiry
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Floating Call Button - Mobile Only */}
      {vehicle.brokerPhone && (
        <a
          href={`tel:${vehicle.brokerPhone}`}
          className="fixed sm:hidden bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all active:scale-90"
        >
          <Phone size={22} />
        </a>
      )}

      {/* Similar Vehicles */}
      {similarVehicles.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-200/60">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Similar {vehicle.brand} Vehicles</h2>
              <p className="text-slate-400 text-xs font-semibold">More {vehicle.brand} models available</p>
            </div>
            <button onClick={onBack} className="text-orange-500 hover:text-orange-600 font-bold text-xs md:text-sm flex items-center gap-1 transition-colors">
              <span>View All</span>
              <span>&rsaquo;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarVehicles.map(car => (
              <div
                key={car.id}
                onClick={() => onViewDetails(car)}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer group"
              >
                <div className="h-32 md:h-40 relative bg-slate-100 overflow-hidden">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xs text-slate-800">{car.year} {car.brand} {car.model}</h3>
                    <p className="font-black text-xs text-orange-500">
                      ETB {car.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {car.mileage?.toLocaleString()} km &bull; {car.transmission}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}