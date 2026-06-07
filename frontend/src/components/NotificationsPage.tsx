import React, { useState } from "react";
import { Bell, ArrowLeft, Check, X } from "lucide-react";

interface NotificationsPageProps {
  onBack: () => void;
}

const INITIAL_NOTIFICATIONS = [
  { id: "n1", text: "New listing pending approval: Toyota Corolla 2024", time: "5 min ago", unread: true },
  { id: "n2", text: "Report received: Suspicious activity on listing #V-003", time: "12 min ago", unread: true },
  { id: "n3", text: "Broker Dawit Mekonnen listed 3 new vehicles", time: "1 hour ago", unread: false },
  { id: "n4", text: "Commission payout processed: 280,000 ETB", time: "3 hours ago", unread: false },
  { id: "n5", text: "New buyer inquiry for Hyundai Tucson 2023", time: "5 hours ago", unread: false },
  { id: "n6", text: "Vehicle inspection completed: Toyota Hilux 2022", time: "1 day ago", unread: false },
  { id: "n7", text: "Broker Yonas Hailu updated listing price", time: "2 days ago", unread: false },
  { id: "n8", text: "New user registration: Broker application from Tigist Assefa", time: "3 days ago", unread: false },
];

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer">
            <ArrowLeft size={18} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900">Notifications</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-bold text-blue-900 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5">
              <Check size={14} /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer flex items-center gap-1.5">
              <X size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Bell size={40} className="text-slate-300 mb-4" />
            <p className="text-sm font-bold text-slate-400">No notifications</p>
            <p className="text-xs text-slate-300 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`px-6 py-4 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${n.unread ? "bg-blue-50/40" : ""}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-blue-900" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.unread ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                    {n.text}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
