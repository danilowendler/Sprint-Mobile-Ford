import { create } from 'zustand';
import { secureStorage } from '@/services/secureStorage';
import {
  login as loginApi,
  signup as signupApi,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
} from '@/services/mocks/authApi';
import { useUserStore } from './useUserStore';

const TOKEN_KEY = 'ford.auth.token';
const USER_KEY = 'ford.auth.user';

export type AuthStatus =
  | 'idle'
  | 'hydrating'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

async function persistSession(token: string, user: AuthUser) {
  await secureStorage.setItem(TOKEN_KEY, token);
  await secureStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function clearSession() {
  await secureStorage.removeItem(TOKEN_KEY);
  await secureStorage.removeItem(USER_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  token: null,
  user: null,
  error: null,

  hydrate: async () => {
    set({ status: 'hydrating' });
    try {
      const [token, rawUser] = await Promise.all([
        secureStorage.getItem(TOKEN_KEY),
        secureStorage.getItem(USER_KEY),
      ]);
      if (token && rawUser) {
        set({
          status: 'authenticated',
          token,
          user: JSON.parse(rawUser) as AuthUser,
          error: null,
        });
      } else {
        set({ status: 'unauthenticated', token: null, user: null });
      }
    } catch {
      set({ status: 'unauthenticated', token: null, user: null });
    }
  },

  login: async (payload) => {
    set({ status: 'authenticating', error: null });
    try {
      const { token, user } = await loginApi(payload);
      await persistSession(token, user);
      set({ status: 'authenticated', token, user, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao entrar. Tente novamente.';
      set({ status: 'unauthenticated', error: message });
      throw err;
    }
  },

  signup: async (payload) => {
    set({ status: 'authenticating', error: null });
    try {
      const { token, user } = await signupApi(payload);
      await persistSession(token, user);
      await useUserStore.getState().clearProfile();
      set({ status: 'authenticated', token, user, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao criar conta.';
      set({ status: 'unauthenticated', error: message });
      throw err;
    }
  },

  logout: async () => {
    await clearSession();
    set({ status: 'unauthenticated', token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
