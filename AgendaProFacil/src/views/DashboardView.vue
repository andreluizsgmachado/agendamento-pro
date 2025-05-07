<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const router = useRouter();
const auth = useAuthStore();
const { user, profile } = storeToRefs(auth);

// Stats data
const stats = ref({
  totalAppointments: 0,
  revenue: 0,
  completionRate: 0
});

// Chart data
const servedClientsData = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [{
    label: 'Clientes Atendidos',
    data: [65, 59, 80, 81, 56, 55],
    fill: false,
    borderColor: '#7c3aed',
    tension: 0.1
  }]
});

const canceledClientsData = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [{
    label: 'Clientes Cancelados',
    data: [12, 19, 3, 5, 2, 3],
    fill: false,
    borderColor: '#ef4444',
    tension: 0.1
  }]
});

const revenueData = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [{
    label: 'Faturamento Total (R$)',
    data: [1200, 1900, 3000, 5000, 2000, 3000],
    fill: false,
    borderColor: '#38bdf8',
    tension: 0.1
  }]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    }
  }
};

onMounted(async () => {
  if (!auth.user) {
    router.push('/login');
    return;
  }

  // Fetch dashboard stats
  try {
    // TODO: Implement API calls to get real stats
    stats.value = {
      totalAppointments: 245,
      revenue: 4750,
      completionRate: 92
    };
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
});

const handleLogout = async () => {
  await auth.logout();
  router.push('/');
};
</script>


<template>
  <div class="dashboard-view">
    
    <div class="dashboard-content">
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Clientes Atendidos</h3>
          <div class="chart-container">
            <Line :data="servedClientsData" :options="chartOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h3>Clientes Cancelados</h3>
          <div class="chart-container">
            <Line :data="canceledClientsData" :options="chartOptions" />
          </div>
        </div>
        <div class="chart-card">
          <h3>Faturamento Total</h3>
          <div class="chart-container">
            <Line :data="revenueData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Gerenciar Horários</h3>
          <p>Configure seus horários disponíveis para agendamento</p>
          <router-link to="/schedule-manager" class="action-button">
            Gerenciar Horários
          </router-link>
        </div>
        <div class="stat-card">
          <h3>Agendamentos</h3>
          <p>Visualize seus agendamentos</p>
          <button class="action-button" disabled>
            Em breve
          </button>
        </div>
        <div class="stat-card">
          <h3>Configurações</h3>
          <p>Configure suas preferências</p>
          <button class="action-button" disabled>
            Em breve
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding: 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px 32px;
  background: rgba(255,255,255,0.7);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  backdrop-filter: blur(8px);
}

.logout-button {
  padding: 10px 28px;
  background: linear-gradient(90deg, #7c3aed 0%, #38bdf8 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(124,58,237,0.15);
  transition: background 0.2s;
}

.logout-button:hover {
  background: linear-gradient(90deg, #38bdf8 0%, #7c3aed 100%);
}

.welcome-card {
  background: rgba(255,255,255,0.8);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  backdrop-filter: blur(8px);
}

.welcome-card h2 {
  margin-bottom: 16px;
  color: #7c3aed;
  font-weight: bold;
}

.welcome-card p {
  margin-bottom: 8px;
  color: #64748b;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255,255,255,0.8);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  backdrop-filter: blur(8px);
}

.chart-card h3 {
  margin-bottom: 16px;
  color: #7c3aed;
  font-weight: bold;
}

.chart-container {
  height: 300px;
  position: relative;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.stat-card {
  background: rgba(255,255,255,0.8);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-card h3 {
  margin-bottom: 8px;
  color: #7c3aed;
  font-weight: bold;
}

.stat-card p {
  color: #64748b;
}

.action-button {
  margin-top: 16px;
  padding: 10px 24px;
  background: linear-gradient(90deg, #7c3aed 0%, #38bdf8 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(124,58,237,0.10);
  transition: background 0.2s;
}

.action-button:hover:not(:disabled) {
  background: linear-gradient(90deg, #38bdf8 0%, #7c3aed 100%);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #e0e7ff;
  color: #a1a1aa;
}
</style>