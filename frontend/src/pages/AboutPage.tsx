import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Users, 
  Handshake, 
  Car, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  BadgeCheck, 
  Phone, 
  Mail, 
  Send, 
  ArrowUpRight,
  Check,
  MapPin,
  Clock,
  Star
} from "lucide-react";

interface AboutPageProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

interface BrokerMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  license: string;
  phone: string;
  email: string;
  telegram: string;
  deals: number;
  rating: number;
  image: string;
}

const BROKERS: BrokerMember[] = [
  {
    id: "yonas",
    name: "Yonas Hailu",
    role: "Senior Automotive Broker",
    specialty: "Sedans & Luxury Crossovers",
    license: "AA-BRK-4091",
    phone: "+251 91 123 4567",
    email: "yonas.h@arifcarsell.et",
    telegram: "@yonas_broker",
    deals: 420,
    rating: 4.9,
    image: "/images/brokers/yonas.jpg"
  },
  {
    id: "bethzatha",
    name: "Bethzatha Assefa",
    role: "EV & Import Specialist",
    specialty: "Zero-Duty EV Advisory",
    license: "AA-BRK-3812",
    phone: "+251 92 888 7766",
    email: "bethzatha.a@arifcarsell.et",
    telegram: "@bethzatha_ev",
    deals: 310,
    rating: 5.0,
    image: "/images/brokers/bethzatha.jpg"
  },
  {
    id: "mesfin",
    name: "Mesfin Tadesse",
    role: "Fleet & Commercial Broker",
    specialty: "Pickups, Vans & Heavy Fleet",
    license: "AA-BRK-5104",
    phone: "+251 91 999 2211",
    email: "mesfin.t@arifcarsell.et",
    telegram: "@mesfin_fleet",
    deals: 580,
    rating: 4.8,
    image: "/images/brokers/mesfin.jpg"
  },
  {
    id: "dawit",
    name: "Dawit Lemma",
    role: "Transport Bureau Escrow Officer",
    specialty: "Libre Audits & Title Transfer",
    license: "AA-BRK-2290",
    phone: "+251 94 444 3322",
    email: "dawit.l@arifcarsell.et",
    telegram: "@dawit_legal",
    deals: 390,
    rating: 4.9,
    image: "/images/brokers/dawit.jpg"
  }
];

export default function AboutPage({ onNotify }: AboutPageProps) {
  const navigate = useNavigate();
  const [selectedBroker, setSelectedBroker] = useState<BrokerMember | null>(null);

  const handleBrokerContact = (broker: BrokerMember, method: "phone" | "email" | "telegram") => {
    if (method === "phone") {
      onNotify(`Calling ${broker.name} at ${broker.phone}...`, "info");
    } else if (method === "telegram") {
      onNotify(`Opening Telegram chat with ${broker.name} (${broker.telegram})...`, "info");
    } else {
      onNotify(`Emailing ${broker.name} (${broker.email})...`, "info");
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 pb-20">
      
      {/* 1. Showroom Top Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 md:px-8 border-b border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
            <Sparkles size={14} />
            <span>Pioneering Trust & Institutional Standards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
            About <span className="text-amber-400">Arif Car Sell</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The verified automotive marketplace built to eliminate roadside fraud, hidden price inflation, and title deed disputes in Ethiopia.
          </p>
        </div>
      </section>

      {/* 2. Carento-Style "Our Mission" Section with 4-Photo Collage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block bg-amber-100 text-amber-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Our Mission
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Sell your car at a fair price. <br className="hidden sm:inline" />
              Get started with us today.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Our mission is to make vehicle buying and selling easy, accessible, and transparent for everyone across Ethiopia. We believe that dealing in automobiles should be a hassle-free, secure experience, and we're dedicated to ensuring that every customer finds the perfect verified vehicle for their journey.
            </p>

            {/* Checklist */}
            <div className="space-y-3.5 pt-2">
              {[
                "Explore a wide range of verified vehicles and inspection options to suit your needs",
                "Comprehensive Libre title & customs audit for complete peace of mind",
                "24/7 dedicated broker concierge support for assistance anytime, anywhere"
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/browse")}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-7 py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/25 flex items-center gap-2 active:scale-95"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right 4-Photo Collage Column */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Column 1 */}
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                  <img 
                    src="/images/about/customer_handover.jpg" 
                    alt="Happy Ethiopian car buyers with keys in Addis Ababa" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                  <img 
                    src="/images/brokers/bethzatha.jpg" 
                    alt="Dedicated automotive advisor" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                  <img 
                    src="/images/about/mechanic_inspection.jpg" 
                    alt="Certified mechanic and client during 150-point diagnostic check in Addis Ababa" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                  <img 
                    src="/images/brokers/dawit.jpg" 
                    alt="Transport Bureau title transfer and escrow consultation" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Carento-Style "Meet Our Brokers" Section */}
      <section className="bg-slate-50/80 border-y border-slate-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Awesome Teams
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Meet Our Brokers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Licensed, certified automotive specialists across Addis Ababa dedicated to transparent negotiations and verified vehicle history.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {BROKERS.map((broker) => (
              <div 
                key={broker.id}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Portrait photo */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                    <img 
                      src={broker.image} 
                      alt={broker.name} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-black text-amber-800 shadow-sm flex items-center gap-1 border border-amber-200">
                      <BadgeCheck size={12} className="text-amber-600" />
                      <span>{broker.license}</span>
                    </div>
                  </div>

                  {/* Broker info */}
                  <div className="p-5 space-y-1.5">
                    <h3 className="text-lg font-black text-slate-950 group-hover:text-amber-600 transition-colors">
                      {broker.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      {broker.role}
                    </p>
                    <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 inline-block px-2.5 py-0.5 rounded-md border border-amber-200/60">
                      {broker.specialty}
                    </p>
                  </div>
                </div>

                {/* Bottom Action / Social Icons */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBrokerContact(broker, "phone")}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 flex items-center justify-center transition cursor-pointer"
                      title="Call Broker"
                      aria-label={`Call ${broker.name}`}
                    >
                      <Phone size={13} />
                    </button>
                    <button
                      onClick={() => handleBrokerContact(broker, "telegram")}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 flex items-center justify-center transition cursor-pointer"
                      title="Telegram"
                      aria-label={`Message ${broker.name}`}
                    >
                      <Send size={13} />
                    </button>
                    <button
                      onClick={() => handleBrokerContact(broker, "email")}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 flex items-center justify-center transition cursor-pointer"
                      title="Email Broker"
                      aria-label={`Email ${broker.name}`}
                    >
                      <Mail size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBroker(broker);
                      onNotify(`Selected ${broker.name} — ${broker.role}`, "success");
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    title="View & Inquire"
                    aria-label={`Inquire with ${broker.name}`}
                  >
                    <ArrowUpRight size={15} />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Verified Standards & Market Impact */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Institutional Trust in Numbers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real performance across Addis Ababa showroom hubs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Verified Vehicles Listed", value: "1,200+", desc: "Physically inspected" },
            { label: "Accredited Local Brokers", value: "85+", desc: "Tax ID registered" },
            { label: "Successful Handovers", value: "98.4%", desc: "Zero title dispute rate" },
            { label: "Average Buyer Savings", value: "350k ETB", desc: "Saved vs roadside markups" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-1.5 shadow-2xs">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 block">{stat.value}</span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{stat.label}</h4>
              <p className="text-[11px] text-slate-400">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Experience Fair Car Trading Today</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse our inspected showroom inventory or connect directly with our accredited broker concierge.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigate("/browse")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Browse Showroom
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
