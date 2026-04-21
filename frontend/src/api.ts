import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

const TOKEN_KEY = 'pm_access';
const REFRESH_KEY = 'pm_refresh';

export const tokens = {
  get access() { return localStorage.getItem(TOKEN_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = tokens.access;
  const isRefreshCall = config.url?.endsWith('/auth/refresh');
  if (t && !isRefreshCall) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  if (isRefreshCall && tokens.refresh) {
    config.headers.Authorization = `Bearer ${tokens.refresh}`;
  }
  return config;
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      !orig._retry &&
      tokens.refresh &&
      !orig.url?.endsWith('/auth/refresh') &&
      !orig.url?.endsWith('/auth/login') &&
      !orig.url?.endsWith('/auth/register')
    ) {
      orig._retry = true;
      try {
        refreshing =
          refreshing ??
          (async () => {
            const { data } = await api.post('/auth/refresh');
            tokens.set(data.accessToken, data.refreshToken);
          })();
        await refreshing;
        refreshing = null;
        return api(orig);
      } catch (e) {
        refreshing = null;
        tokens.clear();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);
