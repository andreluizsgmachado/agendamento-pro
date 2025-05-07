import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';
import { ref } from 'vue';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  plan: string;
  trial_ends_at: string;
  created_at: string;
  updated_at: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const profile = ref<Profile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function register(email: string, password: string, plan: string) {
    try {
      loading.value = true;
      error.value = null;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              plan: plan,
            }
          ]);

        if (profileError) throw profileError;

        user.value = authData.user;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    try {
      loading.value = true;
      error.value = null;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from authentication');
      }

      user.value = authData.user;
      await fetchProfile();
    } catch (err) {
      console.error('Login error:', err);
      error.value = err instanceof Error ? err.message : 'An error occurred during login';
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      loading.value = true;
      error.value = null;

      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;

      user.value = null;
      profile.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    try {
      if (!user.value) {
        throw new Error('No user found when trying to fetch profile');
      }

      console.log('Fetching profile for user:', user.value.id);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!data) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.value.id,
              plan: 'free',
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          throw new Error(`Failed to create profile: ${createError.message}`);
        }

        profile.value = newProfile;
      } else {
        profile.value = data;
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching profile';
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    register,
    login,
    logout,
    fetchProfile
  };
});