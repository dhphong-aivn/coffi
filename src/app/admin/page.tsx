"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import {
  LayoutDashboard, Coffee, ClipboardList, PackagePlus, Users, Truck,
  LogOut, ChevronRight, Loader2, Bell, TrendingUp, AlertTriangle, ShoppingBag
} from "lucide-react";

// ── Types ──
type AdminView = "dashboard" | "orders" | "menu" | "restock" | "users";

interface DashboardData {
  ordersToday: number;
  revenueToday: number;
  lowStockCount: number;
  topItems: { name: string; sold: number }[];
  stockAlerts: { menuId: string; name: string; currentStock: number; minStock: number; status: string }[];
  admin?: { totalRevenue: number; totalOrders: number };
}

interface Order {
  orderId: string; phone: string; name: string;
  items: any[]; total: number; fulfillment: string;
  status: string; source: string; note: string; timestamp: string;
}

// ── Main Page ──
export default function AdminPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

  const isAdmin = user?.role === "admin";

  const NAV: { id: AdminView; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "orders", label: "Đơn hàng", icon: <ClipboardList size={20} /> },
    { id: "menu", label: "Menu", icon: <Coffee size={20} />, adminOnly: true },
    { id: "restock", label: "Nhập kho", icon: <PackagePlus size={20} /> },
    { id: "users", label: "Nhân viên", icon: <Users size={20} />, adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-[260px] h-screen sticky top-0 bg-surface-container-low flex flex-col py-8 px-6 z-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-headline text-primary-container">Cof fi</h1>
          <p className="text-[11px] text-secondary/60 font-body mt-0.5">
            {isAdmin ? "Admin Panel" : "Staff Panel"}
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.filter((n) => !n.adminOnly || isAdmin).map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-body transition-all cursor-pointer ${
                currentView === item.id
                  ? "bg-primary-container/10 text-primary-container font-bold"
                  : "text-secondary hover:bg-white/50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="pt-6 border-t border-outline-variant/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container text-sm font-bold">
              {user?.fullName?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-bold text-on-surface truncate">{user?.fullName}</p>
              <p className="text-[10px] text-secondary/60 font-body uppercase">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-body text-secondary hover:bg-error/10 hover:text-error transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        {currentView === "dashboard" && <DashboardView role={user?.role || "staff"} />}
        {currentView === "orders" && <OrdersView role={user?.role || "staff"} />}
        {currentView === "menu" && isAdmin && <MenuView />}
        {currentView === "restock" && <RestockView role={user?.role || "staff"} />}
        {currentView === "users" && isAdmin && <UsersView />}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD VIEW
// ════════════════════════════════════════════════════════════════

function DashboardView({ role }: { role: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard(role).then((res) => {
      if (res.success) setData(res.dashboard);
      setLoading(false);
    });
  }, [role]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage text="Không thể tải Dashboard" />;

  const formatCurrency = (n: number) => n.toLocaleString("vi-VN") + " ₫";

  const cards = [
    { label: "Đơn hôm nay", value: data.ordersToday, icon: <ShoppingBag size={20} />, color: "text-blue-600 bg-blue-50" },
    { label: "Doanh thu hôm nay", value: formatCurrency(data.revenueToday), icon: <TrendingUp size={20} />, color: "text-emerald-600 bg-emerald-50" },
    { label: "Sắp hết kho", value: data.lowStockCount, icon: <AlertTriangle size={20} />, color: data.lowStockCount > 0 ? "text-red-600 bg-red-50" : "text-secondary bg-surface-container" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-headline font-bold text-on-surface">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <span className="text-[11px] text-secondary/70 font-body uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-2xl font-headline font-extrabold text-on-surface">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Top Items */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
        <h3 className="font-headline font-bold text-on-surface mb-4">🏆 Top 5 Món Bán Chạy</h3>
        {data.topItems.length > 0 ? (
          <div className="space-y-3">
            {data.topItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-full bg-primary-container/10 flex items-center justify-center text-xs font-bold text-primary-container">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-body font-bold text-on-surface">{item.name}</span>
                <span className="text-sm font-body text-secondary">{item.sold} sold</span>
                <div className="w-24 h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full"
                    style={{ width: `${(item.sold / (data.topItems[0]?.sold || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary/60">Chưa có dữ liệu bán hàng</p>
        )}
      </div>

      {/* Stock Alerts */}
      {data.stockAlerts.length > 0 && (
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-200/30">
          <h3 className="font-headline font-bold text-red-700 mb-4">🚨 Cảnh Báo Tồn Kho</h3>
          <div className="space-y-2">
            {data.stockAlerts.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-2.5">
                <span className="text-sm font-body font-bold text-on-surface">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.status === "out_of_stock" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {item.status === "out_of_stock" ? "Hết hàng" : "Sắp hết"}
                  </span>
                  <span className="text-sm text-secondary font-body">Còn {item.currentStock} / Min {item.minStock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  ORDERS VIEW (Admin + Staff)
// ════════════════════════════════════════════════════════════════

function OrdersView({ role }: { role: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    adminService.getOrders(role).then((res) => {
      if (res.success) setOrders(res.orders || []);
      setLoading(false);
    });
  }, [role]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await adminService.updateOrderStatus({ orderId, status: newStatus }, role);
    loadOrders();
    setUpdating(null);
  };

  if (loading) return <LoadingSpinner />;

  const statusColor: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Ready: "bg-emerald-100 text-emerald-700",
    Completed: "bg-gray-100 text-gray-600",
    Cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Đơn Hàng</h2>
        <button onClick={loadOrders} className="text-sm font-body text-primary-container hover:underline cursor-pointer">
          ↻ Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-secondary/60 py-16 font-body">Chưa có đơn hàng nào</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-on-surface">{order.orderId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColor[order.status] || "bg-gray-100"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-secondary/60 font-body mt-0.5">
                    {order.name} · {order.phone} · {order.source} · {order.timestamp}
                  </p>
                </div>
                <span className="text-lg font-headline font-extrabold text-primary-container">
                  {Number(order.total).toLocaleString("vi-VN")} ₫
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(order.items || []).map((item: any, i: number) => (
                  <span key={i} className="text-[11px] bg-surface-container px-2.5 py-1 rounded-full font-body">
                    {item.name || "?"} x{item.quantity || 1}
                  </span>
                ))}
              </div>

              {order.note && (
                <p className="text-xs text-secondary/70 font-body mb-3 italic">📝 {order.note}</p>
              )}

              {/* Action Buttons */}
              {order.status !== "Completed" && order.status !== "Cancelled" && (
                <div className="flex gap-2">
                  {order.status === "Pending" && (
                    <ActionButton
                      label="Xác nhận"
                      loading={updating === order.orderId}
                      onClick={() => handleStatusUpdate(order.orderId, "Processing")}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    />
                  )}
                  {order.status === "Processing" && (
                    <ActionButton
                      label="Sẵn sàng"
                      loading={updating === order.orderId}
                      onClick={() => handleStatusUpdate(order.orderId, "Ready")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    />
                  )}
                  {order.status === "Ready" && (
                    <ActionButton
                      label="Hoàn thành"
                      loading={updating === order.orderId}
                      onClick={() => handleStatusUpdate(order.orderId, "Completed")}
                      className="bg-primary-container text-white hover:bg-primary"
                    />
                  )}
                  <ActionButton
                    label="Hủy đơn"
                    loading={false}
                    onClick={() => handleStatusUpdate(order.orderId, "Cancelled")}
                    className="bg-surface-container text-red-600 hover:bg-red-50"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  MENU VIEW (Admin CRUD)
// ════════════════════════════════════════════════════════════════

function MenuView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getMenu().then((res) => {
      if (res.success) setItems(res.items || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Quản Lý Menu</h2>
        <span className="text-sm text-secondary/60 font-body">{items.length} món</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.menuId} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 flex gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-body font-bold text-sm text-on-surface truncate">{item.name}</h4>
                {!item.active && (
                  <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">OFF</span>
                )}
              </div>
              <p className="text-xs text-secondary/60 font-body">{item.catName} · {item.menuId}</p>
              <p className="text-sm font-bold text-primary-container mt-1">
                {Number(item.unitPrice).toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-secondary/60 py-16 font-body">Menu trống — thêm món từ Google Sheets</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  RESTOCK VIEW
// ════════════════════════════════════════════════════════════════

function RestockView({ role }: { role: string }) {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStock().then((res) => {
      if (res.success) setStock(res.stock || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const statusBadge: Record<string, string> = {
    ok: "🟢",
    low: "🟡",
    critical: "🔴",
    out_of_stock: "⛔",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold text-on-surface">Tồn Kho & Nhập Hàng</h2>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="text-left py-3 px-4 font-body font-bold text-secondary/70 text-[11px] uppercase tracking-wider">Món</th>
              <th className="text-center py-3 px-4 font-body font-bold text-secondary/70 text-[11px] uppercase tracking-wider">Nhập</th>
              <th className="text-center py-3 px-4 font-body font-bold text-secondary/70 text-[11px] uppercase tracking-wider">Bán</th>
              <th className="text-center py-3 px-4 font-body font-bold text-secondary/70 text-[11px] uppercase tracking-wider">Tồn kho</th>
              <th className="text-center py-3 px-4 font-body font-bold text-secondary/70 text-[11px] uppercase tracking-wider">Min</th>
              <th className="text-center py-3 px-4 font-body font-bold text-secondary/70 text-[11px] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.menuId} className="border-t border-outline-variant/5 hover:bg-surface-container/30">
                <td className="py-3 px-4 font-body font-bold text-on-surface">{item.name}</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">+{item.totalIn}</td>
                <td className="py-3 px-4 text-center text-red-500 font-bold">-{item.totalOut}</td>
                <td className="py-3 px-4 text-center font-bold text-on-surface">{item.currentStock}</td>
                <td className="py-3 px-4 text-center text-secondary/60">{item.minStock}</td>
                <td className="py-3 px-4 text-center">{statusBadge[item.status] || "?"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stock.length === 0 && (
        <p className="text-center text-secondary/60 font-body py-8">Chưa có dữ liệu tồn kho</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  USERS VIEW (Admin only)
// ════════════════════════════════════════════════════════════════

function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers("admin").then((res) => {
      if (res.success) setUsers(res.users || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold text-on-surface">Quản Lý Nhân Viên</h2>

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.userId} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container font-bold text-sm">
              {u.fullName?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <p className="font-body font-bold text-on-surface text-sm">{u.fullName}</p>
              <p className="text-xs text-secondary/60 font-body">{u.email}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
              u.role === "admin" ? "bg-primary-container/10 text-primary-container" : "bg-blue-50 text-blue-600"
            }`}>
              {u.role}
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${u.active ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-secondary/60 font-body py-8">Chưa có nhân viên</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="text-primary-container animate-spin" />
    </div>
  );
}

function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-secondary/60 font-body">{text}</p>
    </div>
  );
}

function ActionButton({ label, loading, onClick, className }: {
  label: string; loading: boolean; onClick: () => void; className: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`text-xs font-body font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 ${className} ${loading ? "opacity-50" : ""}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : label}
    </button>
  );
}
