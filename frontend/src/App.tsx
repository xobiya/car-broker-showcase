import React, { useState, useEffect } from "react";
import { Shield, MapPin, ShieldCheck } from "lucide-react";
import HomePage from "./components/HomePage";
import VehicleDetail from "./components/VehicleDetail";
import Showroom from "./components/Showroom";
import BrokerDashboard from "./components/BrokerDashboard";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import { VehicleListing, User } from "../../shared/types";
import { motion, AnimatePresence } from "motion/react";

interface ToastMsg {
  text: string;
  type: "success" | "error" | "info";
  id: string;
}

type ActiveView = "home" | "browse" | "detail" | "broker-dashboard" | "admin-panel";
const FULL_SCREEN_VIEWS: ActiveView[] = ["admin-panel", "broker-dashboard"];
type UserRole = "buyer" | "broker" | "admin";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const saved = localStorage.getItem("autobroker_user");
    if (saved) {
      const user: User = JSON.parse(saved);
      if (user.role === "broker") return "broker-dashboard";
      if (user.role === "admin") return "admin-panel";
    }
    return "home";
  });
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleListing | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("buyer");
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("autobroker_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Set role dynamically when user state changes
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    } else {
      setCurrentRole("buyer");
    }
  }, [currentUser]);
  
  // Status check variables
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [dbStatusText, setDbStatusText] = useState<string>("Verifying database...");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Search filter sharing from Home to Showroom
  const [initialFilters, setInitialFilters] = useState<any>(null);

  // Monitor backend configuration status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setIsConfigured(data.configured);
          setDbStatusText(data.dbType || "Connected");
        } else {
          setIsConfigured(false);
          setDbStatusText("Demo Mode Active");
        }
      } catch (err) {
        setIsConfigured(false);
        setDbStatusText("Offline Demo");
      }
    };
    checkStatus();
  }, []);

  const addNotification = (text: string, type: "success" | "error" | "info") => {
    const newToast: ToastMsg = {
      text,
      type,
      id: crypto.randomUUID(),
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBrowseWithFilters = (filters?: any) => {
    setInitialFilters(filters);
    setActiveView("browse");
  };

  const handleViewDetails = (vehicle: VehicleListing) => {
    setSelectedVehicle(vehicle);
    setActiveView("detail");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Toast Notification System */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none w-80 max-w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              onClick={() => removeToast(toast.id)}
              className={`pointer-events-auto cursor-pointer p-4 rounded-xl border flex items-start space-x-3 shadow-lg backdrop-blur-md transition-all duration-150 active:scale-[0.99] ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : toast.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex-1 text-[12px] font-semibold leading-relaxed select-text">
                {toast.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {/* Main Header */}
      {!FULL_SCREEN_VIEWS.includes(activeView) && (
      <header className="shrink-0 bg-white/95 border-b border-slate-200 h-20 px-6 flex items-center justify-between backdrop-blur-xl sticky top-0 z-35 shadow-sm">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveView("home")} 
          className="flex items-center space-x-3 cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900 uppercase tracking-tight font-sans leading-none">
                AutoBroker <span className="text-orange-500">Ethiopia</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-bold leading-none flex items-center gap-1">
              <MapPin size={10} /> Addis Ababa's Premier Sourcing Network
            </p>
          </div>
        </div>

        {/* Navigation center links - role-based */}
        <nav className="hidden md:flex items-center space-x-8">
          {currentRole !== "broker" && (
            <button 
              onClick={() => setActiveView("home")}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${
                activeView === "home" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"
              }`}
            >
              Home
            </button>
          )}
          {currentRole !== "broker" && (
            <button 
              onClick={() => handleBrowseWithFilters()}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${
                activeView === "browse" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"
              }`}
            >
              Browse Cars
            </button>
          )}

          {/* Broker-only: Dashboard */}
          {currentRole === "broker" && (
            <button 
              onClick={() => setActiveView("broker-dashboard")}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${
                activeView === "broker-dashboard" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"
              }`}
            >
              My Dashboard
            </button>
          )}

          {/* Non-broker, non-admin: Become a Broker */}
          {(!currentUser || currentRole === "buyer") && (
            <button 
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                } else {
                  addNotification("Contact admin to upgrade to a Broker account.", "info");
                }
              }}
              className="text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors text-slate-600"
            >
              Become a Broker
            </button>
          )}

          {/* Admin-only: Admin Panel */}
          {currentRole === "admin" && (
            <button 
              onClick={() => setActiveView("admin-panel")}
              className={`text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors ${
                activeView === "admin-panel" ? "text-orange-500 border-b-2 border-orange-500 pb-1" : "text-slate-600"
              }`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        {/* Right Buttons */}
        <div className="flex items-center space-x-4 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">{currentUser.role}</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("autobroker_user");
                  setCurrentUser(null);
                  setActiveView("home");
                  addNotification("Logged out successfully.", "success");
                }}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-slate-600 hover:text-slate-900 text-xs font-extrabold cursor-pointer"
              >
                Login
              </button>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-xs font-extrabold hover:shadow-sm transition-all cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>
      )}
      
      <main className={`${FULL_SCREEN_VIEWS.includes(activeView) ? "h-screen" : "flex-grow min-h-0"} flex flex-col`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`w-full ${FULL_SCREEN_VIEWS.includes(activeView) ? "h-full flex-1" : "flex-grow"} flex flex-col`}
          >
            {activeView === "home" && (
              <HomePage 
                onViewDetails={handleViewDetails}
                onBrowse={handleBrowseWithFilters}
                onBecomeBroker={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                  } else if (currentUser.role !== "broker") {
                    addNotification("Please sign in as a Broker to access dashboard.", "info");
                  } else {
                    setActiveView("broker-dashboard");
                  }
                }}
              />
            )}
            
            {activeView === "browse" && (
              <div className="max-w-7xl mx-auto w-full p-6 md:p-8 flex-grow">
                <Showroom 
                  onNotify={addNotification}
                  onInquireCar={handleViewDetails}
                />
              </div>
            )}

            {activeView === "detail" && selectedVehicle && (
              <VehicleDetail 
                vehicle={selectedVehicle}
                onBack={() => setActiveView("home")}
                onNotify={addNotification}
                onViewDetails={handleViewDetails}
              />
            )}

            {activeView === "broker-dashboard" && (
              <BrokerDashboard onNotify={addNotification} />
            )}

            {activeView === "admin-panel" && (
              <AdminPanel onNotify={addNotification} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Full Premium Footer */}
      {!FULL_SCREEN_VIEWS.includes(activeView) && (
      <footer className="shrink-0 bg-slate-100 border-t border-slate-200 pt-16 pb-10 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-900 text-white shadow-sm">
                <Shield size={16} />
              </div>
              <span className="text-base font-black tracking-tight uppercase">AutoBroker <span className="text-orange-500">Ethiopia</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The leading digital marketplace for high-quality verified vehicles in Ethiopia. Building trust in every transaction.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <span className="text-[10px] text-slate-400 font-bold">Follow us on social media</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Contact', 'Terms of Service', 'Privacy Policy'].map(link => (
                <li key={link}>
                  <a href="#" className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-300" /> {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Support */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Broker Support</h4>
            <ul className="space-y-3">
              {['Become a Broker', 'Commission Rates', 'Lead Dashboard', 'Inspection Standards'].map(link => (
                <li key={link}>
                  <a href="#" className="text-xs font-bold text-slate-600 hover:text-orange-500 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-300" /> {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Newsletter</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Get the latest car deals and market updates.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full text-xs p-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              <button 
                onClick={() => addNotification("Newsletter registration active!", "success")}
                className="bg-blue-950 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} AutoBroker Ethiopia. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> Secured Platform</span>
          </div>
        </div>
      </footer>
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setCurrentRole(user.role);
            localStorage.setItem("autobroker_user", JSON.stringify(user));
            if (user.role === "admin") {
              setActiveView("admin-panel");
            } else if (user.role === "broker") {
              setActiveView("broker-dashboard");
            }
          }}
          onNotify={addNotification}
        />
      )}

    </div>
  );
}
