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
      <p class="text-muted mb-4 fs-5">Busca un estudiante para ver talleres inscritos, asistencias y reportes.</p>
      
      <div class="position-relative mx-auto" style="max-width: 600px;">
        <i class="fas fa-search position-absolute text-muted fa-lg" style="left: 20px; top: 20px;"></i>
        <input type="text" class="form-control form-control-lg rounded-pill ps-5 bg-white border border-2 shadow-sm py-3 focus-purple" placeholder="Buscar por Nombre o Matrícula..." v-model="searchText">
      </div>

      <div class="list-group mx-auto mt-3 shadow-sm text-start rounded-4 overflow-hidden border-0" style="max-width: 600px; max-height: 350px; overflow-y: auto;" v-if="searchText.length > 2">
        <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 border-bottom" v-for="stu in filteredStudents" :key="stu.matricula" @click="selectStudent(stu)">
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
        <div v-if="filteredStudents.length === 0" class="p-4 text-center text-muted bg-white border">No se encontraron alumnos con ese criterio.</div>
      </div>
    </div>

    <!-- Student Detail View -->
    <div v-else class="animation-fade">
      
      <!-- Top Action Bar -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button class="btn btn-white shadow-sm rounded-pill px-4 fw-semibold border hover-scale" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i> Volver a Búsqueda
        </button>
      </div>

      <div class="row g-4">
        
        <!-- Left Column: Profile & Current Workshops -->
        <div class="col-lg-4">
          <!-- Profile Card -->
          <div class="card border-0 rounded-4 shadow-sm mb-4 bg-white overflow-hidden text-center p-4">
            <div class="mb-3 mx-auto position-relative d-inline-block">
              <img v-if="selectedStudent.foto" :src="selectedStudent.foto" class="rounded-circle object-fit-cover shadow-sm border border-3 border-white" width="120" height="120">
              <div v-else class="rounded-circle shadow-sm border border-3 border-white bg-light d-flex align-items-center justify-content-center text-secondary" style="width: 120px; height: 120px;">
                <i class="fas fa-user fa-4x"></i>
              </div>
            </div>
            <h4 class="fw-bold text-dark mb-1">{{ selectedStudent.nombreCompleto }}</h4>
            <span class="badge bg-purple bg-opacity-10 text-purple border border-purple rounded-pill px-3 py-2 mb-3" style="color: #6b21a8; border-color: #d8b4fe !important;">
              {{ selectedStudent.plantel }} &bull; {{ selectedStudent.grado }} {{ selectedStudent.grupo }}
            </span>
            <div class="text-muted font-monospace small bg-light py-2 rounded-3 border w-100 mb-3">{{ selectedStudent.matricula }}</div>
            
            <div class="d-flex flex-column text-start gap-2 small bg-light p-3 rounded-4 border">
              <div v-if="selectedStudent.telefonoPadre" class="d-flex justify-content-between"><span class="text-muted fw-semibold">Tel. Padre:</span> <span class="fw-bold">{{ selectedStudent.telefonoPadre }}</span></div>
              <div v-if="selectedStudent.telefonoMadre" class="d-flex justify-content-between"><span class="text-muted fw-semibold">Tel. Madre:</span> <span class="fw-bold">{{ selectedStudent.telefonoMadre }}</span></div>
            </div>
          </div>

          <!-- Workshops Card -->
          <div class="card border-0 rounded-4 shadow-sm bg-white">
            <div class="card-header bg-transparent border-bottom p-4">
              <h5 class="fw-bold mb-0 text-dark"><i class="fas fa-paint-brush me-2 text-info"></i>Talleres Actuales</h5>
            </div>
            <div class="list-group list-group-flush">
              <div class="list-group-item p-3 border-light d-flex align-items-center gap-3" v-for="srv in studentWorkshops" :key="srv">
                <div class="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;"><i class="fas fa-star"></i></div>
                <div class="fw-bold text-dark flex-grow-1">{{ srv }}</div>
              </div>
              <div v-if="studentWorkshops.length === 0" class="p-4 text-center text-muted small">No tiene talleres extracurriculares registrados.</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Analytics & Incidencias -->
        <div class="col-lg-8">
          
          <!-- Quick Stats -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <div class="card border-0 rounded-4 shadow-sm h-100 bg-white border-start border-4 border-success">
                <div class="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted fw-bold mb-1 text-uppercase small">Asistencias Este Mes</h6>
                    <h2 class="fw-bold mb-0 text-dark">{{ monthlyStats.attended }}</h2>
                  </div>
                  <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style="width:50px; height:50px;"><i class="fas fa-calendar-check fa-lg"></i></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-0 rounded-4 shadow-sm h-100 bg-white border-start border-4 border-warning">
                <div class="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted fw-bold mb-1 text-uppercase small">Incidencias Historicas</h6>
                    <h2 class="fw-bold mb-0 text-dark">{{ fichas.length }}</h2>
                  </div>
                  <div class="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style="width:50px; height:50px;"><i class="fas fa-folder-open fa-lg"></i></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Incidencias Timeline -->
          <div class="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
            <div class="card-header bg-transparent border-bottom p-4">
              <h5 class="fw-bold mb-0 text-dark"><i class="fas fa-exclamation-triangle me-2 text-warning"></i>Historial de Reportes e Incidencias</h5>
            </div>
            <div class="card-body p-4" style="max-height: 500px; overflow-y: auto;">
              
              <div class="timeline ps-3 border-start border-warning border-2" v-if="fichas.length > 0">
                <div class="mb-4 position-relative" v-for="f in fichas" :key="f.id">
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { logger } from '../utils/logger'

const loading = ref(false)
const searchText = ref('')
const studentsData = ref([])

const selectedStudent = ref(null)
const studentWorkshops = ref([])
const fichas = ref([])
const monthlyStats = ref({ attended: 0, total: 0 })

onMounted(async () => {
  loading.value = true
  try {
    const res = await axios.get('https://bot.casitaapps.com/fetch-servicios-data-all')
    const flatList = []
    
    // Flatten master structure and group workshops
    for (const [p, sObj] of Object.entries(res.data)) {
      for (const [s, list] of Object.entries(sObj)) {
        list.forEach(stu => {
          const existing = flatList.find(x => x.matricula === stu.matricula)
          if (existing) {
            if (!existing._serviciosArr.includes(s) && s !== 'Sin asignar') {
              existing._serviciosArr.push(s)
            }
          } else {
            flatList.push({ ...stu, plantel: p, _serviciosArr: s !== 'Sin asignar' ? [s] : [] })
          }
        })
      }
    }
    studentsData.value = flatList
  } catch (e) {
    logger.error('Failed to load global students data', e)
  } finally { 
    loading.value = false 
  }
})

const filteredStudents = computed(() => {
  const q = searchText.value.toLowerCase()
  if (q.length < 3) return []
  return studentsData.value.filter(s => 
    (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(q)) || 
    (s.matricula && s.matricula.toLowerCase().includes(q))
  ).slice(0, 30) // max results
})

const selectStudent = async (stu) => {
  selectedStudent.value = stu
  studentWorkshops.value = stu._serviciosArr || []
  fichas.value = []
  monthlyStats.value = { attended: 0, total: 0 }
  
  loading.value = true
  try {
    // 1. Fetch Incidencias (Atencion Padres DB)
    const resFichas = await axios.get(`https://bot.casitaapps.com/api/servicios-atencion?matricula=${stu.matricula}`)
    fichas.value = resFichas.data.sort((a,b) => new Date(b.date_created) - new Date(a.date_created))
    
    // 2. Fetch Attendance for current month for all their workshops
    if (studentWorkshops.value.length > 0) {
      const payload = studentWorkshops.value.map(srv => ({ matricula: stu.matricula, servicio: srv }))
      const resAtt = await axios.post('https://bot.casitaapps.com/get-monthly-attendance-bulk', { students: payload })
      const map = resAtt.data.attendanceData || {}
      
      let attCount = 0
      Object.values(map).forEach(daysArray => {
        attCount += daysArray.length
      })
      monthlyStats.value.attended = attCount
    }
  } catch (e) {
    logger.error('Failed to load student deep details', e)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  selectedStudent.value = null
  searchText.value = ''
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
</style>