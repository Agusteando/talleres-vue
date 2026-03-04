import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    roles: [],
    initialized: false
  }),
  getters: {
    hasAdminAccess: (state) => state.roles.includes('ROLE_ADMON') || state.roles.includes('ROLE_ADMIN'),
    isConsumer: (state) => state.user?.consumer || false,
  },
  actions: {
    async fetchProfile() {
      try {
        logger.auth('Fetching user profile session...');
        const res = await axios.post('/isLoggedIn.php');
        if (res.data && res.data.loggedin) {
          this.user = res.data;
          this.isLoggedIn = true;
          this.roles = res.data.roles || [];
          logger.auth('Session restored.', { email: this.user.email, roles: this.roles });
        } else {
          this.clearSession();
        }
      } catch (err) {
        logger.error('Failed to fetch session', err);
        this.clearSession();
      } finally {
        this.initialized = true;
      }
    },
    async loginWithGoogle(credential) {
      logger.auth('Starting Google login process...');
      try {
        const payload = JSON.parse(decodeURIComponent(atob(credential.split('.')[1])));
        logger.auth('Decoded Google payload', { email: payload.email, name: payload.name });
        
        const userData = {
          email: payload.email,
          displayname: payload.name,
          picture: payload.picture,
          googleId: payload.sub
        };

        logger.api('POST /newLogin.php', userData);
        const res = await axios.post('/newLogin.php', { data: userData });
        
        if (res.data && res.data.loggedin) {
          logger.auth('Backend authenticated successfully', res.data);
          await this.fetchProfile();
          return true;
        } else {
          logger.error('Backend returned unexpected non-loggedin state', res.data);
          Swal.fire('Acceso Denegado', res.data.error || 'No es parte de nuestra institución.', 'error');
          return false;
        }
      } catch (e) {
        logger.error('Login exception caught', e.response?.data || e.message || e);
        
        // Extract exact error message sent by PHP backend (e.g., "Favor de autenticarse", "No es parte de nuestra institución")
        const errorMsg = e.response?.data?.error || 'Hubo un problema de conexión al iniciar sesión. Inténtelo de nuevo.';
        
        Swal.fire('Error de Autenticación', errorMsg, 'error');
        return false;
      }
    },
    logout() {
      logger.auth('Logging out user...');
      window.location.href = '/logout.php';
    },
    clearSession() {
      this.user = null;
      this.isLoggedIn = false;
      this.roles = [];
      logger.auth('Session cleared.');
    }
  }
})