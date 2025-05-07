<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const router = useRouter();
const auth = useAuthStore();
const { user, profile } = storeToRefs(auth);

onMounted(async () => {
  if (!user.value) {
    router.push('/login');
    return;
  }
  
  await auth.fetchProfile();
});

const handleLogout = async () => {
  await auth.logout();
  router.push('/');
};
</script>

<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </div>

    <div class="dashboard-content">
      <div class="welcome-card">
        <h2>Welcome back!</h2>
        <p>Your email: {{ user?.email }}</p>
        <p>Your plan: {{ profile?.plan }}</p>
        <p>Trial ends: {{ new Date(profile?.trial_ends_at || '').toLocaleDateString() }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Feature 1</h3>
          <p>Coming soon</p>
        </div>
        <div class="stat-card">
          <h3>Feature 2</h3>
          <p>Coming soon</p>
        </div>
        <div class="stat-card">
          <h3>Feature 3</h3>
          <p>Coming soon</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-8);
}

.logout-button {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-button:hover {
  background-color: var(--color-gray-300);
  color: var(--color-gray-900);
}

.welcome-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  margin-bottom: var(--spacing-4);
  color: var(--color-gray-900);
}

.welcome-card p {
  margin-bottom: var(--spacing-2);
  color: var(--color-gray-700);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
}

.stat-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin-bottom: var(--spacing-2);
  color: var(--color-gray-900);
}

.stat-card p {
  color: var(--color-gray-600);
}
</style>