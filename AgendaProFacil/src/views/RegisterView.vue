<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const selectedPlan = route.query.plan as string;

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
});

const handleSubmit = async (event: Event) => {
  event.preventDefault();
  
  if (form.value.password !== form.value.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  await auth.register(
    form.value.email,
    form.value.password,
    selectedPlan
  );

  if (!auth.error) {
    router.push('/dashboard');
  }
};
</script>

<template>
  <div class="register-view">
    <div class="register-card">
      <h1 class="title">Crie a sua conta</h1>
      <p v-if="selectedPlan" class="selected-plan">
        Selected plan: {{ selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) }}
      </p>
      
      <form @submit="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="your@email.com"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirme a senha</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            placeholder="••••••••"
          >
        </div>

        <div v-if="auth.error" class="error-message">
          {{ auth.error }}
        </div>
        
        <button 
          type="submit" 
          class="submit-button"
          :disabled="auth.loading"
        >
          {{ auth.loading ? 'Criando a conta...' : 'Conta Criada Com Sucesso' }}
        </button>

        <p class="login-link">
          Já Possui uma conta? 
          <router-link to="/login" class="link">Entrar</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.register-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.875rem;
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-6);
  text-align: center;
}

.selected-plan {
  text-align: center;
  color: var(--color-primary-600);
  font-weight: 500;
  margin-bottom: var(--spacing-6);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

label {
  color: var(--color-gray-700);
  font-size: 0.875rem;
  font-weight: 500;
}

input {
  padding: var(--spacing-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.error-message {
  color: var(--color-error-500);
  font-size: 0.875rem;
  margin-top: var(--spacing-2);
}

.submit-button {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: var(--spacing-4);
  color: var(--color-gray-600);
}

.link {
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>