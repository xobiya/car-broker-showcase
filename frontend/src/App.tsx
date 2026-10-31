import { useEffect, useState, useCallback, lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ShieldCheck, Home, LayoutGrid, UserCircle, Info, LogOut, LayoutDashboard, ChevronDown, Menu, X, GitCompare, Phone, Loader2, Sparkles, Plus, MapPin, Car, Zap, FileCheck2, Users, Mail, Sun, Moon, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useStore } from "./store";
import { useAuth } from "./hooks/useAuth";
import { authApi, setToken } from "./lib/api";
import Logo from "./components/ui/Logo";
import AuthModal from "./components/ui/AuthModal";
import { PageSkeleton } from "./components/ui/Skeleton";
import { ScrollProgressBar, ScrollToTopButton } from "./components/ui/ScrollAnimations";
import LanguageSwitcher from "./components/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type { VehicleListing, User } from "../../shared/types";

// Code-split routes via React.lazy for on-demand loading
const HomePage = lazy(() => import("./pages/HomePage"));
const Showroom = lazy(() => import("./pages/Showroom"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const VehicleComparison = lazy(() => import("./pages/VehicleComparison"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const BrokerDashboard = lazy(() => import("./dashboards/BrokerDashboard"));
const AdminPanel = lazy(() => import("./dashboards/AdminPanel"));
const AdminProfilePage = lazy(() => import("./dashboards/AdminProfilePage"));
const BrokerProfilePage = lazy(() => import("./dashboards/BrokerProfilePage"));
const BuyerProfilePage = lazy(() => import("./dashboards/BuyerProfilePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function PageLoader() {
  return <PageSkeleton />;
}

const FULL_SCREEN_ROUTES = ["/broker-dashboard", "/admin", "/admin/profile"];

function useToast() {
  const toasts = useStore(s => s.toasts);
  const removeToast = useStore(s => s.removeToast);
  return { toasts, removeToast };
}

function isFullScreenRoute(path: string) {
  return FULL_SCREEN_ROUTES.some(r => path.startsWith(r));
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"buyer" | "broker" | "seller" | "admin">;
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useStore(s => s.user);
  const isAuthenticated = useStore(s => s.isAuthenticated);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
}

// Blocks admin users from accessing user-side pages and redirects them to /admin
function UserRoute({ children }: { children: ReactNode }) {
  const user = useStore(s => s.user);

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore(s => s.user);
  const isAuthenticated = useStore(s => s.isAuthenticated);
  const theme = useStore(s => s.theme);
  const toggleTheme = useStore(s => s.toggleTheme);
  const setUser = useStore(s => s.setUser);
  const addToast = useStore(s => s.addToast);
  const selectedVehicle = useStore(s => s.selectedVehicle);
  const setSelectedVehicle = useStore(s => s.setSelectedVehicle);
  const setSelectedBrokerId = useStore(s => s.setSelectedBrokerId);
  const { logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<"buyer" | "broker" | "seller">("buyer");
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const { toasts, removeToast } = useToast();
  const { t } = useTranslation(["navigation", "common", "homepage"]);
  const fullScreen = isFullScreenRoute(location.pathname);
  const isAccountRoute = location.pathname === "/profile";
  const userRole = user?.role || "buyer";

  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // If user is admin and visits any user-side page, redirect them to admin pages
  useEffect(() => {
    if (user?.role === "admin" && !location.pathname.startsWith("/admin")) {
      navigate("/admin", { replace: true });
    }
  }, [user?.role, location.pathname, navigate]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setIsConfigured(data.configured);
        } else setIsConfigured(false);
      } catch { setIsConfigured(false); }
    };
    checkStatus();
  }, []);

  const handleAuthSuccess = useCallback((user: User) => {
    setUser(user);
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "broker") navigate("/broker-dashboard");
    else if (user.role === "seller") navigate("/profile?section=listings");
    else navigate("/profile");
  }, [navigate, setUser]);

  const handleViewDetails = useCallback((vehicle: VehicleListing) => {
    setSelectedVehicle(vehicle);
    navigate(`/vehicles/${vehicle.id}`);
  }, [navigate, setSelectedVehicle]);

  const handleViewBrokerProfile = useCallback((brokerId: string) => {
    setSelectedBrokerId(brokerId);
    navigate(`/brokers/${brokerId}`);
  }, [navigate, setSelectedBrokerId]);

  const handleBrowseWithFilters = useCallback((filters?: Record<string, unknown>) => {
    navigate("/vehicles", { state: { filters } });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    addToast("Logged out successfully.", "success");
    navigate("/");
  }, [logout, addToast, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      <ScrollProgressBar />
      <ScrollToTop />
      <div className="fixed top-5 right-5 z-[100] space-y-2 pointer-events-none w-80 max-w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto cursor-pointer p-4 rounded-xl border flex items-start space-x-3 shadow-lg backdrop-blur-md transition-all duration-150 active:scale-[0.99] ${
                toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200" :
                toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200" :
                "bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
              }`}
            >
              <div className="flex-1 text-[12px] font-semibold leading-relaxed select-text">{toast.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!fullScreen && (
        <>
          {/* Carento Top Utility Strip */}
          <div className="bg-[#0B0F19] text-slate-300 text-[11px] border-b border-slate-800/80 px-4 sm:px-6 md:px-8 py-2.5 hidden sm:flex items-center justify-between z-50 relative">
            <div className="flex items-center gap-6">
              <a href="tel:+251911234567" className="flex items-center gap-2 hover:text-[#FF4846] transition-colors cursor-pointer">
                <Phone size={13} className="text-[#FF4846]" />
                <span className="font-semibold">+251 91 123 4567</span>
              </a>
              <a href="mailto:concierge@arifcarsell.com" className="flex items-center gap-2 hover:text-[#FF4846] transition-colors cursor-pointer">
                <Mail size={13} className="text-[#FF4846]" />
                <span className="font-semibold">concierge@arifcarsell.com</span>
              </a>
            </div>

            {/* Middle Summer / Inventory Promo Badge */}
            <div className="hidden lg:inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1 rounded-full text-[11px] font-semibold text-slate-300">
              <Car size={13} className="text-[#FF4846]" />
              <span>More than <strong className="text-[#FF4846] font-black">500+</strong> verified inspected cars in Addis Ababa</span>
              <button
                onClick={() => navigate("/vehicles")}
                className="bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] ml-1 transition cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
              >
                <span>Access Now</span>
                <ArrowRight size={10} strokeWidth={2.5} />
              </button>
            </div>

            {/* Right: Language Switcher, Currency & Theme Toggle */}
            <div className="flex items-center gap-3 text-slate-400 font-bold">
              <LanguageSwitcher variant="header" />
              <span className="text-xs font-semibold text-slate-300 tracking-wide">ETB</span>
              <button
                onClick={toggleTheme}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/80 flex items-center justify-center"
                title={theme === "dark" ? t("navigation:theme.switchToLight") : t("navigation:theme.switchToDark")}
                aria-label={t("navigation:theme.switchToDark")}
              >
                {theme === "dark" ? (
                  <Sun size={15} className="text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon size={15} className="text-slate-300 hover:-rotate-12 transition-transform" />
                )}
              </button>
            </div>
          </div>

          {/* Clean White Signature Header with Emerald Accents */}
          <header className="shrink-0 bg-white/95 dark:bg-[#0B0F19]/95 border-b border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-16 sm:h-20 px-3 sm:px-6 md:px-8 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 transition-colors duration-200 shadow-sm shadow-slate-950/5 dark:shadow-none">
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div onClick={() => navigate(userRole === "admin" ? "/admin" : "/")} className="cursor-pointer shrink-0">
                <Logo size="md" className="max-[360px]:[&>p]:hidden" />
              </div>
            </div>

            {/* Actual Pages Navigation: Clean, Professional, Emerald Accents */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {userRole !== "admin" && !isAccountRoute && (
                <button
                  onClick={() => navigate("/")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                    location.pathname === "/" ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t("navigation:menu.home")}
                </button>
              )}
              {userRole !== "admin" && !isAccountRoute && (
                <button
                  onClick={() => navigate("/vehicles")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                    (location.pathname === "/vehicles" || location.pathname === "/browse") ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t("navigation:menu.vehicles")}
                </button>
              )}
              {userRole !== "admin" && (
                <button
                  onClick={() => navigate("/services")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                    location.pathname === "/services" ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t("navigation:menu.services")}
                </button>
              )}
              {userRole !== "admin" && (
                <button
                  onClick={() => navigate("/compare")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                    location.pathname === "/compare" ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t("navigation:menu.compare")}
                </button>
              )}
              {userRole === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                    location.pathname.startsWith("/admin") ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {t("navigation:menu.admin")}
                </button>
              )}
              {userRole !== "admin" && (
                <>
                  <button
                    onClick={() => navigate("/about")}
                    className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                      location.pathname === "/about" ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t("navigation:menu.about")}
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#FF4846] transition-colors ${
                      location.pathname === "/contact" ? "text-[#FF4846]" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t("navigation:menu.contact")}
                  </button>
                </>
              )}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3.5 shrink-0">
              
              {/* Desktop Add Listing Pill Button */}
              <button
                onClick={() => {
                  if (!user) navigate("/login");
                  else if (userRole === "broker") navigate("/broker-dashboard");
                  else navigate("/profile?section=listings&action=new");
                }}
                className="hidden md:inline-flex items-center gap-1.5 bg-[#FF4846] hover:bg-[#E63D3B] text-slate-950 font-black px-5 py-2.5 rounded-full text-xs transition cursor-pointer shadow-sm hover:shadow-emerald-500/20 tracking-tight active:scale-95 whitespace-nowrap"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Add Listing</span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-full px-2 sm:px-3.5 py-1 sm:py-1.5 shadow-xs transition cursor-pointer shrink-0"
                    aria-label="User Profile"
                  >
                    <UserCircle size={18} className="text-[#FF4846] shrink-0" />
                    <span className="text-xs font-bold hidden sm:block text-slate-800 dark:text-slate-200">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={11} className={`text-slate-500 transition ${profileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FF4846] mt-0.5">
                            {user.role === "admin" ? "Admin" : user.role === "broker" ? "Certified Broker" : "Verified Member"}
                          </p>
                        </div>
                        <div className="py-1">
                          {(userRole === "buyer" || userRole === "seller") && (
                            <DropdownItem icon={UserCircle} label={t("navigation:menu.profile")} onClick={() => { navigate("/profile"); setProfileDropdownOpen(false); }} />
                          )}
                          {userRole === "broker" && (
                            <DropdownItem icon={LayoutDashboard} label={t("navigation:menu.brokerDashboard")} onClick={() => { navigate("/broker-dashboard"); setProfileDropdownOpen(false); }} />
                          )}
                          {userRole === "admin" && (
                            <>
                              <DropdownItem icon={LayoutDashboard} label={t("navigation:menu.admin")} onClick={() => { navigate("/admin"); setProfileDropdownOpen(false); }} />
                              <DropdownItem icon={UserCircle} label={t("navigation:menu.profile")} onClick={() => { navigate("/admin/profile"); setProfileDropdownOpen(false); }} />
                            </>
                          )}
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                          <DropdownItem icon={LogOut} label={t("navigation:menu.signOut")} onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} danger />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => navigate("/login")}
                    className={`items-center gap-1 text-xs sm:text-[13px] font-bold transition-all cursor-pointer px-2.5 sm:px-4 py-1.5 rounded-full border ${
                      location.pathname === "/login"
                        ? "text-[#FF4846] bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                        : "text-slate-700 dark:text-slate-200 hover:text-[#FF4846] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                    } ${location.pathname === "/login" || location.pathname === "/register" ? "hidden sm:flex" : "flex"}`}
                  >
                    <UserCircle size={14} className="text-[#FF4846] hidden xs:block sm:block" />
                    <span>{t("navigation:menu.signIn")}</span>
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className={`hidden sm:inline-flex items-center gap-1 text-xs sm:text-[13px] font-bold transition-colors cursor-pointer px-3.5 py-1.5 rounded-full ${
                      location.pathname === "/register"
                        ? "text-[#FF4846] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{t("navigation:menu.register")}</span>
                  </button>
                </div>
              )}

              {/* Header Language Switcher */}
              <LanguageSwitcher variant="header" className="!inline-block shrink-0" />

              {/* Mobile Theme Toggle Icon Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-[#FF4846] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme mode"
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-amber-400" />
                ) : (
                  <Moon size={18} className="text-slate-600 dark:text-slate-400" />
                )}
              </button>

              {/* Mobile Menu Hamburger Button */}
              {userRole !== "admin" && !isAccountRoute && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-[#FF4846] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </header>

          {/* ── MOBILE SLIDE-DOWN NAVIGATION DRAWER ── */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 top-16 sm:top-20 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden"
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 shadow-2xl z-40 fixed top-16 sm:top-20 left-0 right-0 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto"
                >
                  <div className="px-4 py-4 space-y-4">
                    {/* Primary Links */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-1">
                        {t("navigation:menu.menuOptions", "Menu Options")}
                      </p>
                      {[
                        { label: t("navigation:menu.home"), path: "/", icon: Home },
                        { label: t("navigation:menu.vehicles"), path: "/vehicles", icon: LayoutGrid },
                        { label: t("navigation:menu.compare"), path: "/compare", icon: GitCompare },
                        { label: t("navigation:menu.services"), path: "/services", icon: Sparkles },
                        { label: t("navigation:menu.about"), path: "/about", icon: Info },
                        { label: t("navigation:menu.contact"), path: "/contact", icon: Phone }
                      ].map(link => {
                        const LinkIcon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <button
                            key={link.path}
                            onClick={() => {
                              navigate(link.path);
                              setMobileMenuOpen(false);
                              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#FF4846]"
                                : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <LinkIcon size={17} className={isActive ? "text-[#FF4846]" : "text-slate-400"} />
                              <span>{link.label}</span>
                            </div>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4846]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Drawer Footer: Language & Theme Controls */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 px-3">
                      <LanguageSwitcher variant="mobile" />
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {theme === "dark" ? <Moon size={15} className="text-[#FF4846]" /> : <Sun size={15} className="text-amber-500" />}
                          <div>
                            <span className="block text-xs font-black text-slate-700 dark:text-slate-200">Theme</span>
                            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              {theme === "dark" ? "Dark mode" : "Light mode"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-[10px] font-black text-slate-700 dark:text-slate-200 hover:border-[#FF4846] hover:text-[#FF4846] transition cursor-pointer shadow-xs"
                          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                          aria-label="Toggle theme mode"
                        >
                          {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-500" />}
                          <span>{theme === "dark" ? "Light" : "Dark"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <main className={`${fullScreen ? "h-screen" : "flex-grow min-h-0"} flex min-w-0 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0`}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full ${fullScreen ? "h-full flex-1" : "flex-grow"} flex flex-col`}
            >
              <Routes>
                <Route path="/" element={<UserRoute><HomePage currentUser={user} onViewDetails={handleViewDetails} onBrowse={handleBrowseWithFilters} onViewBrokerProfile={handleViewBrokerProfile} onBecomeBroker={() => { if (!user) navigate("/register?role=broker"); else if (user.role === "broker") navigate("/broker-dashboard"); else if (user.role === "seller" || user.role === "buyer") navigate("/profile"); else if (user.role === "admin") navigate("/admin"); else addToast("Contact admin to upgrade to a Broker account.", "info"); }} /></UserRoute>} />
                <Route path="/choose-role" element={<Navigate to="/register" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/services" element={<UserRoute><ServicesPage onNotify={addToast} /></UserRoute>} />
                <Route path="/service" element={<Navigate to="/services" replace />} />
                <Route path="/vehicles" element={<UserRoute><Showroom onNotify={addToast} onInquireCar={handleViewDetails} /></UserRoute>} />
                <Route path="/browse" element={<Navigate to="/vehicles" replace />} />
                <Route path="/vehicles/:id" element={<UserRoute><VehicleDetail vehicle={selectedVehicle} onBack={() => navigate(-1)} onNotify={addToast} onViewDetails={handleViewDetails} onViewBrokerProfile={handleViewBrokerProfile} /></UserRoute>} />
                <Route path="/broker-dashboard" element={<ProtectedRoute allowedRoles={["broker"]}><BrokerDashboard onNotify={addToast} onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/seller-dashboard" element={<Navigate to="/profile?section=listings" replace />} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel onNotify={addToast} onLogout={handleLogout} onNavigate={(v: string) => navigate(`/admin/${v}`)} /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfilePage onBack={() => navigate("/admin")} onLogout={handleLogout} onNotify={addToast} /></ProtectedRoute>} />
                <Route path="/profile" element={<UserRoute>{user ? (user.role === "admin" ? <Navigate to="/admin/profile" replace /> : <BuyerProfilePage user={user} onNotify={addToast} onViewDetails={handleViewDetails} />) : <Navigate to="/login" replace />}</UserRoute>} />
                <Route path="/about" element={<UserRoute><AboutPage onNotify={addToast} /></UserRoute>} />
                <Route path="/about-us" element={<Navigate to="/about" replace />} />
                <Route path="/contact" element={<UserRoute><ContactPage onNotify={addToast} /></UserRoute>} />
                <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
                <Route path="/terms" element={<UserRoute><TermsPage onBack={() => navigate("/")} /></UserRoute>} />
                <Route path="/privacy" element={<UserRoute><PrivacyPage onBack={() => navigate("/")} /></UserRoute>} />
                <Route path="/help" element={<UserRoute><HelpPage onNotify={addToast} /></UserRoute>} />
                <Route path="/trust-safety" element={<Navigate to="/about" replace />} />
                <Route path="/brokers/:id" element={<UserRoute><BrokerProfilePage brokerId={location.pathname.split("/").pop()!} onBack={() => navigate("/")} onViewDetails={handleViewDetails} /></UserRoute>} />
                <Route path="/my-account" element={<Navigate to={user?.role === "admin" ? "/admin" : "/profile"} replace />} />
                <Route path="/compare" element={<UserRoute><VehicleComparison onNotify={addToast} onViewDetails={handleViewDetails} /></UserRoute>} />
                <Route path="*" element={<Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {!fullScreen && userRole !== "admin" && !isAccountRoute && (
        <footer className="shrink-0 bg-slate-950 border-t border-slate-800/80 pt-16 pb-10 px-6 md:px-12 mt-auto text-slate-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
            <div className="md:col-span-1 space-y-6">
              <Logo size="md" inverted />
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">{t("navigation:footer.tagline")}</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("navigation:footer.quickLinksTitle")}</h4>
              <ul className="space-y-3">
                <li><button onClick={() => navigate("/about")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> {t("navigation:menu.about")}</button></li>
                <li><button onClick={() => navigate("/services")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> {t("navigation:menu.services")}</button></li>
                <li><button onClick={() => navigate("/contact")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> {t("navigation:menu.contact")}</button></li>
                <li><button onClick={() => navigate("/terms")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> {t("navigation:footer.terms")}</button></li>
                <li><button onClick={() => navigate("/privacy")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> {t("navigation:footer.privacy")}</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Marketplace</h4>
              <ul className="space-y-3">
                <li><button onClick={() => user ? navigate("/profile?section=listings&action=new") : navigate("/login")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Sell Your Car</button></li>
                <li><button onClick={() => navigate("/vehicles")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Showroom</button></li>
                <li><button onClick={() => navigate("/compare")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Compare Vehicles</button></li>
                <li><button onClick={() => navigate("/help")} className="text-xs font-bold text-slate-400 hover:text-[#FF4846] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Help & Support</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Newsletter</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">Get the latest car deals and market updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="w-full text-xs p-2.5 bg-slate-900 text-white border border-slate-800 rounded-lg focus:outline-none focus:border-[#FF4846] placeholder:text-slate-500" />
                <button onClick={() => addToast("Newsletter registration active!", "success")} className="bg-[#FF4846] hover:bg-[#E63D3B] text-white font-black px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-colors shadow-sm shadow-[#FF4846]/20">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">© {new Date().getFullYear()} Arif Car Sell. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#FF4846]" /> Secured Platform</span>
            </div>
          </div>
        </footer>
      )}

      {!fullScreen && userRole !== "admin" && !isAccountRoute && (
        <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 flex items-center gap-1 rounded-[2rem] border border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-[#171B25]/95 md:hidden">
          <button
            onClick={() => { navigate("/"); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-[9px] font-semibold transition ${
              location.pathname === "/" && !mobileMenuOpen ? "bg-[#FF4846]/10 text-[#FF4846]" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Home size={19} strokeWidth={2.2} /><span>{t("navigation:menu.home", "Home")}</span>
          </button>

          <button
            onClick={() => { navigate("/vehicles"); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-[9px] font-semibold transition ${
              (location.pathname === "/vehicles" || location.pathname === "/browse") && !mobileMenuOpen ? "bg-[#FF4846]/10 text-[#FF4846]" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <LayoutGrid size={19} strokeWidth={2.2} /><span>{t("navigation:menu.vehicles", "Vehicles")}</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              if (!user) navigate("/login");
              else if (userRole === "broker") navigate("/broker-dashboard");
              else navigate("/profile?section=listings&action=new");
            }}
            className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300"
            aria-label={t("navigation:menu.sellCar", "Sell Car")}
          >
            <span className="-mt-7 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#FF4846] text-slate-950 shadow-lg shadow-[#FF4846]/30 transition-transform group-active:scale-95 dark:border-[#171B25]">
              <Plus size={23} strokeWidth={2.8} />
            </span>
            <span className="mt-0.5">{t("navigation:menu.sellCar", "Sell Car")}</span>
          </button>

          <button
            onClick={() => { navigate("/compare"); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-[9px] font-semibold transition ${
              location.pathname === "/compare" && !mobileMenuOpen ? "bg-[#FF4846]/10 text-[#FF4846]" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <GitCompare size={19} strokeWidth={2.2} /><span>{t("navigation:menu.compare", "Compare")}</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              if (!user) navigate("/login");
              else if (userRole === "broker") navigate("/broker-dashboard");
              else navigate("/profile");
            }}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-[9px] font-semibold transition ${
              (location.pathname === "/profile" || location.pathname.includes("dashboard") || location.pathname === "/login" || location.pathname === "/register") && !mobileMenuOpen ? "bg-[#FF4846]/10 text-[#FF4846]" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <UserCircle size={19} strokeWidth={2.2} /><span>{user ? (userRole === "broker" ? t("navigation:menu.brokerDashboard", "Portal") : t("navigation:menu.profile", "Profile")) : (location.pathname === "/register" ? t("navigation:menu.register", "Register") : t("navigation:menu.signIn", "Sign In"))}</span>
          </button>
        </div>
      )}

      <ScrollToTopButton />

      {showAuthModal && (
        <AuthModal
          defaultRole={authModalRole}
          initialTab={authModalTab}
          onClose={() => { setShowAuthModal(false); setAuthModalRole("buyer"); }}
          onSuccess={handleAuthSuccess}
          onNotify={addToast}
        />
      )}
      {typeof window !== "undefined" && window.location.hostname.includes("vercel.app") && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
        danger 
          ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <Icon size={15} className={danger ? "text-rose-500" : "text-slate-500 dark:text-slate-400"} />
      {label}
    </button>
  );
}
