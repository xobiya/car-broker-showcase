import { useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className = "" }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto ${className}`}
          >
            {(title || description) && (
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
                    {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer text-slate-400 hover:text-slate-600 -mr-1.5 -mt-1.5">
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
            {!title && !description && (
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer text-slate-400 hover:text-slate-600 z-10">
                <X size={18} />
              </button>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 pb-4 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function DialogFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 ${className}`}>{children}</div>;
}
