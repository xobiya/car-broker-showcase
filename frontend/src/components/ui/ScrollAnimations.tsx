import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { ArrowUp, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Top reading/page scroll progress indicator
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-[#22c55e] origin-left z-50 pointer-events-none shadow-[0_1px_10px_rgba(34,197,94,0.6)]"
    />
  );
}

interface ScrollRevealProps {
  children: React.ReactNode;
  key?: React.Key;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  amount?: number | "some" | "all";
}

/**
 * Reveal element on scroll using framer-motion whileInView
 */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 30,
  className = "",
  once = true,
  amount = 0.15
}: ScrollRevealProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      case "scale":
        return { opacity: 0, scale: 0.94 };
      case "fade":
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
      }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Floating Back-to-Top Button that appears on scroll
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-20 sm:bottom-8 right-5 z-40 w-11 h-11 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md shadow-xl border border-white/20 dark:border-slate-800 flex items-center justify-center cursor-pointer group hover:bg-[#22c55e] dark:hover:bg-[#22c55e] dark:hover:text-slate-950 transition-colors"
        >
          <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Orchestrated Stagger Container for list reveals on scroll
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className = ""
}: {
  children: React.ReactNode;
  key?: React.Key;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger child item inside StaggerContainer
 */
export function StaggerItem({
  children,
  className = ""
}: {
  children: React.ReactNode;
  key?: React.Key;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface SectionItem {
  id: string;
  label: string;
  shortLabel?: string;
}

/**
 * Floating in-page vertical section navigator for smooth transitions between sections
 */
export function SectionScrollNavigator({
  sections = [
    { id: "section-hero", label: "Hero Showcase" },
    { id: "section-search", label: "Vehicle Finder" },
    { id: "section-brands", label: "Top Brands" },
    { id: "section-featured", label: "Featured Cars" },
    { id: "section-how-it-works", label: "How It Works" },
    { id: "section-categories", label: "Body Types" },
    { id: "section-comparison", label: "Why Arif Car Sell" },
    { id: "section-testimonials", label: "Client Stories" },
    { id: "section-faq", label: "FAQ" },
    { id: "section-cta", label: "Get Started" }
  ]
}: {
  sections?: SectionItem[];
}) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const scrollPrev = () => {
    if (currentIndex > 0) {
      scrollTo(sections[currentIndex - 1].id);
    }
  };
  const scrollNext = () => {
    if (currentIndex < sections.length - 1) {
      scrollTo(sections[currentIndex + 1].id);
    }
  };

  return (
    <>
      {/* Desktop floating section navigator with active dots and smooth scroll */}
      <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2 bg-slate-950/75 dark:bg-slate-900/85 backdrop-blur-md py-3 px-2 rounded-2xl border border-white/10 dark:border-slate-800 shadow-2xl transition-all">
        {/* Up Button to smooth scroll to previous section */}
        <button
          onClick={scrollPrev}
          disabled={currentIndex <= 0}
          aria-label="Previous section"
          className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition"
        >
          <ChevronUp size={15} />
        </button>

        {/* Dots and Labels */}
        <div className="flex flex-col items-center gap-2 py-1">
          {sections.map((section, idx) => {
            const isActive = section.id === activeSection;
            const isHovered = hoveredSection === section.id;

            return (
              <div
                key={section.id}
                className="relative flex items-center justify-end"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="absolute right-8 py-1 px-2.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none border border-slate-700 z-50"
                    >
                      {section.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dot / Pill Button */}
                <button
                  onClick={() => scrollTo(section.id)}
                  aria-label={`Jump to ${section.label}`}
                  className={`transition-all duration-300 rounded-full flex items-center justify-center cursor-pointer ${
                    isActive
                      ? "w-6 h-6 bg-[#22c55e] text-slate-950 font-black shadow-md shadow-emerald-500/40 text-[9px]"
                      : "w-2.5 h-2.5 bg-slate-500/60 hover:bg-slate-300 dark:hover:bg-slate-200"
                  }`}
                >
                  {isActive && <span>{idx + 1}</span>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Down Button to smooth scroll to next section */}
        <button
          onClick={scrollNext}
          disabled={currentIndex >= sections.length - 1}
          aria-label="Next section"
          className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition"
        >
          <ChevronDown size={15} />
        </button>
      </div>

      {/* Mobile in-page section transition pill: smooth scroll to next section */}
      <div className="fixed bottom-20 left-4 z-40 lg:hidden flex items-center">
        <button
          onClick={scrollNext}
          disabled={currentIndex >= sections.length - 1}
          className="flex items-center gap-2 bg-slate-950/85 dark:bg-slate-900/90 text-white backdrop-blur-md py-1.5 px-3 rounded-full border border-white/15 dark:border-slate-800 shadow-xl text-xs font-semibold cursor-pointer active:scale-95 transition disabled:opacity-40"
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-200">
            {sections[currentIndex]?.label || "Next Section"}
          </span>
          <ChevronDown size={13} className="text-[#22c55e]" />
        </button>
      </div>
    </>
  );
}

/**
 * Animated prompt in Hero that smoothly scrolls to the next section
 */
export function HeroScrollCue({ targetId = "section-search" }: { targetId?: string }) {
  const scrollToTarget = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.button
      onClick={scrollToTarget}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md shadow-lg transition-all duration-200 group cursor-pointer text-xs font-semibold"
      aria-label="Scroll to explore"
    >
      <motion.span
        animate={{ y: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="text-[#22c55e]"
      >
        <ChevronDown size={14} />
      </motion.span>
      <span>Scroll to explore sections</span>
    </motion.button>
  );
}

/**
 * Animated glowing divider line for smooth visual transition between sections
 */
export function SectionDivider() {
  return (
    <div className="w-full relative h-[1px] bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden">
      <motion.div
        initial={{ x: "-100%" }}
        whileInView={{ x: "100%" }}
        viewport={{ once: false, amount: "some" }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#22c55e]/70 to-transparent"
      />
    </div>
  );
}

