"use client";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { Bell, Minus, Plus, X, ArrowRight, ArrowLeft, ShoppingCart, User, Phone, Mail, MapPin, Calendar } from "lucide-react";

export function RightSidebar() {
  const { items, getSubTotal, updateQuantity, removeItem, clearCart } = useCartStore();
  const { profile } = useUserStore();
  const {
    setCurrentView, setOrderTab, fulfillmentType, setFulfillmentType,
    isCartCollapsed, toggleCart,
    checkoutStep, setCheckoutStep, customerInfo, setCustomerInfo, resetCheckout,
  } = useAppStore();

  const subTotal = getSubTotal();
  const shipping = fulfillmentType === 'delivery' ? 15000 : 0;
  const taxes = subTotal * 0.15;
  const total = subTotal + shipping + taxes;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const handleProceedToInfo = () => {
    if (items.length === 0) return;
    setCheckoutStep('info');
  };

  const handleConfirmOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) return;
    clearCart();
    resetCheckout();
    setOrderTab('active');
    setCurrentView('orders');
  };

  const isFormValid = customerInfo.name.trim() !== '' && customerInfo.phone.trim() !== '';

  return (
    <aside className={`h-screen sticky right-0 top-0 bg-surface-container flex flex-col z-[55] transition-all duration-500 ease-in-out relative ${
      isCartCollapsed ? 'w-20' : 'w-[420px]'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleCart}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-primary-container text-white rounded-l-lg flex items-center justify-center cursor-pointer z-[60] shadow-xl hover:scale-105 transition-transform"
      >
        <ArrowRight className={`transition-transform duration-500 ${isCartCollapsed ? 'rotate-180' : 'rotate-0'}`} size={20} />
      </button>

      {/* Collapsed State Icon */}
      <div
        onClick={toggleCart}
        className={`absolute inset-0 flex flex-col items-center pt-24 cursor-pointer transition-opacity duration-300 ${isCartCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div className="relative">
          <ShoppingCart size={32} className="text-primary-container" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {items.length}
            </span>
          )}
        </div>
        <span className="mt-4 font-headline text-lg text-primary-container [writing-mode:vertical-lr] tracking-widest uppercase">
          Cart
        </span>
      </div>

      {/* Expanded Content */}
      <div className={`flex flex-col h-full transition-opacity duration-300 ${isCartCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
        {/* Profile Section */}
        <div className="p-8 flex items-center gap-4 border-b border-outline-variant/10">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container/20">
            <img className="w-full h-full object-cover" alt={profile.name} src={profile.avatar} />
          </div>
          <div>
            <h4 className="font-body font-bold text-primary-container leading-tight">{profile.name}</h4>
            <p className="text-xs text-secondary/70">{profile.email}</p>
          </div>
          <button className="ml-auto text-primary-container">
            <Bell size={24} />
          </button>
        </div>

        {/* Cart Step */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 flex flex-col px-8 py-6 space-y-6 overflow-y-auto">
            <h2 className="font-headline text-3xl text-primary-container tracking-tight mt-2 mb-2">Cart</h2>

            {/* Fulfillment Types */}
            <div className="grid grid-cols-3 gap-2 bg-surface-container-high p-1 rounded-full">
              <button
                onClick={() => setFulfillmentType('delivery')}
                className={`py-2 text-xs font-bold font-body rounded-full transition-all cursor-pointer ${
                  fulfillmentType === 'delivery' ? 'bg-primary-container text-white shadow-md' : 'text-secondary hover:bg-white/50'
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setFulfillmentType('dine-in')}
                className={`py-2 text-xs font-bold font-body rounded-full transition-all cursor-pointer ${
                  fulfillmentType === 'dine-in' ? 'bg-primary-container text-white shadow-md' : 'text-secondary hover:bg-white/50'
                }`}
              >
                Dine in
              </button>
              <button
                onClick={() => setFulfillmentType('take-away')}
                className={`py-2 text-xs font-bold font-body rounded-full transition-all cursor-pointer ${
                  fulfillmentType === 'take-away' ? 'bg-primary-container text-white shadow-md' : 'text-secondary hover:bg-white/50'
                }`}
              >
                Take away
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-surface-container-lowest p-4 rounded-lg flex gap-4 relative group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-body font-bold text-sm text-primary-container">{item.name}</h5>
                    <p className="text-secondary font-bold text-xs mt-1 tracking-tight">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-primary-container cursor-pointer">
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-primary-container cursor-pointer">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-secondary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-8 text-center text-secondary/60 text-sm font-body">Cart is empty</div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-surface-container-highest p-1 rounded-xl flex items-center">
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-primary-container px-4 placeholder:text-secondary/50 outline-none"
                type="text"
                placeholder="Coupon Code"
              />
              <button className="bg-primary-container text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-transform">
                Apply
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/20">
              <div className="flex justify-between text-sm font-body">
                <span className="text-secondary">Subtotal</span>
                <span className="font-bold text-primary-container tracking-tight">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-secondary">Shipping</span>
                <span className="font-bold text-primary-container tracking-tight">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-secondary">Taxes 15%</span>
                <span className="font-bold text-primary-container tracking-tight">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between text-2xl font-headline pt-3 border-t border-outline-variant/10 text-primary-container">
                <span className="font-extrabold">Grand Total</span>
                <span className="font-extrabold tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Info Step */}
        {checkoutStep === 'info' && (
          <div className="flex-1 flex flex-col px-8 py-6 space-y-5 overflow-y-auto">
            <div className="flex items-center gap-3">
              <button onClick={() => setCheckoutStep('cart')} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container cursor-pointer hover:bg-surface-container-highest transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-headline text-2xl text-primary-container tracking-tight">Delivery Details</h2>
            </div>

            <p className="text-secondary text-sm font-body -mt-2">Please fill in your information to complete the order.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block font-body">Full Name *</label>
                <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <User size={18} className="text-secondary/60" />
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                    placeholder="Enter your name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block font-body">Phone *</label>
                <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <Phone size={18} className="text-secondary/60" />
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                    placeholder="0909 xxx xxx"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block font-body">Age</label>
                <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <Calendar size={18} className="text-secondary/60" />
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                    placeholder="Enter your age"
                    type="number"
                    value={customerInfo.age}
                    onChange={(e) => setCustomerInfo({ age: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block font-body">Email</label>
                <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <Mail size={18} className="text-secondary/60" />
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                    placeholder="your@email.com"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block font-body">Address</label>
                <div className="flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <MapPin size={18} className="text-secondary/60" />
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                    placeholder="123 Nguyen Hue, D.1"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Mini */}
            <div className="bg-surface-container-lowest p-4 rounded-xl space-y-2 mt-2">
              <h5 className="font-headline text-sm text-primary-container font-bold">Order Summary</h5>
              <div className="flex justify-between text-xs font-body">
                <span className="text-secondary">{items.length} item(s)</span>
                <span className="font-bold text-primary-container">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="p-8 mt-auto">
          {checkoutStep === 'cart' ? (
            <button
              onClick={handleProceedToInfo}
              disabled={items.length === 0}
              className={`w-full py-5 rounded-xl font-body font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                items.length === 0
                  ? 'bg-outline-variant text-secondary cursor-not-allowed'
                  : 'bg-primary-container text-white hover:bg-primary active:scale-95 cursor-pointer'
              }`}
            >
              Checkout
              <ArrowRight size={24} />
            </button>
          ) : (
            <button
              onClick={handleConfirmOrder}
              disabled={!isFormValid}
              className={`w-full py-5 rounded-xl font-body font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                !isFormValid
                  ? 'bg-outline-variant text-secondary cursor-not-allowed'
                  : 'bg-primary-container text-white hover:bg-primary active:scale-95 cursor-pointer'
              }`}
            >
              Confirm Order
              <ArrowRight size={24} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
