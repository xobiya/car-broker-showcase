import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface ComboboxProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Combobox({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes((input || "").toLowerCase().trim())
  );

  const displayOptions = open && filtered.length === 0 && input.trim()
    ? options
    : filtered;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full text-base sm:text-sm pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
          aria-label="Toggle dropdown"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? "rotate-180 text-[#FF4846]" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl max-h-56 overflow-y-auto overscroll-contain py-1.5 animate-fadeIn">
          {displayOptions.length > 0 ? (
            displayOptions.map((o) => {
              const isSelected = o.toLowerCase() === (value || "").toLowerCase();
              return (
                <button
                  key={o}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInput(o);
                    onChange(o);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm sm:text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-[#FF4846]/10 font-bold text-[#FF4846] dark:text-[#FF4846]"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{o}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-[#FF4846]" />}
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-slate-400 text-center">
              No matching suggestions. You can keep "{input}" as custom.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
