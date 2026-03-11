<template>
  <div id="wrapper" class="min-vh-100 d-flex bg-light">
    
    <!-- DESKTOP SIDEBAR -->
    <nav v-if="route.path !== '/'" class="sidebar premium-sidebar d-none d-lg-flex flex-column border-end bg-white shadow-sm flex-shrink-0">
      <div class="sidebar-header py-4 px-4 text-center border-bottom border-light">
        <router-link to="/" class="d-block text-decoration-none">
          <img src="/img/workshops.png" alt="Talleres App" class="img-fluid drop-shadow transition-transform hover-scale" style="max-height: 100px;">
        </router-link>
      </div>
      
      <div class="sidebar-body flex-grow-1 overflow-auto py-4 px-3 custom-scrollbar">
        <ul class="nav flex-column gap-2">
          <li class="nav-item">
            <router-link to="/" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" active-class="active-link">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-home"></i></div>
              <span class="text-truncate">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/admin')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-sliders-h"></i></div>
              <span class="text-truncate">Administración</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/menus" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/menus')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-utensils"></i></div>
              <span class="text-truncate">Menús del Día</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/plantel-settings" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/plantel-settings')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-cogs"></i></div>
              <span class="text-truncate">Configuración</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/teacher" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/teacher')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-chalkboard-user"></i></div>
              <span class="text-truncate">Portal Docente</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/workshop" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/workshop')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-clipboard-user"></i></div>
              <span class="text-truncate">Portal Tallerista</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/overview" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/overview')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-chart-pie"></i></div>
              <span class="text-truncate">Visión Global</span>
            </router-link>
          </li>
          
          <li class="px-3 mt-4 mb-2 text-uppercase text-muted fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">Seguimiento</li>
          
          <li class="nav-item">
            <router-link to="/atencion-padres" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/atencion-padres')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-users"></i></div>
              <span class="text-truncate">Atención Padres</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/student-history" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/student-history')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-user-graduate"></i></div>
              <span class="text-truncate">Historial Alumno</span>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div class="sidebar-footer p-3 border-top border-light" v-if="authStore.isLoggedIn">
        <div class="d-flex align-items-center p-2 rounded-4 bg-light shadow-sm border border-white">
          <img v-if="authStore.user.picture" :src="authStore.user.picture" class="rounded-circle shadow-sm border border-2 border-white me-2 object-fit-cover" width="40" height="40">
          <div v-else class="rounded-circle shadow-sm border border-2 border-white bg-white d-flex align-items-center justify-content-center text-primary me-2" style="width: 40px; height: 40px;">
            <i class="fas fa-user"></i>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <h6 class="mb-0 fw-bold text-truncate text-dark" style="font-size: 0.85rem;" :title="authStore.user.displayName">{{ authStore.user.displayName }}</h6>
            <small class="text-muted d-block text-truncate" style="font-size: 0.7rem;">{{ authStore.hasAdminAccess ? 'Administrador' : 'Usuario' }}</small>
          </div>
          <button class="btn btn-sm btn-white text-danger rounded-circle p-2 shadow-sm" @click="authStore.logout" title="Cerrar sesión">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- MOBILE OFFCANVAS SIDEBAR -->
    <div class="offcanvas offcanvas-start premium-sidebar" tabindex="-1" id="mobileSidebar" aria-labelledby="mobileSidebarLabel">
      <div class="offcanvas-header py-4 border-bottom border-light">
        <img src="/img/workshops.png" alt="Talleres App" class="img-fluid drop-shadow" style="max-height: 60px;">
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body px-3 custom-scrollbar">
        <ul class="nav flex-column gap-2">
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" active-class="active-link">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-home"></i></div>
              <span class="text-truncate">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/admin" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/admin')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-sliders-h"></i></div>
              <span class="text-truncate">Administración</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/menus" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/menus')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-utensils"></i></div>
              <span class="text-truncate">Menús del Día</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/plantel-settings" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/plantel-settings')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-cogs"></i></div>
              <span class="text-truncate">Configuración</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/teacher" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/teacher')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-chalkboard-user"></i></div>
              <span class="text-truncate">Portal Docente</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/workshop" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/workshop')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-clipboard-user"></i></div>
              <span class="text-truncate">Portal Tallerista</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/overview" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/overview')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-chart-pie"></i></div>
              <span class="text-truncate">Visión Global</span>
            </router-link>
          </li>
          
          <li class="px-3 mt-4 mb-2 text-uppercase text-muted fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">Seguimiento</li>
          
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/atencion-padres" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/atencion-padres')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-users"></i></div>
              <span class="text-truncate">Atención Padres</span>
            </router-link>
          </li>
          <li class="nav-item" data-bs-dismiss="offcanvas">
            <router-link to="/student-history" class="nav-link premium-link rounded-4 text-dark fw-semibold d-flex align-items-center" :class="{'active-link': route.path.startsWith('/student-history')}">
              <div class="icon-wrapper rounded-circle d-flex justify-content-center align-items-center me-3"><i class="fas fa-user-graduate"></i></div>
              <span class="text-truncate">Historial Alumno</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Content Wrapper -->
    <div class="flex-grow-1 d-flex flex-column overflow-hidden position-relative w-100">
      
      <!-- Topbar -->
      <header class="navbar navbar-expand navbar-light bg-white topbar static-top shadow-sm px-4 py-3 sticky-top border-bottom border-light">
        <button class="btn btn-light d-lg-none rounded-circle me-3 shadow-sm border" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-controls="mobileSidebar">
          <i class="fas fa-bars"></i>
        </button>

        <div class="d-none d-md-block ms-2 text-muted fw-semibold">
          <span v-if="route.meta.active === 'dashboard'">Inicio / Dashboard</span>
          <span v-else-if="route.meta.active === 'admin'">Herramientas / Administración</span>
          <span v-else-if="route.meta.active === 'menus'">Herramientas / Menús del Día</span>
          <span v-else-if="route.meta.active === 'plantel-settings'">Herramientas / Config. Planteles</span>
          <span v-else-if="route.meta.active === 'teacher'">Docentes / Portal Docente</span>
          <span v-else-if="route.meta.active === 'workshop'">Docentes / Portal Tallerista</span>
          <span v-else-if="route.meta.active === 'overview'">Analíticas / Visión Global</span>
          <span v-else-if="route.meta.active === 'atencion-padres'">Seguimiento / Atención Padres</span>
          <span v-else-if="route.meta.active === 'student-history'">Seguimiento / Historial Alumno</span>
        </div>

        <div class="ms-auto d-flex align-items-center">
          <div v-if="!authStore.isLoggedIn">
            <div id="g_id_signin_top" class="min-h-40"></div>
          </div>
          <div v-if="authStore.isLoggedIn && route.path === '/'" class="d-lg-none d-flex align-items-center gap-2 bg-light p-1 pe-3 rounded-pill border">
            <img v-if="authStore.user.picture" :src="authStore.user.picture" class="rounded-circle shadow-sm border border-white object-fit-cover" width="35" height="35">
            <div v-else class="rounded-circle shadow-sm border border-white bg-white d-flex align-items-center justify-content-center text-primary" style="width: 35px; height: 35px;">
              <i class="fas fa-user small"></i>
            </div>
            <span class="fw-bold text-dark lh-1" style="font-size: 0.85rem;">{{ authStore.user.displayName?.split(' ')[0] || 'User' }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="container-fluid flex-grow-1 px-4 py-4 overflow-auto bg-slate-50">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'
import { logger } from './utils/logger'

const authStore = useAuthStore()
const route = useRoute()

onMounted(() => {
  if (!authStore.isLoggedIn) {
    authStore.initGoogleAuth('g_id_signin_top');
  }
})

watch([() => route.path, () => authStore.isLoggedIn], ([newPath, isLoggedIn]) => {
  if (!isLoggedIn) {
    nextTick(() => {
      setTimeout(() => {
        authStore.initGoogleAuth('g_id_signin_top');
      }, 150);
    });
  }
})
</script>

<style>
:root {
  --primary: #0f172a;
  --primary-light: #f1f5f9;
  --accent: #2563eb;
  --bg-color: #f8fafc;
}

body { 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
  background-color: var(--bg-color);
  color: #1e293b;
}

.bg-slate-50 { background-color: var(--bg-color); }

/* Premium Sidebar Styles */
.premium-sidebar {
  width: 280px;
  background: #ffffff;
}

.premium-link {
  padding: 0.85rem 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b !important;
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  background-color: transparent;
  color: #94a3b8;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.premium-link:hover {
  background-color: var(--primary-light);
  color: #0f172a !important;
  transform: translateX(4px);
}

.premium-link:hover .icon-wrapper {
  color: var(--accent);
}

.active-link {
  background-color: var(--primary-light) !important;
  color: var(--accent) !important;
  font-weight: 700 !important;
  box-shadow: inset 4px 0 0 var(--accent);
}

.active-link .icon-wrapper {
  background-color: #dbeafe;
  color: var(--accent);
}

.hover-scale { transition: transform 0.3s ease; }
.hover-scale:hover { transform: scale(1.05); }
.drop-shadow { filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); }
.min-h-40 { min-height: 40px; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Global Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(15px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-15px); }
</style>