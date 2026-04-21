import { create } from 'zustand';
import { api } from '../api';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (variantId: string, quantity?: number) => Promise<void>;
  update: (id: string, quantity: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  async fetch() {
    set({ loading: true });
    try {
      const { data } = await api.get<CartItem[]>('/cart');
      set({ items: data });
    } finally {
      set({ loading: false });
    }
  },

  async add(variantId, quantity = 1) {
    await api.post('/cart', { variantId, quantity });
    await get().fetch();
  },

  async update(id, quantity) {
    await api.patch(`/cart/${id}`, { quantity });
    await get().fetch();
  },

  async remove(id) {
    await api.delete(`/cart/${id}`);
    await get().fetch();
  },

  async clear() {
    await api.delete('/cart');
    set({ items: [] });
  },

  total() {
    return get().items.reduce((s, it) => s + it.variant.price * it.quantity, 0);
  },

  count() {
    return get().items.reduce((s, it) => s + it.quantity, 0);
  },
}));
