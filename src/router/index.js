import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { logger } from '../utils/logger'

import Dashboard from '../views/Dashboard.vue'
import Admin from '../views/Admin.vue'
import Teacher from '../views/Teacher.vue'
import AtencionPadres from '../views/AtencionPadres.vue'
import Overview from '../views/Overview.vue'
import Forbidden from '../views/Forbidden.vue'

const routes = [
  { path: '/', component: Dashboard, meta: { active: 'dashboard' } },
  { path: '/admin/:plantel?/:servicio?', component: Admin, meta: { active: 'admin' } },
  { path: '/teacher/:servicio?', component: Teacher, meta: { active: 'teacher' } },
  { path: '/atencion-padres/:matricula?', component: AtencionPadres, meta: { active: 'atencion-padres' } },
  { path: '/overview', component: Overview, meta: { active: 'overview', requiresAuth: true, adminOnly: true } },
  { path: '/forbidden', component: Forbidden }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  logger.info(`Navigating to ${to.path}`);
  const authStore = useAuthStore();
  
  if (!authStore.initialized) {
    await authStore.fetchProfile();
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    logger.warn('Access denied: Authentication required.');
    next('/forbidden');
  } else if (to.meta.adminOnly && !authStore.hasAdminAccess) {
    logger.warn('Access denied: Admin role required.');
    next('/forbidden');
  } else {
    next();
  }
})

export default router