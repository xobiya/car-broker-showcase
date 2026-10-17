interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  forceDarkText?: boolean;
}

const imgSizes = {
  sm: "h-8 sm:h-9",
  md: "h-11 sm:h-12",
  lg: "h-14 sm:h-16",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm sm:text-base",
  lg: "text-base sm:text-lg",
};

export default function Logo({ className = "", iconOnly, size = "md", inverted, forceDarkText }: LogoProps) {
  const imgSizeClass = imgSizes[size];
  const textSize = textSizes[size];

  const textColor = inverted
    ? "text-white"
    : forceDarkText
    ? "text-slate-900"
    : "text-slate-900 dark:text-white";

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="Arif Car Sell"
        className={`shrink-0 object-contain w-auto ${imgSizeClass}`}
      />
      {!iconOnly && (
        <p className={`${textSize} font-black ${textColor} uppercase tracking-tight leading-none whitespace-nowrap`}>
          Arif <span className="text-[#22c55e]">Car Sell</span>
        </p>
      )}
    </div>
  );
}
