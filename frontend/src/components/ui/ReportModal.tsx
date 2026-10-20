import React, { useState } from "react";
import { AlertTriangle, X, Shield } from "lucide-react";
import { reportsApi } from "../../lib/api";

interface ReportModalProps {
  targetType: "listing" | "broker" | "user";
  targetId: string;
  targetLabel: string;
  onClose: () => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
}

const REPORT_REASONS = [
  "Inaccurate information",
  "Suspicious activity",
  "Fraudulent listing",
  "Price misrepresentation",
  "Fake images",
  "Unresponsive broker",
  "Harassment",
  "Spam",
  "Other",
];

export default function ReportModal({ targetType, targetId, targetLabel, onClose, onNotify }: ReportModalProps) {
  const [reporterName, setReporterName] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName || !reason) return;
    setSubmitting(true);
    try {
      const saved = localStorage.getItem("autobroker_user");
      const user = saved ? JSON.parse(saved) : null;
      await reportsApi.create({
        reporter_id: user?.id || null,
        reporter_name: reporterName,
        target_type: targetType,
        target_id: targetId,
        reason,
        description,
      });
      onNotify("Report submitted. Our team will review it shortly.", "success");
      onClose();
    } catch {
      onNotify("Failed to submit report.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Report {targetType}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 flex items-start gap-2">
            <Shield size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              Reporting: <strong>{targetLabel}</strong>. Your report will be reviewed by our trust & safety team.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Your Name *</label>
            <input type="text" required value={reporterName} onChange={e => setReporterName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Reason *</label>
            <select required value={reason} onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:outline-none transition-colors"
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map(r => <option key={r} value={r} className="dark:bg-slate-900">{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Description (Optional)</label>
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Provide additional details to help our investigation..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF4846] focus:outline-none resize-none transition-colors"
            />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 dark:disabled:bg-amber-800 text-white font-bold py-3 rounded-lg text-xs tracking-wider transition cursor-pointer shadow-sm uppercase"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}