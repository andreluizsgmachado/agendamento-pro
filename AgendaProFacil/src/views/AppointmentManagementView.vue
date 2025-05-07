<template>
  <div class="main-layout">
   


    <!-- Main Content -->
    <div class="content">
      <!-- Header -->
 

      <!-- Filters -->
      <div class="filters">
        <button v-for="filter in statusFilters" :key="filter.value"
          @click="currentFilter = filter.value"
          :class="['filter-btn', { 'filter-btn-active': currentFilter === filter.value }]"
        >
          {{ filter.label }}
        </button>
        <div class="filters-count">Show 5 items</div>
      </div>

      <div class="main-section">
        <div class="patients-list">
          <h2 class="patients-title">Atendimentos</h2>
          <div class="patients-list-content">
            <div v-if="loading" class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <div v-else-if="filteredAppointments.length === 0" class="no-appointments">
              Nenhum agendamento encontrado para esta data.
            </div>
            <div v-else>
              <div v-for="appointment in filteredAppointments" :key="appointment.id"
                class="appointment-card"
                :class="getAppointmentBorderClass(appointment.status)">
                <div class="appointment-card-main">
                  <div class="appointment-avatar">
                    <span class="appointment-avatar-initials">{{ getInitials(appointment.clientName) }}</span>
                  </div>
                  <div class="appointment-info">
                    <div class="appointment-name">{{ appointment.clientName }}</div>
                    <div class="appointment-phone">{{ appointment.clientPhone }}</div>
                  </div>
                </div>
                <div class="appointment-details">
                  <div class="appointment-service">{{ getServiceName(appointment.service) }}</div>
                  <div class="appointment-date">{{ formatDate(appointment.date) }}</div>
                  <div class="appointment-time">{{ appointment.time }}</div>
                </div>
                <div class="appointment-status">
                  <span :class="['status-badge', getStatusClass(appointment.status)]">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </div>
                <div class="appointment-actions">
                  <button v-if="appointment.status === 'pending'" @click="updateAppointmentStatus(appointment.id, 'confirmed')" class="action-confirm">Confirmar</button>
                  <button v-if="appointment.status === 'pending'" @click="updateAppointmentStatus(appointment.id, 'cancelled')" class="action-cancel">Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar & Timeline -->
        <div class="calendar-panel">
          <!-- Calendar -->
          <div class="calendar-section">
            <div class="calendar-header">
              <h2 class="calendar-title">{{ currentMonth }} {{ currentYear }}</h2>
              <div class="calendar-nav">
                <button @click="previousMonth" class="calendar-nav-btn">←</button>
                <button @click="nextMonth" class="calendar-nav-btn">→</button>
              </div>
            </div>
            <div class="calendar-weekdays">
              <div v-for="day in weekDays" :key="day" class="calendar-weekday">{{ day }}</div>
            </div>
            <div class="calendar-days">
              <button v-for="date in calendarDays" :key="date.toISOString()"
                @click="selectDate(date)"
                :class="[
                  'calendar-day',
                  { 
                    'calendar-day-today': isToday(date),
                    'calendar-day-selected': isSelectedDate(date),
                    'calendar-day-out': !isSameMonth(date),
                    'calendar-day-has-appointment': hasConfirmedOrPendingAppointment(date)
                  }
                ]"
              >
                {{ date.getDate() }}
              </button>
            </div>
          </div>
          <!-- Timeline -->
          <div class="timeline-section">
            <h3 class="timeline-title">Time</h3>
            <div class="timeline-list">
              <div v-for="hour in businessHours" :key="hour" class="timeline-row">
                <div class="timeline-hour">{{ formatHour(hour) }}</div>
                <div class="timeline-slot" :class="getTimeSlotClass(hour)">
                  <span v-if="getAppointmentByHour(hour)">
                    {{ getAppointmentByHour(hour)?.clientName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Appointment } from '@/types'
import { supabase } from '@/lib/supabase'

const appointments = ref<Appointment[]>([])
const services = ref<{ id: string, name: string }[]>([])
const loading = ref(true)
const selectedDate = ref(new Date())
const currentFilter = ref('all')

const statusFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Novos', value: 'pending' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Cancelados', value: 'cancelled' }
]

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const businessHours = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00 - 19:00

const currentMonth = computed(() => {
  return selectedDate.value.toLocaleString('pt-BR', { month: 'long' })
})

const currentYear = computed(() => {
  return selectedDate.value.getFullYear()
})

const calendarDays = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Adicionar dias do mês anterior
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }
  
  // Adicionar dias do mês atual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  // Adicionar dias do próximo mês
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }
  
  return days
})

const filteredAppointments = computed(() => {
  let filtered = appointments.value.filter(appointment => {
    const appointmentDate = new Date(appointment.date)
    return (
      appointmentDate.getFullYear() === selectedDate.value.getFullYear() &&
      appointmentDate.getMonth() === selectedDate.value.getMonth() &&
      appointmentDate.getDate() === selectedDate.value.getDate()
    )
  })

  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(appointment => appointment.status === currentFilter.value)
  }

  return filtered.sort((a, b) => a.time.localeCompare(b.time))
})

const fetchAppointments = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        schedule_id,
        service_id,
        client_name,
        client_email,
        client_phone,
        start_time,
        end_time,
        status,
        notes
      `)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data) {
      console.error('No data returned from Supabase')
      return
    }

    appointments.value = data.map(appointment => ({
      id: appointment.id,
      clientName: appointment.client_name,
      clientEmail: appointment.client_email,
      clientPhone: appointment.client_phone,
      date: new Date(appointment.start_time),
      time: new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      service: appointment.service_id,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.start_time,
      updatedAt: appointment.end_time
    }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    alert('Erro ao carregar agendamentos. Por favor, tente novamente mais tarde.')
  } finally {
    loading.value = false
  }
}

const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error) throw error
    services.value = data || []
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
  }
}

const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status, 
        end_time: new Date().toISOString() 
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating appointment:', error)
      throw error
    }

    await fetchAppointments()
  } catch (error) {
    console.error('Error updating appointment status:', error)
    alert('Erro ao atualizar status do agendamento. Por favor, tente novamente.')
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getStatusClass = (status: string) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classMap[status as keyof typeof classMap] || ''
}

const getAppointmentBorderClass = (status: string) => {
  const classMap = {
    pending: 'border-yellow-500',
    confirmed: 'border-green-500',
    cancelled: 'border-red-500'
  }
  return classMap[status as keyof typeof classMap] || ''
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const getTimeSlotClass = (hour: number) => {
  const hasAppointment = filteredAppointments.value.some(appointment => {
    const appointmentHour = parseInt(appointment.time.split(':')[0])
    return appointmentHour === hour
  })
  return hasAppointment ? 'bg-blue-100' : 'bg-gray-50'
}

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isSelectedDate = (date: Date) => {
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const isSameMonth = (date: Date) => {
  return date.getMonth() === selectedDate.value.getMonth()
}

const selectDate = (date: Date) => {
  selectedDate.value = date
}

const previousMonth = () => {
  selectedDate.value = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  selectedDate.value = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth() + 1,
    1
  )
}

const getAppointmentByHour = (hour: number) => {
  return filteredAppointments.value.find(appointment => {
    const appointmentHour = parseInt(appointment.time.split(':')[0])
    return appointmentHour === hour
  })
}

const hasConfirmedOrPendingAppointment = (date: Date) => {
  return appointments.value.some(appointment => {
    const appointmentDate = new Date(appointment.date)
    return (
      appointmentDate.getFullYear() === date.getFullYear() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getDate() === date.getDate() &&
      (appointment.status === 'confirmed' || appointment.status === 'pending')
    )
  })
}

const getServiceName = (serviceId: string) => {
  const service = services.value.find(s => s.id === serviceId)
  return service ? service.name : serviceId
}

onMounted(() => {
  fetchAppointments()
  fetchServices()
})
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: #f7fafc;
}
.sidebar {
  width: 80px;
  background: linear-gradient(180deg, #2563eb 0%, #60a5fa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
}
.sidebar-logo {
  margin-bottom: 32px;
}
.sidebar-logo-icon {
  width: 40px;
  height: 40px;
  color: #fff;
}
.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: auto;
}
.sidebar-action-btn {
  background: none;
  border: none;
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s;
}
.sidebar-action-btn:hover {
  opacity: 1;
}
.sidebar-action-icon {
  width: 24px;
  height: 24px;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.header-title {
  font-size: 2rem;
  font-weight: bold;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
}
.filters {
  background: #fff;
  padding: 24px 40px 8px 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.filter-btn {
  padding: 8px 24px;
  border-radius: 999px;
  font-weight: 500;
  background: #eff6ff;
  color: #2563eb;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.filter-btn:hover {
  background: #dbeafe;
}
.filter-btn-active {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 2px 8px rgba(37,99,235,0.12);
}
.filters-count {
  margin-left: auto;
  color: #94a3b8;
  font-size: 0.95rem;
}
.main-section {
  display: flex;
  gap: 32px;
  padding: 24px 40px;
  flex: 1;
}
.patients-list {
  flex: 1;
}
.patients-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #334155;
}
.patients-list-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #2563eb;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.no-appointments {
  text-align: center;
  color: #94a3b8;
  padding: 32px 0;
}
.appointment-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px;
  border-left: 8px solid #e5e7eb;
  gap: 16px;
}
.border-yellow-500 { border-left-color: #facc15 !important; }
.border-green-500 { border-left-color: #22c55e !important; }
.border-red-500 { border-left-color: #ef4444 !important; }
.appointment-card-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}
.appointment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2563eb;
}
.appointment-avatar-initials {
  font-size: 1.2rem;
  font-weight: bold;
}
.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.appointment-name {
  font-weight: 600;
  color: #334155;
}
.appointment-phone {
  font-size: 0.85rem;
  color: #94a3b8;
}
.appointment-details {
  width: 140px;
  text-align: center;
}
.appointment-service {
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
}
.appointment-date, .appointment-time {
  font-size: 0.85rem;
  color: #94a3b8;
}
.appointment-status {
  width: 100px;
  text-align: center;
}
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
}
.bg-yellow-100 { background: #fef9c3; color: #a16207; }
.bg-green-100 { background: #dcfce7; color: #166534; }
.bg-red-100 { background: #fee2e2; color: #991b1b; }
.appointment-actions {
  width: 100px;
  text-align: right;
}
.action-confirm {
  color: #16a34a;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.action-cancel {
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.calendar-panel {
  width: 380px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.calendar-section {
  margin-bottom: 12px;
}
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.calendar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
}
.calendar-nav {
  display: flex;
  gap: 8px;
}
.calendar-nav-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #2563eb;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}
.calendar-nav-btn:hover {
  background: #eff6ff;
}
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.calendar-weekday {
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
}
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.calendar-day {
  padding: 8px 0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #334155;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.calendar-day-today {
  background: #dbeafe;
  color: #2563eb;
  font-weight: bold;
}
.calendar-day-selected {
  background: #2563eb;
  color: #fff;
  font-weight: bold;
}
.calendar-day-out {
  color: #cbd5e1;
}
.calendar-day-has-appointment {
  background: #e6fbe6 !important;
  color: #166534;
}
.timeline-section {
  margin-top: 12px;
}
.timeline-title {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.timeline-row {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}
.timeline-hour {
  width: 60px;
  color: #94a3b8;
}
.timeline-slot {
  flex: 1;
  height: 36px;
  margin-left: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  background: #f1f5f9;
  color: #334155;
  font-weight: 500;
}
.bg-blue-100 { background: #dbeafe !important; }
.bg-gray-50 { background: #f1f5f9 !important; }
</style> 
