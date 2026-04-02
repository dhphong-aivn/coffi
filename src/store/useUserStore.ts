import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  note?: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface UserState {
  profile: UserProfile;
  addresses: Address[];
  setProfile: (profile: Partial<UserProfile>) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        name: 'Matiko Coffee Land',
        email: 'hello@matikocoffee.com',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApvYIqRybUbEXsReSl2s_S2bdOCOWSG059NKC91mxezqtfk-hyuqRj93bXI8s7LuKUC2h4oFBu3QH-KYQbEk2Orzfc6PVtRX1iUFkIgCF_isbiTygq323gIXym_qck3e2RXy-C-S15Alq1h1fIA8_4Q6zh-zt29DNrbzGwgyic76u5VbSe2PkYeUSo9JM3thRCUBRVyJPyY6-QmAaZhg0BbWvBrpHmPY7DOOg6sAyozsIbJWCqn4LLmDKat3HmA_plZ8wGtY8OeLw'
      },
      addresses: [
        {
          id: '1',
          name: 'Home',
          phone: '+251 900 000 000',
          addressLine: 'Block 4, Bole, Addis Ababa',
          isDefault: true
        },
        {
          id: '2',
          name: 'Office',
          phone: '+251 911 111 111',
          addressLine: '5th Floor, Kazanchis, Addis Ababa',
          isDefault: false
        }
      ],
      setProfile: (profileUpdates) => set((state) => ({ 
        profile: { ...state.profile, ...profileUpdates } 
      })),
      addAddress: (address) => set((state) => {
        // If it's the first address or set as default, turn others to false
        let updatedAddresses = [...state.addresses];
        if (address.isDefault || updatedAddresses.length === 0) {
          updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
          address.isDefault = true;
        }
        return { addresses: [...updatedAddresses, address] };
      }),
      removeAddress: (id) => set((state) => ({
        addresses: state.addresses.filter(a => a.id !== id)
      })),
      setDefaultAddress: (id) => set((state) => ({
        addresses: state.addresses.map(a => ({
          ...a,
          isDefault: a.id === id
        }))
      }))
    }),
    {
      name: 'coffee-user-storage',
    }
  )
);
