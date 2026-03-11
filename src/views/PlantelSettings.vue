<template>
  <div class="settings-view position-relative py-4">
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-secondary border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 rounded-4 shadow-sm text-dark bg-white border border-secondary border-opacity-25">
      <div>
        <h2 class="fw-bold mb-1"><i class="fas fa-cogs text-secondary me-2"></i> Configuración de Planteles</h2>
        <p class="mb-0 text-muted">Ajusta los remitentes de correos y configuraciones administrativas de cada sede.</p>
      </div>
      <div class="d-flex gap-2 mt-3 mt-md-0">
        <button class="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-sm bg-white hover-scale" @click="exportConfigs">
          <i class="fas fa-download me-1"></i> Exportar JSON
        </button>
        <button class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm hover-scale" @click="triggerImport">
          <i class="fas fa-upload me-1"></i> Importar
        </button>
        <input type="file" ref="importInput" class="d-none" accept=".json" @change="handleImport">
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="plantel in allowedPlanteles" :key="plantel">
        <div class="card h-100 border-0 shadow-sm rounded-4 hover-card" :class="{'border-2 border-primary': editingPlantel === plantel}">
          <div class="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0 text-dark"><i class="fas fa-building text-secondary me-2"></i> {{ plantel }}</h5>
            <button class="btn btn-sm btn-light text-primary rounded-circle shadow-sm border" @click="editConfig(plantel)">
              <i class="fas fa-pen"></i>
            </button>
          </div>
          <div class="card-body p-4 bg-white rounded-bottom-4">
            <div class="mb-3">
              <span class="d-block small text-muted fw-bold text-uppercase mb-1">Nombre del Remitente</span>
              <span class="text-dark fw-semibold">{{ getConfig(plantel).senderName || 'No configurado' }}</span>
            </div>
            <div class="mb-3">
              <span class="d-block small text-muted fw-bold text-uppercase mb-1">Correo Remitente</span>
              <span class="text-dark fw-semibold font-monospace">{{ getConfig(plantel).senderEmail || 'No configurado' }}</span>
            </div>
            <div>
              <span class="d-block small text-muted fw-bold text-uppercase mb-1">Administrador Asignado</span>
              <span class="badge bg-light text-secondary border px-3 py-2 shadow-sm">{{ getConfig(plantel).adminName || 'No asignado' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingPlantel" class="modal-backdrop fade show"></div>
    <div v-if="editingPlantel" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header border-bottom-0 pb-0 bg-light">
            <h5 class="modal-title fw-bold text-dark"><i class="fas fa-edit text-primary me-2"></i> Editar: {{ editingPlantel }}</h5>
            <button type="button" class="btn-close" @click="editingPlantel = null"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted text-uppercase">Nombre del Remitente</label>
                <input type="text" class="form-control rounded-pill border-0 bg-light shadow-sm" v-model="editForm.senderName" placeholder="Ej: Servicios Alimenticios PREET">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted text-uppercase">Correo del Remitente</label>
                <input type="email" class="form-control rounded-pill border-0 bg-light shadow-sm" v-model="editForm.senderEmail" placeholder="Ej: admin@colegio.edu.mx">
              </div>
              <div class="mb-4">
                <label class="form-label small fw-bold text-muted text-uppercase">Administrador Asignado</label>
                <input type="text" class="form-control rounded-pill border-0 bg-light shadow-sm" v-model="editForm.adminName" placeholder="Nombre del responsable">
              </div>
              <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm hover-scale" @click="saveConfig">
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'

const loading = ref(false)
const configs = ref({})
const allowedPlanteles = ["PREET", "PREEM", "PT", "PM", "ST", "SM", "ISM", "DM", "CM", "CT"]

const editingPlantel = ref(null)
const editForm = ref({ senderName: '', senderEmail: '', adminName: '' })
const importInput = ref(null)

onMounted(() => { loadConfigs() })

const loadConfigs = async () => {
  loading.value = true
  try {
    const res = await axios.get('https://matricula.casitaapps.com/api/plantel-configs')
    configs.value = res.data || {}
  } catch (e) {
    logger.error('Failed to load configs', e)
    Swal.fire('Error', 'Fallo al cargar configuraciones.', 'error')
  } finally {
    loading.value = false
  }
}

const getConfig = (plantel) => configs.value[plantel] || {}

const editConfig = (plantel) => {
  editingPlantel.value = plantel
  editForm.value = { 
    senderName: getConfig(plantel).senderName || '', 
    senderEmail: getConfig(plantel).senderEmail || '', 
    adminName: getConfig(plantel).adminName || '' 
  }
}

const saveConfig = async () => {
  loading.value = true
  try {
    const payload = { [editingPlantel.value]: { ...editForm.value } }
    await axios.post('https://matricula.casitaapps.com/api/plantel-configs/import', payload)
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Guardado correctamente', showConfirmButton: false, timer: 2000 })
    editingPlantel.value = null
    await loadConfigs()
  } catch (e) {
    logger.error('Error saving config', e)
    Swal.fire('Error', 'No se pudo guardar la configuración.', 'error')
  } finally {
    loading.value = false
  }
}

const exportConfigs = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configs.value, null, 2))
  const dlAnchorElem = document.createElement('a')
  dlAnchorElem.setAttribute("href", dataStr)
  dlAnchorElem.setAttribute("download", "planteles_config.json")
  dlAnchorElem.click()
}

const triggerImport = () => { importInput.value.click() }

const handleImport = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (event) => {
    try {
      const importedData = JSON.parse(event.target.result)
      loading.value = true
      await axios.post('https://matricula.casitaapps.com/api/plantel-configs/import', importedData)
      Swal.fire('Éxito', 'Configuraciones importadas exitosamente.', 'success')
      loadConfigs()
    } catch (err) {
      Swal.fire('Error', 'Archivo JSON inválido.', 'error')
    } finally {
      loading.value = false
      e.target.value = ''
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.hover-card { transition: transform 0.2s, box-shadow 0.2s; }
.hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1)!important; }
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }
</style>