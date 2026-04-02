"use client";

import { useState } from "react";
import { Home, Building2 } from "lucide-react";

export function SettingsView() {
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <h2 className="font-headline text-4xl text-primary-container mb-8">Settings</h2>
      
      {/* Profile Section */}
      <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm mb-8 relative">
        <h3 className="font-headline text-xl text-primary-container mb-6">Personal Profile</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Full Name</label>
            <input type="text" defaultValue="John Doe" className="w-full bg-white px-5 py-3.5 rounded-[24px] shadow-sm font-body text-sm text-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20 border-none"/>
          </div>
          <div>
            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Phone Number</label>
            <input type="tel" defaultValue="0901 234 567" className="w-full bg-white px-5 py-3.5 rounded-[24px] shadow-sm font-body text-sm text-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20 border-none"/>
          </div>
          <div>
            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Email</label>
            <input type="email" defaultValue="johndoe@email.com" className="w-full bg-white px-5 py-3.5 rounded-[24px] shadow-sm font-body text-sm text-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20 border-none"/>
          </div>
        </div>
        <button onClick={handleSave} className="mt-6 bg-primary-container text-white px-8 py-3 rounded-[24px] font-body text-sm font-bold hover:bg-primary transition-all active:scale-95 cursor-pointer">
          Save changes
        </button>
        
        {/* Toast */}
        {showToast && (
          <div className="absolute top-8 right-8 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
            Saved successfully!
          </div>
        )}
      </div>

      {/* Address Book */}
      <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm">
        <h3 className="font-headline text-xl text-primary-container mb-6">Shipping Address Book</h3>
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Home className="text-primary-container" size={20} />
              <h4 className="font-body font-bold text-primary-container">Home</h4>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Default</span>
            </div>
            <p className="text-secondary text-sm ml-8">Chưa có địa chỉ — nhấn Edit để thêm</p>
            <div className="flex gap-4 mt-3 ml-8">
              <button className="text-xs font-bold text-primary-container hover:underline cursor-pointer">Edit</button>
              <button className="text-xs font-bold text-error/70 hover:underline cursor-pointer">Delete</button>
              <button className="text-xs font-bold text-secondary hover:underline cursor-pointer">Set Default</button>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-primary-container" size={20} />
              <h4 className="font-body font-bold text-primary-container">Office</h4>
            </div>
            <p className="text-secondary text-sm ml-8">456 Le Loi, D.1, HCMC</p>
            <div className="flex gap-4 mt-3 ml-8">
              <button className="text-xs font-bold text-primary-container hover:underline cursor-pointer">Edit</button>
              <button className="text-xs font-bold text-error/70 hover:underline cursor-pointer">Delete</button>
              <button className="text-xs font-bold text-secondary hover:underline cursor-pointer">Set Default</button>
            </div>
          </div>
        </div>
        <button className="mt-4 border-2 border-dashed border-outline-variant/40 text-secondary w-full py-3 rounded-[24px] font-body text-sm font-bold hover:bg-white/50 transition-all cursor-pointer">
          + Add new address
        </button>
      </div>
    </div>
  );
}
