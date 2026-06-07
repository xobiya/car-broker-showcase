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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator size={18} className="text-orange-500" />
        <h3 className="text-sm font-bold text-slate-800">Commission Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sale Price (ETB)</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="number" value={salePrice} onChange={e => setSalePrice(+e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commission Type</label>
          <select value={commissionType} onChange={e => setCommissionType(e.target.value as any)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (ETB)</option>
          </select>
        </div>
        {commissionType === "percentage" ? (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commission Rate (%)</label>
            <div className="relative">
              <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(+e.target.value)} step="0.1"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fixed Commission (ETB)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="number" value={fixedAmount} onChange={e => setFixedAmount(+e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Sale Price</span>
          <span className="font-bold text-slate-800">{fmt(salePrice)} ETB</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Commission ({commissionType === "percentage" ? `${commissionRate}%` : "Fixed"})</span>
          <span className="font-bold text-orange-500">- {fmt(commissionAmount)} ETB</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Platform Fee (15% of commission)</span>
          <span className="text-slate-500">- {fmt(platformFee)} ETB</span>
        </div>
        <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
          <span className="font-bold text-slate-800">Broker Payout</span>
          <span className="text-lg font-black text-emerald-600">{fmt(brokerShare)} ETB</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Total Seller Payout</span>
          <span>{fmt(totalPayout)} ETB</span>
        </div>
      </div>
    </div>
  );
}
