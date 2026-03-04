<template>
  <div class="workshop-view position-relative py-3">
    <!-- Loader -->
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-danger border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- 1. SHORTCUTS SELECTION -->
    <div v-if="!currentWorkshop" class="fade-in">
      <div class="text-center mb-5">
        <div class="bg-danger bg-opacity-10 text-danger mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
          <i class="fas fa-clipboard-user fa-2x"></i>
        </div>
        <h2 class="fw-bold text-dark mb-2">Mis Talleres</h2>
        <p class="text-muted">Selecciona un taller para tomar asistencia rápidamente.</p>
      </div>
      
      <div class="row justify-content-center g-4 mb-5">
        <div class="col-12 col-md-4 col-lg-3" v-for="(shortcut, idx) in savedShortcuts" :key="idx">
          <div class="card h-100 border-0 shadow-sm hover-card cursor-pointer rounded-4 position-relative overflow-hidden" @click="openWorkshop(shortcut)">
            <div class="card-body p-4 d-flex flex-column align-items-center text-center">
              <button class="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-2 rounded-circle" @click.stop="removeShortcut(idx)" title="Quitar taller">
                <i class="fas fa-times"></i>
              </button>
              <div class="mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" 
                   :style="{ background: getPlantelTheme(shortcut.plantel).gradient, width: '60px', height: '60px' }">
                <i class="fas fa-xl" :class="getServiceIcon(shortcut.servicio)"></i>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ shortcut.servicio }}</h5>
              <span class="badge bg-light text-secondary border rounded-pill px-3 py-1">{{ shortcut.plantel }}</span>
            </div>
          </div>
        </div>
        
        <!-- Add Shortcut Button -->
        <div class="col-12 col-md-4 col-lg-3">
          <div class="card h-100 border-2 border-dashed shadow-none hover-card cursor-pointer rounded-4 bg-transparent d-flex align-items-center justify-content-center min-h-200" @click="showAddModal = true" style="min-height: 200px;">
            <div class="text-center text-muted">
              <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style="width: 50px; height: 50px;">
                <i class="fas fa-plus fa-lg"></i>
              </div>
              <h6 class="fw-bold mb-0">Agregar Taller</h6>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. ATTENDANCE VIEW -->
    <div v-else class="fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm text-white flex-wrap gap-3" :style="{ background: getPlantelTheme(currentWorkshop.plantel).gradient }">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light bg-opacity-25 text-white border-0 rounded-circle shadow-sm" style="width: 45px; height: 45px;" @click="closeWorkshop">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h3 class="fw-bold mb-0">{{ currentWorkshop.servicio }}</h3>
            <small class="opacity-75"><i class="fas fa-map-marker-alt me-1"></i> {{ currentWorkshop.plantel }} &bull; {{ studentsList.length }} Alumnos</small>
          </div>
        </div>
        <button class="btn btn-light text-dark rounded-pill px-4 fw-bold shadow-sm" @click="recordSelectedAttendance" :disabled="selectedForAttendance.length === 0">
          <i class="fas fa-save me-1"></i> Guardar Asistencia ({{ selectedForAttendance.length }})
        </button>
      </div>

      <div class="bg-white rounded-4 shadow-sm border p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div class="position-relative w-100" style="max-width: 400px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 12px;"></i>
            <input type="text" class="form-control rounded-pill ps-5 bg-light border-0 py-2" placeholder="Buscar alumno..." v-model="searchText">
          </div>
          <button class="btn btn-outline-success rounded-pill fw-semibold px-4" @click="toggleSelectAll">
            <i class="fas" :class="allSelected ? 'fa-check-square' : 'fa-square'"></i> {{ allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo' }}
          </button>
        </div>

        <div v-if="filteredStudents.length === 0" class="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
          <i class="fas fa-user-slash fa-3x mb-3 opacity-25"></i>
          <h5>No hay alumnos que coincidan.</h5>
        </div>

        <div class="row g-3">
          <div class="col-6 col-md-3 col-lg-2" v-for="stu in filteredStudents" :key="stu.matricula">
            <div class="card h-100 cursor-pointer attendance-card border-2 rounded-4 position-relative" 
                 :class="{'border-success bg-success bg-opacity-10 shadow-sm': hasAttendedToday(stu.matricula), 'border-primary shadow': selectedForAttendance.includes(stu.matricula), 'bg-light border-transparent': !hasAttendedToday(stu.matricula) && !selectedForAttendance.includes(stu.matricula)}"
                 @click="toggleAttendanceSelection(stu.matricula)">
              <div class="card-body text-center p-3">
                <transition name="pop">
                  <div v-if="selectedForAttendance.includes(stu.matricula) || hasAttendedToday(stu.matricula)" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50 rounded-4 z-1">
                    <i class="fas fa-check-circle text-success fa-3x filter-drop-shadow"></i>
                  </div>
                </transition>
                
                <img v-if="stu.foto" :src="stu.foto" class="rounded-circle mb-2 object-fit-cover shadow-sm" width="65" height="65">
                <div v-else class="rounded-circle mb-2 mx-auto d-flex align-items-center justify-content-center shadow-sm bg-white text-secondary" style="width: 65px; height: 65px;">
                  <i class="fas fa-user fa-xl"></i>
                </div>
                
                <h6 class="small fw-bold mb-0 text-truncate text-dark" :title="stu.nombreCompleto">{{ stu.nombreCompleto }}</h6>
                <small class="text-muted" style="font-size: 0.7rem;">{{ stu.grado }} {{ stu.grupo }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Add Shortcut -->
    <div v-if="showAddModal" class="modal-backdrop fade show" style="z-index: 1040;"></div>
    <div v-if="showAddModal" class="modal fade show d-block" tabindex="-1" style="z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold text-dark">Agregar Taller</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">1. Plantel</label>
              <select class="form-select rounded-pill" v-model="newShortcutPlantel" @change="fetchServicesForAdd">
                <option :value="null">Seleccione Plantel...</option>
                <option v-for="p in allowedPlanteles" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="mb-4 position-relative">
              <label class="form-label fw-semibold">2. Taller (Servicio)</label>
              <select class="form-select rounded-pill" v-model="newShortcutServicio" :disabled="!newShortcutPlantel || fetchingServices">
                <option :value="null">{{ fetchingServices ? 'Cargando...' : 'Seleccione Taller...' }}</option>
                <option v-for="s in availableServicesForAdd" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <button class="btn btn-danger w-100 rounded-pill py-2 fw-bold" @click="saveNewShortcut" :disabled="!newShortcutPlantel || !newShortcutServicio">
              Guardar en Mis Talleres
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'
import { getPlantelTheme, getServiceIcon } from '../utils/theme'

const loading = ref(false)
const savedShortcuts = ref([])

const showAddModal = ref(false)
const newShortcutPlantel = ref(null)
const newShortcutServicio = ref(null)
const fetchingServices = ref(false)
const availableServicesForAdd = ref([])

const currentWorkshop = ref(null)
const studentsList = ref([])
const attendanceMap = ref({})
const selectedForAttendance = ref([])
const searchText = ref('')
const allSelected = ref(false)

const allowedPlanteles = ["PREET", "PREEM", "PT", "PM", "ST", "SM", "ISM", "DM", "CM", "CT"]

onMounted(() => {
  const stored = localStorage.getItem('workshop_shortcuts')
  if (stored) {
    savedShortcuts.value = JSON.parse(stored)
  }
})

const fetchServicesForAdd = async () => {
  if (!newShortcutPlantel.value) {
    availableServicesForAdd.value = []
    return
  }
  fetchingServices.value = true
  try {
    const res = await axios.get(`https://matricula.casitaapps.com/fetch-servicios-data?plantel=${newShortcutPlantel.value}`)
    if (res.data && res.data[newShortcutPlantel.value]) {
      availableServicesForAdd.value = Object.keys(res.data[newShortcutPlantel.value]).sort()
    } else {
      availableServicesForAdd.value = []
    }
  } catch (e) {
    logger.error('Failed to fetch services for modal', e)
  } finally {
    fetchingServices.value = false
  }
}

const saveNewShortcut = () => {
  const exists = savedShortcuts.value.find(s => s.plantel === newShortcutPlantel.value && s.servicio === newShortcutServicio.value)
  if (!exists) {
    savedShortcuts.value.push({ plantel: newShortcutPlantel.value, servicio: newShortcutServicio.value })
    localStorage.setItem('workshop_shortcuts', JSON.stringify(savedShortcuts.value))
  }
  closeAddModal()
}

const closeAddModal = () => {
  showAddModal.value = false
  newShortcutPlantel.value = null
  newShortcutServicio.value = null
  availableServicesForAdd.value = []
}

const removeShortcut = (idx) => {
  savedShortcuts.value.splice(idx, 1)
  localStorage.setItem('workshop_shortcuts', JSON.stringify(savedShortcuts.value))
}

const openWorkshop = async (shortcut) => {
  loading.value = true
  currentWorkshop.value = shortcut
  searchText.value = ''
  selectedForAttendance.value = []
  allSelected.value = false
  studentsList.value = []
  attendanceMap.value = {}

  try {
    const res = await axios.get(`https://matricula.casitaapps.com/fetch-servicios-data?plantel=${shortcut.plantel}`)
    if (res.data && res.data[shortcut.plantel] && res.data[shortcut.plantel][shortcut.servicio]) {
      studentsList.value = res.data[shortcut.plantel][shortcut.servicio]
      await fetchAttendance()
    } else {
      Swal.fire('Atención', 'No hay alumnos inscritos en este taller.', 'info')
    }
  } catch (e) {
    logger.error('Failed to open workshop', e)
    Swal.fire('Error', 'No se pudieron cargar los datos del taller', 'error')
    currentWorkshop.value = null
  } finally {
    loading.value = false
  }
}

const closeWorkshop = () => {
  currentWorkshop.value = null
  studentsList.value = []
  attendanceMap.value = {}
  selectedForAttendance.value = []
}

const filteredStudents = computed(() => {
  const q = searchText.value.toLowerCase()
  if (!q) return studentsList.value
  return studentsList.value.filter(s => s.nombreCompleto.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q))
})

const fetchAttendance = async () => {
  if (studentsList.value.length === 0) return
  const payload = studentsList.value.map(s => ({ matricula: s.matricula, servicio: currentWorkshop.value.servicio }))
  try {
    const res = await axios.post('https://bot.casitaapps.com/get-monthly-attendance-bulk', { students: payload })
    attendanceMap.value = res.data.attendanceData || {}
  } catch (e) {
    logger.error("Attendance fetch error", e)
  }
}

const hasAttendedToday = (matricula) => {
  const day = new Date().getDate()
  const key = `${matricula}-${currentWorkshop.value.servicio}`
  const arr = attendanceMap.value[key]
  return arr && arr.map(Number).includes(Number(day))
}

const toggleAttendanceSelection = (matricula) => {
  const idx = selectedForAttendance.value.indexOf(matricula)
  if (idx > -1) selectedForAttendance.value.splice(idx, 1)
  else selectedForAttendance.value.push(matricula)
  
  allSelected.value = filteredStudents.value.length > 0 && selectedForAttendance.value.length === filteredStudents.value.length
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedForAttendance.value = []
  } else {
    selectedForAttendance.value = filteredStudents.value.map(s => s.matricula)
  }
  allSelected.value = !allSelected.value
}

const recordSelectedAttendance = async () => {
  loading.value = true
  try {
    await axios.post('https://bot.casitaapps.com/record-attendance-bulk', { matriculas: selectedForAttendance.value, servicio: currentWorkshop.value.servicio })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asistencia Guardada', showConfirmButton: false, timer: 2000 })
    selectedForAttendance.value = []
    allSelected.value = false
    await fetchAttendance()
  } catch (e) {
    Swal.fire('Error', 'No se guardó asistencia', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.hover-card { transition: transform 0.2s, box-shadow 0.2s; }
.hover-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
.attendance-card { transition: all 0.2s; overflow: hidden; }
.attendance-card:hover { transform: scale(1.02); }
.border-transparent { border-color: transparent; }
.filter-drop-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
.min-h-200 { min-height: 200px; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from, .pop-leave-to { transform: scale(0); opacity: 0; }
</style>