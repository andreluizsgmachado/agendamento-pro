<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';

interface Schedule {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface Appointment {
  id: string;
  schedule_id: string;
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_time: string;
  end_time: string;
  status: string;
}

const route = useRoute();
const userId = route.params.id as string;

const schedules = ref<Schedule[]>([]);
const services = ref<Service[]>([]);
const availableSlots = ref<TimeSlot[]>([]);
const selectedDate = ref(new Date());
const selectedSlot = ref<TimeSlot | null>(null);
const selectedService = ref<Service | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  client_name: '',
  client_email: '',
  client_phone: '',
  notes: ''
});

const fetchSchedules = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Buscar todos os agendamentos ativos do usuário
    const { data, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Erro ao buscar agendamentos do usuário:', fetchError);
      throw fetchError;
    }

    console.log('Agendamentos encontrados:', data);
    schedules.value = data || [];
  } catch (err) {
    console.error('Erro completo:', err);
    error.value = err instanceof Error ? err.message : 'Erro ao carregar horários';
  } finally {
    loading.value = false;
  }
};

const fetchServices = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (fetchError) throw fetchError;
    services.value = data || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar serviços';
  } finally {
    loading.value = false;
  }
};

const generateTimeSlots = (schedule: Schedule) => {
  const slots: TimeSlot[] = [];
  const start = new Date(`2000-01-01T${schedule.start_time}`);
  const end = new Date(`2000-01-01T${schedule.end_time}`);
  const duration = schedule.duration_minutes;

  let current = new Date(start);
  while (current < end) {
    const slotEnd = new Date(current.getTime() + duration * 60000);
    if (slotEnd <= end) {
      slots.push({
        start: current.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5),
        available: true
      });
    }
    current = slotEnd;
  }

  return slots;
};

// Função utilitária para montar o timestamp completo
function buildTimestamp(date: Date, time: string) {
  const [hours, minutes] = time.split(':');
  const d = new Date(date);
  d.setHours(Number(hours), Number(minutes), 0, 0);
  d.setMilliseconds(0);
  return d.toISOString();
}

const checkSlotAvailability = async (slot: TimeSlot, scheduleId: string) => {
  try {
    console.log('Verificando disponibilidade para o slot:', slot);
    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('start_time', buildTimestamp(selectedDate.value, slot.start))
      .in('status', ['confirmed', 'pending']);
    if (fetchError) {
      console.error('Erro ao verificar disponibilidade:', fetchError);
      throw fetchError;
    }
    const isAvailable = !data || data.length === 0;
    console.log('Slot disponível:', isAvailable);
    return isAvailable;
  } catch (err) {
    console.error('Erro ao verificar disponibilidade:', err);
    return false;
  }
};

const updateAvailableSlots = async () => {
  try {
    const dayOfWeek = selectedDate.value.getDay();
    console.log('Dia da semana selecionado:', dayOfWeek);
    console.log('Agendamentos disponíveis:', schedules.value);

    const schedulesForDay = schedules.value.filter(s => s.day_of_week === dayOfWeek);
    if (!schedulesForDay.length) {
      availableSlots.value = [];
      return;
    }
    let allSlots: TimeSlot[] = [];
    for (const schedule of schedulesForDay) {
      const slots = generateTimeSlots(schedule);
      const availableSlotsPromises = slots.map(async slot => {
        const isAvailable = await checkSlotAvailability(slot, schedule.id);
        return {
          ...slot,
          available: isAvailable
        };
      });
      const checkedSlots = await Promise.all(availableSlotsPromises);
      allSlots = allSlots.concat(checkedSlots);
    }
    availableSlots.value = allSlots;
    console.log('Slots disponíveis atualizados:', availableSlots.value);
  } catch (err) {
    console.error('Erro ao atualizar slots disponíveis:', err);
    error.value = err instanceof Error ? err.message : 'Erro ao atualizar horários disponíveis';
  }
};

const bookAppointment = async () => {
  if (!selectedSlot.value || !selectedService.value) {
    error.value = 'Por favor, selecione um horário e um serviço';
    return;
  }
  try {
    loading.value = true;
    error.value = null;
    // Encontrar o schedule correspondente ao horário selecionado
    const dayOfWeek = selectedDate.value.getDay();
    const schedulesForDay = schedules.value.filter(s => s.day_of_week === dayOfWeek);
    let matchedSchedule = null;
    for (const schedule of schedulesForDay) {
      const slots = generateTimeSlots(schedule);
      if (slots.some(slot => slot.start === selectedSlot.value?.start)) {
        matchedSchedule = schedule;
        break;
      }
    }
    if (!matchedSchedule) {
      error.value = 'Horário selecionado não encontrado.';
      return;
    }
    const appointment: Partial<Appointment> = {
      schedule_id: matchedSchedule.id,
      service_id: selectedService.value.id,
      client_name: formData.value.client_name,
      client_email: formData.value.client_email,
      client_phone: formData.value.client_phone,
      start_time: buildTimestamp(selectedDate.value, selectedSlot.value.start),
      end_time: buildTimestamp(selectedDate.value, selectedSlot.value.end),
      status: 'pending'
    };
    const { error: insertError } = await supabase
      .from('appointments')
      .insert([appointment]);
    if (insertError) throw insertError;
    // Limpar formulário e seleções
    selectedSlot.value = null;
    selectedService.value = null;
    formData.value = {
      client_name: '',
      client_email: '',
      client_phone: '',
      notes: ''
    };
    // Atualizar slots disponíveis
    await updateAvailableSlots();
    alert('Agendamento realizado com sucesso! Aguarde a confirmação.');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao realizar agendamento';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const changeDate = (days: number) => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() + days);
  selectedDate.value = newDate;
  updateAvailableSlots();
};

onMounted(async () => {
  await Promise.all([fetchSchedules(), fetchServices()]);
  updateAvailableSlots();
});
</script>

<template>
  <div class="public-schedule">
    <div class="header">
      <h2>Agendar Horário</h2>
    </div>

    <div class="date-navigation">
      <button @click="changeDate(-1)">Anterior</button>
      <span>{{ formatDate(selectedDate) }}</span>
      <button @click="changeDate(1)">Próximo</button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">
      Carregando...
    </div>

    <div v-else class="schedule-container">
      <div class="services-section">
        <h3>Selecione um Serviço</h3>
        <div class="services-grid">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-card"
            :class="{ 'selected': selectedService?.id === service.id }"
            @click="selectedService = service"
          >
            <h4>{{ service.name }}</h4>
            <p class="description">{{ service.description }}</p>
            <div class="service-details">
              <span>Duração: {{ service.duration_minutes }} min</span>
              <span>Preço: R$ {{ service.price.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="slots-section">
        <h3>Horários Disponíveis</h3>
        <div v-if="availableSlots.length === 0" class="no-slots">
          Nenhum horário disponível para esta data
        </div>
        <div v-else class="slots-grid">
          <button
            v-for="slot in availableSlots"
            :key="slot.start"
            class="time-slot"
            :class="{ 'selected': selectedSlot === slot, 'unavailable': !slot.available }"
            :disabled="!slot.available"
            @click="selectedSlot = slot"
          >
            {{ slot.start }}
          </button>
        </div>
      </div>

      <div v-if="selectedSlot && selectedService" class="booking-form">
        <h3>Dados do Cliente</h3>
        <form @submit.prevent="bookAppointment">
          <div class="form-group">
            <label for="client_name">Nome</label>
            <input
              id="client_name"
              v-model="formData.client_name"
              type="text"
              required
              placeholder="Seu nome completo"
            >
          </div>

          <div class="form-group">
            <label for="client_email">E-mail</label>
            <input
              id="client_email"
              v-model="formData.client_email"
              type="email"
              required
              placeholder="seu@email.com"
            >
          </div>

          <div class="form-group">
            <label for="client_phone">Telefone</label>
            <input
              id="client_phone"
              v-model="formData.client_phone"
              type="tel"
              required
              placeholder="(00) 00000-0000"
            >
          </div>

          <div class="form-group">
            <label for="notes">Observações</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Alguma observação importante?"
            ></textarea>
          </div>

          <button type="submit" :disabled="loading">
            {{ loading ? 'Agendando...' : 'Confirmar Agendamento' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.public-schedule {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.header {
  margin-bottom: var(--spacing-8);
  text-align: center;
}

.date-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.date-navigation button {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-primary-600);
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.date-navigation button:hover {
  background-color: var(--color-primary-700);
}

.schedule-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-8);
}

@media (min-width: 768px) {
  .schedule-container {
    grid-template-columns: 1fr 1fr;
  }
}

.services-section, .slots-section {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.service-card {
  padding: var(--spacing-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.service-card:hover {
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
}

.service-card.selected {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.service-card h4 {
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

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

.time-slot {
  padding: var(--spacing-2);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background-color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.time-slot:hover:not(:disabled) {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.time-slot.selected {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-500);
  color: white;
}

.time-slot.unavailable {
  background-color: var(--color-gray-100);
  color: var(--color-gray-400);
  cursor: not-allowed;
}

.booking-form {
  grid-column: 1 / -1;
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: 500;
  color: var(--color-gray-700);
}

input, textarea {
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button[type="submit"] {
  width: 100%;
  padding: var(--spacing-3);
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-primary-600);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

button[type="submit"]:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

button[type="submit"]:disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
}

.error-message {
  color: var(--color-error-600);
  text-align: center;
  margin: var(--spacing-4) 0;
}

.loading, .no-slots {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-gray-600);
}
</style> 