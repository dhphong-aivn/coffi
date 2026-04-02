"use client";

import { useAppStore } from "@/store/useAppStore";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { MapPin, Package, ArrowRight, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN") + " VND";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  processing: { label: "Processing", bg: "bg-amber-100", text: "text-amber-700" },
  preparing: { label: "Preparing", bg: "bg-blue-100", text: "text-blue-700" },
  "on-the-way": { label: "On the way", bg: "bg-indigo-100", text: "text-indigo-700" },
  delivered: { label: "Completed", bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600" },
};

function OrderCard({ order, isActive }: { order: Order; isActive: boolean }) {
  const { setShowCancelDialog, setCurrentView } = useAppStore();
  const status = statusConfig[order.status] || statusConfig.processing;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-[20px] shadow-sm hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-headline text-lg text-primary-container">
          Order #{order.orderNumber}
        </h4>
        <span className={`${status.bg} ${status.text} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
          {status.label}
        </span>
      </div>
      <p className="text-secondary/60 text-xs mb-4 font-body">{formatDate(order.createdAt)}</p>

      {/* Items */}
      <div className="border-t border-outline-variant/10 pt-4 space-y-3">
        {order.address && (
          <div className="flex items-center gap-2 text-xs text-secondary/70 font-body">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{order.address}</span>
          </div>
        )}
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-bold text-primary-container truncate">{item.name} x{item.quantity}</p>
              <p className="text-secondary text-[11px] tracking-tight">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
        <p className="font-headline text-xl text-primary-container tracking-tight">{formatCurrency(order.total)}</p>
        {isActive ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="border border-error/30 text-error px-4 py-2 rounded-full font-body text-xs font-bold hover:bg-error/5 transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setCurrentView("tracking")}
              className="bg-primary-container text-white px-4 py-2 rounded-full font-body text-xs font-bold hover:bg-primary transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Package size={14} />
              Track
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <button className="bg-primary-container text-white px-6 py-2.5 rounded-full font-body text-xs font-bold hover:bg-primary transition-all active:scale-95 cursor-pointer">
            Reorder
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-4">
        <ShoppingBag size={28} className="text-primary-container/40" />
      </div>
      <p className="text-secondary/60 font-body text-sm">{message}</p>
    </div>
  );
}

export function OrdersView() {
  const { orderTab, setOrderTab, showCancelDialog, setShowCancelDialog } = useAppStore();
  const { getActiveOrders, getHistoryOrders, cancelOrder, orders } = useOrderStore();

  const activeOrders = getActiveOrders();
  const historyOrders = getHistoryOrders();

  const handleCancelLatest = () => {
    const latest = activeOrders[0];
    if (latest) {
      cancelOrder(latest.id);
    }
    setShowCancelDialog(false);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="font-headline text-4xl text-primary-container mb-8">My Orders</h2>

      {/* Order Tabs */}
      <div className="flex gap-2 mb-10 bg-surface-container-high p-1 rounded-full w-fit">
        <button
          onClick={() => setOrderTab("active")}
          className={`px-8 py-2.5 rounded-full font-body text-sm font-bold transition-all cursor-pointer ${
            orderTab === "active"
              ? "bg-primary-container text-white shadow-md"
              : "bg-surface-container-high text-secondary hover:bg-white/50"
          }`}
        >
          Active{activeOrders.length > 0 && ` (${activeOrders.length})`}
        </button>
        <button
          onClick={() => setOrderTab("history")}
          className={`px-8 py-2.5 rounded-full font-body text-sm font-bold transition-all cursor-pointer ${
            orderTab === "history"
              ? "bg-primary-container text-white shadow-md"
              : "bg-surface-container-high text-secondary hover:bg-white/50"
          }`}
        >
          History{historyOrders.length > 0 && ` (${historyOrders.length})`}
        </button>
      </div>

      {orderTab === "active" && (
        <div className="space-y-4 pb-12">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} isActive />
            ))
          ) : (
            <EmptyState message="Chưa có đơn hàng đang xử lý" />
          )}
        </div>
      )}

      {orderTab === "history" && (
        <div className="space-y-4 pb-12">
          {historyOrders.length > 0 ? (
            historyOrders.map((order) => (
              <OrderCard key={order.id} order={order} isActive={false} />
            ))
          ) : (
            <EmptyState message="Chưa có lịch sử đơn hàng" />
          )}
        </div>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Order Confirmation</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Funds will be refunded to your account (if paid) according to Cof fi policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <button
              onClick={() => setShowCancelDialog(false)}
              className="px-4 py-2 bg-surface-container-high rounded-full font-bold text-secondary text-sm hover:bg-surface-container-highest cursor-pointer transition-colors"
            >
              No, keep it
            </button>
            <button
              onClick={handleCancelLatest}
              className="px-4 py-2 bg-error text-white rounded-full font-bold text-sm hover:bg-error/90 cursor-pointer transition-colors"
            >
              Yes, cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
