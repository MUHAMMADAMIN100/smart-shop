import { create } from 'zustand';
import { api, tokens } from '../api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  async init() {
    if (!tokens.access) {
      set({ initialized: true });
      return;
    }
    try {
      const { data } = await api.get<User>('/users/me');
      set({ user: data, initialized: true });
    } catch {
      tokens.clear();
      set({ initialized: true });
    }
  },

  async login(email, password) {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      tokens.set(data.accessToken, data.refreshToken);
      set({ user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  async register(email, password, name, phone) {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', { email, password, name, phone });
      tokens.set(data.accessToken, data.refreshToken);
      set({ user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    tokens.clear();
    set({ user: null });
  },

  setUser(u) {
    set({ user: u });
  },
}));
