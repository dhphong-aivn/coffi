"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import {
  LayoutDashboard, Coffee, ClipboardList, PackagePlus, Users, Truck,
  LogOut, ChevronRight, Loader2, Bell, TrendingUp, AlertTriangle, ShoppingBag, Plus, Edit, Trash2, X
} from "lucide-react";

// ── Types ──
type AdminView = "dashboard" | "orders" | "menu" | "suppliers" | "restock" | "users";

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
    { id: "suppliers", label: "Nhà cung cấp", icon: <Truck size={20} /> },
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
      <main className="flex-1 overflow-y-auto px-8 py-8 relative">
        {currentView === "dashboard" && <DashboardView role={user?.role || "staff"} />}
        {currentView === "orders" && <OrdersView role={user?.role || "staff"} />}
        {currentView === "menu" && isAdmin && <MenuView role={user?.role || "staff"} />}
        {currentView === "suppliers" && <SuppliersView role={user?.role || "staff"} />}
        {currentView === "restock" && <RestockView role={user?.role || "staff"} />}
        {currentView === "users" && isAdmin && <UsersView role={user?.role || "staff"} />}
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

      {/* 2 Charts Section */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        
        {/* Chart 1: Bar Chart Top Items */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
          <h3 className="font-headline font-bold text-on-surface mb-4">🏆 Biểu đồ: Top 5 Bán Chạy</h3>
          {data.topItems.length > 0 ? (
            <div className="space-y-4">
              {data.topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="flex-1 text-sm font-body text-on-surface truncate pr-2">{item.name}</span>
                  <div className="w-[40%] h-3.5 rounded-full bg-surface-container overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary-container rounded-full transition-all"
                      style={{ width: `${(item.sold / (data.topItems[0]?.sold || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-body font-bold text-primary-container w-8 text-right">{item.sold}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary/60">Chưa có dữ liệu đồ thị</p>
          )}
        </div>

        {/* Chart 2: Pie Chart Stock Alerts */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
          <h3 className="font-headline font-bold text-on-surface mb-6">📦 Biểu đồ: Tổng quan Tồn Kho</h3>
          <div className="flex items-center gap-8 mt-4">
            {/* CSS Pie Chart */}
            <div 
              className="w-28 h-28 rounded-full flex-shrink-0 relative flex items-center justify-center border-4 border-surface-container/50 shadow-sm transition-transform hover:scale-105"
              style={{
                background: `conic-gradient(#10b981 0deg 250deg, #f59e0b 250deg 320deg, #ef4444 320deg 360deg)`
              }}
            >
               <div className="w-16 h-16 bg-surface-container-lowest rounded-full shadow-inner flex items-center justify-center">
                 <span className="text-[11px] font-bold text-secondary">Health</span>
               </div>
            </div>
            {/* Legend */}
            <div className="space-y-4 flex-1">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm font-body text-on-surface">Đủ hàng</span></div>
                 <span className="font-bold text-sm text-emerald-700">70%</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm font-body text-on-surface">Sắp hết</span></div>
                 <span className="font-bold text-sm text-amber-700">20%</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm font-body text-on-surface">Cần nhập gấp</span></div>
                 <span className="font-bold text-sm text-red-700">10%</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {data.stockAlerts.length > 0 && (
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-200/30">
          <h3 className="font-headline font-bold text-red-700 mb-4">🚨 Cảnh Báo Tồn Kho Dưới Định Mức</h3>
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

  const statusLabel: Record<string, string> = {
    Pending: "Đang chờ",
    Processing: "Đang xử lý",
    Ready: "Đã pha xong",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
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
                      {statusLabel[order.status] || order.status}
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
              {role !== "viewer" && order.status !== "Completed" && order.status !== "Cancelled" && (
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

function MenuView({ role }: { role: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    menuId: "", name: "", catName: "", supplierName: "", unitPrice: "", minStock: "", imageUrl: "", active: true
  });

  const loadMenu = useCallback(() => {
    setLoading(true);
    Promise.all([adminService.getMenu(), adminService.getSuppliers(role)]).then(([menuRes, supRes]) => {
      if (menuRes.success) setItems(menuRes.items || []);
      if (supRes.success) setSuppliers(supRes.suppliers || []);
      setLoading(false);
    });
  }, [role]);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ menuId: "", name: "", catName: "Coffee", supplierName: "", unitPrice: "0", minStock: "10", imageUrl: "", active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      menuId: item.menuId || "",
      name: item.name || "",
      catName: item.catName || "",
      supplierName: item.supplierName || "",
      unitPrice: item.unitPrice?.toString() || "0",
      minStock: item.minStock?.toString() || "0",

      imageUrl: item.imageUrl || "",
      active: item.active !== false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa món này?")) return;
    setLoading(true);
    const res = await adminService.deleteMenuItem({ menuId }, role);
    if (res.success) loadMenu();
    else { alert("Lỗi: " + res.message); setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.catName || !formData.unitPrice) return alert("Vui lòng điền đủ Tên, Danh mục và Giá");
    
    setSaving(true);
    const payload = { ...formData, unitPrice: Number(formData.unitPrice), minStock: Number(formData.minStock) };
    
    let res;
    if (editingItem) {
      res = await adminService.updateMenuItem(payload, role);
    } else {
      res = await adminService.addMenuItem({ ...payload, menuId: payload.menuId || "MENU_" + Date.now() }, role);
    }
    
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      loadMenu();
    } else {
      alert("Lỗi: " + res.message);
    }
  };

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Quản Lý Menu</h2>
          <span className="text-sm text-secondary/60 font-body">{items.length} món</span>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary-container text-white px-4 py-2.5 rounded-xl text-sm font-bold font-body hover:bg-primary transition-colors cursor-pointer"
        >
          <Plus size={18} /> Thêm Món
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.menuId} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 flex gap-4 relative group">
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
            {/* Actions overlay */}
            <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
              <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm border border-outline-variant/20 hover:bg-blue-50 cursor-pointer">
                <Edit size={14} />
              </button>
              <button onClick={() => handleDelete(item.menuId)} className="p-1.5 bg-white text-red-600 rounded-md shadow-sm border border-outline-variant/20 hover:bg-red-50 cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-secondary/60 py-16 font-body">Menu trống — click Thêm Món để bắt đầu</p>
      )}

      {/* Modal Thêm/Sửa Món */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Sửa Món" : "Thêm Món Mới"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingItem && (
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Mã Món (Để trống tự tạo)</label>
              <input type="text" value={formData.menuId} onChange={e => setFormData({...formData, menuId: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: CF_01" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tên Món *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: Cà Phê Sữa Đá" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Danh Mục *</label>
              <select required value={formData.catName} onChange={e => setFormData({...formData, catName: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50">
                {Array.from(new Set(items.map(i => i.catName))).filter(Boolean).map(cat => (
                  <option key={String(cat)} value={String(cat)}>{String(cat)}</option>
                ))}
                <option value="Khác">-- Danh Mục Khác --</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Nhà Cung Cấp *</label>
              <select required value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50">
                <option value="" disabled>-- Chọn NCC --</option>
                {suppliers.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Giá (VND) *</label>
              <input required type="number" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: 35000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tồn Kho Nhắc Nhở</label>
              <input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: 10" />
            </div>
          </div>
          
          <div className="flex flex-col mb-4">
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-primary-container rounded shrink-0 cursor-pointer" />
              <span className="text-sm font-bold font-body text-on-surface">Món đang bán</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Link Ảnh (URL)</label>
            <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="https://..." />
          </div>
          
          <div className="pt-2">
            <button disabled={saving} type="submit" className={`w-full bg-primary-container text-white rounded-xl py-3 text-sm font-bold font-body hover:bg-primary transition-colors cursor-pointer ${saving ? "opacity-50" : ""}`}>
              {saving ? "Đang lưu..." : (editingItem ? "Cập Nhật" : "Thêm Món")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  RESTOCK VIEW
// ════════════════════════════════════════════════════════════════

function RestockView({ role }: { role: string }) {
  const [stock, setStock] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ menuId: "", quantity: "", note: "" });

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([adminService.getStock(), adminService.getMenu()]).then(([stockRes, menuRes]) => {
      if (stockRes.success) setStock(stockRes.stock || []);
      if (menuRes.success) setMenuItems(menuRes.items?.filter((i:any) => i.active) || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menuId || !formData.quantity) return alert("Vui lòng chọn món và nhập số lượng");
    setSaving(true);
    const res = await adminService.restock({ menuId: formData.menuId, quantity: Number(formData.quantity), note: formData.note }, role);
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ menuId: "", quantity: "", note: "" });
      loadData();
    } else {
      alert("Lỗi: " + res.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusBadge: Record<string, string> = {
    ok: "🟢", low: "🟡", critical: "🔴", out_of_stock: "⛔",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Tồn Kho & Nhập Hàng</h2>
        {role !== "viewer" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-container text-white px-4 py-2.5 rounded-xl text-sm font-bold font-body hover:bg-primary transition-colors cursor-pointer"
          >
            <PackagePlus size={18} /> Tạo Phiếu Nhập
          </button>
        )}
      </div>

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

      {/* Modal Nhập Kho */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Phiếu Nhập/Xuất Kho">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Chọn Món</label>
            <select required value={formData.menuId} onChange={e => setFormData({...formData, menuId: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50">
              <option value="" disabled>-- Chọn một món --</option>
              {menuItems.map(m => (
                <option key={m.menuId} value={m.menuId}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Số Lượng (Âm để xuất bớt)</label>
            <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: 50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Ghi Chú</label>
            <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: Nhập thêm từ NCC A" />
          </div>
          
          <div className="pt-2">
            <button disabled={saving} type="submit" className={`w-full bg-primary-container text-white rounded-xl py-3 text-sm font-bold font-body hover:bg-primary transition-colors cursor-pointer ${saving ? "opacity-50" : ""}`}>
              {saving ? "Đang xử lý..." : "Xác nhận tạo phiếu"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  USERS VIEW (Admin only)
// ════════════════════════════════════════════════════════════════

function UsersView({ role }: { role: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", role: "staff", password: "", active: true });

  const loadUsers = useCallback(() => {
    setLoading(true);
    adminService.getUsers(role).then((res) => {
      if (res.success) setUsers(res.users || []);
      setLoading(false);
    });
  }, [role]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleOpenAdd = () => {
    setEditingEmail(null);
    setFormData({ fullName: "", email: "", role: "staff", password: "", active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingEmail(u.email);
    setFormData({ fullName: u.fullName || "", email: u.email || "", role: u.role || "staff", password: "", active: u.active !== false });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const dataToSend = { ...formData };
    if (editingEmail && !dataToSend.password) {
      delete (dataToSend as any).password;
    }
    const apiCall = editingEmail ? adminService.updateUser : adminService.addUser;
    const res = await apiCall(dataToSend, role);
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      loadUsers();
    } else {
      alert("Lỗi: " + res.message);
    }
  };

  const handleToggleActive = async (u: any) => {
    await adminService.updateUser({ ...u, active: u.active === false ? true : false, password: "" }, role);
    loadUsers();
  };

  if (role !== "admin") return <ErrorMessage text="Không có quyền truy cập" />;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-headline font-bold text-on-surface">Nhân Viên</h2>
         <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary-container text-white px-4 py-2.5 rounded-xl text-sm font-bold font-body cursor-pointer hover:bg-primary transition-colors">
           <Plus size={18} /> Thêm NV
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(u => (
          <div key={u.email} className={`rounded-2xl p-5 border flex gap-4 ${u.active !== false ? "bg-surface-container-lowest border-outline-variant/10" : "bg-surface-container/20 border-red-200 opacity-50"}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                 <h3 className="font-headline font-bold text-lg">{u.fullName}</h3>
                 <span className="text-[10px] uppercase bg-secondary/10 px-2 py-0.5 rounded font-bold text-secondary">{u.role}</span>
              </div>
              <p className="text-sm text-secondary font-body mb-1">Email: {u.email}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button title="Sửa" onClick={() => handleOpenEdit(u)} className="p-2 bg-white text-blue-600 rounded-md border border-outline-variant/20 shadow-sm cursor-pointer hover:bg-blue-50 transition-colors"><Edit size={14}/></button>
              <button title={u.active !== false ? "Khoá" : "Mở Khoá"} onClick={() => handleToggleActive(u)} className={`p-2 rounded-md border shadow-sm cursor-pointer transition-colors ${u.active !== false ? 'bg-white text-red-600 border-outline-variant/20 hover:bg-red-50' : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'}`}>
                {u.active !== false ? <Trash2 size={14}/> : <Plus size={14}/>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmail ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Họ Tên *</label>
             <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: Nguyễn Văn A" />
          </div>
          <div>
             <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Email *</label>
             <input required disabled={!!editingEmail} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="VD: email@example.com" />
          </div>
          <div>
             <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Mật khẩu {editingEmail && "(Để trống nếu không đổi)"}</label>
             <input required={!editingEmail} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-1">
               <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Quyền *</label>
               <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
               </select>
             </div>
             <div className="flex flex-col justify-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-primary-container rounded shrink-0 cursor-pointer" />
                <span className="text-sm font-bold font-body text-on-surface">Hoạt động</span>
              </label>
            </div>
          </div>
          
          <div className="pt-2">
            <button disabled={saving} type="submit" className={`w-full bg-primary-container text-white py-3 rounded-xl font-bold font-body cursor-pointer hover:bg-primary transition-colors ${saving ? "opacity-50" : ""}`}>
               {saving ? "Đang lưu..." : "Xác nhận lưu"}
            </button>
          </div>
        </form>
      </Modal>
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

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg text-on-surface">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-surface-container text-secondary transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SUPPLIERS VIEW
// ════════════════════════════════════════════════════════════════

function SuppliersView({ role }: { role: string }) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "" });
  const [saving, setSaving] = useState(false);

  const loadSuppliers = useCallback(() => {
    setLoading(true);
    adminService.getSuppliers(role).then((res) => {
      if (res.success) setSuppliers(res.suppliers || []);
      setLoading(false);
    });
  }, [role]);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert("Vui lòng nhập Tên và SĐT");
    setSaving(true);
    const res = await adminService.addSupplier(formData, role);
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ name: "", contactPerson: "", phone: "", email: "", address: "" });
      loadSuppliers();
    } else {
      alert("Lỗi: " + res.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Nhà Cung Cấp</h2>
          <p className="text-sm text-secondary/60 font-body">Quản lý đối tác phân phối vật liệu</p>
        </div>
        {role !== "viewer" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-container text-white px-4 py-2.5 rounded-xl text-sm font-bold font-body hover:bg-primary transition-colors cursor-pointer"
          >
            <Plus size={18} /> Thêm NCC
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((sup, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-1">{sup.name}</h3>
            <p className="text-sm text-secondary font-body mb-3">Người LH: <span className="font-bold text-on-surface">{sup.contactPerson || "Không rõ"}</span></p>
            <div className="space-y-1.5">
              <p className="text-sm font-body text-on-surface"><span className="text-secondary inline-block w-16">SĐT:</span> {sup.phone}</p>
              {sup.email && <p className="text-sm font-body text-on-surface"><span className="text-secondary inline-block w-16">Email:</span> {sup.email}</p>}
              {sup.address && <p className="text-sm font-body text-on-surface"><span className="text-secondary inline-block w-16">Địa chỉ:</span> {sup.address}</p>}
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <p className="text-center text-secondary/60 py-16 font-body">Chưa có dữ liệu nhà cung cấp.</p>
      )}

      {/* Modal Thêm NCC */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Nhà Cung Cấp">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tên Nhà Cung Cấp *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: NCC Cà Phê Mộc" />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Người Liên Hệ</label>
            <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: Anh Minh" />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Số Điện Thoại *</label>
            <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: 0901234567" />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: contact@moc.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Địa chỉ</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary-container/50" placeholder="VD: 123 Đường A..." />
          </div>
          
          <div className="pt-2">
            <button disabled={saving} type="submit" className={`w-full bg-primary-container text-white rounded-xl py-3 text-sm font-bold font-body hover:bg-primary transition-colors cursor-pointer ${saving ? "opacity-50" : ""}`}>
              {saving ? "Đang lưu..." : "Xác nhận thêm"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

