import { Store, Search, BadgePercent, ArrowRight, Shield, Users, Car, Star } from "lucide-react";
import Logo from "../components/ui/Logo";

interface ChooseRolePageProps {
  onSelectRole: (role: "buyer" | "broker" | "seller") => void;
  onSignIn?: () => void;
}

const ROLES = [
  {
    id: "buyer" as const,
    title: "Buyer",
    tagline: "Find your perfect car",
    description: "Browse thousands of verified vehicles from trusted brokers across Ethiopia. Save favorites, request test drives, and get the best deals.",
    icon: Search,
    color: "bg-emerald-500",
    hover: "hover:border-emerald-400 hover:shadow-emerald-100",
    badge: "Most Popular",
    features: ["Search & filter vehicles", "Save favorites", "Request test drives", "Compare listings", "Direct broker contact"],
  },
  {
    id: "seller" as const,
    title: "Seller",
    tagline: "Sell your car fast",
    description: "List your vehicle directly on Ethiopia's leading marketplace. Connect with serious buyers, get fair prices, and sell with confidence.",
    icon: Store,
    color: "bg-orange-500",
    hover: "hover:border-orange-400 hover:shadow-orange-100",
    badge: "New",
    features: ["List your vehicles", "Manage inquiries", "Track views & interest", "Set your own price", "Sold price history"],
  },
  {
    id: "broker" as const,
    title: "Broker",
    tagline: "Scale your business",
    description: "Join Ethiopia's largest network of automotive professionals. Manage inventory, track leads, and grow your brokerage with powerful tools.",
    icon: BadgePercent,
    color: "bg-blue-900",
    hover: "hover:border-blue-400 hover:shadow-blue-100",
    badge: "Pro",
    features: ["Inventory management", "Lead tracking system", "Sales analytics", "Commission management", "Verified badge"],
  },
];

export default function ChooseRolePage({ onSelectRole, onSignIn }: ChooseRolePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-blue-900 text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" inverted />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
            <Star size={12} />
            Get Started
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Choose Your Path
          </h1>
          <p className="text-sm sm:text-base text-blue-200/80 max-w-2xl mx-auto font-medium leading-relaxed px-2">
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
                className={`relative bg-white rounded-2xl border-2 border-slate-200 ${role.hover} transition-all duration-200 p-5 sm:p-6 md:p-7 flex flex-col cursor-pointer group hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* Badge */}
                <div className={`absolute -top-2.5 right-4 ${role.color} text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm`}>
                  {role.badge}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${role.color} text-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={22} />
                </div>

                {/* Title & tagline */}
                <h2 className="text-xl font-extrabold text-slate-900 mb-0.5">{role.title}</h2>
                <p className="text-sm text-slate-500 font-medium mb-3">{role.tagline}</p>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-5 flex-grow">{role.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {role.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                      <div className={`w-1.5 h-1.5 rounded-full ${role.color} shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`flex items-center justify-center gap-2 ${role.color} text-white py-3 rounded-xl text-xs font-bold transition-all group-hover:shadow-sm`}>
                  <span>Continue as {role.title}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs sm:text-sm text-slate-400 font-semibold mt-6 sm:mt-8">
          Already have an account?{" "}
          <button
            onClick={onSignIn}
            className="text-blue-900 hover:text-orange-500 underline font-bold transition cursor-pointer"
          >
            Sign in
          </button>{" "}
          to access your dashboard.
        </p>
      </div>
    </div>
  );
}
