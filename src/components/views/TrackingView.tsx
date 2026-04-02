"use client";

import { Check, Coffee, Truck, CheckCircle2, Clock } from "lucide-react";

export function TrackingView() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">
      <h2 className="font-headline text-4xl text-primary-container mb-8">Order Tracking</h2>
      
      <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-headline text-xl text-primary-container">Order #CF-2025</h4>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Processing</span>
        </div>
        <p className="text-secondary/70 text-sm mb-6">01 Apr 2026, 10:30 AM</p>
        
        {/* Large Stepper */}
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center">
              <Check size={20} />
            </div>
            <span className="text-sm font-bold text-primary-container text-center">Pending</span>
          </div>
          <div className="flex-1 h-1 bg-primary-container mx-2 mt-[-24px]"></div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-high text-secondary flex items-center justify-center relative">
               <Coffee size={20} />
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-container rounded-full animate-pulse border-2 border-white"></div>
            </div>
            <span className="text-sm font-medium text-secondary text-center">Brewing</span>
          </div>
          <div className="flex-1 h-1 bg-surface-container-high mx-2 mt-[-24px]"></div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-high text-secondary flex items-center justify-center">
              <Truck size={20} />
            </div>
            <span className="text-sm font-medium text-secondary text-center">Shipping</span>
          </div>
          <div className="flex-1 h-1 bg-surface-container-high mx-2 mt-[-24px]"></div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-high text-secondary flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-sm font-medium text-secondary text-center">Completed</span>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div className="border-t border-outline-variant/20 pt-8 mt-4">
           <div className="bg-surface-container py-4 px-6 rounded-xl flex items-center gap-4">
              <Clock className="text-primary-container" size={24} />
              <div>
                 <p className="font-headline font-bold text-primary-container text-lg">Brewing your drinks</p>
                 <p className="text-secondary text-sm">Estimated delivery in 15-20 minutes.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
