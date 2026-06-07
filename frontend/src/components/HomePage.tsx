import React, { useState, useEffect } from "react";
import { Search, Shield, ShieldCheck, Users, Lock, ArrowRight, Car, LogIn, UserPlus } from "lucide-react";
import { VehicleListing, User } from "../../../shared/types";

interface HomePageProps {
  currentUser?: User | null;
  onViewDetails: (vehicle: VehicleListing) => void;
  onBrowse: (filters?: { brand?: string; model?: string; year?: string; priceRange?: string }) => void;
  onBecomeBroker: () => void;
  onViewBrokerProfile?: (brokerId: string) => void;
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

export default function HomePage({ currentUser, onViewDetails, onBrowse, onBecomeBroker }: HomePageProps) {
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
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const data: VehicleListing[] = await res.json();
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
        className="relative min-h-[550px] flex flex-col justify-center items-center px-4 bg-cover bg-center py-20"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')` 
        }}
      >
        <div className="max-w-4xl w-full text-center text-white space-y-8 z-10">

          {currentUser ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold mb-2">
                <ShieldCheck size={12} />
                Welcome back, {currentUser.name}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                {currentUser.role === "broker" ? "Manage Your Listings" :
                 currentUser.role === "admin" ? "Control Center" :
                 "Find Your Next Car"}
              </h1>
              <p className="text-sm md:text-base text-blue-100/80 max-w-xl mx-auto font-medium">
                {currentUser.role === "broker" ? "Track leads, manage inventory, and close more deals." :
                 currentUser.role === "admin" ? "Oversee platform activity, brokers, and revenue." :
                 "Browse thousands of verified vehicles from trusted brokers across Ethiopia."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {currentUser.role === "buyer" && (
                  <button onClick={() => onBrowse()}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Browse Vehicles
                  </button>
                )}
                {currentUser.role === "broker" && (
                  <button onClick={onBecomeBroker}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                )}
                {currentUser.role === "admin" && (
                  <button onClick={onBecomeBroker}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
                Find Your Next Car
              </h1>
              <p className="text-sm md:text-base text-blue-100/80 max-w-xl mx-auto font-medium">
                Browse thousands of verified vehicles from trusted brokers across Ethiopia.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button onClick={() => onBrowse()}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Browse Vehicles
                </button>
                <button onClick={onBecomeBroker}
                  className="bg-slate-900/50 hover:bg-slate-900/80 text-white font-semibold px-6 py-3 rounded-lg text-xs border border-white/40 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  Become a Broker
                </button>
              </div>
            </>
          )}

          {/* Quick Search Card - always shown */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-xl text-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end max-w-4xl mx-auto border border-slate-200">
            
            {/* Brand Select */}
            <div className="text-left space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Brand</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option>Any Brand</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Model Select */}
            <div className="text-left space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={selectedBrand === "Any Brand"}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none disabled:opacity-50"
              >
                <option>Any Model</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Year Select */}
            <div className="text-left space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Year</label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
              >
                <option>Any Year</option>
                {Array.from({ length: 6 }, (_, i) => 2026 - i).map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Price Select */}
            <div className="text-left space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Price Range</label>
              <select 
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
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
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
            >
              <Search size={14} />
              <span>Search</span>
            </button>

          </div>
        </div>
      </section>

      {/* 2. Featured Listings Section */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 space-y-10">
        <div className="flex justify-between items-end border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Featured Listings</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Hand-picked premium vehicles from verified brokers.</p>
          </div>
          <button 
            onClick={() => onBrowse()}
            className="text-orange-500 hover:text-orange-600 font-bold text-xs md:text-sm flex items-center gap-1 transition-colors"
          >
            <span>View All Inventory</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.slice(0, 4).map(car => (
            <div 
              key={car.id} 
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Image Container */}
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img 
                  src={car.imageUrl} 
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-black tracking-widest py-0.5 px-2 rounded flex items-center gap-1 shadow-sm uppercase">
                  <ShieldCheck size={10} />
                  <span>Verified</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm text-slate-800 truncate">{car.brand} {car.model}</h3>
                    <span className="font-black text-xs text-orange-500 shrink-0">
                      {(car.price / 1000000).toFixed(1)}M ETB
                    </span>
                  </div>
                  {/* Specifications subtext */}
                  <p className="text-[11px] text-slate-400 font-medium">
                    {car.year} &bull; {car.transmission} &bull; {car.fuelType}
                  </p>
                </div>

                <button 
                  onClick={() => onViewDetails(car)}
                  className="w-full text-center border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-10 font-medium text-xs">
              No vehicles available.
            </div>
          )}
        </div>
      </section>

      {/* 3. Why Choose AutoBroker Ethiopia Section */}
      <section className="bg-slate-100/80 py-16 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto w-full px-6 space-y-12 text-center">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Why Choose Arif Car Sell</h2>
            <p className="text-slate-500 text-xs md:text-sm">We provide the most secure and efficient way to buy or sell vehicles in Ethiopia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shadow-inner">
                <Shield size={24} />
              </div>
              <h3 className="font-bold text-base">Verified Listings</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Every car listed goes through a 150-point inspection to ensure quality and authenticity.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shadow-inner">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-base">Trusted Brokers</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Connect with licensed automotive professionals who manage the entire transaction for you.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shadow-inner">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-base">Secure Transactions</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Our secure payment and documentation systems protect both buyers and sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Broker CTA Banner */}
      <section className="bg-blue-950 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90" />
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          {currentUser?.role === "broker" ? (
            <>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Your brokerage dashboard awaits</h2>
              <p className="text-blue-200/80 text-xs md:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Manage your listings, respond to leads, and track your earnings all in one place.
              </p>
              <button onClick={onBecomeBroker}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg text-xs tracking-wider transition-all cursor-pointer shadow-md inline-block"
              >
                Go to Dashboard
              </button>
            </>
          ) : currentUser?.role === "admin" ? (
            <>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Platform administration</h2>
              <p className="text-blue-200/80 text-xs md:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Monitor listings, manage brokers, and review platform revenue.
              </p>
              <button onClick={onBecomeBroker}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg text-xs tracking-wider transition-all cursor-pointer shadow-md inline-block"
              >
                Open Admin Panel
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Want to scale your brokerage business?</h2>
              <p className="text-blue-200/80 text-xs md:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Join Ethiopia's largest network of verified brokers and gain access to thousands of daily leads.
              </p>
              <button onClick={onBecomeBroker}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg text-xs tracking-wider transition-all cursor-pointer shadow-md inline-block"
              >
                Register as a Broker
              </button>
            </>
          )}
        </div>
      </section>

    </div>
  );
}
