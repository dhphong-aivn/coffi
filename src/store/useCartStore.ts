import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOPPINGS } from '@/data/menu-options';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type?: string;
  sugarLevel?: number;
  toppings?: string[];
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemToppings: (id: string, toppings: string[]) => void;
  clearCart: () => void;
  getSubTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity < 1) {
          return { items: state.items.filter((i) => i.id !== id) };
        }
        return {
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i))
        };
      }),
      updateItemToppings: (id, toppings) => set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, toppings } : i))
      })),
      clearCart: () => set({ items: [] }),
      getSubTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const toppingTotal = (item.toppings || []).reduce((sum, tid) => {
            const t = TOPPINGS.find(tp => tp.id === tid);
            return sum + (t?.price || 0);
          }, 0);
          return total + (item.price + toppingTotal) * item.quantity;
        }, 0);
      }
    }),
    {
      name: 'coffee-cart-storage',
    }
  )
);
