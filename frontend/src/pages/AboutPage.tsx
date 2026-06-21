import React from "react";
import { Shield, Phone, Mail, MapPin, Award, Users, Handshake } from "lucide-react";
import Logo from "../components/ui/Logo";

export default function AboutPage({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-12 text-slate-800">

      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">About Us</h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Ethiopia's most trusted digital marketplace for verified vehicles. We connect buyers with reputable brokers, ensuring transparency and quality in every transaction.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Shield size={22} />, title: "Trust & Verification", desc: "Every vehicle listed on our platform undergoes thorough verification to ensure quality and accurate representation." },
          { icon: <Users size={22} />, title: "Broker Network", desc: "Our curated network of licensed brokers provides professional service and expert guidance throughout your purchase." },
          { icon: <Handshake size={22} />, title: "Fair Transactions", desc: "We promote transparent pricing and fair dealings, making car buying and selling safe and straightforward." },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">{item.icon}</div>
            <h3 className="font-extrabold text-sm">{item.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-blue-900 rounded-2xl p-8 md:p-12 text-white grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { icon: <Award size={24} />, value: "500+", label: "Vehicles Listed" },
          { icon: <Users size={24} />, value: "50+", label: "Verified Brokers" },
          { icon: <Handshake size={24} />, value: "300+", label: "Successful Sales" },
          { icon: <MapPin size={24} />, value: "10+", label: "Cities Covered" },
        ].map(item => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-center text-orange-400">{item.icon}</div>
            <p className="text-2xl md:text-3xl font-black">{item.value}</p>
            <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="text-center space-y-4 py-6">
        <h2 className="text-xl font-black">Have Questions?</h2>
        <p className="text-sm text-slate-500 font-medium">We'd love to hear from you. Reach out to our team anytime.</p>
        <button onClick={() => onNotify("Contact page coming soon!", "info")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer"
        >Get in Touch</button>
      </div>
    </div>
  );
}
