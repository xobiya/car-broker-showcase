import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, CheckCircle, Car, TrendingUp, MessageSquare } from "lucide-react";
import { VehicleListing, Lead } from "../../../shared/types";

interface BrokerDashboardProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function BrokerDashboard({ onNotify }: BrokerDashboardProps) {
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListing | null>(null);
  
  // Form fields
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [mileage, setMileage] = useState(0);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [fuelType, setFuelType] = useState("Benzine");
  const [transmission, setTransmission] = useState("Automatic");
  const [location, setLocation] = useState("Addis Ababa");

  // Sale Modal state
  const [selectedLeadForSale, setSelectedLeadForSale] = useState<Lead | null>(null);
  const [salePrice, setSalePrice] = useState(0);

  const brokerId = "brk-1"; // Simulated logged in broker ID

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehRes, leadRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/leads")
      ]);
      
      if (vehRes.ok && leadRes.ok) {
        const allVehs: VehicleListing[] = await vehRes.json();
        const allLeads: Lead[] = await leadRes.json();
        
        // Filter by brokerId
        const myVehs = allVehs.filter(v => v.brokerId === brokerId);
        const myVehIds = new Set(myVehs.map(v => v.id));
        const myLeads = allLeads.filter(l => myVehIds.has(l.vehicleId));
        
        setVehicles(myVehs);
        setLeads(myLeads);
      }
    } catch (err) {
      console.error(err);
      onNotify("Failed to fetch dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        broker_id: brokerId,
        brand,
        model,
        year,
        mileage,
        price,
        original_price: originalPrice || price,
        image_url: imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        description,
        fuel_type: fuelType,
        transmission,
        location
      };

      let res;
      if (editingVehicle) {
        res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        onNotify(editingVehicle ? "Vehicle updated successfully!" : "Vehicle listing submitted for approval!", "success");
        setShowAddForm(false);
        setEditingVehicle(null);
        clearForm();
        fetchData();
      } else {
        onNotify("Error saving vehicle data.", "error");
      }
    } catch (err) {
      onNotify("Network error occurred.", "error");
    }
  };

  const handleEditClick = (v: VehicleListing) => {
    setEditingVehicle(v);
    setBrand(v.brand);
    setModel(v.model);
    setYear(v.year);
    setMileage(v.mileage);
    setPrice(v.price);
    setOriginalPrice(v.originalPrice);
    setImageUrl(v.imageUrl);
    setDescription(v.description);
    setFuelType(v.fuelType);
    setTransmission(v.transmission);
    setLocation(v.location);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        onNotify("Listing removed.", "success");
        fetchData();
      } else {
        onNotify("Failed to delete listing.", "error");
      }
    } catch (err) {
      onNotify("Error deleting listing.", "error");
    }
  };

  const handleLeadStatusChange = async (id: string, status: Lead["status"]) => {
    try {
      const res = await fetch(`/api/leads/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        onNotify(`Lead status updated to ${status}.`, "success");
        fetchData();
      }
    } catch (err) {
      onNotify("Failed to update status.", "error");
    }
  };

  const handleOpenSaleModal = (lead: Lead) => {
    setSelectedLeadForSale(lead);
    setSalePrice(lead.vehiclePrice || 0);
  };

  const handleRecordSale = async () => {
    if (!selectedLeadForSale) return;
    try {
      // Calculate 1% platform commission
      const commission = Math.round(salePrice * 0.01);
      
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: selectedLeadForSale.vehicleId,
          broker_id: brokerId,
          buyer_id: selectedLeadForSale.buyerId,
          sale_price: salePrice,
          commission: commission
        })
      });

      if (res.ok) {
        // Update lead status to sold
        await fetch(`/api/leads/${selectedLeadForSale.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sold" })
        });

        onNotify("Sale recorded and vehicle marked as SOLD!", "success");
        setSelectedLeadForSale(null);
        fetchData();
      } else {
        onNotify("Failed to record sale.", "error");
      }
    } catch (err) {
      onNotify("Error recording sale.", "error");
    }
  };

  const clearForm = () => {
    setBrand("");
    setModel("");
    setYear(new Date().getFullYear());
    setMileage(0);
    setPrice(0);
    setOriginalPrice(0);
    setImageUrl("");
    setDescription("");
    setFuelType("Benzine");
    setTransmission("Automatic");
    setLocation("Addis Ababa");
  };

  const activeVehicles = vehicles.filter(v => v.status === "approved").length;
  const pendingVehicles = vehicles.filter(v => v.status === "pending").length;
  const soldVehicles = vehicles.filter(v => v.status === "sold").length;
  const newLeadsCount = leads.filter(l => l.status === "new").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400 font-mono text-xs">
        Loading Broker Workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#10121A] border border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Active Listings</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold text-gray-100">{activeVehicles}</span>
            <span className="text-[9px] bg-emerald-950/45 border border-emerald-900/40 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
        </div>

        <div className="bg-[#10121A] border border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Pending Approval</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold text-yellow-500">{pendingVehicles}</span>
            <span className="text-[9px] bg-yellow-950/20 border border-yellow-900/35 text-yellow-550 font-bold px-1.5 py-0.5 rounded">
              Awaiting Review
            </span>
          </div>
        </div>

        <div className="bg-[#10121A] border border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Total Sales</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold text-gray-100">{soldVehicles}</span>
            <span className="text-[9px] bg-blue-950/45 border border-blue-900/40 text-blue-400 font-bold px-1.5 py-0.5 rounded">
              Closed Deals
            </span>
          </div>
        </div>

        <div className="bg-[#10121A] border border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">New Inquiries</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold text-pink-400">{newLeadsCount}</span>
            <span className="text-[9px] bg-pink-950/45 border border-pink-900/45 text-pink-400 font-bold px-1.5 py-0.5 rounded animate-pulse">
              Active Leads
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-sm font-mono font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
          <Car size={16} /> My Vehicle Allocations
        </h2>
        <button
          onClick={() => {
            setEditingVehicle(null);
            clearForm();
            setShowAddForm(!showAddForm);
          }}
          className="text-xs bg-yellow-600 hover:bg-yellow-500 text-gray-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Sourced Car
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleAddOrUpdate} className="bg-[#10121A] border border-gray-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider">
            {editingVehicle ? "Edit Sourced Vehicle" : "Add New Sourced Vehicle"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Brand</label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Toyota"
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-yellow-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Model</label>
              <input
                type="text"
                required
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. RAV4"
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-yellow-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Mileage (km)</label>
              <input
                type="number"
                value={mileage}
                onChange={e => setMileage(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Sourced Price (ETB)</label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-yellow-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">MSRP Retail Price (ETB)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(parseInt(e.target.value))}
                placeholder="Optional"
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-yellow-600/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Fuel Type</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
              >
                <option value="Benzine">Benzine</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Transmission</label>
              <select
                value={transmission}
                onChange={e => setTransmission(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-mono uppercase">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-mono uppercase">Description / Sourcing Notes</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Detail import history, options, taxes, custom clear status..."
              className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingVehicle(null);
                clearForm();
              }}
              className="text-xs text-gray-400 hover:text-gray-200 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs bg-yellow-600 hover:bg-yellow-500 text-gray-950 font-bold px-5 py-2 rounded-xl"
            >
              {editingVehicle ? "Save Changes" : "Submit Vehicle"}
            </button>
          </div>
        </form>
      )}

      {/* Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="bg-[#10121A] border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="p-4 flex gap-4">
              <img
                src={v.imageUrl}
                alt={`${v.brand} ${v.model}`}
                className="w-24 h-20 object-cover rounded-xl bg-gray-950 shrink-0"
              />
              <div className="space-y-1 overflow-hidden">
                <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-widest block">{v.year} model</span>
                <h4 className="text-sm font-bold text-gray-200 truncate">{v.brand} {v.model}</h4>
                <p className="text-xs text-gray-400 font-medium">{v.price.toLocaleString()} ETB</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    v.status === "approved" 
                      ? "bg-emerald-950/20 border-emerald-900 text-emerald-400"
                      : v.status === "sold"
                      ? "bg-blue-950/20 border-blue-900 text-blue-400"
                      : "bg-yellow-950/20 border-yellow-900 text-yellow-550"
                  }`}>
                    {v.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{v.location}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#141722]/60 px-4 py-2.5 border-t border-gray-900 flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-500">{v.fuelType} • {v.transmission}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(v)}
                  className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-gray-200 rounded-lg transition"
                  title="Edit Listing"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-rose-400 rounded-lg transition"
                  title="Remove Listing"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <div className="col-span-2 text-center py-10 bg-[#10121A] border border-gray-800 border-dashed rounded-2xl text-gray-500 text-xs">
            No active vehicle listing found. Click "Add Sourced Car" to submit one.
          </div>
        )}
      </div>

      {/* Leads / Customer Inquiries Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={16} /> Buyer Inquiries & Leads Pipeline
        </h2>
        <div className="bg-[#10121A] border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-900">
          {leads.map(l => (
            <div key={l.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#717A95] font-mono block">
                    Inquiry on: <strong className="text-gray-300">{l.vehicleBrand} {l.vehicleModel}</strong> ({l.vehiclePrice?.toLocaleString()} ETB)
                  </span>
                  <h4 className="text-xs font-bold text-gray-200">{l.buyerName} ({l.buyerPhone})</h4>
                  <p className="text-xs text-gray-400 italic">"{l.message}"</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    l.status === "new" 
                      ? "bg-pink-950/40 border border-pink-900 text-pink-400"
                      : l.status === "negotiating"
                      ? "bg-yellow-950/20 border border-yellow-900 text-yellow-550"
                      : l.status === "sold"
                      ? "bg-emerald-950/20 border border-emerald-900 text-emerald-400"
                      : "bg-gray-800 text-gray-400"
                  }`}>
                    {l.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(l.inquiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {l.status !== "sold" && (
                  <>
                    <button
                      onClick={() => handleLeadStatusChange(l.id, "negotiating")}
                      className="text-[11px] border border-gray-800 hover:border-gray-750 text-gray-300 font-medium px-2.5 py-1 rounded-lg transition"
                    >
                      Negotiating
                    </button>
                    <button
                      onClick={() => handleOpenSaleModal(l)}
                      className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <TrendingUp size={11} /> Record Sale
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {leads.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-xs font-sans">
              No leads currently active on your listings.
            </div>
          )}
        </div>
      </div>

      {/* Record Sale Modal */}
      {selectedLeadForSale && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10121A] w-full max-w-md border border-gray-800 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-900 pb-3">
              <h3 className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle size={16} /> Record Deal Completion
              </h3>
              <button
                onClick={() => setSelectedLeadForSale(null)}
                className="text-gray-500 hover:text-gray-300 text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-400">
              <p>
                Confirm final negotiated selling price for the <strong>{selectedLeadForSale.vehicleBrand} {selectedLeadForSale.vehicleModel}</strong>.
              </p>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase block">Final Sale Price (ETB)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={e => setSalePrice(parseInt(e.target.value))}
                  className="w-full text-xs p-2.5 bg-[#090A0E] text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-emerald-600/50"
                />
              </div>
              <div className="bg-emerald-950/20 border border-emerald-900/60 rounded-xl p-3 text-emerald-300 space-y-1">
                <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">Estimated Platform Commission (1%)</span>
                <span className="text-sm font-extrabold block">{(salePrice * 0.01).toLocaleString()} ETB</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLeadForSale(null)}
                className="text-xs text-gray-400 hover:text-gray-200 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordSale}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold px-5 py-2 rounded-xl"
              >
                Confirm Sold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
