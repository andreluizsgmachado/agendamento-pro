import { defineStore } from 'pinia';

// Root store for app-wide state
export const useAppStore = defineStore('app', {
  state: () => ({
    isLoading: false,
    darkMode: false,
  }),
  actions: {
    setLoading(status: boolean) {
      this.isLoading = status;
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
    },
  },
});

// Future stores will be added here:
// - useAuthStore: For Supabase authentication
// - usePaymentStore: For Stripe payments