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
const SellerDashboard = lazy(() => import("./dashboards/SellerDashboard"));
const AdminPanel = lazy(() => import("./dashboards/AdminPanel"));
const AdminProfilePage = lazy(() => import("./dashboards/AdminProfilePage"));
const NotificationsPage = lazy(() => import("./dashboards/NotificationsPage"));
const BrokerProfilePage = lazy(() => import("./dashboards/BrokerProfilePage"));
const BuyerProfilePage = lazy(() => import("./dashboards/BuyerProfilePage"));
const ChooseRolePage = lazy(() => import("./pages/ChooseRolePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

function PageLoader() {
  return (
    <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 text-slate-400">
      <Loader2 size={32} className="animate-spin text-amber-500 mb-3" />
      <p className="text-xs font-semibold tracking-wider uppercase">Loading...</p>
    </div>
  );
}

const FULL_SCREEN_ROUTES = ["/broker-dashboard", "/seller-dashboard", "/admin", "/admin/profile", "/admin/notifications"];

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
    return <Navigate to="/choose-role" replace />;
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
  const [vehiclesMenuOpen, setVehiclesMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const { toasts, removeToast } = useToast();
  const fullScreen = isFullScreenRoute(location.pathname);
  const userRole = user?.role || "buyer";

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setVehiclesMenuOpen(false);
    setServicesMenuOpen(false);
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
    else if (user.role === "seller") navigate("/seller-dashboard");
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
    navigate("/browse", { state: { filters } });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    addToast("Logged out successfully.", "success");
    navigate("/");
  }, [logout, addToast, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
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
          <div className="bg-[#0B0F19] text-slate-300 text-[11px] border-b border-slate-800/80 px-4 sm:px-6 md:px-8 py-2.5 hidden sm:flex items-center justify-between z-40 relative">
            <div className="flex items-center gap-6">
              <a href="tel:+251911234567" className="flex items-center gap-2 hover:text-[#22c55e] transition-colors cursor-pointer">
                <Phone size={13} className="text-[#22c55e]" />
                <span className="font-semibold">+251 91 123 4567</span>
              </a>
              <a href="mailto:concierge@arifcarsell.com" className="flex items-center gap-2 hover:text-[#22c55e] transition-colors cursor-pointer">
                <Mail size={13} className="text-[#22c55e]" />
                <span className="font-semibold">concierge@arifcarsell.com</span>
              </a>
            </div>

            {/* Middle Summer / Inventory Promo Badge */}
            <div className="hidden lg:inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1 rounded-full text-[11px] font-semibold text-slate-300">
              <Car size={13} className="text-[#22c55e]" />
              <span>More than <strong className="text-[#22c55e] font-black">500+</strong> verified inspected cars in Addis Ababa</span>
              <button
                onClick={() => navigate("/browse")}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] ml-1 transition cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
              >
                <span>Access Now</span>
                <ArrowRight size={10} strokeWidth={2.5} />
              </button>
            </div>

            {/* Right: Language / Currency / Dark Mode & Light Mode Toggle */}
            <div className="flex items-center gap-4 text-slate-400 font-bold">
              <span className="text-xs font-semibold text-slate-300 tracking-wide">EN</span>
              <span className="text-xs font-semibold text-slate-300 tracking-wide">ETB</span>
              <button
                onClick={toggleTheme}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/80 flex items-center justify-center"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme mode"
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
          <header className="shrink-0 bg-white/95 border-b border-slate-200/90 text-slate-900 h-20 px-4 sm:px-6 md:px-8 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 transition-colors duration-200 shadow-sm shadow-slate-950/5">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu size={22} />
              </button>
              <div onClick={() => navigate(userRole === "admin" ? "/admin" : "/")} className="cursor-pointer shrink-0">
                <Logo size="md" />
              </div>
            </div>

            {/* Actual Pages Navigation: Clean, Professional, Emerald Accents */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {userRole !== "broker" && userRole !== "seller" && userRole !== "admin" && (
                <button
                  onClick={() => navigate("/")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname === "/" ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Home
                </button>
              )}
              {userRole !== "broker" && userRole !== "seller" && userRole !== "admin" && (
                <button
                  onClick={() => navigate("/browse")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname === "/browse" ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Vehicles
                </button>
              )}
              {userRole !== "admin" && (
                <button
                  onClick={() => navigate("/services")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname === "/services" ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Services
                </button>
              )}
              {userRole !== "admin" && (
                <button
                  onClick={() => navigate("/compare")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname === "/compare" ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Compare
                </button>
              )}
              {userRole === "broker" && (
                <button
                  onClick={() => navigate("/broker-dashboard")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname === "/broker-dashboard" ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Broker Portal
                </button>
              )}
              {userRole === "seller" && (
                <button
                  onClick={() => navigate("/seller-dashboard")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname === "/seller-dashboard" ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Seller Hub
                </button>
              )}
              {userRole === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                    location.pathname.startsWith("/admin") ? "text-[#22c55e]" : "text-slate-700"
                  }`}
                >
                  Admin Panel
                </button>
              )}
              {userRole !== "admin" && (
                <>
                  <button
                    onClick={() => navigate("/about")}
                    className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                      location.pathname === "/about" ? "text-[#22c55e]" : "text-slate-700"
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => navigate("/contact")}
                    className={`text-[13px] font-bold tracking-tight cursor-pointer hover:text-[#22c55e] transition-colors ${
                      location.pathname === "/contact" ? "text-[#22c55e]" : "text-slate-700"
                    }`}
                  >
                    Contact
                  </button>
                </>
              )}
            </nav>

            {/* Right: Sign in, Add Listing & Grid Icon Button */}
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-full px-3 py-1.5 shadow-xs transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold hidden sm:block text-slate-800">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={12} className={`text-slate-500 transition ${profileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#22c55e] mt-0.5">{user.role}</p>
                        </div>
                        <div className="py-1">
                          {userRole === "buyer" && (
                            <DropdownItem icon={LayoutDashboard} label="My Saved & Requests" onClick={() => { navigate("/profile"); setProfileDropdownOpen(false); }} />
                          )}
                          {(userRole === "broker" || userRole === "seller") && (
                            <DropdownItem icon={LayoutDashboard} label="My Dashboard" onClick={() => { navigate(userRole === "broker" ? "/broker-dashboard" : "/seller-dashboard"); setProfileDropdownOpen(false); }} />
                          )}
                          {userRole === "admin" && (
                            <>
                              <DropdownItem icon={LayoutDashboard} label="Admin Panel" onClick={() => { navigate("/admin"); setProfileDropdownOpen(false); }} />
                              <DropdownItem icon={UserCircle} label="Admin Profile" onClick={() => { navigate("/admin/profile"); setProfileDropdownOpen(false); }} />
                            </>
                          )}
                          {userRole !== "admin" && (
                            <DropdownItem icon={UserCircle} label="Profile Settings" onClick={() => { navigate("/profile"); setProfileDropdownOpen(false); }} />
                          )}
                        </div>
                        <div className="border-t border-slate-100 pt-1">
                          <DropdownItem icon={LogOut} label="Sign Out" onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} danger />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => navigate("/login")}
                    className={`flex items-center gap-1.5 text-xs sm:text-[13px] font-bold transition-colors cursor-pointer px-2 sm:px-3 py-1.5 rounded-full ${
                      location.pathname === "/login"
                        ? "text-[#22c55e] bg-emerald-50 border border-emerald-200/80"
                        : "text-slate-700 hover:text-[#22c55e]"
                    }`}
                  >
                    <UserCircle size={16} className={location.pathname === "/login" ? "text-[#22c55e]" : "text-slate-600"} />
                    <span>Sign in</span>
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className={`hidden sm:inline-flex items-center gap-1 text-xs sm:text-[13px] font-bold transition-colors cursor-pointer px-2.5 py-1.5 rounded-full ${
                      location.pathname === "/register"
                        ? "text-[#22c55e] bg-emerald-50 border border-emerald-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Sign up</span>
                  </button>
                </div>
              )}

              {/* Add Listing Pill Button */}
              <button
                onClick={() => {
                  if (!user) navigate("/choose-role");
                  else if (userRole === "seller") navigate("/seller-dashboard");
                  else if (userRole === "broker") navigate("/broker-dashboard");
                  else navigate("/choose-role");
                }}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs transition cursor-pointer shadow-sm hover:shadow-emerald-500/20 tracking-tight active:scale-95 whitespace-nowrap"
              >
                Add Listing
              </button>

              {/* Green Grid 4-Squares Icon Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 transition cursor-pointer shadow-xs flex items-center justify-center active:scale-95 shrink-0"
                aria-label="Navigation drawer"
                title="Navigation & Categories"
              >
                <LayoutGrid size={18} strokeWidth={2.2} className="text-slate-700" />
              </button>
            </div>
          </header>

          {/* Off-canvas Mobile Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 240 }}
                  className="fixed inset-y-0 left-0 z-50 w-[84%] max-w-sm bg-white text-slate-900 shadow-2xl flex flex-col md:hidden border-r border-slate-200 overflow-hidden"
                >
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                    <Logo size="sm" />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {user ? (
                      <div className="p-4 rounded-2xl bg-slate-50 text-slate-900 space-y-3 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-sm font-black shadow-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-[#16a34a] border border-emerald-200/80">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (user.role === "broker") navigate("/broker-dashboard");
                            else if (user.role === "seller") navigate("/seller-dashboard");
                            else if (user.role === "admin") navigate("/admin");
                            else navigate("/profile");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <LayoutDashboard size={14} />
                          Go to Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Welcome to Arif Car Sell</p>
                          <p className="text-[11px] text-slate-500">Sign in to contact brokers, schedule test drives, and save cars.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                            className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-xs"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/20"
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      {userRole !== "admin" ? (
                        <>
                          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Marketplace</p>
                          {[
                            { to: "/", label: "Home", icon: Home },
                            { to: "/browse", label: "Showroom Inventory", icon: LayoutGrid },
                            { to: "/services", label: "Broker Services & Inspection", icon: Sparkles },
                            { to: "/compare", label: "Compare Vehicles", icon: GitCompare },
                            { to: "/about", label: "About Our Marketplace", icon: Info },
                            { to: "/contact", label: "Contact Broker Support", icon: Phone },
                          ].map(item => {
                            const Icon = item.icon;
                            const active = location.pathname === item.to;
                            return (
                              <button
                                key={item.to}
                                onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                  active
                                    ? "bg-emerald-50 text-[#16a34a] font-extrabold"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                              >
                                <Icon size={16} className={active ? "text-[#16a34a]" : "text-slate-400"} />
                                {item.label}
                              </button>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Administration</p>
                          {[
                            { to: "/admin", label: "Admin Control Panel", icon: ShieldCheck },
                            { to: "/admin/profile", label: "Admin Profile", icon: UserCircle },
                            { to: "/admin/notifications", label: "Notifications & Alerts", icon: Info },
                          ].map(item => {
                            const Icon = item.icon;
                            const active = location.pathname === item.to;
                            return (
                              <button
                                key={item.to}
                                onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                  active
                                    ? "bg-emerald-50 text-[#16a34a] font-extrabold"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                              >
                                <Icon size={16} className={active ? "text-[#16a34a]" : "text-slate-400"} />
                                {item.label}
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Account & Roles</p>
                      {userRole === "admin" && (
                        <button
                          onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <ShieldCheck size={16} className="text-indigo-600" />
                          Admin Control Panel
                        </button>
                      )}
                      {userRole === "broker" && (
                        <button
                          onClick={() => { navigate("/broker-dashboard"); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <LayoutDashboard size={16} className="text-indigo-600" />
                          Broker Portal
                        </button>
                      )}
                      {userRole === "seller" && (
                        <button
                          onClick={() => { navigate("/seller-dashboard"); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <LayoutDashboard size={16} className="text-orange-600" />
                          Seller Hub
                        </button>
                      )}
                      {!user && (
                        <button
                          onClick={() => { navigate("/choose-role"); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white cursor-pointer"
                        >
                          <UserCircle size={16} className="text-slate-400" />
                          Join as Broker or Seller
                        </button>
                      )}
                    </div>

                    {/* Mobile Theme Mode Switcher */}
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition"
                      >
                        <span className="flex items-center gap-2">
                          {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-300" />}
                          <span>Appearance</span>
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-[#22c55e]">
                          {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </span>
                      </button>
                    </div>

                    {user && (
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <main className={`${fullScreen ? "h-screen" : "flex-grow min-h-0"} flex flex-col pb-16 sm:pb-0`}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`w-full ${fullScreen ? "h-full flex-1" : "flex-grow"} flex flex-col`}
            >
              <Routes>
                <Route path="/" element={<UserRoute><HomePage currentUser={user} onViewDetails={handleViewDetails} onBrowse={handleBrowseWithFilters} onViewBrokerProfile={handleViewBrokerProfile} onBecomeBroker={() => { if (!user) navigate("/choose-role"); else if (user.role === "broker") navigate("/broker-dashboard"); else if (user.role === "seller") navigate("/seller-dashboard"); else if (user.role === "admin") navigate("/admin"); else addToast("Contact admin to upgrade to a Broker account.", "info"); }} onChooseRole={() => navigate("/choose-role")} /></UserRoute>} />
                <Route path="/choose-role" element={<UserRoute><ChooseRolePage onSelectRole={(role) => { setAuthModalRole(role); setShowAuthModal(true); }} onSignIn={() => navigate("/login")} /></UserRoute>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/services" element={<UserRoute><ServicesPage onNotify={addToast} /></UserRoute>} />
                <Route path="/service" element={<Navigate to="/services" replace />} />
                <Route path="/browse" element={<UserRoute><div className="max-w-7xl mx-auto w-full p-6 md:p-8 flex-grow"><Showroom onNotify={addToast} onInquireCar={handleViewDetails} /></div></UserRoute>} />
                <Route path="/vehicles/:id" element={<UserRoute><VehicleDetail vehicle={selectedVehicle} onBack={() => navigate(-1)} onNotify={addToast} onViewDetails={handleViewDetails} onViewBrokerProfile={handleViewBrokerProfile} /></UserRoute>} />
                <Route path="/broker-dashboard" element={<ProtectedRoute allowedRoles={["broker"]}><BrokerDashboard onNotify={addToast} onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/seller-dashboard" element={<ProtectedRoute allowedRoles={["seller"]}><SellerDashboard currentUser={user} onNotify={addToast} onLogout={handleLogout} /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel onNotify={addToast} onLogout={handleLogout} onNavigate={(v: string) => navigate(`/admin/${v}`)} /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfilePage onBack={() => navigate("/admin")} onLogout={handleLogout} onNotify={addToast} /></ProtectedRoute>} />
                <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><NotificationsPage onBack={() => navigate("/admin")} /></ProtectedRoute>} />
                <Route path="/profile" element={<UserRoute>{user ? user.role === "buyer" ? <BuyerProfilePage user={user} onNotify={addToast} onViewDetails={handleViewDetails} /> : <div className="max-w-2xl mx-auto w-full p-6 md:p-8 flex-grow"><ProfileView user={user} onLogout={handleLogout} onBack={() => navigate("/")} /></div> : <div className="p-8 text-center"><p className="text-sm font-semibold text-slate-500">Please log in to view your profile.</p></div>}</UserRoute>} />
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

      {!fullScreen && userRole !== "admin" && (
        <footer className="shrink-0 bg-slate-950 border-t border-slate-800/80 pt-16 pb-10 px-6 md:px-12 mt-auto text-slate-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
            <div className="md:col-span-1 space-y-6">
              <Logo size="md" inverted />
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">The leading digital marketplace for high-quality verified vehicles.</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => navigate("/about")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> About Us</button></li>
                <li><button onClick={() => navigate("/services")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Broker Services</button></li>
                <li><button onClick={() => navigate("/contact")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Contact</button></li>
                <li><button onClick={() => navigate("/terms")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Terms of Service</button></li>
                <li><button onClick={() => navigate("/privacy")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Privacy Policy</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">For Sellers</h4>
              <ul className="space-y-3">
                <li><button onClick={() => user ? navigate("/seller-dashboard") : navigate("/choose-role")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Sell Your Car</button></li>
                {['Pricing Guide', 'Listing Tips'].map(link => (
                  <li key={link}>
                    <button onClick={() => addToast("Coming soon!", "info")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-600" /> {link}
                    </button>
                  </li>
                ))}
                <li><button onClick={() => navigate("/help")} className="text-xs font-bold text-slate-400 hover:text-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-600" /> Help Center</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Newsletter</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">Get the latest car deals and market updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="w-full text-xs p-2.5 bg-slate-900 text-white border border-slate-800 rounded-lg focus:outline-none focus:border-[#22c55e] placeholder:text-slate-500" />
                <button onClick={() => addToast("Newsletter registration active!", "success")} className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-black px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-colors shadow-sm shadow-[#22c55e]/20">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">© {new Date().getFullYear()} Arif Car Sell. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#22c55e]" /> Secured Platform</span>
            </div>
          </div>
        </footer>
      )}

      {!fullScreen && userRole !== "admin" && (
        <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-around px-1 py-1 shadow-[0_-3px_16px_rgba(0,0,0,0.06)]">
          <button onClick={() => navigate("/")} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl cursor-pointer transition-colors min-w-0 ${location.pathname === "/" ? "text-[#22c55e] font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}>
            <Home size={20} /><span className="text-[10px]">Home</span>
          </button>
          <button onClick={() => navigate("/browse")} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl cursor-pointer transition-colors min-w-0 ${location.pathname === "/browse" ? "text-[#22c55e] font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}>
            <LayoutGrid size={20} /><span className="text-[10px]">Showroom</span>
          </button>
          <button onClick={() => navigate("/compare")} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl cursor-pointer transition-colors min-w-0 ${location.pathname === "/compare" ? "text-[#22c55e] font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}>
            <GitCompare size={20} /><span className="text-[10px]">Compare</span>
          </button>
          <button onClick={() => {
            if (!user) navigate("/login");
            else if (userRole === "broker") navigate("/broker-dashboard");
            else if (userRole === "seller") navigate("/seller-dashboard");
            else navigate("/profile");
          }} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl cursor-pointer transition-colors min-w-0 ${(location.pathname === "/profile" || location.pathname.includes("dashboard")) ? "text-[#22c55e] font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}>
            <UserCircle size={20} /><span className="text-[10px]">{user ? (userRole === "broker" ? "Broker" : userRole === "seller" ? "Seller" : "Saved") : "Sign In"}</span>
          </button>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          defaultRole={authModalRole}
          initialTab={authModalTab}
          onClose={() => { setShowAuthModal(false); setAuthModalRole("buyer"); }}
          onSuccess={handleAuthSuccess}
          onNotify={addToast}
        />
      )}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
        danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={15} className={danger ? "text-rose-500" : "text-slate-500"} />
      {label}
    </button>
  );
}

function ProfileView({ user, onLogout, onBack }: { user: User; onLogout: () => void; onBack: () => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 md:p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-blue-200 font-black uppercase tracking-wider mt-0.5">{user.role}</p>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{user.phone}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Joined</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</p>
            <p className="text-sm font-semibold text-emerald-600 mt-1">Active</p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">Back to Home</button>
          <button onClick={onLogout} className="text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg transition cursor-pointer">Logout</button>
        </div>
      </div>
    </div>
  );
}
