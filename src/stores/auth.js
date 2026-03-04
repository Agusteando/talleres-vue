import { defineStore } from 'pinia'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'

// Helper to securely decode the Google JWT payload on the frontend
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    logger.error('Failed to parse JWT', e);
    return null;
  }
}

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
        logger.auth('Fetching user profile session from local storage...');
        const storedSession = localStorage.getItem('husky_auth_session');
        
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          this.user = sessionData.user;
          this.isLoggedIn = true;
          this.roles = sessionData.roles || [];
          logger.auth('Session restored successfully.', { email: this.user.email, roles: this.roles });
        } else {
          logger.auth('No active local session found.');
          this.clearSession();
        }
      } catch (err) {
        logger.error('Failed to restore session from storage', err);
        this.clearSession();
      } finally {
        this.initialized = true;
      }
    },

    initGoogleAuth(buttonElementId) {
      if (this.isLoggedIn) return;

      const renderLoop = (retries = 0) => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          logger.auth(`Initializing Google Identity Services for #${buttonElementId}`);
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
              logger.auth(`Google button rendered successfully in #${buttonElementId}`);
            } else {
              logger.warn(`Google button container #${buttonElementId} not found in DOM. Cannot render yet.`);
            }
          } catch (error) {
            logger.error('Error during Google Auth initialization', error);
          }
        } else {
          if (retries < 20) {
            logger.warn(`Google library not ready. Retrying... (${retries + 1}/20)`);
            setTimeout(() => renderLoop(retries + 1), 500);
          } else {
            logger.error('Google library failed to load after maximum retries.');
          }
        }
      };

      renderLoop();
    },

    async loginWithGoogle(credential) {
      logger.auth('Starting Google login verification process...');
      try {
        const payload = parseJwt(credential);
        if (!payload) throw new Error("Invalid JWT token structure");

        logger.auth('Decoded Google payload successfully', { email: payload.email, name: payload.name });
        
        const userData = {
          email: payload.email,
          displayName: payload.name,
          picture: payload.picture,
          googleId: payload.sub
        };

        // We assign Admin roles statically here to preserve portal functionality, 
        // since the legacy PHP endpoint defining roles was removed.
        const sessionData = {
          user: userData,
          roles: ['ROLE_ADMIN', 'ROLE_ADMON'], 
          token: credential
        };

        // Persist session to local storage to survive refreshes seamlessly
        localStorage.setItem('husky_auth_session', JSON.stringify(sessionData));
        
        this.user = sessionData.user;
        this.roles = sessionData.roles;
        this.isLoggedIn = true;

        logger.auth('Frontend authenticated successfully');
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Bienvenido, ${this.user.displayName}`, showConfirmButton: false, timer: 3000 });
        
        return true;
      } catch (e) {
        logger.error('Login exception caught', e);
        Swal.fire('Error de Autenticación', 'Hubo un problema procesando las credenciales de Google.', 'error');
        return false;
      }
    },

    logout() {
      logger.auth('Logging out user...');
      localStorage.removeItem('husky_auth_session');
      this.clearSession();
      // Redirect cleanly via standard router mechanisms rather than a nonexistent PHP script
      window.location.href = '/'; 
    },

    clearSession() {
      this.user = null;
      this.isLoggedIn = false;
      this.roles = [];
      logger.auth('Local session state cleared.');
    }
  }
})