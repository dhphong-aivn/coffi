"use client";

import { useAppStore } from "@/store/useAppStore";
import { MapPin, Package, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OrdersView() {
  const { orderTab, setOrderTab, showCancelDialog, setShowCancelDialog, setCurrentView } = useAppStore();

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="font-headline text-4xl text-primary-container mb-8">My Orders</h2>
      
      {/* Order Tabs */}
      <div className="flex gap-2 mb-10 bg-surface-container-high p-1 rounded-full w-fit">
        <button
          onClick={() => setOrderTab('active')}
          className={`px-8 py-2.5 rounded-full font-body text-sm font-bold transition-all cursor-pointer ${
            orderTab === 'active'
              ? 'bg-primary-container text-white shadow-md'
              : 'bg-surface-container-high text-secondary hover:bg-white/50'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setOrderTab('history')}
          className={`px-8 py-2.5 rounded-full font-body text-sm font-bold transition-all cursor-pointer ${
            orderTab === 'history'
              ? 'bg-primary-container text-white shadow-md'
              : 'bg-surface-container-high text-secondary hover:bg-white/50'
          }`}
        >
          History
        </button>
      </div>

      {orderTab === 'active' && (
        <div className="space-y-6 pb-12">
          <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-headline text-xl text-primary-container">Order #CF-2025</h4>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Processing</span>
            </div>
            <p className="text-secondary/70 text-sm mb-6">01 Apr 2026, 10:30 AM</p>
            
            {/* Order Items */}
            <div className="border-t border-outline-variant/20 pt-6 space-y-4">
              <h5 className="font-headline text-lg text-primary-container">Order Summary</h5>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="text-secondary" size={18} />
                <span className="text-secondary">123 Nguyen Hue, D.1, HCMC</span>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=200&auto=format&fit=crop" alt="Cappuccino"/>
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-primary-container">Cappuccino x1</p>
                  <p className="text-secondary text-xs tracking-tight">95.000 VND</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1549903072-7e6e0bedb7bc?q=80&w=200&auto=format&fit=crop" alt="Croissant"/>
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-primary-container">Butter Croissant x1</p>
                  <p className="text-secondary text-xs tracking-tight">55.000 VND</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button 
                onClick={() => setShowCancelDialog(true)} 
                className="border-2 border-error/30 text-error px-6 py-2.5 rounded-[24px] font-body text-sm font-bold hover:bg-error/5 transition-all active:scale-95 cursor-pointer"
              >
                Cancel Order
              </button>
              <button 
                onClick={() => setCurrentView('tracking')}
                className="bg-primary-container text-white px-6 py-2.5 rounded-[24px] font-body text-sm font-bold hover:bg-primary transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Package size={18} />
                Track Order
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {orderTab === 'history' && (
        <div className="space-y-6 pb-12">
          <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm flex flex-col md:flex-row gap-8 items-center group hover:shadow-xl transition-shadow">
            <div className="flex -space-x-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm">
                <img alt="Coffee" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop"/>
              </div>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm">
                <img alt="Croissant" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1549903072-7e6e0bedb7bc?q=80&w=200&auto=format&fit=crop"/>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-headline text-xl text-primary-container">Order #CF-8241</h4>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Completed</span>
              </div>
              <p className="text-secondary/70 text-sm mb-3">12 Oct 2026, 09:45 AM</p>
              <p className="font-body text-sm text-primary-container font-medium">Single-Origin Pour Over, Butter Croissant</p>
            </div>
            <div className="text-right flex flex-col items-end gap-4">
              <p className="font-headline text-2xl text-primary-container tracking-tight">175.000 VND</p>
              <button className="bg-primary-container text-white px-8 py-3 rounded-[24px] font-body text-sm font-bold hover:bg-primary transition-all active:scale-95 cursor-pointer">
                Reorder
              </button>
            </div>
          </div>
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
              onClick={() => {
                setShowCancelDialog(false);
                setOrderTab('history');
              }}
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
