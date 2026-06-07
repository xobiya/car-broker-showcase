import React, { useState } from "react";
import { HelpCircle, ArrowLeft, Search, ChevronDown, ChevronUp, Mail, MessageSquare, Phone } from "lucide-react";

interface HelpPageProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

const FAQS = [
  { q: "How do I create an account?", a: "Click 'Register' in the top right corner. Fill in your name, email, phone, and select your role (Buyer or Broker). Submit and you're ready to go." },
  { q: "How do I become a broker?", a: "Register as a broker during sign-up, or contact an admin to upgrade your buyer account. Brokers must provide valid license information." },
  { q: "How are commissions calculated?", a: "Commissions are calculated based on the rate set per listing (default 1% of sale price). Use our Commission Calculator tool for precise figures." },
  { q: "How do I list a vehicle?", a: "Go to your Broker Dashboard, click 'Add Listing', fill in vehicle details including specs, photos, and pricing. Submit for admin approval." },
  { q: "How do buyers contact me?", a: "When a buyer is interested, they send an inquiry that appears in your Leads section. You'll receive contact information to follow up directly." },
  { q: "What documents do I need to sell a car?", a: "Required documents include: Certificate of Title/Customs Clearance, Proof of Ownership/Invoice, Inspection Certificate, and valid identification." },
  { q: "How does vehicle inspection work?", a: "Admin can schedule inspections. A vehicle can pass, fail, or be pending inspection. Passed inspections display a badge on the listing." },
  { q: "What payment methods are accepted?", a: "Payments are handled directly between buyer and broker. Arif Car Sell does not process payments but recommends bank transfers with proper documentation." },
  { q: "How do I reset my password?", a: "Contact support through the Contact page or email support@arifcarsell.et for password reset assistance." },
  { q: "Can I edit a listing after submission?", a: "Yes, you can edit draft listings anytime. Pending and approved listings can be edited but may require re-approval." },
];

export default function HelpPage({ onNotify }: HelpPageProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto w-full p-6 md:p-8 flex-grow">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 md:p-8 text-white space-y-4">
          <div className="flex items-center gap-3">
            <HelpCircle size={24} />
            <h1 className="text-xl md:text-2xl font-black">Help & Support</h1>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/20 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:bg-white/30"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-100">
            {filtered.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpanded(expanded === `faq-${i}` ? null : `faq-${i}`)}
                  className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-slate-700">{faq.q}</span>
                  {expanded === `faq-${i}` ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {expanded === `faq-${i}` && (
                  <p className="text-sm text-slate-500 pb-4 leading-relaxed -mt-2">{faq.a}</p>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">No results found. Try a different search term.</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Still Need Help?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
                <Mail size={20} className="mx-auto text-blue-900" />
                <p className="text-xs font-bold text-slate-700">Email Us</p>
                <p className="text-[10px] text-slate-400">support@arifcarsell.et</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
                <Phone size={20} className="mx-auto text-blue-900" />
                <p className="text-xs font-bold text-slate-700">Call Us</p>
                <p className="text-[10px] text-slate-400">+251 91 234 5678</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
                <MessageSquare size={20} className="mx-auto text-blue-900" />
                <p className="text-xs font-bold text-slate-700">Live Chat</p>
                <p className="text-[10px] text-slate-400">Available 8AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
