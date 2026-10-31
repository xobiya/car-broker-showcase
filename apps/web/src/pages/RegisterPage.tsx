import React from "react";
import { useTranslation } from "react-i18next";
import SEO from "../components/common/SEO";
import AuthLayout from "../components/auth/AuthLayout";

export default function RegisterPage() {
  const { t } = useTranslation(["metadata"]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-4 sm:py-8 px-3 sm:px-6 pb-28 md:pb-10 bg-slate-50/70 dark:bg-[#070A12] transition-colors">
      <SEO
        title={t("metadata:pages.register", "Create Account — Join Arif Car Sell")}
        description={t(
          "metadata:descriptions.register",
          "Create an Arif Car Sell account as a buyer, private seller, or licensed broker to access Ethiopia's trusted vehicle marketplace."
        )}
        canonical="/register"
        noIndex={true}
      />
      <AuthLayout initialMode="register" />
    </div>
  );
}
