import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  })
    }),
    {
      name: 'edca_auth_session',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitializing = false;
        }
      },
    }
  )
);

