<template>
  <div class="appointment-management">
    <h1 class="text-2xl font-bold mb-6">Gerenciamento de Agendamentos</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="appointments.length === 0" class="text-center py-8">
        <p class="text-gray-500">Nenhum agendamento encontrado.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="appointment in appointments" :key="appointment.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ appointment.clientName }}</div>
                <div class="text-sm text-gray-500">{{ appointment.clientEmail }}</div>
                <div class="text-sm text-gray-500">{{ appointment.clientPhone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(appointment.date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ appointment.time }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ appointment.service }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(appointment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(appointment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="appointment.status === 'pending'"
                  @click="updateAppointmentStatus(appointment.id, 'confirmed')"
                  class="text-green-600 hover:text-green-900 mr-4"
                >
                  Aceitar
                </button>
                <button
                  v-if="appointment.status === 'pending'"
                  @click="updateAppointmentStatus(appointment.id, 'cancelled')"
                  class="text-red-600 hover:text-red-900"
                >
                  Rejeitar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Appointment } from '@/types'
import { supabase } from '@/lib/supabase'

const appointments = ref<Appointment[]>([])
const loading = ref(true)

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

    // Transform database fields to frontend format
    appointments.value = data.map(appointment => ({
      id: appointment.id,
      clientName: appointment.client_name,
      clientEmail: appointment.client_email,
      clientPhone: appointment.client_phone,
      date: new Date(appointment.start_time).toISOString().split('T')[0],
      time: new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      service: appointment.service_id, // You might want to fetch service names separately
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
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

onMounted(() => {
  fetchAppointments()
})
</script>

<style scoped>
.appointment-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style> 