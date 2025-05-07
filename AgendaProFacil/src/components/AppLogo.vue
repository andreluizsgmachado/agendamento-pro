<script setup lang="ts">
const props = defineProps({
  size: {
    type: String,
    default: 'medium',
  },
});

const sizeClasses = {
  small: 'text-lg',
  medium: 'text-xl',
  large: 'text-2xl',
};
</script>

<template>
  <div class="app-logo" :class="sizeClasses[size as keyof typeof sizeClasses]">
    <span class="brand-name">YourApp</span>
  </div>
</template>

<style scoped>
.app-logo {
  font-weight: 700;
  color: var(--color-primary-600);
  transition: color var(--transition-fast);
  cursor: pointer;
}

.app-logo:hover {
  color: var(--color-primary-700);
}

.brand-name {
  letter-spacing: -0.5px;
}
</style>