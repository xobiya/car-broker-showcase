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
  ChevronDown, 
  HelpCircle, 
  Sparkles,
  Car
} from "lucide-react";
import { api } from "../lib/api";

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
    a: "All accredited brokers on our platform agree to a transparent, capped 1.5% commission structure. The fee is clearly specified before closing negotiations, preventing unexpected middleman markups."
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
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      onNotify("Please provide your name and either phone or email.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/contact", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        topic: selectedTopic,
        vehicleRef: vehicleRef.trim(),
        message: message.trim()
      });
      onNotify("Your inquiry has been submitted. Our concierge will contact you within 2 business hours.", "success");
      setName("");
      setEmail("");
      setPhone("");
      setVehicleRef("");
      setMessage("");
    } catch (err: any) {
      onNotify(err.message || "Failed to submit inquiry. Please try again or call our hotline.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
      {/* 1. Hero Header */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 md:px-8 border-b border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('/images/about/happy_buyer.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Get in Touch with <span className="text-[#22c55e]">Arif Car Sell</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Have questions about an inspected car, Libre title audit, or listing your vehicle? Our team in Addis Ababa is here to assist you.
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                Direct Communication Lines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reach our team directly by phone, messaging, or visit our Addis Ababa headquarters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Hotline</h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">+251 91 123 4567 / +251 92 234 5678</p>
                  <p className="text-[11px] text-slate-400">Mon - Sat: 8:30 AM - 6:30 PM (EAT)</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Inquiry</h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">support@arifcarsell.com</p>
                  <p className="text-[11px] text-slate-400">Average response time within 2 hours</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Headquarters & Inspection Lot</h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Bole Sub-City, Next to Medhanialem Mall</p>
                  <p className="text-[11px] text-slate-400">Addis Ababa, Ethiopia</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Monday – Saturday: 8:30 AM – 6:30 PM</p>
                  <p className="text-[11px] text-slate-400">Sunday: By appointment only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg shadow-slate-100 dark:shadow-none space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  Send Us a Direct Message
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in your details and an accredited concierge will follow up promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Inquiry Topic
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TOPIC_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTopic(t)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition cursor-pointer border ${
                          selectedTopic === t
                            ? "bg-[#0B0F19] dark:bg-slate-800 text-[#22c55e] border-[#22c55e]/50 font-black shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Solomon Tadesse"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 91 123 4567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                      required
                    />
                  </div>
                </div>

                {/* Email & Vehicle Ref */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle of Interest (Optional)
                    </label>
                    <input
                      type="text"
                      value={vehicleRef}
                      onChange={(e) => setVehicleRef(e.target.value)}
                      placeholder="e.g. 2023 Toyota RAV4 Hybrid"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Message Details
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you are looking for, preferred viewing schedule, or questions..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-[#22c55e]/25 active:scale-95 disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Message to Concierge"}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FAQ Accordion */}
      <section className="bg-slate-50/70 dark:bg-[#0B0F19]/60 border-t border-slate-200/80 dark:border-slate-800 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Quick answers about contact and concierge appointments
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4.5 sm:p-5 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between gap-3 cursor-pointer hover:text-[#22c55e] transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#22c55e]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 sm:px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
