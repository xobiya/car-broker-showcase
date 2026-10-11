import React, { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  ChevronDown, 
  HelpCircle, 
  Sparkles,
  ExternalLink,
  Car
} from "lucide-react";

interface ContactPageProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

const TOPIC_OPTIONS = [
  "Vehicle Inquiry",
  "Test Drive Booking",
  "Sell / List My Car",
  "Broker Partnership",
  "Inspection Verification",
  "General Support"
];

const FAQS = [
  {
    q: "How does the physical vehicle verification process work?",
    a: "Every listed car is inspected on-site by certified mechanics. We assess 150 points covering the chassis, powertrain, suspension, and brake diagnostics, alongside verifying ownership paperwork and customs stamps."
  },
  {
    q: "How are broker commission rates capped and disclosed?",
    a: "All accredited brokers on our platform agree to a transparent, capped commission structure. The fee is clearly specified before closing negotiations, preventing unexpected middleman markups."
  },
  {
    q: "How can I book an in-person test drive?",
    a: "You can submit an inquiry through any vehicle listing card or use this contact form. Our concierge coordinates a supervised viewing appointment with the assigned verified broker."
  },
  {
    q: "How long does vehicle listing approval take for sellers and brokers?",
    a: "Standard reviews and document checks are completed within 4 to 12 business hours. If an on-site physical inspection is scheduled, the full report is published within 24 hours."
  }
];

export default function ContactPage({ onNotify }: ContactPageProps) {
  const [selectedTopic, setSelectedTopic] = useState("Vehicle Inquiry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleRef, setVehicleRef] = useState("");
  const [preferredContact, setPreferredContact] = useState<"phone" | "whatsapp" | "email">("phone");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      onNotify(`${label} copied to clipboard!`, "success");
    } catch {
      onNotify(`Copied: ${text}`, "info");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      onNotify("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNotify("Message transmitted successfully. A support specialist will respond within 2 hours.", "success");
      setName("");
      setEmail("");
      setPhone("");
      setVehicleRef("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="w-full bg-slate-50 text-slate-800 pb-20">
      {/* 1. Header Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-16 pb-20 px-4 sm:px-6 md:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,76,129,0.25),transparent_50%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Connect with Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Concierge Desk</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
            Have questions about a verified listing, broker onboarding, title verification, or booking a vehicle inspection? Our automotive specialists are here to guide you.
          </p>
        </div>
      </section>

      {/* 2. Direct Contact Channels */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Direct Hotline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone Hotline</p>
                <p className="text-xs font-bold text-slate-900 mt-1">+251 91 123 4567</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Direct phone assistance</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy("+251911234567", "Phone number")}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-bold transition cursor-pointer"
            >
              <Copy size={12} />
              <span>Copy Number</span>
            </button>
          </div>

          {/* Card 2: General Inquiries */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Concierge</p>
                <p className="text-xs font-bold text-slate-900 mt-1">support@arifcarsell.com</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Response within 2 hours</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy("support@arifcarsell.com", "Email address")}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-bold transition cursor-pointer"
            >
              <Copy size={12} />
              <span>Copy Email</span>
            </button>
          </div>

          {/* Card 3: Broker Relations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Broker Desk</p>
                <p className="text-xs font-bold text-slate-900 mt-1">brokers@arifcarsell.com</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Licensing & Onboarding</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy("brokers@arifcarsell.com", "Broker email")}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-bold transition cursor-pointer"
            >
              <Copy size={12} />
              <span>Copy Email</span>
            </button>
          </div>

          {/* Card 4: Main Office */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Verification Center</p>
                <p className="text-xs font-bold text-slate-900 mt-1">Bole Sub-City, Road 22</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Physical inspection yard</p>
              </div>
            </div>
            <div className="mt-4 py-1.5 px-3 text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-lg">
              Open for Inspections
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Form & Side Info Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Send an Official Inquiry</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Select your inquiry topic and provide your details below.
              </p>
            </div>

            {/* Topic Pills */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Inquiry Topic</label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedTopic === topic
                        ? "bg-[#0F4C81] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Dawit Bekele"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+251 9X XXX XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Vehicle Ref / Model (Optional)</label>
                  <input
                    type="text"
                    value={vehicleRef}
                    onChange={e => setVehicleRef(e.target.value)}
                    placeholder="e.g. 2022 Toyota RAV4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Preferred Contact Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "phone" as const, label: "Phone Call" },
                    { id: "whatsapp" as const, label: "Telegram / SMS" },
                    { id: "email" as const, label: "Email" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreferredContact(opt.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        preferredContact === opt.id
                          ? "bg-blue-50 border-[#0F4C81] text-[#0F4C81]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, vehicle requirements, or questions in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F4C81] hover:bg-blue-900 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Message to Concierge</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Assurances & FAQs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Trust Assurance Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white space-y-4 border border-slate-800 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h3 className="font-extrabold text-base tracking-tight">Our Concierge Commitment</h3>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verified responses from licensed staff members only.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Strict confidentiality with buyer and seller records.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Complimentary booking of vehicle test drives and audits.</span>
                </li>
              </ul>
            </div>

            {/* Quick FAQs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <HelpCircle size={17} className="text-[#0F4C81]" />
                <span>Frequently Asked Questions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {FAQS.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div key={faq.q} className="py-3 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left gap-3 text-xs font-bold text-slate-800 hover:text-blue-900 transition cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
