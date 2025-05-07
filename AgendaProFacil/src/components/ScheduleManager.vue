<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_active: boolean;
}

const schedules = ref<Schedule[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const daysOfWeek = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

const newSchedule = ref({
  day_of_week: 1,
  start_time: '09:00',
  end_time: '17:00',
  duration_minutes: 60,
  is_active: true
});

const fetchSchedules = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (fetchError) throw fetchError;
    schedules.value = data || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar horários';
  } finally {
    loading.value = false;
  }
};

const addSchedule = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!auth.user?.id) {
      throw new Error('Usuário não autenticado');
    }

    const { error: insertError } = await supabase
      .from('schedules')
      .insert([{
        ...newSchedule.value,
        user_id: auth.user.id
      }]);

    if (insertError) throw insertError;

    await fetchSchedules();
    resetNewSchedule();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao adicionar horário';
  } finally {
    loading.value = false;
  }
};

const toggleSchedule = async (schedule: Schedule) => {
  try {
    loading.value = true;
    error.value = null;

    const { error: updateError } = await supabase
      .from('schedules')
      .update({ is_active: !schedule.is_active })
      .eq('id', schedule.id);

    if (updateError) throw updateError;

    await fetchSchedules();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao atualizar horário';
  } finally {
    loading.value = false;
  }
};

const deleteSchedule = async (scheduleId: string) => {
  try {
    loading.value = true;
    error.value = null;

    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId);

    if (deleteError) throw deleteError;

    await fetchSchedules();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao deletar horário';
  } finally {
    loading.value = false;
  }
};

const resetNewSchedule = () => {
  newSchedule.value = {
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    duration_minutes: 60,
    is_active: true
  };
};

const getShareableLink = () => {
  return `${window.location.origin}/schedule/${auth.user?.id}`;
};

const copyToClipboard = (link: string) => {
  navigator.clipboard.writeText(link);
};

onMounted(fetchSchedules);
</script>

<template>
  <div class="schedule-manager">
    <div class="header">
      <h2>Gerenciar Horários</h2>
    </div>

    <div class="add-schedule">
      <h3>Adicionar Novo Horário</h3>
      <form @submit.prevent="addSchedule" class="schedule-form">
        <div class="form-group">
          <label for="day">Dia da Semana</label>
          <select id="day" v-model="newSchedule.day_of_week">
            <option v-for="(day, index) in daysOfWeek" :key="index" :value="index">
              {{ day }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="start">Horário de Início</label>
          <input type="time" id="start" v-model="newSchedule.start_time" required>
        </div>

        <div class="form-group">
          <label for="end">Horário de Término</label>
          <input type="time" id="end" v-model="newSchedule.end_time" required>
        </div>

        <div class="form-group">
          <label for="duration">Duração (minutos)</label>
          <input type="number" id="duration" v-model="newSchedule.duration_minutes" min="15" step="15" required>
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Adicionando...' : 'Adicionar Horário' }}
        </button>
      </form>
    </div>

    <div class="schedules-list">
      <h3>Horários Cadastrados</h3>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading" class="loading">
        Carregando...
      </div>

      <div v-else-if="schedules.length === 0" class="no-schedules">
        Nenhum horário cadastrado
      </div>

      <div v-else class="schedules-grid">
        <div v-for="schedule in schedules" :key="schedule.id" class="schedule-card">
          <div class="schedule-info">
            <h4>{{ daysOfWeek[schedule.day_of_week] }}</h4>
            <p>{{ schedule.start_time }} - {{ schedule.end_time }}</p>
            <p>Duração: {{ schedule.duration_minutes }} minutos</p>
          </div>
          <div class="schedule-actions">
            <button 
              @click="toggleSchedule(schedule)"
              :class="{ 'active': schedule.is_active }"
            >
              {{ schedule.is_active ? 'Ativo' : 'Inativo' }}
            </button>
            <button 
              @click="deleteSchedule(schedule.id)"
              class="delete"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="share-links">
      <h3>Link para compartilhar seus horários:</h3>
      <div v-if="schedules.length > 0">
        <div class="share-link-row">
          <input :value="getShareableLink()" readonly class="share-link-input" />
          <button @click="copyToClipboard(getShareableLink())">Copiar</button>
        </div>
      </div>
      <div v-else>
        <p>Nenhum horário cadastrado para compartilhar.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.header {
  margin-bottom: var(--spacing-8);
}

.add-schedule {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.schedule-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

input, select {
  padding: var(--spacing-2);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.schedules-list {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.schedules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.schedule-card {
  padding: var(--spacing-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-info h4 {
  margin: 0;
  color: var(--color-gray-900);
}

.schedule-info p {
  margin: var(--spacing-1) 0;
  color: var(--color-gray-600);
}

.schedule-actions {
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
  background-color: var(--color-primary-700);
}

button.delete {
  background-color: rgb(211, 156, 236);
  color: white
}

button.delete:hover {
  background-color: rgb(247, 69, 69);
}

.error-message {
  color: var(--color-error-600);
  margin: var(--spacing-4) 0;
}

.loading, .no-schedules {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-gray-600);
}

.share-links {
  margin: var(--spacing-6) 0;
}
.share-link-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}
.share-link-input {
  flex: 1;
  padding: var(--spacing-2);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
}
</style> 