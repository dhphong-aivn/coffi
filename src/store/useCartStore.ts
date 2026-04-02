import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type?: string; 
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [
        // Mock data matching the original HTML
        {
          id: '1',
          name: 'Small Macchiato',
          price: 80000,
          quantity: 1,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACFx9r70Y_AnwOsUcRURe8vrIxky4BcUgmMNu10F8i3m59FMPrKwwvT9tKmNjiy7gFOqIgxq7OiFB-aICWiKLjhRJ-3Vfn9pI36Hr-_QERmCsoxOAqv58lx17iD_2PNZxd1l9G05CaQsAuqS1DXsTU9aSD17o9t1RwKctzdgBQkmrvi_ykqKuLwDRO4NKXCwCfyi6kI6gbPGeKwPTo3uifhWXw8p7q7MIJ4K3FdKABWiIFonROPyLE84q4U-E6JlKeHLdA8IJKUBs'
        },
        {
          id: '2',
          name: 'Large Iced Chocolate',
          price: 150000,
          quantity: 1,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1R3EqeFFCROsZ9eFLmcCM0xewYnj157oH5W9-4Ch73nHkNWakd3Od81vxlS-r7YP0zc7XI8OivO4J9AQspu4rfXV9aAAsiw7KNRKfbG_EjXUzv9OOcgRdLju9pbQvc0E7RokJa9z-AZljnxTZFyGKoSK6HL4suO5Z2YdeZpltAHQEW_dspdt15NSzTuMrhKWNAl-thPOebLWAA-G8p44Zfdf0eITq8Jp6j1DpMYJQf9T171e32P9E_m-ahStJJ6Xi4QpTJqWuyDY'
        }
      ],
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
      clearCart: () => set({ items: [] }),
      getSubTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'coffee-cart-storage',
    }
  )
);
