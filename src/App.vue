<template>
  <div id="wrapper" class="min-vh-100 d-flex bg-light">
    
    <!-- Sidebar -->
    <nav v-if="route.path !== '/'" class="sidebar bg-white border-end shadow-sm d-none d-md-flex flex-column py-3" style="width: 260px; z-index: 1000;">
      <router-link to="/" class="text-center d-block mb-5 text-decoration-none px-4">
        <h3 class="fw-bold text-dark mt-3 mb-0" style="letter-spacing: -0.5px;">
          <i class="fas fa-layer-group text-primary me-2"></i>Talleres App
        </h3>
      </router-link>
      
      <ul class="nav flex-column gap-1 px-3">
        <li class="nav-item">
          <router-link to="/" class="nav-link py-3 px-4 rounded-3 text-dark fw-semibold transition-all" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
            <i class="fas fa-home w-20px me-2 text-center"></i> Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/admin" class="nav-link py-3 px-4 rounded-3 text-dark fw-semibold transition-all" :class="{'bg-primary bg-opacity-10 text-primary fw-bold': route.path.startsWith('/admin')}">
            <i class="fas fa-sliders-h w-20px me-2 text-center"></i> Administración
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/teacher" class="nav-link py-3 px-4 rounded-3 text-dark fw-semibold transition-all" :class="{'bg-primary bg-opacity-10 text-primary fw-bold': route.path.startsWith('/teacher')}">
            <i class="fas fa-chalkboard-user w-20px me-2 text-center"></i> Portal Docente
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/overview" class="nav-link py-3 px-4 rounded-3 text-dark fw-semibold transition-all" active-class="bg-primary bg-opacity-10 text-primary fw-bold">
            <i class="fas fa-chart-line w-20px me-2 text-center"></i> Visión Global
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/atencion-padres" class="nav-link py-3 px-4 rounded-3 text-dark fw-semibold transition-all" :class="{'bg-primary bg-opacity-10 text-primary fw-bold': route.path.startsWith('/atencion-padres')}">
            <i class="fas fa-users w-20px me-2 text-center"></i> Atención Padres
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Main Content Wrapper -->
    <div class="flex-grow-1 d-flex flex-column overflow-hidden w-100">
      <!-- Topbar -->
      <header class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow-sm px-4 py-3 sticky-top">
        <button class="btn btn-light d-md-none rounded-circle me-3" type="button">
          <i class="fas fa-bars"></i>
        </button>

        <div class="ms-auto d-flex align-items-center">
          <div v-if="authStore.isLoggedIn" class="d-flex align-items-center gap-3">
            <div class="d-flex flex-column align-items-end d-none d-sm-flex">
              <span class="fw-bold text-dark mb-0 lh-1">{{ authStore.user.displayName || authStore.user.email }}</span>
              <small class="text-muted" style="font-size: 0.75rem;">{{ authStore.hasAdminAccess ? 'Administrador' : 'Usuario' }}</small>
            </div>
            <img :src="authStore.user.picture || '/img/default-avatar.png'" class="rounded-circle shadow-sm border border-2 border-white" width="45" height="45">
            <button class="btn btn-light text-danger rounded-circle p-2 ms-2" @click="authStore.logout" title="Cerrar sesión">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
          <div v-else>
            <div id="g_id_signin_top"></div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="container-fluid flex-grow-1 px-4 pb-5 overflow-auto">
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
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'
import { logger } from './utils/logger'

const authStore = useAuthStore()
const route = useRoute()

onMounted(() => {
  if (window.google && !authStore.isLoggedIn) {
    logger.info('Initializing Google Identity Services.');
    window.google.accounts.id.initialize({
      client_id: '182000980506-g7e79r026td38bsiipnttp36osl28hvb.apps.googleusercontent.com',
      callback: async (res) => {
        await authStore.loginWithGoogle(res.credential)
      }
    })
    
    setTimeout(() => {
      const btn = document.getElementById('g_id_signin_top')
      if (btn) window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', shape: 'pill' })
    }, 500);
  }
})
</script>

<style>
body { 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
  background-color: #f8fafc;
  color: #1e293b;
}

.transition-all { transition: all 0.2s ease-in-out; }
.nav-link:hover:not(.active) { background-color: #f1f5f9; transform: translateX(4px); }
.w-20px { width: 20px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>