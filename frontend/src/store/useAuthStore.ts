import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set as idbSet, del } from 'idb-keyval';

// IndexedDB storage for Zustand to bypass localStorage 5MB limits
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await idbSet(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    await del(name);
  },
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isOnboarded?: boolean;
  username?: string;
  avatar?: string;
  banner?: string;
  customThemeBg?: string;
  customTextColor?: string;
  authProvider?: string;
  phone?: string;
  location?: string;
  gender?: string;
  college?: string;
  degree?: string;
  gradYear?: string;
  targetRole?: string;
  experienceLevel?: string;
  techStack?: string[];
  resumeName?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setInitializing: (val: boolean) => void;
  setOnboarded: (val: boolean, profileData?: Partial<User>) => void;
  updateUser: (profileData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true, // Starts true until onRehydrateStorage completes

  setAuth: (user, accessToken) => {
    set({ 
      user: { ...user }, 
      accessToken, 
      isAuthenticated: true,
      isInitializing: false
    });
  },

  setAccessToken: (token) => set((state) => ({
    ...state,
    accessToken: token
  })),

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/sign?view=login';
    }
  },

  setInitializing: (val) => set({ isInitializing: val }),

  setOnboarded: (val, profileData) => set((state) => {
    const updatedUser = state.user ? { ...state.user, isOnboarded: val, ...profileData } : null;
    return { ...state, user: updatedUser };
  }),

  updateUser: (profileData) => set((state) => {
    const updatedUser = state.user ? { ...state.user, ...profileData } : null;
    return { ...state, user: updatedUser };
  })
    }),
    {
      name: 'edca_auth_session',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitializing(false);
        }
      },
    }
  )
);

