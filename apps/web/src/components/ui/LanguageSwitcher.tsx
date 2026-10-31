import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "../../i18n/useLocale";
import { Locale, locales, localeMetadata } from "../../i18n/config";

interface LanguageSwitcherProps {
  variant?: "header" | "mobile" | "footer";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "header",
  className = ""
}: LanguageSwitcherProps) {
  const { locale, setLocale, meta } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (variant === "mobile") {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
          Language / ቋንቋ / Afaan
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
          {locales.map((code) => {
            const loc = localeMetadata[code];
            const isSelected = locale === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`min-h-10 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${isSelected
                    ? "bg-[#0B0F19] dark:bg-emerald-500 text-[#FF4846] dark:text-slate-950 shadow-md font-black"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                {loc.nativeName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700/80 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
      >
        <Globe size={13} className="text-[#FF4846] shrink-0" />
        <span className="font-extrabold tracking-tight">{meta.nativeName}</span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF4846]" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-[100] overflow-hidden backdrop-blur-md"
          >
            <div className="px-3.5 py-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
              Language / ቋንቋ
            </div>
            {locales.map((code) => {
              const loc = localeMetadata[code];
              const isSelected = locale === code;
              return (
                <button
                  key={code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLocale(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition cursor-pointer text-left border-l-2 ${isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#FF4846] border-[#FF4846]"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold">{loc.nativeName}</span>
                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                      {loc.name}
                    </span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#FF4846] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
