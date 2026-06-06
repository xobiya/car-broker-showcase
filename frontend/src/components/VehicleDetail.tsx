import React, { useState } from "react";
import { ShieldCheck, Phone, MapPin, Star, Compass, Zap } from "lucide-react";
import { VehicleListing } from "../../../shared/types";

interface VehicleDetailProps {
  vehicle: VehicleListing;
  onBack: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onViewDetails: (vehicle: VehicleListing) => void;
}

export default function VehicleDetail({ vehicle, onBack, onNotify, onViewDetails }: VehicleDetailProps) {
  // Mock image gallery based on main image
  const images = [
    vehicle.imageUrl,
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", // Exterior
    "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", // Interior
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", // Rear
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"  // Detail/Engine
  ];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState(
    `I am interested in this ${vehicle.brand} ${vehicle.model}. Please let me know when I can inspect it.`
  );

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          buyer_name: buyerName,
          buyer_email: `${buyerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          buyer_phone: buyerPhone,
          message: inquiryMsg
        })
      });

      if (res.ok) {
        onNotify("Inquiry sent successfully! The broker will contact you shortly.", "success");
        setBuyerName("");
        setBuyerPhone("");
      } else {
        onNotify("Failed to submit inquiry.", "error");
      }
    } catch (err) {
      onNotify("Error submitting inquiry.", "error");
    }
  };

  // Mock similar vehicles (4 items matching the designs)
  const similarVehicles: Partial<VehicleListing>[] = [
    {
      id: "sim-1",
      brand: "Lexus",
      model: "LX 600",
      year: 2022,
      price: 18200000,
      mileage: 5000,
      transmission: "Auto",
      imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "sim-2",
      brand: "Mercedes",
      model: "G63 AMG",
      year: 2021,
      price: 22000000,
      mileage: 12000,
      transmission: "Auto",
      imageUrl: "https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "sim-3",
      brand: "Defender",
      model: "110",
      year: 2023,
      price: 16500000,
      mileage: 0,
      transmission: "Auto",
      imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "sim-4",
      brand: "BMW",
      model: "X7 M60i",
      year: 2023,
      price: 19800000,
      mileage: 800,
      transmission: "Auto",
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6 bg-slate-50 text-slate-800">
      
      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-slate-400 flex items-center space-x-2">
        <button onClick={onBack} className="hover:text-slate-600 transition-colors">Home</button>
        <span>&rsaquo;</span>
        <button onClick={onBack} className="hover:text-slate-600 transition-colors">Browse Cars</button>
        <span>&rsaquo;</span>
        <span className="text-slate-600">{vehicle.brand} {vehicle.model}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Images, Specs, Description) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Image View */}
          <div className="relative h-[480px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
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
              <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                Featured
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img ? "border-orange-500 shadow-sm" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
            <div className="h-20 rounded-xl bg-slate-200/60 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
              +12 More
            </div>
          </div>

          {/* Vehicle Information Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
                  <MapPin size={12} className="text-slate-400" />
                  {vehicle.location || "Bole, Addis Ababa"}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Asking Price</p>
                <p className="text-2xl md:text-3xl font-black text-blue-950 mt-1">
                  ETB {vehicle.price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm border-b border-slate-100 pb-2 text-slate-800">Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                
                {/* Year */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Star size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Year</p>
                    <p className="text-xs font-bold text-slate-700">{vehicle.year}</p>
                  </div>
                </div>

                {/* Mileage */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Compass size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Mileage</p>
                    <p className="text-xs font-bold text-slate-700">{vehicle.mileage.toLocaleString()} km</p>
                  </div>
                </div>

                {/* Transmission */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Transmission</p>
                    <p className="text-xs font-bold text-slate-700">{vehicle.transmission}</p>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Fuel Type</p>
                    <p className="text-xs font-bold text-slate-700">{vehicle.fuelType}</p>
                  </div>
                </div>

                {/* Engine */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Engine</p>
                    <p className="text-xs font-bold text-slate-700">3.3L V8 Turbo</p>
                  </div>
                </div>

                {/* Color */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Color</p>
                    <p className="text-xs font-bold text-slate-700">Pearl White</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-sm border-b border-slate-100 pb-2 text-slate-800">Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {vehicle.description || "Full option premium vehicle available for immediate sale. Pristine condition, imported with duty fully paid. Excellent luxury and comfort, features state-of-the-art tech assists and premium sound system."}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column (Sidebar - Broker Info & Contact Form) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Broker Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            
            {/* Broker Avatar & Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80" 
                  alt="Broker Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Dawit Mekonnen</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">(42 Reviews)</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Authorized Broker since 2018</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <a 
                href="tel:+251911234567"
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone size={14} />
                <span>+251 91 123 4567</span>
              </a>
              <a 
                href="https://wa.me/251911234567" 
                target="_blank" 
                rel="noreferrer"
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-800 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Contact via WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Send Inquiry Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2">Send Inquiry</h3>
            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Message</label>
                <textarea 
                  required
                  rows={4}
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

      {/* Similar Vehicles Section */}
      <section className="space-y-6 pt-10 border-t border-slate-200/60">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Similar Vehicles</h2>
            <p className="text-slate-400 text-xs font-semibold">Hand-picked alternatives for you</p>
          </div>
          <button 
            onClick={onBack}
            className="text-orange-500 hover:text-orange-600 font-bold text-xs md:text-sm flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span>&rsaquo;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarVehicles.map((car) => (
            <div 
              key={car.id} 
              onClick={() => {
                // If it's a real vehicle, we can view its details. Otherwise trigger callback with simulated listings
                const mockVehicle: VehicleListing = {
                  id: car.id!,
                  brokerId: "brk-1",
                  brand: car.brand!,
                  model: car.model!,
                  year: car.year!,
                  price: car.price!,
                  mileage: car.mileage!,
                  transmission: car.transmission!,
                  fuelType: "Benzine",
                  originalPrice: car.price! * 1.1,
                  status: "approved",
                  imageUrl: car.imageUrl!,
                  description: "Alternative premium choice.",
                  location: "Addis Ababa"
                };
                onViewDetails(mockVehicle);
              }}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer group"
            >
              <div className="h-40 relative bg-slate-100 overflow-hidden">
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
                    ETB {car.price?.toLocaleString()}
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

    </div>
  );
}
