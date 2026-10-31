import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  default: "bg-blue-900 text-white hover:bg-blue-800 shadow-sm",
  primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
  outline: "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
  link: "bg-transparent text-blue-700 hover:underline p-0",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-bold",
  md: "px-4 py-2 text-sm font-bold",
  lg: "px-6 py-3 text-base font-bold",
  icon: "p-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export function buttonVariants({ variant = "default", size = "md", className = "" }: { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string } = {}) {
  return `${variants[variant]} ${sizes[size]} ${className}`;
}
