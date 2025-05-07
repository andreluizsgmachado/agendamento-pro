import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PublicScheduleView from '@/views/PublicScheduleView.vue';
import ScheduleManager from '@/components/ScheduleManager.vue';
import ServiceManager from '@/components/ServiceManager.vue';
import AppointmentManagementView from '@/views/AppointmentManagementView.vue';
import { supabase } from '@/lib/supabase';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/schedule/:id',
      name: 'public-schedule',
      component: PublicScheduleView
    },
    {
      path: '/schedule-manager',
      name: 'schedule-manager',
      component: ScheduleManager,
      meta: { requiresAuth: true }
    },
    {
      path: '/service-manager',
      name: 'service-manager',
      component: ServiceManager,
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: AppointmentManagementView,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;