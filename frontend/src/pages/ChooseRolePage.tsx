import { Store, Search, BadgePercent, ArrowRight, Star } from "lucide-react";
import Logo from "../components/ui/Logo";

interface ChooseRolePageProps {
  onSelectRole: (role: "buyer" | "broker" | "seller") => void;
  onSignIn?: () => void;
}

const ROLES = [
  {
    id: "buyer" as const,
    title: "Customer",
    tagline: "Find or sell your car",
    description: "Browse verified vehicles, save favorites, book test drives, and list your own vehicles for sale directly from one unified dashboard.",
    icon: Search,
    color: "bg-[#22c55e] text-slate-950",
    badgeBg: "bg-[#22c55e] text-slate-950",
    hoverBorder: "hover:border-[#22c55e]/60 dark:hover:border-[#22c55e]/60",
    badge: "Most Popular",
    features: ["Search & filter vehicles", "Save favorites & test drives", "List vehicles for sale", "Manage customer inquiries", "Unified customer portal"],
  },
  {
    id: "seller" as const,
    title: "Direct Car Listing",
    tagline: "List & sell with ease",
    description: "List your car with specs and photos, track inquiries, receive calls, and browse marketplace vehicles anytime.",
    icon: Store,
    color: "bg-slate-900 dark:bg-slate-800 text-[#22c55e]",
    badgeBg: "bg-[#0B0F19] dark:bg-slate-800 text-[#22c55e] border border-[#22c55e]/30",
    hoverBorder: "hover:border-[#22c55e]/60 dark:hover:border-[#22c55e]/60",
    badge: "Free Listing",
    features: ["List cars in 3 easy steps", "Manage inquiries", "Track views & interest", "Full marketplace access", "Direct customer contact"],
  },
  {
    id: "broker" as const,
    title: "Broker",
    tagline: "Scale your business",
    description: "Join our premier network of automotive professionals. Manage inventory, track leads, and grow your brokerage with powerful tools.",
    icon: BadgePercent,
    color: "bg-[#0B0F19] dark:bg-slate-800 text-white",
    badgeBg: "bg-[#22c55e]/15 text-[#16a34a] dark:text-[#4ade80] border border-[#22c55e]/30",
    hoverBorder: "hover:border-[#22c55e]/60 dark:hover:border-[#22c55e]/60",
    badge: "Pro",
    features: ["Inventory management", "Lead tracking system", "Sales analytics", "Commission management", "Verified badge"],
  },
];

export default function ChooseRolePage({ onSelectRole, onSignIn }: ChooseRolePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Hero */}
      <div className="bg-slate-950 border-b border-slate-800 text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" inverted />
          </div>
          <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold text-[#22c55e]">
            <Star size={12} />
            <span>Get Started with Arif Car Sell</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Choose Your Path
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed px-2">
            Whether you're buying, selling, or brokering — Arif Car Sell gives you the tools you need.
            Select your role to get started.
          </p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 -mt-6 sm:-mt-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {ROLES.map(role => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 ${role.hoverBorder} transition-all duration-200 p-5 sm:p-6 md:p-7 flex flex-col cursor-pointer group hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40`}
              >
                {/* Badge */}
                <div className={`absolute -top-2.5 right-4 ${role.badgeBg} text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm`}>
                  {role.badge}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${role.color} flex items-center justify-center mb-4 shadow-sm border border-slate-200/20`}>
                  <Icon size={22} />
                </div>

                {/* Title & tagline */}
                <h2 className="text-xl font-black text-slate-950 dark:text-white mb-0.5 group-hover:text-[#22c55e] transition-colors">{role.title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">{role.tagline}</p>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 flex-grow">{role.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {role.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center justify-center gap-2 bg-[#22c55e] group-hover:bg-[#16a34a] text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-[#22c55e]/20">
                  <span>Continue as {role.title}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-6 sm:mt-8">
          Already have an account?{" "}
          <button
            onClick={onSignIn}
            className="text-[#22c55e] hover:text-[#16a34a] underline font-bold transition cursor-pointer"
          >
            Sign in
          </button>{" "}
          to access your dashboard.
        </p>
      </div>
    </div>
  );
}
