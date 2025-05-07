<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const isDarkMode = ref(false);
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const hideSidebarRouteNames = ['home', 'login', 'register', 'public-schedule'];
const showSidebar = computed(() => !hideSidebarRouteNames.includes(route.name as string));

const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Horários', path: '/schedule-manager', icon: '🗓️' },
  { name: 'Serviços', path: '/service-manager', icon: '🛠️' },
  { name: 'Agendamentos', path: '/appointments', icon: '📅' },
];

// Can be expanded when implementing dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="container header-container">
      
        <div class="header-right">
          <!-- Future navigation items will go here -->
        </div>
      </div>
    </header>
    <div class="layout-body">
      <aside v-if="showSidebar" class="sidebar">
        <div class="user-info">
          <span class="user-name">{{ auth.user?.email }}</span>
        </div>
        <nav>
          <ul>
            <li v-for="link in navLinks" :key="link.path">
              <router-link :to="link.path" active-class="active-link">
                <span class="icon">{{ link.icon }}</span>
                <span>{{ link.name }}</span>
              </router-link>
            </li>
          </ul>
        </nav>
        <button class="logout-btn" @click="handleLogout">Sair</button>
      </aside>
      <main class="main">
        <div class="container">
          <slot />
        </div>
      </main>
    </div>
    <footer v-if="!showSidebar" class="footer">
      <div class="container">
        <p class="copyright">© {{ new Date().getFullYear() }} YourApp. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.sidebar {
  width: 220px;
  background: linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%);
  color: #fff;
  padding: 32px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 2px 0 8px rgba(60,60,120,0.07);
}
.user-info {
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 24px;
}
.user-name {
  font-size: 0.9rem;
  opacity: 0.9;
  word-break: break-all;
}
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar nav ul li {
  margin-bottom: 16px;
}
.sidebar nav ul li .icon {
  margin-right: 10px;
}
.sidebar nav ul li .active-link {
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
}
.sidebar a {
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 12px 24px;
  font-weight: 500;
  border-radius: 8px;
  transition: background 0.2s;
}
.sidebar a:hover {
  background: rgba(255,255,255,0.10);
}
.logout-btn {
  margin: 32px 24px 0 24px;
  padding: 10px 0;
  background: #fff;
  color: #7c3aed;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.logout-btn:hover {
  background: #7c3aed;
  color: #fff;
}
.main {
  flex: 1;
  padding: var(--spacing-8) 0;
}
@media (max-width: 900px) {
  .layout-body {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    flex-direction: row;
    padding: 0;
    box-shadow: none;
    min-height: 56px;
    align-items: center;
    justify-content: space-between;
  }
  .sidebar nav ul {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
  }
  .sidebar nav ul li {
    margin-bottom: 0;
  }
  .logout-btn {
    margin: 0 16px;
    padding: 8px 16px;
  }
  .user-info {
    display: none;
  }
}
.footer {
  padding: var(--spacing-6) 0;
  background-color: var(--color-gray-100);
  border-top: 1px solid var(--color-gray-200);
}
.copyright {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-gray-500);
  text-align: center;
}
</style>