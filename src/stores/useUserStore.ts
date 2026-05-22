import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlanId } from '@/theme/plans';

const PROFILE_KEY = 'ford.user.profile';
const ONBOARDING_FLAG = 'ford.onboarding.complete';

export const vehicleModels = ['ranger', 'maverick', 'territory', 'mustang', 'raptor'] as const;
export type VehicleModel = (typeof vehicleModels)[number];

export const usageStyles = ['urban', 'rural', 'mixed', 'performance'] as const;
export type UsageStyle = (typeof usageStyles)[number];

export type UserProfile = {
  vehicleModel: VehicleModel;
  usageStyle: UsageStyle;
  monthlyKm: number;
  plan: PlanId;
  riskScore?: number;
};

export type DraftProfile = Partial<UserProfile>;

type UserState = {
  hydrated: boolean;
  onboardingComplete: boolean;
  profile: UserProfile | null;
  draft: DraftProfile;
  hydrate: () => Promise<void>;
  updateDraft: (patch: DraftProfile) => void;
  resetDraft: () => void;
  commitProfile: (profile: UserProfile) => Promise<void>;
  updatePlan: (plan: PlanId) => Promise<void>;
  clearProfile: () => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  hydrated: false,
  onboardingComplete: false,
  profile: null,
  draft: {},

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const [rawProfile, flag] = await Promise.all([
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(ONBOARDING_FLAG),
      ]);
      set({
        hydrated: true,
        onboardingComplete: flag === '1',
        profile: rawProfile ? (JSON.parse(rawProfile) as UserProfile) : null,
      });
    } catch {
      set({ hydrated: true, onboardingComplete: false, profile: null });
    }
  },

  updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),

  resetDraft: () => set({ draft: {} }),

  commitProfile: async (profile) => {
    await AsyncStorage.multiSet([
      [PROFILE_KEY, JSON.stringify(profile)],
      [ONBOARDING_FLAG, '1'],
    ]);
    set({ profile, onboardingComplete: true, draft: {} });
  },

  updatePlan: async (plan) => {
    const cur = get().profile;
    if (!cur || cur.plan === plan) return;
    const next = { ...cur, plan };
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      set({ profile: next });
    } catch {
      // mantém estado anterior em caso de falha de IO
    }
  },

  clearProfile: async () => {
    await AsyncStorage.multiRemove([PROFILE_KEY, ONBOARDING_FLAG]);
    set({ profile: null, onboardingComplete: false, draft: {} });
  },
}));
