import React from "react";
import { FileText, ArrowLeft } from "lucide-react";

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-grow pb-24 sm:pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition cursor-pointer">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-slate-950 p-6 md:p-8 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Terms of Service</h1>
              <p className="text-xs text-slate-400 font-medium">Clear marketplace rules and broker standards</p>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Last updated: January 2026</p>
          
          <Section title="1. Acceptance of Terms">
            By accessing and using Arif Car Sell, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
          </Section>

          <Section title="2. Platform Description">
            Arif Car Sell is a digital marketplace connecting vehicle buyers with verified brokers. We facilitate listings, inquiries, and transaction management but are not a party to any sale agreement.
          </Section>

          <Section title="3. Broker Obligations">
            Brokers must maintain valid licenses, provide accurate vehicle information, and conduct transactions in good faith. Misrepresentation of vehicle condition or documentation may result in account termination.
          </Section>

          <Section title="4. Buyer Responsibilities">
            Buyers should verify vehicle details independently before purchase. Arif Car Sell recommends independent inspections for all pre-owned vehicles.
          </Section>

          <Section title="5. Commission and Fees">
            Broker commission rates are displayed per listing. Arif Car Sell charges a platform fee on completed sales as disclosed at transaction time.
          </Section>

          <Section title="6. Dispute Resolution">
            Any disputes between buyers and brokers should first be attempted to be resolved through our mediation process. Unresolved disputes may be escalated to binding arbitration.
          </Section>

          <Section title="7. Limitation of Liability">
            Arif Car Sell acts solely as an intermediary. We are not liable for the condition, legality, or safety of listed vehicles, nor for any losses arising from transactions between users.
          </Section>

          <Section title="8. Privacy">
            Use of our platform is governed by our Privacy Policy. We collect and process personal data as described therein.
          </Section>

          <Section title="9. Termination">
            We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
          </Section>

          <Section title="10. Changes to Terms">
            We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
