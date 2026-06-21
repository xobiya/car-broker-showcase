interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

const imgSizes = {
  sm: 70,
  md: 86,
  lg: 105,
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export default function Logo({ className = "", iconOnly, size = "md", inverted }: LogoProps) {
  const imgSize = imgSizes[size];
  const textSize = textSizes[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="Arif Car Sell"
        width={imgSize}
        height={imgSize}
        className="shrink-0 rounded-lg"
      />
      {!iconOnly && (
        <p className={`${textSize} font-black ${inverted ? "text-white" : "text-slate-900"} uppercase tracking-tight leading-none`}>
          Arif Car Sell
        </p>
      )}
    </div>
  );
}
