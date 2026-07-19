import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true, // Used for the initial page load to check if user has active session

  setAuth: (user, accessToken) => set({ 
    user, 
    accessToken, 
    isAuthenticated: true,
    isInitializing: false
  }),

  setAccessToken: (token) => set((state) => ({
    ...state,
    accessToken: token
  })),

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    // In a real app, this should also clear any WebSockets or redirect the user
    if (typeof window !== 'undefined') {
      window.location.href = '/sign?view=login';
    }
  },

  setInitializing: (val) => set({ isInitializing: val })
}));
