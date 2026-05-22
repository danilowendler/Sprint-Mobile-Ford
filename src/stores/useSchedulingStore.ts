import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Booking, SchedulingDraft } from '@/types/scheduling';

const BOOKINGS_KEY = 'ford.scheduling.bookings';

type SchedulingState = {
  hydrated: boolean;
  draft: SchedulingDraft;
  bookings: Booking[];
  hydrate: () => Promise<void>;
  startDraft: (dealerId: string) => void;
  startDraftWithSuggestion: (suggestion: SchedulingDraft) => void;
  updateDraft: (patch: Partial<SchedulingDraft>) => void;
  resetDraft: () => void;
  commitBooking: (booking: Booking) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  clearBookings: () => Promise<void>;
};

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  hydrated: false,
  draft: {},
  bookings: [],

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
      const bookings = raw ? (JSON.parse(raw) as Booking[]) : [];
      set({ hydrated: true, bookings });
    } catch {
      set({ hydrated: true, bookings: [] });
    }
  },

  startDraft: (dealerId) => set({ draft: { dealerId } }),

  startDraftWithSuggestion: (suggestion) => set({ draft: { ...suggestion } }),

  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),

  resetDraft: () => set({ draft: {} }),

  commitBooking: async (booking) => {
    const next = [booking, ...get().bookings];
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
    set({ bookings: next, draft: {} });
  },

  cancelBooking: async (id) => {
    const next = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'cancelled' as const } : b,
    );
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
    set({ bookings: next });
  },

  clearBookings: async () => {
    await AsyncStorage.removeItem(BOOKINGS_KEY);
    set({ bookings: [] });
  },
}));
