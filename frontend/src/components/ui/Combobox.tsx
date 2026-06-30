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
        className={`w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-400 focus:bg-white transition ${className}`}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button key={o} type="button" onMouseDown={() => { setInput(o); onChange(o); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-50 transition cursor-pointer ${o === input ? "bg-orange-50 font-semibold text-orange-700" : "text-slate-700"}`}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}
