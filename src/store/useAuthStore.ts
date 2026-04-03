import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
  active: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "";
const GAS_SECRET = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SECRET || "coffi-2026-xyz";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              apiSecret: GAS_SECRET,
              action: "CHECK_LOGIN",
              data: { email, password }
            })
          });

          const result = await res.json();

          if (result.success && result.user) {
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false
            });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: result.error || "Đăng nhập thất bại" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Lỗi kết nối server" };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'coffi-auth-storage',
    }
  )
);
