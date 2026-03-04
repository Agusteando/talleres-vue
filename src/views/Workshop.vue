<template>
  <div class="workshop-view position-relative py-3">
    <!-- Loader Minimal (Non-blocking usually) -->
    <div v-if="loading && !currentWorkshop" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-danger border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- Background Sync Indicator -->
    <div v-if="loading && currentWorkshop" class="position-fixed bottom-0 end-0 m-4 bg-dark text-white rounded-pill px-4 py-2 shadow-lg z-3 animation-fade">
      <i class="fas fa-sync-alt fa-spin me-2"></i> Actualizando lista...
    </div>

    <!-- 1. SHORTCUTS SELECTION -->
    <div v-if="!currentWorkshop" class="fade-in">
      <div class="text-center mb-5">
        <div class="bg-danger bg-opacity-10 text-danger mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
          <i class="fas fa-clipboard-user fa-2x"></i>
        </div>
        <h2 class="fw-bold text-dark mb-2">Mis Talleres</h2>
        <p class="text-muted fs-5">Selecciona un taller para tomar asistencia rápidamente.</p>
      </div>
      
      <div class="row justify-content-center g-4 mb-5">
        <div class="col-12 col-md-4 col-lg-3" v-for="(shortcut, idx) in savedShortcuts" :key="idx">
          <div class="card h-100 border-0 shadow-sm hover-card cursor-pointer rounded-4 position-relative overflow-hidden" @click="openWorkshop(shortcut)">
            <div class="card-body p-4 d-flex flex-column align-items-center text-center">
              <button class="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-2 rounded-circle" @click.stop="removeShortcut(idx)" title="Quitar taller">
                <i class="fas fa-times"></i>
              </button>
              <div class="mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" 
                   :style="{ background: getPlantelTheme(shortcut.plantel).gradient, width: '70px', height: '70px' }">
                <i class="fas fa-2x" :class="getServiceIcon(shortcut.servicio)"></i>
              </div>
              <h4 class="fw-bold text-dark mb-1">{{ shortcut.servicio }}</h4>
              <span class="badge bg-light text-secondary border rounded-pill px-3 py-2 mt-1">{{ shortcut.plantel }}</span>
            </div>
          </div>
        </div>
        
        <!-- Add Shortcut Button -->
        <div class="col-12 col-md-4 col-lg-3">
          <div class="card h-100 border-2 border-dashed shadow-none hover-card cursor-pointer rounded-4 bg-transparent d-flex align-items-center justify-content-center min-h-200" @click="showAddModal = true" style="min-height: 200px;">
            <div class="text-center text-muted">
              <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3 transition-transform" style="width: 60px; height: 60px;">
                <i class="fas fa-plus fa-xl"></i>
              </div>
              <h5 class="fw-bold mb-0">Agregar Taller</h5>
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
            <span class="opacity-75 d-block mt-1"><i class="fas fa-map-marker-alt me-1"></i> {{ currentWorkshop.plantel }} &bull; {{ studentsList.length }} Alumnos</span>
          </div>
        </div>
        <button class="btn btn-light text-dark rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-scale" @click="recordSelectedAttendance" :disabled="selectedForAttendance.length === 0">
          <i class="fas fa-save fa-lg text-success"></i> Guardar Asistencia <span class="badge bg-success rounded-pill ms-1">{{ selectedForAttendance.length }}</span>
        </button>
      </div>

      <div class="bg-white rounded-4 shadow-sm border p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          
          <div class="position-relative" style="width: 100%; max-width: 350px;">
            <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 12px;"></i>
            <input type="text" class="form-control rounded-pill ps-5 bg-light border-0 py-2" placeholder="Buscar alumno..." v-model="searchText">
          </div>
          
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-outline-secondary rounded-pill fw-semibold px-4" @click="toggleSortMode" :class="{'active bg-secondary text-white': sortMode}">
              <i class="fas fa-sort me-1"></i> {{ sortMode ? 'Finalizar Orden' : 'Reordenar' }}
            </button>
            <button class="btn btn-outline-primary rounded-pill fw-semibold px-4" @click="manualRefresh">
              <i class="fas fa-sync-alt me-1"></i> Refrescar
            </button>
            <button class="btn btn-outline-success rounded-pill fw-semibold px-4" @click="toggleSelectAll">
              <i class="fas" :class="allSelected ? 'fa-check-square' : 'fa-square'"></i> {{ allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo' }}
            </button>
          </div>
        </div>

        <div v-if="filteredStudents.length === 0" class="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
          <i class="fas fa-user-slash fa-3x mb-3 opacity-25"></i>
          <h5>No hay alumnos que coincidan.</h5>
        </div>

        <!-- Student Grid -->
        <div class="row g-3">
          <div class="col-6 col-md-4 col-lg-3 col-xl-2" v-for="(stu, index) in filteredStudents" :key="stu.matricula">
            <div class="card h-100 attendance-card border-2 rounded-4 position-relative" 
                 :class="{'border-success bg-success bg-opacity-10 shadow-sm': hasAttendedToday(stu.matricula), 'border-primary shadow': selectedForAttendance.includes(stu.matricula), 'bg-light border-transparent': !hasAttendedToday(stu.matricula) && !selectedForAttendance.includes(stu.matricula)}">
              
              <!-- Indicator for New Students -->
              <div v-if="isNewStudent(timelineData[stu.matricula]?.started_at)" class="position-absolute top-0 start-0 m-2 z-2" style="pointer-events: none;">
                <span class="badge bg-success shadow-sm rounded-pill border border-white pulse-animation"><i class="fas fa-star text-warning me-1"></i> NUEVO</span>
              </div>

              <!-- Sorting Controls Overlay -->
              <div v-if="sortMode" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 rounded-3 d-flex flex-column justify-content-center align-items-center z-3 gap-3 p-3">
                <button class="btn btn-light rounded-circle shadow-sm" @click.stop="moveStudent(index, -1)" :disabled="index === 0"><i class="fas fa-arrow-up"></i></button>
                <span class="badge bg-white text-dark fw-bold rounded-pill">Pos {{ index + 1 }}</span>
                <button class="btn btn-light rounded-circle shadow-sm" @click.stop="moveStudent(index, 1)" :disabled="index === filteredStudents.length - 1"><i class="fas fa-arrow-down"></i></button>
              </div>

              <!-- Main Card Body -->
              <div class="card-body text-center p-3 d-flex flex-column h-100 cursor-pointer" @click="!sortMode && toggleAttendanceSelection(stu.matricula)">
                <transition name="pop">
                  <div v-if="selectedForAttendance.includes(stu.matricula) || hasAttendedToday(stu.matricula)" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50 rounded-4 z-1" style="pointer-events: none;">
                    <i class="fas fa-check-circle text-success fa-3x filter-drop-shadow"></i>
                  </div>
                </transition>
                
                <div class="mb-2 position-relative d-inline-block mx-auto mt-2">
                  <img v-if="stu.foto" :src="stu.foto" class="rounded-circle object-fit-cover shadow-sm bg-white" width="70" height="70">
                  <div v-else class="rounded-circle d-flex align-items-center justify-content-center shadow-sm bg-white text-secondary" style="width: 70px; height: 70px;">
                    <i class="fas fa-user fa-xl"></i>
                  </div>
                </div>
                
                <h6 class="small fw-bold mb-0 text-truncate text-dark w-100" :title="stu.nombreCompleto">{{ stu.nombreCompleto }}</h6>
                <small class="text-muted d-block mb-2" style="font-size: 0.7rem;">{{ stu.grado }} {{ stu.grupo }}</small>
                
                <div class="d-flex align-items-center justify-content-center gap-1 mb-2 position-relative z-2">
                  <span class="badge bg-white text-secondary border rounded-pill shadow-sm" style="font-size: 0.65rem;">
                    <i class="fas fa-clock text-info"></i> {{ timeAgo(timelineData[stu.matricula]?.started_at) }}
                  </span>
                  <button class="btn btn-sm text-primary p-0 ms-1 bg-transparent border-0" @click.stop="openTimelineModal(stu)" title="Ver Historial"><i class="fas fa-history"></i></button>
                </div>

                <div class="mt-auto d-flex justify-content-center gap-2 position-relative z-2">
                  <button class="btn btn-sm btn-outline-warning rounded-pill px-3 shadow-sm bg-white" @click.stop="openIncidenciaModal(stu)" title="Añadir Nota / Incidencia" :disabled="sortMode">
                    <i class="fas fa-exclamation-triangle"></i> Nota
                  </button>
                </div>
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
            <h5 class="modal-title fw-bold text-dark">Agregar Taller a Favoritos</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-4">
              <label class="form-label fw-semibold text-muted">1. Selecciona el Plantel</label>
              <select class="form-select form-select-lg rounded-pill bg-light border-0 shadow-sm" v-model="newShortcutPlantel" @change="fetchServicesForAdd">
                <option :value="null">Plantel...</option>
                <option v-for="p in allowedPlanteles" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="mb-5 position-relative">
              <label class="form-label fw-semibold text-muted">2. Selecciona el Taller (Servicio)</label>
              <select class="form-select form-select-lg rounded-pill bg-light border-0 shadow-sm" v-model="newShortcutServicio" :disabled="!newShortcutPlantel || fetchingServices">
                <option :value="null">{{ fetchingServices ? 'Cargando listado...' : 'Taller...' }}</option>
                <option v-for="s in availableServicesForAdd" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <button class="btn btn-danger w-100 rounded-pill py-3 fw-bold shadow-sm" @click="saveNewShortcut" :disabled="!newShortcutPlantel || !newShortcutServicio">
              Guardar en Mis Talleres
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Modal -->
    <div v-if="viewingTimelineStu" class="modal-backdrop fade show" style="z-index: 1040;"></div>
    <div v-if="viewingTimelineStu" class="modal fade show d-block" tabindex="-1" style="z-index: 1050;">
       <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content rounded-4 border-0 shadow-lg">
             <div class="modal-header border-bottom-0 pb-0">
               <h5 class="modal-title fw-bold text-dark">Historial de Talleres</h5>
               <button type="button" class="btn-close" @click="closeTimelineModal"></button>
             </div>
             <div class="modal-body p-4">
                <div class="d-flex align-items-center gap-3 mb-4 bg-light p-3 rounded-4 border">
                   <img v-if="viewingTimelineStu.foto" :src="viewingTimelineStu.foto" class="rounded-circle object-fit-cover shadow-sm border border-2 border-white" width="60" height="60">
                   <div v-else class="rounded-circle shadow-sm border border-2 border-white bg-white d-flex align-items-center justify-content-center text-secondary" style="width: 60px; height: 60px;">
                      <i class="fas fa-user fa-lg"></i>
                   </div>
                   <div>
                      <h6 class="fw-bold mb-0 text-dark">{{ viewingTimelineStu.nombreCompleto }}</h6>
                      <small class="text-muted d-block">{{ viewingTimelineStu.matricula }} &bull; {{ viewingTimelineStu.grado }} {{ viewingTimelineStu.grupo }}</small>
                   </div>
                </div>

                <h6 class="fw-bold mb-3 text-secondary text-uppercase small" style="letter-spacing: 0.5px;">Línea de tiempo ({{ currentWorkshop?.plantel }})</h6>
                <div class="timeline ps-3 border-start border-info border-2 ms-2" v-if="timelineData[viewingTimelineStu.matricula]?.history?.length > 0">
                   <div class="mb-4 position-relative" v-for="entry in timelineData[viewingTimelineStu.matricula].history" :key="entry.id">
                      <i class="fas fa-circle position-absolute border border-2 border-white" :class="entry.active ? 'text-success' : 'text-secondary'" style="left: -23px; top: 0px; font-size: 0.85rem;"></i>
                      <div class="bg-white p-3 rounded-4 shadow-sm border">
                         <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="fw-bold mb-0" :class="entry.active ? 'text-dark' : 'text-muted'">{{ entry.servicio_label }}</h6>
                            <span class="badge" :class="entry.active ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-light text-muted border'">{{ entry.active ? 'Actual' : 'Baja' }}</span>
                         </div>
                         <small class="text-muted d-block"><i class="fas fa-calendar-alt me-1"></i> {{ formatDateObj(entry.started_at) }} - {{ entry.ended_at ? formatDateObj(entry.ended_at) : 'Presente' }}</small>
                      </div>
                   </div>
                </div>
                <div v-else class="text-center py-4 text-muted bg-light rounded-4 border border-dashed">
                   <i class="fas fa-history fa-2x mb-2 opacity-25"></i>
                   <p class="mb-0 small fw-semibold">No hay historial de movimientos registrado para este alumno.</p>
                </div>
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
const customSortOrder = ref([]) 
const attendanceMap = ref({})
const selectedForAttendance = ref([])
const searchText = ref('')
const allSelected = ref(false)
const sortMode = ref(false)

const timelineData = ref({})
const viewingTimelineStu = ref(null)

const allowedPlanteles = ["PREET", "PREEM", "PT", "PM", "ST", "SM", "ISM", "DM", "CM", "CT"]

onMounted(() => {
  const stored = localStorage.getItem('workshop_shortcuts')
  if (stored) savedShortcuts.value = JSON.parse(stored)
})

// Date Utilities
const timeAgo = (dateStr) => {
  if (!dateStr) return 'Desconocido';
  const d = new Date(dateStr);
  if(isNaN(d.getTime())) return 'Desconocido';
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays/7)} sem`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays/30)} meses`;
  return `Hace ${Math.floor(diffDays/365)} años`;
}

const isNewStudent = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if(isNaN(d.getTime())) return false;
  const diffDays = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 14; 
}

const formatDateObj = (dateStr) => {
   if(!dateStr) return '...';
   const d = new Date(dateStr);
   if(isNaN(d.getTime())) return dateStr;
   return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Modal Handlers
const openTimelineModal = (stu) => { viewingTimelineStu.value = stu; }
const closeTimelineModal = () => { viewingTimelineStu.value = null; }

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

const getCacheKey = () => `ws_cache_${currentWorkshop.value.plantel}_${currentWorkshop.value.servicio}`
const getSortKey = () => `ws_sort_${currentWorkshop.value.plantel}_${currentWorkshop.value.servicio}`

const applySortOrder = (list) => {
  if (customSortOrder.value.length === 0) return list;
  return [...list].sort((a, b) => {
    const idxA = customSortOrder.value.indexOf(a.matricula);
    const idxB = customSortOrder.value.indexOf(b.matricula);
    if (idxA === -1 && idxB === -1) return a.nombreCompleto.localeCompare(b.nombreCompleto);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
}

const openWorkshop = async (shortcut) => {
  currentWorkshop.value = shortcut
  searchText.value = ''
  selectedForAttendance.value = []
  allSelected.value = false
  sortMode.value = false
  timelineData.value = {}
  
  // Load custom sort order
  const savedSort = localStorage.getItem(getSortKey())
  customSortOrder.value = savedSort ? JSON.parse(savedSort) : []

  // Fast Render from Cache
  const cachedData = localStorage.getItem(getCacheKey())
  if (cachedData) {
    studentsList.value = applySortOrder(JSON.parse(cachedData))
    await fetchAttendance() 
    fetchTimeline() 
  } else {
    loading.value = true 
  }

  // Background Sync Data
  await fetchWorkshopData()
}

const manualRefresh = async () => {
  loading.value = true
  await fetchWorkshopData()
  await fetchAttendance()
  await fetchTimeline()
  loading.value = false
}

const fetchWorkshopData = async () => {
  if(!currentWorkshop.value) return;
  loading.value = true;
  try {
    const res = await axios.get(`https://matricula.casitaapps.com/fetch-servicios-data?plantel=${currentWorkshop.value.plantel}`)
    if (res.data && res.data[currentWorkshop.value.plantel] && res.data[currentWorkshop.value.plantel][currentWorkshop.value.servicio]) {
      const freshList = res.data[currentWorkshop.value.plantel][currentWorkshop.value.servicio]
      localStorage.setItem(getCacheKey(), JSON.stringify(freshList))
      studentsList.value = applySortOrder(freshList)
      
      // Update missing customSortOrder entries
      if(customSortOrder.value.length === 0 && freshList.length > 0) {
        customSortOrder.value = freshList.map(s => s.matricula)
        localStorage.setItem(getSortKey(), JSON.stringify(customSortOrder.value))
      }
      
      fetchTimeline()
    } else {
      studentsList.value = []
      Swal.fire('Atención', 'No hay alumnos inscritos en este taller.', 'info')
    }
  } catch (e) {
    logger.error('Failed to sync workshop', e)
  } finally {
    loading.value = false
  }
}

const fetchTimeline = async () => {
  if (!currentWorkshop.value || studentsList.value.length === 0) return;
  const matriculas = studentsList.value.map(s => s.matricula);
  try {
    const res = await axios.post('https://bot.casitaapps.com/api/servicio-timeline-bulk', {
      plantel: currentWorkshop.value.plantel,
      servicio: currentWorkshop.value.servicio,
      matriculas
    });
    timelineData.value = res.data?.data || {};
  } catch(e) {
    logger.error("Timeline bulk fetch gracefully failed", e);
  }
}

const closeWorkshop = () => {
  currentWorkshop.value = null
  studentsList.value = []
  attendanceMap.value = {}
  selectedForAttendance.value = []
  sortMode.value = false
}

const filteredStudents = computed(() => {
  const q = searchText.value.toLowerCase()
  let list = studentsList.value
  if (q) {
    list = list.filter(s => s.nombreCompleto.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q))
  }
  return applySortOrder(list)
})

const fetchAttendance = async () => {
  if (studentsList.value.length === 0) return
  const payload = studentsList.value.map(s => ({ matricula: s.matricula, servicio: currentWorkshop.value.servicio }))
  try {
    const res = await axios.post('https://bot.casitaapps.com/get-monthly-attendance-bulk', { students: payload })
    attendanceMap.value = res.data.attendanceData || {}
  } catch (e) { logger.error("Attendance fetch error", e) }
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

// Sorting feature
const toggleSortMode = () => {
  sortMode.value = !sortMode.value
  searchText.value = '' // Clear search to allow sorting entire list
}

const moveStudent = (index, direction) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= studentsList.value.length) return

  // Update master order array
  if(customSortOrder.value.length === 0) {
    customSortOrder.value = studentsList.value.map(s => s.matricula)
  }
  
  const temp = customSortOrder.value[index]
  customSortOrder.value[index] = customSortOrder.value[targetIndex]
  customSortOrder.value[targetIndex] = temp
  
  localStorage.setItem(getSortKey(), JSON.stringify(customSortOrder.value))
  studentsList.value = applySortOrder(studentsList.value) // Force refresh computed
}

// Incidencias Flow (Connected to Atención a Padres endpoints)
const openIncidenciaModal = async (stu) => {
  const { value: formValues } = await Swal.fire({
    title: `Reportar: ${stu.nombreCompleto}`,
    html: `
      <div class="text-start">
        <label class="fw-bold mb-2 text-dark small">Motivo / Descripción de la incidencia:</label>
        <textarea id="swal-motivo" class="form-control mb-3 bg-light rounded-4 p-3 border-0" rows="3" placeholder="Describe lo sucedido (min 10 caracteres)..."></textarea>
        <label class="fw-bold mb-2 text-dark small">Acciones Tomadas:</label>
        <textarea id="swal-acciones" class="form-control bg-light rounded-4 p-3 border-0" rows="3" placeholder="¿Qué se hizo al respecto? (min 10 caracteres)..."></textarea>
      </div>
    `,
    focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar Reporte', cancelButtonText: 'Cancelar',
    confirmButtonColor: '#eab308',
    preConfirm: () => {
      const motivo = document.getElementById('swal-motivo').value
      const acciones = document.getElementById('swal-acciones').value
      if(motivo.length < 10 || acciones.length < 10) {
        Swal.showValidationMessage('Ambos campos requieren al menos 10 caracteres.')
        return false
      }
      return { motivo, acciones }
    }
  })

  if (formValues) {
    loading.value = true
    try {
      await axios.post('https://bot.casitaapps.com/api/servicios-atencion', {
        matricula: stu.matricula, 
        nombre_alumno: stu.nombreCompleto, 
        servicios: currentWorkshop.value.servicio,
        motivo: formValues.motivo, 
        acciones: formValues.acciones, 
        plantel: currentWorkshop.value.plantel, 
        area: 'Artes y Deportes'
      })
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Incidencia guardada', showConfirmButton: false, timer: 3000 })
    } catch(e) {
      logger.error('Failed to save incidencia', e)
      Swal.fire('Error', 'Fallo al guardar reporte. Revisa la conexión.', 'error')
    } finally {
      loading.value = false
    }
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
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }

.pulse-animation { animation: pulse 2s infinite; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.fade-in { animation: fadeIn 0.4s ease-out; }
.animation-fade { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from, .pop-leave-to { transform: scale(0); opacity: 0; }
</style>