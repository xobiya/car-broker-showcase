import React, { useState, useEffect } from "react";
import { Search, Shield, ShieldCheck, Users, Lock, ArrowRight, Car, LogIn, UserPlus } from "lucide-react";
import { VehicleListing, User } from "../../../shared/types";
import { vehiclesApi } from "../lib/api";

interface HomePageProps {
  currentUser?: User | null;
  onViewDetails: (vehicle: VehicleListing) => void;
  onBrowse: (filters?: { brand?: string; model?: string; year?: string; priceRange?: string }) => void;
  onBecomeBroker: () => void;
  onViewBrokerProfile?: (brokerId: string) => void;
  onChooseRole?: () => void;
}

const FALLBACK_VEHICLES: VehicleListing[] = [
  {
    id: "fb-1", brokerId: "brk-1", brand: "Toyota", model: "RAV4", year: 2022,
    mileage: 12000, price: 7450000, originalPrice: 8000000, status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    description: "Limited Edition 2022", fuelType: "Electric", transmission: "Automatic", location: "Addis Ababa",
    color: "Silver", engineSize: "Electric", engineType: "Electric", horsepower: 201,
  },
  {
    id: "fb-2", brokerId: "brk-2", brand: "Hyundai", model: "Tucson", year: 2023,
    mileage: 0, price: 6200000, originalPrice: 6500000, status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
    description: "SmartStream 2023", fuelType: "Hybrid", transmission: "Automatic", location: "Addis Ababa",
    color: "Black", engineSize: "2.0L", engineType: "V4", horsepower: 156,
  },
  {
    id: "fb-3", brokerId: "brk-1", brand: "Suzuki", model: "Dzire", year: 2021,
    mileage: 24000, price: 2850000, originalPrice: 3100000, status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
    description: "VXI Plus 2021", fuelType: "Benzine", transmission: "Automatic", location: "Adama",
    color: "White", engineSize: "1.2L", engineType: "V4", horsepower: 83,
  },
  {
    id: "fb-4", brokerId: "brk-2", brand: "Mercedes-Benz", model: "C200", year: 2020,
    mileage: 45000, price: 12500000, originalPrice: 13000000, status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80",
    description: "Avantgarde 2020", fuelType: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    color: "Black", engineSize: "2.0L", engineType: "V4", horsepower: 181,
  },
  {
    id: "fb-5", brokerId: "brk-1", brand: "Volkswagen", model: "ID.4", year: 2023,
    mileage: 0, price: 8900000, originalPrice: 9500000, status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
    description: "Pro Performance 2023", fuelType: "Electric", transmission: "Automatic", location: "Addis Ababa",
    color: "White", engineSize: "Electric", engineType: "Electric", horsepower: 201,
  },
  {
    id: "fb-6", brokerId: "brk-2", brand: "Toyota", model: "Hilux", year: 2021,
    mileage: 32000, price: 9800000, originalPrice: 10500000, status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    description: "Double Cabin 2021", fuelType: "Diesel", transmission: "Manual", location: "Bishoftu",
    color: "Gold", engineSize: "3.0L", engineType: "V4", horsepower: 201,
  },
];

export default function HomePage({ currentUser, onViewDetails, onBrowse, onBecomeBroker, onChooseRole }: HomePageProps) {
  const [vehicles, setVehicles] = useState<VehicleListing[]>(FALLBACK_VEHICLES);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  
  // Search state
  const [selectedBrand, setSelectedBrand] = useState("Any Brand");
  const [selectedModel, setSelectedModel] = useState("Any Model");
  const [selectedYear, setSelectedYear] = useState("Any Year");
  const [selectedPrice, setSelectedPrice] = useState("Any Price");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehiclesApi.list();
        if (res) {
          const data = res;
          const approved = data.filter(v => v.status === "approved");
          if (approved.length > 0) setVehicles(approved);
        }
      } catch (err) {
        console.error("Failed to load vehicles for homepage", err);
      } finally {
        setLoaded(true);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const uniqueBrands = Array.from(new Set(vehicles.map(v => v.brand)));
    setBrands(uniqueBrands);
  }, [vehicles]);

  // Update models list when brand changes
  useEffect(() => {
    if (selectedBrand === "Any Brand") {
      setModels([]);
      setSelectedModel("Any Model");
    } else {
      const filteredModels = Array.from(
        new Set(vehicles.filter(v => v.brand === selectedBrand).map(v => v.model))
      );
      setModels(filteredModels);
      setSelectedModel("Any Model");
    }
  }, [selectedBrand, vehicles]);

  const handleSearch = () => {
    onBrowse({
      brand: selectedBrand !== "Any Brand" ? selectedBrand : undefined,
      model: selectedModel !== "Any Model" ? selectedModel : undefined,
      year: selectedYear !== "Any Year" ? selectedYear : undefined,
      priceRange: selectedPrice !== "Any Price" ? selectedPrice : undefined
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      
      {/* 1. Hero Section */}
      <section 
        className="relative min-h-[500px] sm:min-h-[560px] flex flex-col justify-center items-center px-4 sm:px-6 bg-cover bg-center py-16 sm:py-24"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')` 
        }}
      >
        <div className="max-w-4xl w-full text-center text-white space-y-6 sm:space-y-8 z-10">

          {currentUser ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold">
                <ShieldCheck size={14} className="text-emerald-400" />
                Welcome back, {currentUser.name}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">
                {currentUser.role === "broker" ? "Brokerage Control Center" :
                 currentUser.role === "admin" ? "Administrative Portal" :
                 "Verified Automotive Exchange"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-200/90 max-w-xl mx-auto font-medium leading-relaxed">
                {currentUser.role === "broker" ? "Manage listings, track buyer inquiries, and finalize sales." :
                 currentUser.role === "admin" ? "Oversee listings, verify brokers, and monitor platform health." :
                 "Browse certified pre-owned and new vehicles verified by licensed brokers."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {currentUser.role === "buyer" && (
                  <button onClick={() => onBrowse()}
                    className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    Explore Showroom
                  </button>
                )}
                {currentUser.role === "broker" && (
                  <button onClick={onBecomeBroker}
                    className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    Open Broker Dashboard
                  </button>
                )}
                {currentUser.role === "admin" && (
                  <button onClick={onBecomeBroker}
                    className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    Open Admin Panel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-200">
                <ShieldCheck size={14} className="text-emerald-400" />
                Verified Automotive Marketplace
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-md leading-tight">
                Find Your Next Car with Absolute Confidence
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-200/90 max-w-xl mx-auto font-medium leading-relaxed">
                Connecting genuine car buyers directly with verified, licensed automotive brokers across central and regional hubs.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button onClick={() => onBrowse()}
                  className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Browse Showroom
                </button>
                <button onClick={onChooseRole}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3 rounded-xl text-xs border border-white/30 backdrop-blur-sm transition cursor-pointer"
                >
                  Join as Seller / Broker
                </button>
              </div>
            </>
          )}

          {/* Quick Search Card - always shown */}
          {/* Quick Search Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl text-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end max-w-4xl mx-auto border border-slate-200/80 text-left">
            
            {/* Brand Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Brand</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0F4C81] focus:outline-none cursor-pointer"
              >
                <option>Any Brand</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Model Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={selectedBrand === "Any Brand"}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0F4C81] focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                <option>Any Model</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Year Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0F4C81] focus:outline-none cursor-pointer"
              >
                <option>Any Year</option>
                {Array.from({ length: 6 }, (_, i) => 2026 - i).map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Price Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Price Range</label>
              <select 
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0F4C81] focus:outline-none cursor-pointer"
              >
                <option>Any Price</option>
                <option value="under-5m">Under 5M ETB</option>
                <option value="5m-10m">5M - 10M ETB</option>
                <option value="10m-20m">10M - 20M ETB</option>
                <option value="over-20m">Over 20M ETB</option>
              </select>
            </div>

            {/* Search Button */}
            <button 
              onClick={handleSearch}
              className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer w-full shadow-sm"
            >
              <Search size={14} />
              <span>Search Cars</span>
            </button>

          </div>

          {/* Quick trust metrics row */}
          <div className="hidden sm:flex items-center justify-center gap-6 pt-2 text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> 150-Point Inspection</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span>Licensed Addis Ababa Brokers</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span>Verified Title & Customs</span>
          </div>
        </div>
      </section>

      {/* 2. Featured Listings Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-12 sm:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Featured Listings</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Hand-picked premium vehicles inspected and ready for sale.</p>
          </div>
          <button 
            onClick={() => onBrowse()}
            className="self-start sm:self-auto text-[#0F4C81] hover:text-blue-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>View All Vehicles</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {vehicles.slice(0, 4).map(car => (
            <div 
              key={car.id} 
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all flex flex-col overflow-hidden group w-full"
            >
              {/* Image Container */}
              <div className="h-44 sm:h-48 relative bg-slate-100 overflow-hidden">
                <img 
                  src={car.imageUrl} 
                  alt={`${car.brand} ${car.model}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black tracking-widest py-0.5 px-2 rounded-md flex items-center gap-1 shadow-sm uppercase">
                  <ShieldCheck size={10} />
                  <span>Verified</span>
                </div>
                {car.condition === "New" && (
                  <span className="absolute bottom-3 left-3 bg-[#0F4C81] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    New
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{car.brand} {car.model}</h3>
                    <span className="font-black text-xs text-[#0F4C81] shrink-0 whitespace-nowrap">
                      {(car.price / 1000000).toFixed(1)}M ETB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {car.year} &bull; {car.transmission} &bull; {car.fuelType}
                  </p>
                </div>

                <button 
                  onClick={() => onViewDetails(car)}
                  className="w-full text-center border border-slate-200 hover:bg-slate-50 text-slate-800 hover:text-slate-900 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-12 font-medium text-xs">
              No vehicles available at this time.
            </div>
          )}
        </div>
      </section>

      {/* 3. Why Choose Arif Car Sell Section */}
      <section className="bg-slate-100/70 py-12 sm:py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-10 sm:space-y-12 text-center">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Built for Trust & Transparency in Auto Trade</h2>
            <p className="text-slate-500 text-xs sm:text-sm">We eliminate market uncertainty through physical vehicle verification and licensed broker accountability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Box 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F4C81] flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">150-Point Physical Inspection</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Every vehicle is inspected for chassis integrity, engine condition, mileage authenticity, and customs paperwork validity.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Licensed Professional Brokers</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Direct contact with verified brokers who handle vehicle viewing, title transfer, and negotiation transparently.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Transparent Pricing & Records</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                No duplicate or ghost listings. Real asking prices with verifiable broker commission caps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Broker CTA Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-14 sm:py-18 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 relative z-10">
          {currentUser?.role === "broker" ? (
            <>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight">Manage Your Auto Brokerage</h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Track buyer inquiries in real time, upload verified inspection documents, and record sales on your dashboard.
              </p>
              <button onClick={onBecomeBroker}
                className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-7 py-3 rounded-xl text-xs tracking-wider transition cursor-pointer shadow-md inline-block"
              >
                Go to Broker Portal
              </button>
            </>
          ) : currentUser?.role === "admin" ? (
            <>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight">System Control Panel</h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Review pending listing approvals, audit user activities, and manage platform brokers.
              </p>
              <button onClick={onBecomeBroker}
                className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-7 py-3 rounded-xl text-xs tracking-wider transition cursor-pointer shadow-md inline-block"
              >
                Open Admin Panel
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight">Are You a Car Seller or Automotive Broker?</h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Join our verified automotive exchange. List your inventory to thousands of active buyers with transparent commission tracking.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button onClick={onBecomeBroker}
                  className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider transition cursor-pointer shadow-md"
                >
                  Register as Broker
                </button>
                <button onClick={onChooseRole}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-xs border border-white/20 transition cursor-pointer"
                >
                  Learn More
                </button>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
}
