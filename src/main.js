import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from './utils/logger'

// Global Axios configuration
axios.defaults.baseURL = window.location.origin
axios.defaults.headers.post['Content-Type'] = 'application/json'

// Axios Interceptor for automated logging
axios.interceptors.response.use(
  response => {
    logger.api(`SUCCESS: ${response.config.url}`, response.status)
    return response
  },
  error => {
    logger.error(`API ERROR: ${error.config?.url}`, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.globalProperties.$swal = Swal
app.config.globalProperties.$logger = logger

app.mount('#app')