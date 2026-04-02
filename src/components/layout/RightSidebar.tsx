"use client";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useOrderStore } from "@/store/useOrderStore";
import { TOPPINGS } from "@/data/menu-options";
import { Bell, Minus, Plus, X, ArrowRight, ArrowLeft, ShoppingCart, User, Phone, MapPin } from "lucide-react";

export function RightSidebar() {
  const { items, getSubTotal, updateQuantity, removeItem, clearCart, updateItemToppings } = useCartStore();
  const { profile } = useUserStore();
  const { addOrder } = useOrderStore();
  const {
    setCurrentView, setOrderTab, fulfillmentType, setFulfillmentType,
    isCartCollapsed, toggleCart,
    checkoutStep, setCheckoutStep, customerInfo, setCustomerInfo, resetCheckout,
  } = useAppStore();

  const subTotal = getSubTotal();
  const FREE_SHIPPING_THRESHOLD = 200000;
  const isFreeShipping = fulfillmentType === 'delivery' && subTotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = fulfillmentType === 'delivery' && !isFreeShipping ? 15000 : 0;
  const taxes = subTotal * 0.15;
  const total = subTotal + shipping + taxes;
  const amountToFreeShip = FREE_SHIPPING_THRESHOLD - subTotal;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const getEffectivePrice = (item: { price: number; toppings?: string[] }) => {
    const toppingTotal = (item.toppings || []).reduce((sum, tid) => {
      const t = TOPPINGS.find(tp => tp.id === tid);
      return sum + (t?.price || 0);
    }, 0);
    return item.price + toppingTotal;
  };

  const handleProceedToInfo = () => {
    if (items.length === 0) return;
    setCheckoutStep('info');
  };

  const handleConfirmOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) return;

    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
      items: items.map((item) => ({
        name: item.name,
        price: getEffectivePrice(item),
        quantity: item.quantity,
        image: item.image,
      })),
      total,
      status: 'processing' as const,
      fulfillment: fulfillmentType,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      address: customerInfo.address,
      note: customerInfo.note,
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
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
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sticky Top: Title + Fulfillment */}
            <div className="px-8 pt-6 pb-4 space-y-4 flex-shrink-0">
              <div className="flex items-center gap-3 mt-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-primary-container" />
                </div>
                <div>
                  <h2 className="font-headline text-2xl text-primary-container tracking-tight leading-none">Your Cart</h2>
                  <p className="text-[11px] text-secondary/60 font-body mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>

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
            </div>

            {/* Scrollable Middle: Cart Items + Coupon */}
            <div className="flex-1 overflow-y-auto px-8 py-2 space-y-4">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const effectivePrice = getEffectivePrice(item);
                  const currentToppings = item.toppings || [];
                  const isDrinkItem = item.type === 'drink';

                  return (
                    <div key={item.id} className="bg-surface-container-lowest p-4 rounded-lg relative group">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-body font-bold text-sm text-primary-container">{item.name}</h5>
                          {item.sugarLevel && (
                            <p className="text-[10px] text-secondary/60 font-body mt-0.5">🍯 {item.sugarLevel}%</p>
                          )}
                          <p className="text-secondary font-bold text-xs mt-1 tracking-tight">{formatCurrency(effectivePrice)}</p>
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

                      {/* Topping Chips — only for drinks */}
                      {isDrinkItem && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/10">
                          <span className="text-[10px] text-secondary/60 uppercase font-bold font-body tracking-wider block mb-1.5">Topping</span>
                          <div className="flex flex-wrap gap-1.5">
                            {TOPPINGS.map((t) => {
                              const isSelected = currentToppings.includes(t.id);
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    const updated = isSelected
                                      ? currentToppings.filter(id => id !== t.id)
                                      : [...currentToppings, t.id];
                                    updateItemToppings(item.id, updated);
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-all border font-body ${
                                    isSelected
                                      ? "bg-primary-container/15 text-primary-container border-primary-container/30 font-bold"
                                      : "bg-surface-container text-secondary/60 border-transparent hover:border-outline-variant/30"
                                  }`}
                                >
                                  {t.emoji} +{(t.price / 1000)}k
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
            </div>

            {/* Sticky Bottom: Summary + Grand Total */}
            <div className="px-8 pt-4 pb-4 flex-shrink-0 border-t border-outline-variant/20 space-y-3">
              <div className="flex justify-between text-sm font-body">
                <span className="text-secondary">Subtotal</span>
                <span className="font-bold text-primary-container tracking-tight">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-secondary">Shipping</span>
                {isFreeShipping ? (
                  <span className="font-bold text-emerald-600 tracking-tight flex items-center gap-1">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase font-black">Free</span>
                    <span className="line-through text-secondary/40 text-xs">15.000 VND</span>
                  </span>
                ) : (
                  <span className="font-bold text-primary-container tracking-tight">{formatCurrency(shipping)}</span>
                )}
              </div>
              {fulfillmentType === 'delivery' && !isFreeShipping && subTotal > 0 && amountToFreeShip > 0 && (
                <p className="text-[11px] text-secondary/70 font-body -mt-1">
                  🚚 Add {formatCurrency(amountToFreeShip)} more for <span className="font-bold text-emerald-600">free delivery</span>
                </p>
              )}
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

        {/* Customer Info Step — Highlands-style minimal */}
        {checkoutStep === 'info' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {/* Back + Title */}
              <div className="flex items-center gap-3">
                <button onClick={() => setCheckoutStep('cart')} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container cursor-pointer hover:bg-surface-container-highest transition-colors">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-headline text-2xl text-primary-container tracking-tight">Delivery Details</h2>
              </div>

              {/* Customer Info — Name + Phone + Address */}
              <div className="bg-surface-container-lowest rounded-xl p-4 space-y-4">
                <h5 className="font-headline text-sm text-primary-container font-bold">Thông tin người nhận</h5>

                <div>
                  <label className="text-[10px] font-bold text-secondary/70 uppercase tracking-wider mb-1 block font-body">Tên người nhận *</label>
                  <div className="flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                    <User size={16} className="text-secondary/50 flex-shrink-0" />
                    <input
                      className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                      placeholder="Nhập tên người nhận"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondary/70 uppercase tracking-wider mb-1 block font-body">Số điện thoại *</label>
                  <div className="flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                    <Phone size={16} className="text-secondary/50 flex-shrink-0" />
                    <input
                      className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                      placeholder="0909 xxx xxx"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondary/70 uppercase tracking-wider mb-1 block font-body">
                    Địa chỉ {fulfillmentType === 'delivery' ? '*' : '(tuỳ chọn)'}
                  </label>
                  <div className="flex items-center gap-3 bg-surface-container-high px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                    <MapPin size={16} className="text-secondary/50 flex-shrink-0" />
                    <input
                      className="flex-1 bg-transparent border-none outline-none text-sm font-body text-on-surface placeholder:text-secondary/40"
                      placeholder={fulfillmentType === 'delivery' ? 'Nhập địa chỉ giao hàng' : 'Nhập địa chỉ (không bắt buộc)'}
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary — compact */}
              <div className="bg-surface-container-lowest rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-headline text-sm text-primary-container font-bold">Nội dung đơn hàng</h5>
                  <button onClick={() => setCheckoutStep('cart')} className="text-[11px] text-primary-container font-bold font-body cursor-pointer hover:underline">
                    Chỉnh sửa
                  </button>
                </div>
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const effectivePrice = getEffectivePrice(item);
                    return (
                      <div key={item.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-bold text-on-surface truncate">
                            {item.quantity}x {'  '}{item.name}
                          </p>
                          <p className="text-[10px] text-secondary/60 font-body">
                            {item.sugarLevel ? `🍯 ${item.sugarLevel}%` : ''}
                            {(item.toppings || []).length > 0 ? `${item.sugarLevel ? ' · ' : ''}+${item.toppings!.length} topping` : ''}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary-container whitespace-nowrap">{formatCurrency(effectivePrice * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Note */}
              <div className="bg-surface-container-lowest rounded-xl p-4 space-y-2">
                <h5 className="font-headline text-sm text-primary-container font-bold">Ghi chú đơn hàng</h5>
                <textarea
                  className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm font-body text-on-surface placeholder:text-secondary/40 border-none outline-none resize-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                  placeholder="Nhập nội dung"
                  rows={2}
                  maxLength={255}
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({ note: e.target.value })}
                />
                <p className="text-right text-[10px] text-secondary/50 font-body">{customerInfo.note.length}/255</p>
              </div>
            </div>

            {/* Sticky Bottom — Total + Confirm */}
            <div className="px-8 pt-4 pb-6 flex-shrink-0 border-t border-outline-variant/20 space-y-3 bg-surface-container">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary font-body">
                  Tổng cộng ({items.reduce((s, i) => s + i.quantity, 0)} món)
                </span>
                <span className="text-2xl font-headline font-extrabold text-primary-container tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                onClick={handleConfirmOrder}
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-body font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${
                  !isFormValid
                    ? 'bg-outline-variant text-secondary cursor-not-allowed'
                    : 'bg-primary-container text-white hover:bg-primary active:scale-[0.98] cursor-pointer'
                }`}
              >
                Tiếp tục
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Action Button — Cart step only */}
        {checkoutStep === 'cart' && (
          <div className="p-8 mt-auto">
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
          </div>
        )}
      </div>
    </aside>
  );
}
