import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  FileCheck2, 
  Users, 
  Zap, 
  Scale, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Check, 
  Award, 
  Car, 
  PhoneCall, 
  Sparkles,
  Search,
  BadgeCheck,
  X,
  Calendar,
  Clock,
  MapPin,
  Send,
  Loader2
} from "lucide-react";

interface ServicesPageProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

interface ServiceItem {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  desc: string;
  highlights: string[];
  tag: string;
  priceEstimate: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "inspection",
    icon: ShieldCheck,
    title: "150-Point Physical Inspection",
    subtitle: "Complete Mechanical & Diagnostic Scorecard",
    desc: "Every vehicle listed on our showroom is physically examined by certified mechanics in Addis Ababa. We perform computer OBD-II diagnostic scans, frame and chassis alignment checks, paint-depth analysis to detect past accidents, and high-voltage battery health tests on hybrid and EV powertrains.",
    highlights: [
      "Computerized OBD-II engine & electrical diagnostic scan",
      "Digital paint-depth gauge audit to identify hidden collision repairs",
      "High-voltage battery state-of-health test (Hybrids & EVs)",
      "Brake, suspension, and steering road-safety scorecard"
    ],
    tag: "Physical Audit",
    priceEstimate: "Free for Listed Cars • 3,500 ETB for Private Cars"
  },
  {
    id: "libre",
    icon: FileCheck2,
    title: "Libre & Customs Clearance Audit",
    subtitle: "Zero Outstanding Bank Liens or Duty Disputes",
    desc: "Automotive title fraud and customs duty disputes are widespread in informal Telegram channels. We independently cross-verify the vehicle's Libre (ownership title deed) with the Addis Ababa Transport Bureau records, verifying genuine registration, customs tariff documentation, and bank release stamps.",
    highlights: [
      "Direct Addis Ababa Transport Bureau registry cross-check",
      "Customs duty receipt & tax exemption certificate verification",
      "Commercial bank lien-free & court injunction-free confirmation",
      "Chassis & engine number serial matching against Libre records"
    ],
    tag: "Legal Security",
    priceEstimate: "Included in Concierge • 2,000 ETB Standalone"
  },
  {
    id: "broker-escort",
    icon: Users,
    title: "Licensed Broker Concierge",
    subtitle: "Professional In-Person Viewing & Negotiation",
    desc: "Skip random roadside brokers. We assign an accredited, licensed automotive broker registered with tax identification. Your broker schedules viewings at secure locations, escorts you through the mechanical evaluation, and conducts fair negotiations governed by our legal contract.",
    highlights: [
      "Accredited professional with registered tax identification",
      "Supervised, secure viewings at designated lots in Addis Ababa",
      "Strict 1.5% commission cap enforced by binding contract",
      "No dual-broker splitting or secret seller markup inflation"
    ],
    tag: "Verified Brokers",
    priceEstimate: "Capped 1.5% Commission (No Hidden Fees)"
  },
  {
    id: "ev-advisory",
    icon: Zap,
    title: "Zero-Duty EV Advisory & Sourcing",
    subtitle: "Slash Customs Duties & Lifetime Running Costs",
    desc: "Ethiopia's revolutionary zero customs duty policy on fully electric passenger vehicles makes EVs the most cost-effective investment in the country. We provide expert guidance on EV models (VW ID.4, BYD Song Plus), home charger installations, range efficiency in Addis traffic, and spare part availability.",
    highlights: [
      "Customs tax exemption guidance under Ethiopian Ministry directives",
      "Charging infrastructure & domestic wall-box charger installation advisory",
      "Realistic battery range performance on highland Ethiopian terrains",
      "Warranty tracking and verified battery cell health inspections"
    ],
    tag: "Green Mobility",
    priceEstimate: "Complimentary Consultation"
  },
  {
    id: "escrow",
    icon: Scale,
    title: "Secure Ownership Handover & Escrow",
    subtitle: "Safe Payment & Title Transfer at the Bureau",
    desc: "Finalizing a vehicle purchase involves high-value transactions. We oversee the ownership handover step-by-step, ensuring bank transfers and title deed changes at the Transport Bureau occur simultaneously with legal contracts, preventing payment disputes and title delays.",
    highlights: [
      "Standardized legal sales contract prepared by legal counsel",
      "Coordinated Transport Bureau title transfer appointment",
      "Simultaneous payment confirmation and key/document exchange",
      "Formal receipt and stamped handover confirmation provided"
    ],
    tag: "Safe Settlement",
    priceEstimate: "Standard Legal Escrow Service"
  },
  {
    id: "valuation",
    icon: Calculator,
    title: "Fair Market Vehicle Valuation",
    subtitle: "Accurate Pricing Based on Real Closed Transactions",
    desc: "Whether you are buying or selling, know the true market value of the car before you negotiate. We aggregate genuine closed deal prices across Addis Ababa to provide data-backed valuations, protecting sellers from lowballers and buyers from inflated broker tags.",
    highlights: [
      "Algorithmic valuation based on local transaction records",
      "Mileage and depreciation adjustment for Ethiopian road conditions",
      "Clear price breakdown factoring title stamps and capped fees",
      "Free valuation reports for prospective sellers"
    ],
    tag: "Price Intelligence",
    priceEstimate: "Free Instant Market Analysis"
  }
];

export default function ServicesPage({ onNotify }: ServicesPageProps) {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+251 ");
  const [vehicleModel, setVehicleModel] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [locationArea, setLocationArea] = useState("Bole / Kazanchis");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenBooking = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const handleCloseBooking = () => {
    setSelectedService(null);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onNotify(`Service request for "${selectedService?.title}" submitted! Our broker team will contact you at ${clientPhone} within 1 hour.`, "success");
      handleCloseBooking();
      setClientName("");
      setClientPhone("+251 ");
      setVehicleModel("");
      setNotes("");
    }, 600);
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
      {/* 1. Header Hero (Carento Dark Showroom Style) */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('/images/about/mechanic_inspection.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Services Built on <span className="text-[#22c55e]">Trust & Transparency</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From multi-point mechanical inspections to customs duty audits and transparent broker facilitation, we eliminate the risks of the Ethiopian car market.
          </p>
        </div>
      </section>

      {/* 2. Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Our Core Automotive Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Every service is engineered to guarantee security, fairness, and speed in Addis Ababa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#22c55e]/60 dark:hover:border-[#22c55e]/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] dark:text-[#4ade80] bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 py-1 rounded-full">
                      {s.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white group-hover:text-[#22c55e] transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#16a34a] dark:text-[#4ade80]">
                      {s.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {s.desc}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {s.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wider">Fee Structure:</span>
                    <span>{s.priceEstimate}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleOpenBooking(s)}
                    className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#22c55e]/20 active:scale-95"
                  >
                    <span>Book or Inquire Service</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. The 4-Step Process */}
      <section className="bg-slate-50/70 dark:bg-[#0B0F19]/60 border-y border-slate-200/80 dark:border-slate-800 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              How We Work With You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear, structured steps from first consultation to key handover
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Select or List", desc: "Choose a verified car on our showroom or submit your car for physical inspection." },
              { step: "02", title: "Mechanic Audit", desc: "Comprehensive 150-point diagnostic check and on-site road test with a licensed broker." },
              { step: "03", title: "Libre Verification", desc: "Official title check at the Transport Bureau to confirm lien-free and customs clearance." },
              { step: "04", title: "Safe Handover", desc: "Transparent contract signing, title transfer, and secure key exchange at capped fees." }
            ].map((st, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 space-y-2.5 shadow-xs">
                <span className="text-3xl font-black text-[#22c55e] block">{st.step}</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{st.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to Buy or Sell with Confidence?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Explore hundreds of verified cars in Addis Ababa or connect with our concierge team today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/browse")}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-[#22c55e]/25 active:scale-95"
            >
              Browse Showroom
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95"
            >
              Contact Concierge
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden text-slate-900 dark:text-white">
            <button
              onClick={handleCloseBooking}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#16a34a] dark:text-[#4ade80] bg-[#22c55e]/10 border border-[#22c55e]/30 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {selectedService.tag}
                </span>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {selectedService.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Schedule your service appointment with our certified concierge team.
                </p>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+251 91 123 4567"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Vehicle Model (if known)
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Toyota RAV4 2021"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Addis Ababa Area
                    </label>
                    <select
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition cursor-pointer"
                    >
                      <option value="Bole / Kazanchis">Bole / Kazanchis</option>
                      <option value="CMC / Ayat">CMC / Ayat</option>
                      <option value="Sarbet / Bisrate Gabriel">Sarbet / Bisrate Gabriel</option>
                      <option value="Gotera / Kality">Gotera / Kality</option>
                      <option value="Piassa / Arat Kilo">Piassa / Arat Kilo</option>
                      <option value="Other Area">Other Area</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Special Notes or Vehicle Plate
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific requests or requirements..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md shadow-[#22c55e]/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Confirming Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Confirm Appointment Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
