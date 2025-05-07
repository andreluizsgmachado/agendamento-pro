<script setup lang="ts">
import { ref } from 'vue';
import AppLogo from '../components/AppLogo.vue';

const isDarkMode = ref(false);

// Can be expanded when implementing dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="container header-container">
        <div class="header-left">
          <AppLogo />
        </div>
        <div class="header-right">
          <!-- Future navigation items will go here -->
        </div>
      </div>
    </header>
    
    <main class="main">
      <div class="container">
        <slot />
      </div>
    </main>
    
    <footer class="footer">
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

.header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.main {
  flex: 1;
  padding: var(--spacing-8) 0;
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