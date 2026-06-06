import React, { useState, useEffect } from "react";
import { Calendar, Compass, MapPin, Heart, ChevronDown, ShieldCheck } from "lucide-react";
import { VehicleListing } from "../../../shared/types";

interface ShowroomProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  onInquireCar: (car: VehicleListing) => void;
}

export default function Showroom({ onNotify, onInquireCar }: ShowroomProps) {
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedYear, setSelectedYear] = useState("Any Year");
  const [selectedFuel, setSelectedFuel] = useState<string>(""); // empty = All fuels
  const [selectedTransmission, setSelectedTransmission] = useState<string>(""); // empty = All transmissions
  const [selectedLocation, setSelectedLocation] = useState("All Regions");
  const [sortBy, setSortBy] = useState("Newest Listings");

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  // Seed / Mock vehicles matching the screenshot design exactly
  const screenshotVehicles: VehicleListing[] = [
    {
      id: "scr-1",
      brokerId: "brk-1",
      brand: "Toyota",
      model: "RAV4",
      year: 2022,
      mileage: 12000,
      price: 7450000,
      originalPrice: 8000000,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
      description: "Limited Edition 2022 edition",
      fuelType: "Electric",
      transmission: "Automatic",
      location: "Addis Ababa"
    },
    {
      id: "scr-2",
      brokerId: "brk-1",
      brand: "Hyundai",
      model: "Tucson",
      year: 2023,
      mileage: 0,
      price: 6200000,
      originalPrice: 6500000,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      description: "SmartStream 2023",
      fuelType: "Hybrid",
      transmission: "Automatic",
      location: "Addis Ababa"
    },
    {
      id: "scr-3",
      brokerId: "brk-2",
      brand: "Suzuki",
      model: "Dzire",
      year: 2021,
      mileage: 24000,
      price: 2850000,
      originalPrice: 3100000,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
      description: "VXI Plus 2021",
      fuelType: "Petrol",
      transmission: "Automatic",
      location: "Adama"
    },
    {
      id: "scr-4",
      brokerId: "brk-2",
      brand: "Mercedes-Benz",
      model: "C200",
      year: 2020,
      mileage: 45000,
      price: 12500000,
      originalPrice: 13000000,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80",
      description: "Avantgarde 2020",
      fuelType: "Petrol",
      transmission: "Automatic",
      location: "Addis Ababa"
    },
    {
      id: "scr-5",
      brokerId: "brk-1",
      brand: "Volkswagen",
      model: "ID.4",
      year: 2023,
      mileage: 0,
      price: 8900000,
      originalPrice: 9500000,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
      description: "Pro Performance 2023",
      fuelType: "Electric",
      transmission: "Automatic",
      location: "Addis Ababa"
    },
    {
      id: "scr-6",
      brokerId: "brk-2",
      brand: "Toyota",
      model: "Hilux",
      year: 2021,
      mileage: 32000,
      price: 9800000,
      originalPrice: 10500000,
      status: "approved",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
      description: "Double Cabin 2021",
      fuelType: "Diesel",
      transmission: "Manual",
      location: "Bishoftu"
    }
  ];

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      let apiData: VehicleListing[] = [];
      if (res.ok) {
        apiData = await res.json();
        apiData = apiData.filter(v => v.status === "approved");
      }
      
      // Merge unique DB vehicles with screenshot mock vehicles to ensure all screenshot options are visible
      const merged = [...screenshotVehicles];
      apiData.forEach(apiCar => {
        if (!merged.some(m => m.brand === apiCar.brand && m.model === apiCar.model)) {
          merged.push(apiCar);
        }
      });

      setVehicles(merged);
    } catch (err) {
      console.error(err);
      setVehicles(screenshotVehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleClearAll = () => {
    setSelectedBrand("All Brands");
    setMinPrice("");
    setMaxPrice("");
    setSelectedYear("Any Year");
    setSelectedFuel("");
    setSelectedTransmission("");
    setSelectedLocation("All Regions");
    onNotify("All filters cleared.", "info");
  };

  const handleApplyFilters = () => {
    onNotify(`Showing ${filteredVehicles.length} vehicle${filteredVehicles.length !== 1 ? "s" : ""} matching your filters.`, "success");
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(car => {
    if (selectedBrand !== "All Brands" && car.brand !== selectedBrand) return false;
    if (minPrice && car.price < parseInt(minPrice)) return false;
    if (maxPrice && car.price > parseInt(maxPrice)) return false;
    if (selectedYear !== "Any Year" && car.year.toString() !== selectedYear) return false;
    if (selectedFuel && car.fuelType !== selectedFuel) return false;
    if (selectedTransmission && car.transmission !== selectedTransmission) return false;
    if (selectedLocation !== "All Regions" && !car.location.includes(selectedLocation.split(" ")[0])) return false;
    return true;
  });

  const uniqueBrands = ["All Brands", ...Array.from(new Set(vehicles.map(v => v.brand)))];
  const uniqueLocations = ["All Regions", "Addis Ababa", "Adama", "Bishoftu"];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 font-semibold text-xs">
        Loading Inventory...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* 1. Left Sidebar (Filters Panel) */}
      <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h2 className="font-extrabold text-base text-slate-900">Filters</h2>
          <button 
            onClick={handleClearAll}
            className="text-xs text-blue-900 hover:text-blue-950 font-bold transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Brand</label>
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none appearance-none cursor-pointer"
            >
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-4.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Price Range (ETB)</label>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Year</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option>Any Year</option>
              {Array.from({ length: 8 }, (_, i) => 2026 - i).map(yr => (
                <option key={yr} value={yr.toString()}>{yr}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-4.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Fuel Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["Petrol", "Electric", "Diesel", "Hybrid"].map(fuel => (
              <button
                key={fuel}
                onClick={() => setSelectedFuel(prev => prev === fuel ? "" : fuel)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedFuel === fuel 
                    ? "bg-blue-50 border-blue-900 text-blue-900" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {fuel}
              </button>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Transmission</label>
          <div className="grid grid-cols-2 gap-2">
            {["Manual", "Automatic"].map(trans => (
              <button
                key={trans}
                onClick={() => setSelectedTransmission(prev => prev === trans ? "" : trans)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedTransmission === trans 
                    ? "bg-blue-900 border-blue-900 text-white" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {trans}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Location</label>
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none appearance-none cursor-pointer"
            >
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-4.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyFilters}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-colors cursor-pointer uppercase"
        >
          Apply Filters
        </button>

      </aside>

      {/* 2. Right Content Panel */}
      <section className="lg:col-span-9 space-y-6">
        
        {/* Results Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xs text-slate-450 uppercase font-black tracking-wider leading-none">Available Vehicles</h3>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              Showing <strong className="text-slate-800">{filteredVehicles.length}</strong> results in Ethiopia
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer"
              >
                <option>Newest Listings</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <p className="text-slate-400 font-bold text-sm">No vehicles match your current filters.</p>
              <button
                onClick={handleClearAll}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
          {filteredVehicles.map(car => (
            <div 
              key={car.id} 
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-350 hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              
              {/* Image Banner */}
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img 
                  src={car.imageUrl} 
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                
                {/* Verified Badge */}
                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-black tracking-widest py-0.5 px-2 rounded flex items-center gap-1 shadow-sm uppercase">
                  <ShieldCheck size={10} />
                  <span>Verified</span>
                </div>

                {/* Heart Icon Overlay */}
                <button 
                  onClick={() => toggleFavorite(car.id)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border ${
                    favorites.includes(car.id)
                      ? "bg-rose-500 border-rose-400 text-white"
                      : "bg-white/90 border-slate-200 text-slate-400 hover:text-rose-500"
                  }`}
                >
                  <Heart size={14} fill={favorites.includes(car.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Info Area */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 truncate">{car.brand} {car.model}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{car.description}</p>
                    </div>
                    {/* Badge if specific models */}
                    {car.model === "RAV4" && (
                      <span className="bg-blue-50 text-blue-800 text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded shrink-0">NEW</span>
                    )}
                    {car.model === "Dzire" && (
                      <span className="bg-orange-50 text-orange-850 text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded shrink-0">TOP RATED</span>
                    )}
                  </div>
                  <p className="font-black text-sm text-blue-950 pt-1">
                    {car.price.toLocaleString()} ETB
                  </p>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-1 py-2 border-y border-slate-100 text-center text-[10.5px] font-semibold text-slate-500">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 border-x border-slate-100">
                    <Compass size={12} className="text-slate-400" />
                    <span>{(car.mileage / 1000).toFixed(0)}k km</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 truncate">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{car.location.split(" ")[0]}</span>
                  </div>
                </div>

                {/* Button Action */}
                {car.model === "Tucson" ? (
                  <button 
                    onClick={() => onInquireCar(car)}
                    className="w-full text-center border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Contact Seller
                  </button>
                ) : (
                  <button 
                    onClick={() => onInquireCar(car)}
                    className="w-full text-center bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                )}

              </div>

            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 pt-6">
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 cursor-pointer">&lsaquo;</button>
          <button className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">1</button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">2</button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">3</button>
          <span className="text-xs text-slate-400 font-bold px-1">&hellip;</span>
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">42</button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">&rsaquo;</button>
        </div>

      </section>

    </div>
  );
}
