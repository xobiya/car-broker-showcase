import React from "react";
import { Shield, ArrowLeft } from "lucide-react";

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="max-w-3xl mx-auto w-full p-6 md:p-8 flex-grow">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition cursor-pointer">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 md:p-8 text-white">
          <div className="flex items-center gap-3">
            <Shield size={24} />
            <h1 className="text-xl md:text-2xl font-black">Privacy Policy</h1>
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800">Last updated: January 2026</p>

          <Section title="1. Information We Collect">
            We collect personal information you provide during registration (name, email, phone number), vehicle listing data, inquiry communications, and usage data including pages visited and interactions.
          </Section>

          <Section title="2. How We Use Your Information">
            Your information is used to operate the platform, facilitate transactions, verify broker credentials, communicate updates, and improve our services. We do not sell personal data to third parties.
          </Section>

          <Section title="3. Data Sharing">
            We share necessary information between buyers and brokers to facilitate transactions. With your consent, we may share verification status with other platform users.
          </Section>

          <Section title="4. Data Security">
            We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your personal information.
          </Section>

          <Section title="5. Your Rights">
            You may access, update, or delete your personal data at any time through your account settings. Contact support for assistance with data requests.
          </Section>

          <Section title="6. Cookies">
            We use essential cookies for platform functionality and analytics cookies to improve user experience. You can control cookie preferences in your browser settings.
          </Section>

          <Section title="7. Retention">
            We retain your data for as long as your account is active. Upon account deletion, personal data is removed within 30 days unless required for legal purposes.
          </Section>

          <Section title="8. Contact">
            For privacy-related inquiries, contact our Data Protection Officer at privacy@arifcarsell.et or call +251 91 234 5678.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-800 mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
