import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { brokersApi } from "../lib/api";
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
  bio: string;
  experience: string;
  location: string;
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
    image: "/images/brokers/yonas.jpg",
    bio: "Over 9 years connecting verified private sellers and buyers in Bole and Sarbet. Specializes in clean-title luxury sedans, hybrids, and certified European imports with zero hidden markups.",
    experience: "9+ Years Experience",
    location: "Addis Ababa (Bole & Sarbet)"
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
    image: "/images/brokers/bethzatha.jpg",
    bio: "Leading Ethiopia's electric transition. Provides expert guidance on zero-customs duty EV purchases, home wallbox installation, and state-of-health battery diagnostics.",
    experience: "6+ Years Experience",
    location: "Addis Ababa (Kazanchis)"
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
    image: "/images/brokers/mesfin.jpg",
    bio: "The go-to commercial broker for double-cabin pickups, logistics vans, and heavy-duty commercial fleets. Trusted by contractors and enterprises throughout Addis and Hawassa.",
    experience: "12+ Years Experience",
    location: "Addis Ababa & Hawassa"
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
    image: "/images/brokers/dawit.jpg",
    bio: "Former Transport Bureau liaison officer. Oversees certified Libre title deed audits, ensuring 100% legal compliance, zero court or bank liens, and verified ownership transfers.",
    experience: "8+ Years Experience",
    location: "Kaliti & Megenagna Hubs"
  }
];

export default function AboutPage({ onNotify }: AboutPageProps) {
  const navigate = useNavigate();
  const [selectedBroker, setSelectedBroker] = useState<BrokerMember | null>(null);
  const [flippedBrokerId, setFlippedBrokerId] = useState<string | null>(null);
  const [brokerList, setBrokerList] = useState<BrokerMember[]>(BROKERS);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const res = await brokersApi.list();
        if (res && res.length > 0) {
          const mapped: BrokerMember[] = res.map((b, idx) => {
            const fallback = BROKERS[idx % BROKERS.length];
            return {
              id: b.id,
              name: b.name || fallback.name,
              role: "Licensed Automotive Broker",
              specialty: fallback?.specialty || "Title Audit & Negotiation",
              license: b.licenseNumber || fallback.license,
              phone: b.phone || fallback.phone,
              email: b.email || fallback.email,
              telegram: fallback.telegram,
              deals: fallback.deals,
              rating: fallback.rating,
              image: b.avatar || fallback.image,
              bio: b.bio || fallback.bio,
              experience: fallback.experience,
              location: fallback.location
            };
          });
          setBrokerList(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch brokers", err);
      }
    };
    fetchBrokers();
  }, []);

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
    <div className="w-full bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
            About <span className="text-[#22c55e]">Arif Car Sell</span>
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              Sell your car at a fair price. <br className="hidden sm:inline" />
              Get started with us today.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
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
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/browse")}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-black px-7 py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#22c55e]/25 flex items-center gap-2 active:scale-95"
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
                <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-shadow border border-transparent dark:border-slate-800">
                  <img 
                    src="/images/about/customer_handover.jpg" 
                    alt="Happy Ethiopian car buyers with keys in Addis Ababa" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-shadow border border-transparent dark:border-slate-800">
                  <img 
                    src="/images/brokers/bethzatha.jpg" 
                    alt="Dedicated automotive advisor" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-shadow border border-transparent dark:border-slate-800">
                  <img 
                    src="/images/about/mechanic_inspection.jpg" 
                    alt="Certified mechanic and client during 150-point diagnostic check in Addis Ababa" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-shadow border border-transparent dark:border-slate-800">
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
      <section className="bg-slate-50/80 dark:bg-[#0B0F19]/60 border-y border-slate-200/80 dark:border-slate-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Meet Our Brokers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ethiopia's certified automotive advisors ensuring 100% verified Libre title transfer and transparent pricing.
            </p>
          </div>

          {/* 3D Flip Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {brokerList.map((broker) => {
              const isFlipped = flippedBrokerId === broker.id;

              return (
                <div 
                  key={broker.id}
                  onClick={() => setFlippedBrokerId(prev => prev === broker.id ? null : broker.id)}
                  className={`flip-card-container h-[450px] sm:h-[470px] w-full group ${isFlipped ? "is-flipped" : ""}`}
                >
                  <div className="flip-card-inner">
                    
                    {/* ── CARD FRONT FACE ── */}
                    <div className="flip-card-front bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs group-hover:shadow-xl dark:group-hover:border-emerald-500/40 transition-shadow duration-300 flex flex-col justify-between overflow-hidden">
                      {/* Maximized portrait photo */}
                      <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img 
                          src={broker.image} 
                          alt={broker.name} 
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Bottom Info & Icons Section (No description, clean spacing) */}
                      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-2.5">
                        {/* Broker Basic Info */}
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white group-hover:text-[#22c55e] transition-colors leading-tight">
                              {broker.name}
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-[#22c55e] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                              {broker.specialty}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
                            {broker.role}
                          </p>
                        </div>

                        {/* Reviews & Experience */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                            <div className="flex items-center text-amber-400">
                              <Star size={13} className="fill-amber-400" />
                            </div>
                            <span className="font-extrabold">{broker.rating}</span>
                            <span className="text-slate-400 text-[11px] font-medium">({broker.deals} reviews)</span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-[#22c55e]">
                            {broker.experience}
                          </span>
                        </div>

                        {/* Only Action Icons */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          {/* Call Icon */}
                          <a
                            href={`tel:${broker.phone}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrokerContact(broker, "phone");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#22c55e] hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                            title={`Call ${broker.name}`}
                            aria-label={`Call ${broker.name}`}
                          >
                            <Phone size={16} />
                          </a>

                          {/* Telegram Icon */}
                          <a
                            href={`https://t.me/${broker.telegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrokerContact(broker, "telegram");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                            title={`Telegram ${broker.name}`}
                            aria-label={`Message ${broker.name}`}
                          >
                            <Send size={16} />
                          </a>

                          {/* Email Icon */}
                          <a
                            href={`mailto:${broker.email}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrokerContact(broker, "email");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                            title={`Email ${broker.name}`}
                            aria-label={`Email ${broker.name}`}
                          >
                            <Mail size={16} />
                          </a>
                        </div>
                      </div>
                    </div>


                    {/* ── CARD BACK FACE (REVEALED ON MOUSE OVER) ── */}
                    <div className="flip-card-back bg-slate-950 text-white border-2 border-emerald-500/70 p-5 sm:p-6 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
                      
                      {/* Top Header of Back Face */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800/90 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center font-black text-xs border border-[#22c55e]/40">
                              {broker.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{broker.name}</h4>
                              <p className="text-[10px] text-emerald-400 font-bold">{broker.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                            <Star size={11} className="fill-amber-400" />
                            <span>{broker.rating}</span>
                          </div>
                        </div>

                        {/* Description / Bio */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            About Broker
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                            {broker.bio}
                          </p>
                        </div>

                        {/* Experience & Deals Badges */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Experience</span>
                            <span className="font-bold text-white text-[11px]">{broker.experience}</span>
                          </div>
                          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Completed Deals</span>
                            <span className="font-bold text-[#22c55e] text-[11px]">{broker.deals}+ Handed Over</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info (Only Icons Row on Back) */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
                          Direct Contact Info
                        </span>

                        <div className="flex items-center justify-between gap-2">
                          <a 
                            href={`tel:${broker.phone}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrokerContact(broker, "phone");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-[#22c55e] hover:text-slate-950 text-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                            title={`Call ${broker.phone}`}
                          >
                            <Phone size={16} />
                          </a>
                          <a 
                            href={`https://t.me/${broker.telegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrokerContact(broker, "telegram");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-500 hover:text-white text-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                            title={broker.telegram}
                          >
                            <Send size={16} />
                          </a>
                          <a 
                            href={`mailto:${broker.email}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrokerContact(broker, "email");
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                            title={broker.email}
                          >
                            <Mail size={16} />
                          </a>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Verified Standards & Market Impact */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Institutional Trust in Numbers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
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
            <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center space-y-1.5 shadow-2xs">
              <span className="text-2xl sm:text-3xl font-black text-[#22c55e] block">{stat.value}</span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{stat.label}</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Experience Fair Car Trading Today</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse our inspected showroom inventory or connect directly with our accredited broker concierge.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => navigate("/browse")}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-[#22c55e]/25 active:scale-95"
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
