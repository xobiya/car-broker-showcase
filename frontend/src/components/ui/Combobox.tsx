import React, { useState, useEffect } from "react";

interface ComboboxProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export default function Combobox({ value, onChange, options, placeholder, className = "" }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const filtered = options.filter(o => o.toLowerCase().includes(input.toLowerCase()));
  useEffect(() => { setInput(value); }, [value]);
  return (
    <div className="relative">
      <input type="text" value={input} onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} placeholder={placeholder}
        className={`w-full text-base sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4846] focus:bg-white dark:focus:bg-slate-800 transition ${className}`}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
          {filtered.map(o => (
            <button key={o} type="button" onMouseDown={() => { setInput(o); onChange(o); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 text-sm sm:text-xs transition cursor-pointer ${
                o === input 
                  ? "bg-emerald-50 dark:bg-emerald-950/40 font-bold text-[#FF4846]" 
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}
