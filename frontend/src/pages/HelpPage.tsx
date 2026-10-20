import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, ChevronUp, Mail, MessageSquare, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "../components/common/SEO";
import { buildFaqSchema } from "../lib/seo";

interface HelpPageProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

const FAQS = [
  { q: "How do I create an account?", a: "Click 'Register' in the top right corner. Fill in your name, email, phone, and select your role (Buyer, Seller, or Broker). Submit and you're ready to go." },
  { q: "How do I become a broker?", a: "Register as a broker during sign-up, or contact an admin to upgrade your buyer account. Brokers must provide valid license information." },
  { q: "How are commissions calculated?", a: "Commissions are transparently capped at 1.5% of the vehicle sale price. No hidden middleman markups or duplicate broker splits." },
  { q: "How do I list a vehicle?", a: "Go to your Broker or Seller Dashboard, click 'Add Listing', fill in vehicle details including specs, photos, and pricing. Submit for physical inspection and admin approval." },
  { q: "How do buyers contact me?", a: "When a buyer is interested, they send an inquiry that appears in your Leads section. You'll receive contact information to follow up directly." },
  { q: "What documents do I need to sell a car?", a: "Required documents include: Certificate of Title/Customs Clearance (Libre), Proof of Ownership/Invoice, 150-Point Inspection Certificate, and valid identification." },
  { q: "How does vehicle inspection work?", a: "Certified technicians perform a 150-point diagnostic check covering chassis, OBD-II engine codes, paint thickness, and battery state of health. Passed inspections display a verified badge." },
  { q: "What payment methods are accepted?", a: "Transactions are executed through secure Transport Bureau escrow or verified direct bank transfer with standardized legal contracts." },
  { q: "How do I reset my password?", a: "Contact support through the Contact page or email support@arifcarsell.et for password reset assistance." },
  { q: "Can I edit a listing after submission?", a: "Yes, you can edit draft listings anytime. Pending and approved listings can be edited but may require re-approval." },
];

export default function HelpPage({ onNotify }: HelpPageProps) {
  const { t } = useTranslation(["common", "metadata"]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-grow pb-24 sm:pb-8">
      <SEO
        title={t("metadata:pages.help", "Help & Support — Arif Car Sell")}
        description={t("metadata:descriptions.help", "Find answers to frequently asked questions about buying, selling, inspecting cars, title deed clearance, and broker commissions in Ethiopia.")}
        keywords={t("metadata:keywords.help", "car buying FAQ Ethiopia, how to sell car Addis Ababa, car inspection FAQ Ethiopia, libre verification guide")}
        canonical="/help"
        schema={buildFaqSchema(FAQS)}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Help & Support", url: "/help" }
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-slate-950 p-6 md:p-8 text-white space-y-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FF4846]/15 border border-[#FF4846]/30 flex items-center justify-center text-[#FF4846]">
              <HelpCircle size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Help & Support</h1>
              <p className="text-xs text-slate-400 font-medium">Find answers or reach out to our concierge team</p>
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-900 text-white placeholder-slate-400 border border-slate-800 focus:outline-none focus:border-[#FF4846] focus:ring-1 focus:ring-[#FF4846] transition"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpanded(expanded === `faq-${i}` ? null : `faq-${i}`)}
                  className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#FF4846] transition-colors">{faq.q}</span>
                  {expanded === `faq-${i}` ? <ChevronUp size={16} className="text-[#FF4846] shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {expanded === `faq-${i}` && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pb-4 leading-relaxed -mt-1">{faq.a}</p>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs sm:text-sm text-slate-400 py-8 text-center">No results found. Try a different search term.</p>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Still Need Help?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div 
                onClick={() => onNotify("Opening email client...", "info")}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1.5 cursor-pointer hover:border-[#FF4846]/50 transition"
              >
                <Mail size={20} className="mx-auto text-[#FF4846]" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Us</p>
                <p className="text-[11px] text-slate-400">support@arifcarsell.et</p>
              </div>
              <div 
                onClick={() => onNotify("Calling support line...", "info")}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1.5 cursor-pointer hover:border-[#FF4846]/50 transition"
              >
                <Phone size={20} className="mx-auto text-[#FF4846]" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Call Us</p>
                <p className="text-[11px] text-slate-400">+251 91 234 5678</p>
              </div>
              <div 
                onClick={() => onNotify("Connecting with live agent...", "info")}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1.5 cursor-pointer hover:border-[#FF4846]/50 transition"
              >
                <MessageSquare size={20} className="mx-auto text-[#FF4846]" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Chat</p>
                <p className="text-[11px] text-slate-400">Available 8AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
