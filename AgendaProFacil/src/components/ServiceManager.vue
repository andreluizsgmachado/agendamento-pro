<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

const services = ref<Service[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const newService = ref({
  name: '',
  description: '',
  duration_minutes: 60,
  price: 0,
  is_active: true
});

const fetchServices = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) throw fetchError;
    services.value = data || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar serviços';
  } finally {
    loading.value = false;
  }
};

const addService = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!auth.user?.id) {
      throw new Error('Usuário não autenticado');
    }

    const { error: insertError } = await supabase
      .from('services')
      .insert([{
        ...newService.value,
        user_id: auth.user.id
      }]);

    if (insertError) throw insertError;

    await fetchServices();
    resetNewService();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao adicionar serviço';
  } finally {
    loading.value = false;
  }
};

const toggleService = async (service: Service) => {
  try {
    loading.value = true;
    error.value = null;

    const { error: updateError } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (updateError) throw updateError;

    await fetchServices();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao atualizar serviço';
  } finally {
    loading.value = false;
  }
};

const deleteService = async (serviceId: string) => {
  try {
    loading.value = true;
    error.value = null;

    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (deleteError) throw deleteError;

    await fetchServices();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao deletar serviço';
  } finally {
    loading.value = false;
  }
};

const resetNewService = () => {
  newService.value = {
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    is_active: true
  };
};

onMounted(fetchServices);
</script>

<template>
  <div class="service-manager">
    <div class="header">
      <h2>Gerenciar Serviços</h2>
    </div>

    <div class="add-service">
      <h3>Adicionar Novo Serviço</h3>
      <form @submit.prevent="addService" class="service-form">
        <div class="form-group">
          <label for="name">Nome do Serviço</label>
          <input
            id="name"
            v-model="newService.name"
            type="text"
            required
            placeholder="Ex: Corte de Cabelo"
          >
        </div>

        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea
            id="description"
            v-model="newService.description"
            placeholder="Descreva o serviço..."
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="duration">Duração (minutos)</label>
            <input
              id="duration"
              v-model="newService.duration_minutes"
              type="number"
              min="15"
              step="15"
              required
            >
          </div>

          <div class="form-group">
            <label for="price">Preço (R$)</label>
            <input
              id="price"
              v-model="newService.price"
              type="number"
              min="0"
              step="0.01"
              required
            >
          </div>
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Adicionando...' : 'Adicionar Serviço' }}
        </button>
      </form>
    </div>

    <div class="services-list">
      <h3>Serviços Cadastrados</h3>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading" class="loading">
        Carregando...
      </div>

      <div v-else-if="services.length === 0" class="no-services">
        Nenhum serviço cadastrado
      </div>

      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.id" class="service-card">
          <div class="service-info">
            <h4>{{ service.name }}</h4>
            <p class="description">{{ service.description }}</p>
            <div class="service-details">
              <span>Duração: {{ service.duration_minutes }} min</span>
              <span>Preço: R$ {{ service.price.toFixed(2) }}</span>
            </div>
          </div>
          <div class="service-actions">
            <button 
              @click="toggleService(service)"
              :class="{ 'active': service.is_active }"
            >
              {{ service.is_active ? 'Ativo' : 'Inativo' }}
            </button>
            <button 
              @click="deleteService(service.id)"
              class="delete"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.header {
  margin-bottom: var(--spacing-8);
}

.add-service {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.service-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

input, textarea {
  padding: var(--spacing-2);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.services-list {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.service-card {
  padding: var(--spacing-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.service-info h4 {
  margin: 0;
  color: var(--color-gray-900);
}

.description {
  color: var(--color-gray-600);
  font-size: 0.875rem;
  margin: var(--spacing-2) 0;
}

.service-details {
  display: flex;
  justify-content: space-between;
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.service-actions {
  display: flex;
  gap: var(--spacing-2);
}

button {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

button:not(.delete) {
  background-color: var(--color-primary-600);
  color: white;
}

button:not(.delete):hover {
  background-color: var(--color-primary-700);
}

button.active {
  background-color: var(--color-success-600);
}

button.delete {
  background-color: var(--color-error-600);
  color: white;
}

button.delete:hover {
  background-color: var(--color-error-700);
}

.error-message {
  color: var(--color-error-600);
  margin: var(--spacing-4) 0;
}

.loading, .no-services {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-gray-600);
}
</style> 