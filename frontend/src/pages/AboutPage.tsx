import React from "react";
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Handshake, 
  Car, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  BadgeCheck, 
  TrendingUp, 
  Clock, 
  FileCheck, 
  Lock,
  Search,
  Building2,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo";

interface AboutPageProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AboutPage({ onNotify }: AboutPageProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-slate-50 text-slate-800 pb-20">
      {/* 1. Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-16 pb-20 px-4 sm:px-6 md:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,76,129,0.25),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200">
            <Sparkles size={14} className="text-orange-400" />
            <span>Pioneering Trust & Transparency in Auto Trade</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            The Modern Standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Verified Vehicles</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            We are transforming the vehicle buying and selling journey by bridging serious buyers, honest sellers, and certified brokers with verified vehicle records and transparent pricing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {[
              "150-Point Physical Checks",
              "Zero Ghost Listings",
              "Capped Broker Fees",
              "Verified Title Audits"
            ].map(badge => (
              <div key={badge} className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-[11px] font-bold text-slate-300 shadow-sm">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Key Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              color: "text-blue-600 bg-blue-50 border-blue-200",
              title: "Physical Vehicle Verification",
              desc: "Every listed car undergoes multi-point chassis, mechanical, and documentation checks. We audit odometer authenticity, ownership title, and customs history before approval."
            },
            {
              icon: Users,
              color: "text-indigo-600 bg-indigo-50 border-indigo-200",
              title: "Licensed Broker Standards",
              desc: "Our platform partners solely with vetted, accountable automotive brokers. Transparent commission caps and performance reviews safeguard every client interaction."
            },
            {
              icon: Handshake,
              color: "text-emerald-600 bg-emerald-50 border-emerald-200",
              title: "Fair Pricing & Safe Deals",
              desc: "We eliminate hidden dealer markups and speculative middleman bidding. Real asking prices, verifiable records, and secure handover procedures ensure peace of mind."
            }
          ].map(pillar => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${pillar.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-900 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Platform Workflow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-20 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-[#0F4C81]">Our 4-Step Ecosystem</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How We Protect Every Buyer & Seller</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">A frictionless, protected protocol from discovery to title transfer.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Audited Inventory",
              desc: "Brokers and sellers submit listings accompanied by title documentation and detailed vehicle specs for pre-approval review."
            },
            {
              step: "02",
              title: "On-Site Inspection",
              desc: "Our verification team inspects engine health, frame structural integrity, tire tread depth, and computerized diagnostic logs."
            },
            {
              step: "03",
              title: "Supervised Viewing",
              desc: "Qualified buyers schedule in-person test drives coordinated transparently with certified brokers."
            },
            {
              step: "04",
              title: "Compliant Settlement",
              desc: "Fair transaction templates, title transfer clearance, and verified commission settlement ensure complete safety."
            }
          ].map(flow => (
            <div key={flow.step} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 relative overflow-hidden group hover:border-slate-300 transition-colors shadow-sm">
              <span className="text-3xl font-black text-slate-100 group-hover:text-blue-50 transition-colors absolute top-3 right-4 select-none">
                {flow.step}
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-black">
                {flow.step}
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">{flow.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{flow.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Platform Performance Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            {[
              { icon: Car, value: "1,200+", label: "Verified Vehicles Audited" },
              { icon: BadgeCheck, value: "99.4%", label: "Inspection Accuracy" },
              { icon: Users, value: "60+", label: "Licensed Active Brokers" },
              { icon: Clock, value: "< 48 hrs", label: "Average Deal Match" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex justify-center text-orange-400">
                    <Icon size={26} />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Standards Comparison */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-20 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-[#0F4C81]">Market Comparison</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Standard vs. Traditional Informal Trading</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Our Standard */}
            <div className="p-6 sm:p-8 space-y-4 bg-emerald-50/20">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm uppercase tracking-wider">
                <BadgeCheck size={18} className="text-emerald-600" />
                <span>Arif Car Sell Verified Standard</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Physical 150-point inspection record attached to each listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Licensed and registered broker identity with customer reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Capped transparent commission rates agreed before negotiation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time inventory status ensuring zero ghost or sold listings</span>
                </li>
              </ul>
            </div>

            {/* Informal Market */}
            <div className="p-6 sm:p-8 space-y-4 bg-rose-50/20">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm uppercase tracking-wider">
                <ShieldCheck size={18} className="text-rose-500" />
                <span>Informal Street / Social Channels</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>Unverified odometer readings and hidden accident structural damage</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>Anonymous intermediaries with no licensing, accountability, or trail</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>Arbitrary, hidden commission markups inflating the actual asking price</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>Ghost posts, duplicate ads, and bait-and-switch vehicle availability</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Ready to Find or Sell Your Next Vehicle?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Browse our inspected showroom inventory or connect directly with our broker support desk for tailored guidance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/browse")}
              className="bg-[#0F4C81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <span>Explore Showroom</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
