import React from "react";
import { useTranslation } from "react-i18next";
import SEO from "../components/common/SEO";
import AuthLayout from "../components/auth/AuthLayout";

export default function LoginPage() {
  const { t } = useTranslation(["metadata"]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-4 sm:py-8 px-3 sm:px-6 pb-28 md:pb-10 bg-slate-50/70 dark:bg-[#070A12] transition-colors">
      <SEO
        title={t("metadata:pages.login", "Sign In — Arif Car Sell Account")}
        description={t(
          "metadata:descriptions.login",
          "Sign in to your Arif Car Sell account to manage your car listings, test drive appointments, and buyer inquiries."
        )}
        canonical="/login"
        noIndex={true}
      />
      <AuthLayout initialMode="login" />
    </div>
  );
}
