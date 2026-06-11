import { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Shield, ShieldCheck, Home, LayoutGrid, UserCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useStore } from "./store";
import { useAuth } from "./hooks/useAuth";
import { authApi, setToken } from "./lib/api";
import AuthModal from "./components/ui/AuthModal";
import HomePage from "./pages/HomePage";
import Showroom from "./pages/Showroom";
import VehicleDetail from "./pages/VehicleDetail";
import VehicleComparison from "./pages/VehicleComparison";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpPage from "./pages/HelpPage";
import TrustSafetyPage from "./pages/TrustSafetyPage";
import BrokerDashboard from "./dashboards/BrokerDashboard";
import AdminPanel from "./dashboards/AdminPanel";
import AdminProfilePage from "./dashboards/AdminProfilePage";
import NotificationsPage from "./dashboards/NotificationsPage";
import BrokerProfilePage from "./dashboards/BrokerProfilePage";
import BuyerDashboard from "./dashboards/BuyerDashboard";
import type { VehicleListing, User } from "../../shared/types";

const FULL_SCREEN_ROUTES = ["/broker-dashboard", "/admin", "/admin/profile", "/admin/notifications"];

function useToast() {
  return useStore(s => ({ toasts: s.toasts, removeToast: s.removeToast }));
}

function isFullScreenRoute(path: string) {
  return FULL_SCREEN_ROUTES.some(r => path.startsWith(r));
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setUser, addToast, selectedVehicle, setSelectedVehicle, setSelectedBrokerId } = useStore();
  const { logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const { toasts, removeToast } = useToast();
  const fullScreen = isFullScreenRoute(location.pathname);
  const userRole = user?.role || "buyer";

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
    else navigate("/browse");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none w-80 max-w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto cursor-pointer p-4 rounded-xl border flex items-start space-x-3 shadow-lg backdrop-blur-md transition-all duration-150 active:scale-[0.99] ${
                toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
                "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex-1 text-[12px] font-semibold leading-relaxed select-text">{toast.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!fullScreen && (
        <header className="shrink-0 bg-white/95 border-b border-slate-200 h-20 px-6 flex items-center justify-between backdrop-blur-xl sticky top-0 z-35 shadow-sm">
          <div onClick={() => navigate("/")} className="flex items-center space-x-3 cursor-pointer shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight font-sans leading-none">Arif Car Sell</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {userRole !== "broker" && (
              <button onClick={() => navigate("/")}
                className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${location.pathname === "/" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"}`}>
                Home
              </button>
            )}
            {userRole !== "broker" && (
              <button onClick={() => navigate("/browse")}
                className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${location.pathname === "/browse" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"}`}>
                Browse
              </button>
            )}
            {userRole === "broker" && (
              <button onClick={() => navigate("/broker-dashboard")}
                className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${location.pathname === "/broker-dashboard" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"}`}>
                My Dashboard
              </button>
            )}
            {(!user || userRole === "buyer") && (
              <button onClick={() => { if (!user) setShowAuthModal(true); else addToast("Contact admin to upgrade to a Broker account.", "info"); }}
                className="text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors text-slate-600">
                Become a Broker
              </button>
            )}
            {userRole === "admin" && (
              <button onClick={() => navigate("/admin")}
                className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${location.pathname.startsWith("/admin") ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"}`}>
                Admin Panel
              </button>
            )}
            <button onClick={() => navigate("/about")}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${location.pathname === "/about" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"}`}>
              About
            </button>
            <button onClick={() => navigate("/contact")}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${location.pathname === "/contact" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"}`}>
              Contact
            </button>
          </nav>

          <div className="flex items-center space-x-3 shrink-0">
            {user ? (
              <div className="relative">
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-sm hover:bg-blue-800 transition cursor-pointer">
                  <span className="text-sm font-black">{user.name.charAt(0).toUpperCase()}</span>
                </button>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 space-y-0.5">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">{user.role}</p>
                      </div>
                      <button onClick={() => { navigate("/profile"); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer">
                        Profile
                      </button>
                      {userRole === "broker" && (
                        <button onClick={() => { navigate("/broker-dashboard"); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer">
                          My Dashboard
                        </button>
                      )}
                      {userRole === "admin" && (
                        <button onClick={() => { navigate("/admin"); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer">
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition cursor-pointer">
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => setShowAuthModal(true)} className="text-slate-600 hover:text-slate-900 text-xs font-extrabold cursor-pointer">Login</button>
                <button onClick={() => setShowAuthModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-extrabold hover:shadow-sm transition-all cursor-pointer">Register</button>
              </>
            )}
          </div>
        </header>
      )}

      <main className={`${fullScreen ? "h-screen" : "flex-grow min-h-0"} flex flex-col pb-16 sm:pb-0`}>
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
              <Route path="/" element={<HomePage currentUser={user} onViewDetails={handleViewDetails} onBrowse={handleBrowseWithFilters} onViewBrokerProfile={handleViewBrokerProfile} onBecomeBroker={() => { if (!user) setShowAuthModal(true); else if (user.role === "broker") navigate("/broker-dashboard"); else if (user.role === "admin") navigate("/admin"); else addToast("Contact admin to upgrade to a Broker account.", "info"); }} />} />
              <Route path="/browse" element={<div className="max-w-7xl mx-auto w-full p-6 md:p-8 flex-grow"><Showroom onNotify={addToast} onInquireCar={handleViewDetails} /></div>} />
              <Route path="/vehicles/:id" element={<VehicleDetail vehicle={selectedVehicle!} onBack={() => navigate(-1)} onNotify={addToast} onViewDetails={handleViewDetails} onViewBrokerProfile={handleViewBrokerProfile} />} />
              <Route path="/broker-dashboard" element={<BrokerDashboard onNotify={addToast} onLogout={handleLogout} />} />
              <Route path="/admin" element={<AdminPanel onNotify={addToast} onLogout={handleLogout} onNavigate={(v: string) => navigate(v)} />} />
              <Route path="/admin/profile" element={<AdminProfilePage onBack={() => navigate("/admin")} onLogout={handleLogout} onNotify={addToast} />} />
              <Route path="/admin/notifications" element={<NotificationsPage onBack={() => navigate("/admin")} />} />
              <Route path="/profile" element={user ? <div className="max-w-2xl mx-auto w-full p-6 md:p-8 flex-grow"><ProfileView user={user} onLogout={handleLogout} onBack={() => navigate("/")} /></div> : <div className="p-8 text-center"><p className="text-sm font-semibold text-slate-500">Please log in to view your profile.</p></div>} />
              <Route path="/about" element={<AboutPage onNotify={addToast} />} />
              <Route path="/contact" element={<ContactPage onNotify={addToast} />} />
              <Route path="/terms" element={<TermsPage onBack={() => navigate("/")} />} />
              <Route path="/privacy" element={<PrivacyPage onBack={() => navigate("/")} />} />
              <Route path="/help" element={<HelpPage onNotify={addToast} />} />
              <Route path="/trust-safety" element={<TrustSafetyPage onBack={() => navigate("/")} />} />
              <Route path="/brokers/:id" element={<BrokerProfilePage brokerId={location.pathname.split("/").pop()!} onBack={() => navigate("/")} onViewDetails={handleViewDetails} />} />
              <Route path="/my-account" element={user ? <BuyerDashboard currentUser={user} onNotify={addToast} onViewDetails={handleViewDetails} /> : <div className="p-8 text-center"><p className="text-sm font-semibold text-slate-500">Please log in.</p></div>} />
              <Route path="/compare" element={<VehicleComparison onNotify={addToast} onViewDetails={handleViewDetails} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!fullScreen && userRole !== "admin" && (
        <footer className="shrink-0 bg-slate-100 border-t border-slate-200 pt-16 pb-10 px-6 md:px-12 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
            <div className="md:col-span-1 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-900 text-white shadow-sm"><Shield size={16} /></div>
                <span className="text-base font-black tracking-tight uppercase">Arif Car Sell</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">The leading digital marketplace for high-quality verified vehicles in Ethiopia.</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => navigate("/about")} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-300" /> About Us</button></li>
                <li><button onClick={() => navigate("/contact")} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-300" /> Contact</button></li>
                <li><button onClick={() => navigate("/terms")} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-300" /> Terms of Service</button></li>
                <li><button onClick={() => navigate("/privacy")} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-300" /> Privacy Policy</button></li>
                <li><button onClick={() => navigate("/trust-safety")} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-300" /> Trust & Safety</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Broker Support</h4>
              <ul className="space-y-3">
                {['Become a Broker', 'Commission Rates', 'Lead Dashboard', 'Inspection Standards'].map(link => (
                  <li key={link}>
                    <button onClick={() => { if (!user) setShowAuthModal(true); else addToast("Contact admin to upgrade.", "info"); }} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-300" /> {link}
                    </button>
                  </li>
                ))}
                <li><button onClick={() => navigate("/help")} className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer"><span className="w-1 h-1 rounded-full bg-slate-300" /> Help Center</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Newsletter</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">Get the latest car deals and market updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="w-full text-xs p-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" />
                <button onClick={() => addToast("Newsletter registration active!", "success")} className="bg-blue-950 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">© {new Date().getFullYear()} Arif Car Sell. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> Secured Platform</span>
            </div>
          </div>
        </footer>
      )}

      {!fullScreen && userRole !== "admin" && (
        <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around px-1 py-1 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <button onClick={() => navigate("/")} className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors min-w-0 ${location.pathname === "/" ? "text-[#0F4C81]" : "text-slate-400"}`}>
            <Home size={22} /><span className="text-[9px] font-semibold">Home</span>
          </button>
          <button onClick={() => navigate("/browse")} className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors min-w-0 ${location.pathname === "/browse" ? "text-[#0F4C81]" : "text-slate-400"}`}>
            <LayoutGrid size={22} /><span className="text-[9px] font-semibold">Browse</span>
          </button>
          <button onClick={() => navigate("/about")} className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors min-w-0 ${location.pathname === "/about" ? "text-[#0F4C81]" : "text-slate-400"}`}>
            <Info size={22} /><span className="text-[9px] font-semibold">About</span>
          </button>
          <button onClick={() => { if (!user) setShowAuthModal(true); else navigate("/profile"); }} className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors min-w-0 ${location.pathname === "/profile" ? "text-[#0F4C81]" : "text-slate-400"}`}>
            <UserCircle size={22} /><span className="text-[9px] font-semibold">{user ? "Profile" : "Login"}</span>
          </button>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onNotify={addToast}
        />
      )}
      <Analytics />
      <SpeedInsights />
    </div>
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
            <h1 className="text-xl font-bold">{user.name}</h1>
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
