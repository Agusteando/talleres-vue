import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    roles: [],
    initialized: false,
    googleAuthRetries: 0
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
          logger.auth('Session restored successfully.', { email: this.user.email, roles: this.roles });
        } else {
          logger.auth('No active session found.');
          this.clearSession();
        }
      } catch (err) {
        logger.error('Failed to fetch session', err);
        this.clearSession();
      } finally {
        this.initialized = true;
      }
    },

    initGoogleAuth(buttonElementId) {
      if (this.isLoggedIn) return;

      if (window.google && window.google.accounts && window.google.accounts.id) {
        logger.auth('Initializing Google Identity Services.');
        try {
          window.google.accounts.id.initialize({
            client_id: '182000980506-g7e79r026td38bsiipnttp36osl28hvb.apps.googleusercontent.com',
            callback: async (res) => {
              await this.loginWithGoogle(res.credential);
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          const btn = document.getElementById(buttonElementId);
          if (btn) {
            window.google.accounts.id.renderButton(btn, { 
              theme: 'outline', 
              size: 'large', 
              shape: 'pill',
              width: 250
            });
            logger.auth(`Google button rendered in #${buttonElementId}`);
          } else {
            logger.warn(`Google button container #${buttonElementId} not found in DOM.`);
          }
        } catch (error) {
          logger.error('Error during Google Auth initialization', error);
        }
      } else {
        if (this.googleAuthRetries < 20) {
          this.googleAuthRetries++;
          logger.warn(`Google library not ready. Retrying... (${this.googleAuthRetries}/20)`);
          setTimeout(() => this.initGoogleAuth(buttonElementId), 500);
        } else {
          logger.error('Google library failed to load after maximum retries.');
        }
      }
    },

    async loginWithGoogle(credential) {
      logger.auth('Starting Google login verification process...');
      try {
        const payloadBase64Url = credential.split('.')[1];
        const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(atob(payloadBase64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));

        logger.auth('Decoded Google payload successfully', { email: payload.email, name: payload.name });
        
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
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Bienvenido, ${this.user.displayName}`, showConfirmButton: false, timer: 3000 });
          return true;
        } else {
          logger.error('Backend returned unexpected non-loggedin state', res.data);
          Swal.fire('Acceso Denegado', res.data.error || 'Su cuenta no cuenta con los permisos necesarios en la institución.', 'error');
          return false;
        }
      } catch (e) {
        logger.error('Login exception caught', e.response?.data || e.message || e);
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
      logger.auth('Local session state cleared.');
    }
  }
})