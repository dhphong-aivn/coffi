import { create } from 'zustand';

export type ViewType = 'menu' | 'cart' | 'orders' | 'settings' | 'support' | 'help' | 'tracking';
export type OrderTabType = 'history' | 'active';
export type FulfillmentType = 'delivery' | 'dine-in' | 'take-away';
export type CheckoutStep = 'cart' | 'info';

export interface CustomerInfo {
  name: string;
  phone: string;
  age: string;
  email: string;
  address: string;
}

interface AppState {
  currentView: ViewType;
  orderTab: OrderTabType;
  expandedFaq: number | null;
  fulfillmentType: FulfillmentType;
  showCancelDialog: boolean;
  showRefundMsg: boolean;
  showReorderMsg: boolean;
  isCartCollapsed: boolean;
  isChatOpen: boolean;
  checkoutStep: CheckoutStep;
  customerInfo: CustomerInfo;

  setCurrentView: (view: ViewType) => void;
  setOrderTab: (tab: OrderTabType) => void;
  setExpandedFaq: (id: number | null) => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  setShowCancelDialog: (show: boolean) => void;
  setShowRefundMsg: (show: boolean) => void;
  setShowReorderMsg: (show: boolean) => void;
  setCartCollapsed: (collapsed: boolean) => void;
  toggleCart: () => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  setCheckoutStep: (step: CheckoutStep) => void;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  resetCheckout: () => void;
}

const initialCustomerInfo: CustomerInfo = {
  name: '',
  phone: '',
  age: '',
  email: '',
  address: '',
};

export const useAppStore = create<AppState>((set) => ({
  currentView: 'menu',
  orderTab: 'history',
  expandedFaq: null,
  fulfillmentType: 'dine-in',
  showCancelDialog: false,
  showRefundMsg: false,
  showReorderMsg: false,
  isCartCollapsed: false,
  isChatOpen: false,
  checkoutStep: 'cart',
  customerInfo: { ...initialCustomerInfo },

  setCurrentView: (view) => set({ currentView: view }),
  setOrderTab: (tab) => set({ orderTab: tab }),
  setExpandedFaq: (id) => set({ expandedFaq: id }),
  setFulfillmentType: (type) => set({ fulfillmentType: type }),
  setShowCancelDialog: (show) => set({ showCancelDialog: show }),
  setShowRefundMsg: (show) => set({ showRefundMsg: show }),
  setShowReorderMsg: (show) => set({ showReorderMsg: show }),
  setCartCollapsed: (collapsed) => set({ isCartCollapsed: collapsed }),
  toggleCart: () => set((state) => ({ isCartCollapsed: !state.isCartCollapsed })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setCheckoutStep: (step) => set({ checkoutStep: step }),
  setCustomerInfo: (info) => set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),
  resetCheckout: () => set({ checkoutStep: 'cart', customerInfo: { ...initialCustomerInfo } }),
}));
