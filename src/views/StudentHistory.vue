<template>
  <div class="container py-4 position-relative">
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-purple border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- Search View -->
    <div v-if="!selectedStudent" class="text-center animation-fade pt-5">
      <div class="bg-purple bg-opacity-10 text-purple mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 90px; height: 90px; color: #8b5cf6; background-color: #f3e8ff;">
        <i class="fas fa-user-graduate fa-3x"></i>
      </div>
      <h2 class="fw-bold text-dark mb-2">Historial Integral del Alumno</h2>
      <p class="text-muted mb-4 fs-5">Búsqueda global rápida a través de todos los planteles.</p>
      
      <div class="position-relative mx-auto" style="max-width: 600px;">
        <i class="fas fa-search position-absolute text-muted fa-lg" style="left: 20px; top: 20px;"></i>
        <input type="text" class="form-control form-control-lg rounded-pill ps-5 bg-white border border-2 shadow-sm py-3 focus-purple" placeholder="Buscar por Nombre o Matrícula..." v-model="searchText" @input="onSearchInput">
      </div>

      <div class="list-group mx-auto mt-3 shadow-sm text-start rounded-4 overflow-hidden border-0" style="max-width: 600px; max-height: 400px; overflow-y: auto;" v-if="searchResults.length > 0 || isSearching">
        <div v-if="isSearching" class="p-4 text-center text-muted bg-white border">
          <i class="fas fa-spinner fa-spin me-2"></i> Buscando...
        </div>
        <button v-else class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 border-bottom" v-for="stu in searchResults" :key="stu.matricula" @click="selectStudent(stu)">
          <div class="d-flex align-items-center gap-3">
            <img v-if="stu.foto" :src="stu.foto" class="rounded-circle object-fit-cover shadow-sm border" width="45" height="45">
            <div v-else class="rounded-circle shadow-sm border bg-light d-flex align-items-center justify-content-center text-secondary" style="width: 45px; height: 45px;">
              <i class="fas fa-user"></i>
            </div>
            <div>
              <h6 class="fw-bold mb-1 text-dark">{{ stu.nombreCompleto }}</h6>
              <small class="text-muted">{{ stu.plantel }} | {{ stu.grado }} {{ stu.grupo }} | {{ stu.matricula }}</small>
            </div>
          </div>
          <i class="fas fa-chevron-right text-muted opacity-50"></i>
        </button>
      </div>
      <div v-if="searchText.length > 2 && searchResults.length === 0 && !isSearching" class="mx-auto mt-3 p-4 text-center text-muted bg-white border rounded-4 shadow-sm" style="max-width: 600px;">
        No se encontraron alumnos con ese criterio.
      </div>
    </div>

    <!-- Student Detail Dashboard -->
    <div v-else class="animation-fade">
      <!-- Top Action Bar -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button class="btn btn-white shadow-sm rounded-pill px-4 fw-semibold border hover-scale" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i> Volver a Búsqueda
        </button>
      </div>

      <div class="row g-4">
        <!-- Left Column: Profile -->
        <div class="col-lg-4">
          <!-- Profile Card -->
          <div class="card border-0 rounded-4 shadow-sm mb-4 bg-white overflow-hidden text-center p-4">
            <div class="mb-3 mx-auto position-relative d-inline-block">
              <img v-if="dashboardData.profile.foto" :src="dashboardData.profile.foto" class="rounded-circle object-fit-cover shadow-sm border border-3 border-white" width="120" height="120">
              <div v-else class="rounded-circle shadow-sm border border-3 border-white bg-light d-flex align-items-center justify-content-center text-secondary" style="width: 120px; height: 120px;">
                <i class="fas fa-user fa-4x"></i>
              </div>
            </div>
            <h4 class="fw-bold text-dark mb-1">{{ dashboardData.profile.nombreCompleto }}</h4>
            <span class="badge bg-purple bg-opacity-10 text-purple border border-purple rounded-pill px-3 py-2 mb-3" style="color: #6b21a8; border-color: #d8b4fe !important;">
              {{ dashboardData.profile.plantel }} &bull; {{ dashboardData.profile.grado }} {{ dashboardData.profile.grupo }}
            </span>
            <div class="text-muted font-monospace small bg-light py-2 rounded-3 border w-100 mb-3">{{ dashboardData.profile.matricula }}</div>
            
            <div class="d-flex flex-column text-start gap-2 small bg-light p-3 rounded-4 border">
              <div v-if="dashboardData.profile.telefonoPadre" class="d-flex justify-content-between"><span class="text-muted fw-semibold">Tel. Padre:</span> <span class="fw-bold">{{ dashboardData.profile.telefonoPadre }}</span></div>
              <div v-if="dashboardData.profile.telefonoMadre" class="d-flex justify-content-between"><span class="text-muted fw-semibold">Tel. Madre:</span> <span class="fw-bold">{{ dashboardData.profile.telefonoMadre }}</span></div>
            </div>
          </div>

          <!-- Active Workshops Card -->
          <div class="card border-0 rounded-4 shadow-sm bg-white">
            <div class="card-header bg-transparent border-bottom p-4">
              <h5 class="fw-bold mb-0 text-dark"><i class="fas fa-paint-brush me-2 text-info"></i>Talleres Actuales</h5>
            </div>
            <div class="list-group list-group-flush">
              <div class="list-group-item p-3 border-light d-flex align-items-center gap-3" v-for="srv in dashboardData.workshops.current" :key="srv">
                <div class="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 40px;"><i class="fas fa-star"></i></div>
                <div class="fw-bold text-dark flex-grow-1">{{ srv }}</div>
              </div>
              <div v-if="dashboardData.workshops.current.length === 0" class="p-4 text-center text-muted small">No tiene talleres activos actualmente.</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Tabs -->
        <div class="col-lg-8">
          <ul class="nav nav-pills mb-4 bg-white p-2 rounded-pill shadow-sm border flex-wrap">
            <li class="nav-item">
              <a class="nav-link rounded-pill fw-semibold px-4 cursor-pointer text-dark" :class="{ 'bg-light border': activeTab !== 'workshops', 'active text-white': activeTab === 'workshops' }" @click="activeTab = 'workshops'">
                <i class="fas fa-history me-1"></i> Línea de Tiempo
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link rounded-pill fw-semibold px-4 cursor-pointer text-dark" :class="{ 'bg-light border': activeTab !== 'attendance', 'active text-white': activeTab === 'attendance' }" @click="activeTab = 'attendance'">
                <i class="fas fa-calendar-check me-1"></i> Asistencia Reciente
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link rounded-pill fw-semibold px-4 cursor-pointer text-dark" :class="{ 'bg-light border': activeTab !== 'incidencias', 'active text-white': activeTab === 'incidencias' }" @click="activeTab = 'incidencias'">
                <i class="fas fa-exclamation-triangle me-1"></i> Reportes
              </a>
            </li>
          </ul>

          <div class="card border-0 rounded-4 shadow-sm bg-white p-4">
            
            <!-- Timeline Tab -->
            <div v-if="activeTab === 'workshops'" class="animation-fade">
              <h5 class="fw-bold mb-4 text-dark">Historial Completo de Talleres</h5>
              <div class="timeline ps-3 border-start border-info border-2" v-if="dashboardData.workshops.history.length > 0">
                 <div class="mb-4 position-relative" v-for="entry in dashboardData.workshops.history" :key="entry.id">
                    <i class="fas fa-circle position-absolute border border-2 border-white" :class="entry.active ? 'text-success' : 'text-secondary'" style="left: -23px; top: 0px; font-size: 0.85rem;"></i>
                    <div class="bg-light p-3 rounded-4 shadow-sm border border-light">
                       <div class="d-flex justify-content-between align-items-start mb-1">
                          <h6 class="fw-bold mb-0" :class="entry.active ? 'text-dark' : 'text-muted'">{{ entry.servicio_label }}</h6>
                          <span class="badge" :class="entry.active ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-white text-muted border'">{{ entry.active ? 'Activo' : 'Baja' }}</span>
                       </div>
                       <small class="text-muted d-block fw-semibold mb-1"><i class="fas fa-map-marker-alt me-1"></i> Plantel {{ entry.plantel }}</small>
                       <small class="text-muted d-block"><i class="fas fa-calendar-alt me-1"></i> {{ formatDateObj(entry.started_at) }} - {{ entry.ended_at ? formatDateObj(entry.ended_at) : 'Presente' }}</small>
                    </div>
                 </div>
              </div>
              <div v-else class="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                 <i class="fas fa-paint-brush fa-3x mb-3 opacity-25"></i>
                 <p class="mb-0 fw-semibold">No tiene historial de movimientos registrado.</p>
              </div>
            </div>

            <!-- Attendance Tab -->
            <div v-if="activeTab === 'attendance'" class="animation-fade">
              <h5 class="fw-bold mb-4 text-dark">Registro de Asistencia General</h5>
              <div class="table-responsive border rounded-4" v-if="dashboardData.attendance.length > 0" style="max-height: 500px; overflow-y: auto;">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light position-sticky top-0 z-2 shadow-sm">
                    <tr>
                      <th class="ps-4">Fecha</th>
                      <th>Taller</th>
                      <th class="text-center pe-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(att, idx) in dashboardData.attendance" :key="idx">
                      <td class="ps-4 text-muted">{{ att.date }}</td>
                      <td class="fw-semibold text-dark">{{ att.servicio }}</td>
                      <td class="text-center pe-4">
                        <span class="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3" v-if="att.status === 1"><i class="fas fa-check me-1"></i> Presente</span>
                        <span class="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-3" v-else><i class="fas fa-times me-1"></i> Ausente</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                 <i class="fas fa-calendar-times fa-3x mb-3 opacity-25"></i>
                 <p class="mb-0 fw-semibold">No hay asistencias recientes registradas en talleres.</p>
              </div>
            </div>

            <!-- Incidencias Tab -->
            <div v-if="activeTab === 'incidencias'" class="animation-fade">
              <h5 class="fw-bold mb-4 text-dark">Reportes y Notas</h5>
              <div class="timeline ps-3 border-start border-warning border-2" v-if="dashboardData.incidencias.length > 0">
                <div class="mb-4 position-relative" v-for="f in dashboardData.incidencias" :key="f.id">
                  <i class="fas fa-circle text-warning position-absolute border border-2 border-white" style="left: -25px; top: 0px; font-size: 0.85rem;"></i>
                  <div class="bg-light p-4 rounded-4 shadow-sm border border-light">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="fw-bold mb-0 text-dark">{{ f.servicios }}</h6>
                      <span class="badge bg-white text-muted border px-2 py-1 shadow-sm">{{ new Date(f.date_created).toLocaleDateString() }}</span>
                    </div>
                    
                    <div class="mb-3">
                      <span class="d-block small fw-bold text-muted text-uppercase mb-1" style="font-size: 0.65rem;">Motivo / Incidencia</span>
                      <p class="text-dark small mb-0">{{ f.motivo }}</p>
                    </div>
                    
                    <div class="mb-2">
                      <span class="d-block small fw-bold text-muted text-uppercase mb-1" style="font-size: 0.65rem;">Acciones Tomadas</span>
                      <p class="text-dark small mb-0">{{ f.acciones }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                <i class="fas fa-clipboard-check fa-3x mb-3 text-success opacity-50"></i>
                <h5 class="fw-bold">Excelente historial</h5>
                <p class="mb-0">El alumno no tiene reportes ni incidencias registradas en talleres.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { logger } from '../utils/logger'
import { allServiciosList } from '../utils/theme'

const loading = ref(false)
const searchText = ref('')
const isSearching = ref(false)
const searchResults = ref([])
const studentsDataCache = ref([]) // Fallback

const selectedStudent = ref(null)
const dashboardData = ref({
  profile: {},
  workshops: { current: [], history: [] },
  attendance: [],
  incidencias: []
})
const activeTab = ref('workshops')

let searchTimeout;

// 1. Debounced Global Search
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 300);
}

const performSearch = async () => {
  if (searchText.value.length < 3) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const res = await axios.get(`https://matricula.casitaapps.com/api/students/search?q=${encodeURIComponent(searchText.value)}`);
    searchResults.value = res.data;
  } catch (e) {
    logger.warn('New search API unavailable, using fallback', e);
    await fallbackSearch();
  } finally {
    isSearching.value = false;
  }
}

// Fallback logic
const fallbackSearch = async () => {
  if (studentsDataCache.value.length === 0) {
    try {
      const res = await axios.get('https://matricula.casitaapps.com/fetch-servicios-data');
      const flatList = [];
      for (const [p, sObj] of Object.entries(res.data)) {
        for (const [s, list] of Object.entries(sObj)) {
          if (allServiciosList.includes(s.toUpperCase())) {
            list.forEach(stu => {
              if (!flatList.find(x => x.matricula === stu.matricula)) {
                flatList.push({ ...stu, plantel: p });
              }
            });
          }
        }
      }
      studentsDataCache.value = flatList;
    } catch(err) {
      logger.error('Fallback global cache failed', err);
    }
  }
  const q = searchText.value.toLowerCase();
  searchResults.value = studentsDataCache.value.filter(s => 
    (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(q)) || 
    (s.matricula && s.matricula.toLowerCase().includes(q))
  ).slice(0, 30);
}

const selectStudent = async (stu) => {
  selectedStudent.value = stu;
  activeTab.value = 'workshops';
  await loadDashboard(stu.matricula);
}

const loadDashboard = async (matricula) => {
  loading.value = true;
  try {
    const res = await axios.get(`https://matricula.casitaapps.com/api/students/${matricula}/dashboard`);
    const data = res.data;
    if (data.workshops) {
      if (data.workshops.current) {
        data.workshops.current = data.workshops.current.filter(srv => allServiciosList.includes(srv.toUpperCase()));
      }
      if (data.workshops.history) {
        data.workshops.history = data.workshops.history.filter(h => allServiciosList.includes(h.servicio_label.toUpperCase()));
      }
    }
    if (data.attendance) {
      data.attendance = data.attendance.filter(a => allServiciosList.includes(a.servicio.toUpperCase()));
    }
    dashboardData.value = data;
  } catch (e) {
    logger.warn('New dashboard API unavailable, reconstructing payload using existing endpoints', e);
    await fallbackLoadDashboard(matricula);
  } finally {
    loading.value = false;
  }
}

const fallbackLoadDashboard = async (matricula) => {
  const stu = searchResults.value.find(s => s.matricula === matricula) || { matricula };
  const profile = { ...stu };
  
  let incidencias = [];
  try {
    const resFichas = await axios.get(`https://bot.casitaapps.com/api/servicios-atencion?matricula=${matricula}`);
    incidencias = resFichas.data.sort((a,b) => new Date(b.date_created) - new Date(a.date_created));
  } catch(e) {}
  
  let timeline = [];
  try {
    const resTl = await axios.post('https://bot.casitaapps.com/api/talleres/timeline/bulk', { matriculas: [matricula] });
    let rawHistory = resTl.data?.data[matricula]?.history || [];
    timeline = rawHistory.filter(h => allServiciosList.includes(h.servicio_label.toUpperCase()));
  } catch(e) {}
  
  const activeWorkshops = timeline.filter(t => t.active).map(t => t.servicio_label);
  
  let attendance = [];
  if (activeWorkshops.length > 0) {
    try {
      const payload = activeWorkshops.map(srv => ({ matricula, servicio: srv }));
      const resAtt = await axios.post('https://bot.casitaapps.com/get-monthly-attendance-bulk', { students: payload });
      const map = resAtt.data.attendanceData || {};
      for (const key in map) {
        const parts = key.split('-');
        const srv = parts[1];
        if (allServiciosList.includes(srv.toUpperCase())) {
          map[key].forEach(day => {
            attendance.push({ date: `Día ${day} (Mes actual)`, servicio: srv, status: 1 });
          });
        }
      }
    } catch(e) {}
  }

  dashboardData.value = { profile, workshops: { current: activeWorkshops, history: timeline }, attendance, incidencias };
}

const goBack = () => {
  selectedStudent.value = null;
  searchText.value = '';
  searchResults.value = [];
}

const formatDateObj = (dateStr) => {
   if(!dateStr) return '...';
   const d = new Date(dateStr);
   if(isNaN(d.getTime())) return dateStr;
   return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.animation-fade { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.focus-purple:focus { border-color: #a855f7 !important; box-shadow: 0 0 0 0.25rem rgba(168, 85, 247, 0.25) !important; outline: none; }
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }
.text-purple { color: #8b5cf6 !important; }
.bg-purple { background-color: #8b5cf6 !important; }
.border-purple { border-color: #8b5cf6 !important; }
.cursor-pointer { cursor: pointer; }
</style>