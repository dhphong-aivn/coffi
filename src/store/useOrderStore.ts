import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  fulfillment: 'delivery' | 'dine-in' | 'take-away';
  customerName: string;
  customerPhone: string;
  address?: string;
  note?: string;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  cancelOrder: (id: string) => void;
  getActiveOrders: () => Order[];
  getHistoryOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => set((state) => ({
        orders: [order, ...state.orders],
      })),

      cancelOrder: (id) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status: 'cancelled' as const } : o
        ),
      })),

      getActiveOrders: () =>
        get().orders.filter((o) => ['processing', 'preparing', 'on-the-way'].includes(o.status)),

      getHistoryOrders: () =>
        get().orders.filter((o) => ['delivered', 'cancelled'].includes(o.status)),
    }),
    { name: 'coffee-orders-storage' }
  )
);
