import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle(id) {
        const cur = get().ids;
        if (cur.includes(id)) {
          set({ ids: cur.filter((x) => x !== id) });
        } else if (cur.length < 4) {
          set({ ids: [...cur, id] });
        }
      },
      clear() { set({ ids: [] }); },
      has(id) { return get().ids.includes(id); },
    }),
    { name: 'pm_compare' },
  ),
);
