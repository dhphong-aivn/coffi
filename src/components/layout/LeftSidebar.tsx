"use client";

import { useAppStore, ViewType } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  Coffee, ReceiptText, Truck, Settings, MessageSquareDot,
  HelpCircle, LogOut, LayoutDashboard
} from "lucide-react";

const NAV_ITEMS: { id: ViewType; icon: React.ReactNode; label: string }[] = [
  { id: "menu", icon: <Coffee size={24} />, label: "Menu" },
  { id: "orders", icon: <ReceiptText size={24} />, label: "My Orders" },
  { id: "tracking", icon: <Truck size={24} />, label: "Order Tracking" },
  { id: "settings", icon: <Settings size={24} />, label: "Settings" },
  { id: "support", icon: <MessageSquareDot size={24} />, label: "Chat & Support" },
  { id: "help", icon: <HelpCircle size={24} />, label: "Help Center" },
];

export function LeftSidebar() {
  const { currentView, setCurrentView } = useAppStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  const isStaff = isAuthenticated && (user?.role === "admin" || user?.role === "staff");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAdminPanel = () => {
    router.push("/admin");
  };

  return (
    <aside className="w-[280px] h-screen sticky left-0 top-0 bg-surface-container-low flex flex-col py-12 px-8 space-y-8 z-50">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline text-primary-container">Cof fi</h1>
        <p className="text-secondary text-sm font-medium">Modern Alchemist</p>
      </div>
      <nav className="flex-1 flex flex-col space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer ${
              currentView === item.id
                ? "bg-white/50 text-primary-container font-bold shadow-sm"
                : "text-secondary hover:bg-white/50"
            }`}
          >
            {item.icon}
            <span className="font-headline text-base tracking-tight">{item.label}</span>
          </button>
        ))}

        {/* Admin Panel button — chỉ hiện khi đã login admin/staff */}
        {isStaff && (
          <button
            onClick={handleAdminPanel}
            className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer text-primary-container bg-primary-container/5 hover:bg-primary-container/10 border border-primary-container/10 mt-4"
          >
            <LayoutDashboard size={24} />
            <span className="font-headline text-base tracking-tight font-bold">Admin Panel</span>
          </button>
        )}
      </nav>
      <div className="pt-8 space-y-2">
        {/* Login / Logout */}
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container text-xs font-bold">
                {user?.fullName?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-bold text-on-surface truncate">{user?.fullName}</p>
                <p className="text-[10px] text-secondary/60 uppercase">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-secondary hover:bg-error/10 hover:text-error transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <LogOut size={24} />
              <span className="font-headline text-base tracking-tight">Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-primary-container bg-primary-container/5 hover:bg-primary-container/10 transition-all duration-300 cursor-pointer"
          >
            <LogOut size={24} className="rotate-180" />
            <span className="font-headline text-base tracking-tight">Staff Login</span>
          </button>
        )}
      </div>
    </aside>
  );
}
