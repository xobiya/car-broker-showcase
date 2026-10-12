import React, { useState } from "react";
import { Calculator, DollarSign, Percent, ArrowRight } from "lucide-react";

const PLATFORM_FEE_RATE = 0.15;

export default function CommissionCalculator() {
  const [salePrice, setSalePrice] = useState(5000000);
  const [commissionRate, setCommissionRate] = useState(1.0);
  const [commissionType, setCommissionType] = useState<"percentage" | "fixed">("percentage");
  const [fixedAmount, setFixedAmount] = useState(50000);

  const commissionAmount = commissionType === "percentage"
    ? Math.round(salePrice * (commissionRate / 100))
    : fixedAmount;

  const platformFee = Math.round(commissionAmount * PLATFORM_FEE_RATE);
  const brokerShare = commissionAmount - platformFee;
  const totalPayout = salePrice - commissionAmount;

  const fmt = (n: number) => n.toLocaleString("en-ET", { maximumFractionDigits: 0 });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6 transition-colors">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#22c55e]">
          <Calculator size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Commission Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Sale Price (ETB)</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input type="number" value={salePrice} onChange={e => setSalePrice(+e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#22c55e] transition-colors" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Commission Type</label>
          <select value={commissionType} onChange={e => setCommissionType(e.target.value as any)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#22c55e] transition-colors">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (ETB)</option>
          </select>
        </div>
        {commissionType === "percentage" ? (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Commission Rate (%)</label>
            <div className="relative">
              <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(+e.target.value)} step="0.1"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#22c55e] transition-colors" />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Fixed Commission (ETB)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="number" value={fixedAmount} onChange={e => setFixedAmount(+e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#22c55e] transition-colors" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/30 dark:via-slate-850 dark:to-slate-800/40 rounded-xl p-5 space-y-3 border border-emerald-500/20 dark:border-emerald-500/10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">Sale Price</span>
          <span className="font-bold text-slate-800 dark:text-white">{fmt(salePrice)} ETB</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">Commission ({commissionType === "percentage" ? `${commissionRate}%` : "Fixed"})</span>
          <span className="font-bold text-[#22c55e]">- {fmt(commissionAmount)} ETB</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">Platform Fee (15% of commission)</span>
          <span className="text-slate-500 dark:text-slate-400">- {fmt(platformFee)} ETB</span>
        </div>
        <div className="border-t border-emerald-500/20 dark:border-slate-800 pt-2 flex justify-between items-center">
          <span className="font-bold text-slate-800 dark:text-white">Broker Payout</span>
          <span className="text-lg font-black text-[#22c55e]">{fmt(brokerShare)} ETB</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
          <span>Total Seller Payout</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">{fmt(totalPayout)} ETB</span>
        </div>
      </div>
    </div>
  );
}
