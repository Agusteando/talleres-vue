<template>
  <div class="admin-view position-relative py-3">
    <!-- Loader -->
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-primary border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- 1. PLANTEL SELECTION -->
    <div v-if="!plantel" class="fade-in">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-dark mb-2">Selecciona un Plantel</h2>
        <p class="text-muted">Elige el campus para administrar sus servicios extracurriculares.</p>
      </div>
      <div class="row justify-content-center g-4">
        <div class="col-6 col-md-3 col-lg-2" v-for="p in allowedPlanteles" :key="p">
          <div class="card h-100 border-0 shadow-sm hover-card text-center py-4 rounded-4 cursor-pointer" @click="selectPlantel(p)">
            <div class="mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" 
                 :style="{ background: getPlantelTheme(p).gradient, width: '70px', height: '70px' }">
              <i class="fas fa-2x" :class="getPlantelTheme(p).icon"></i>
            </div>
            <h5 class="mb-0 fw-bold text-dark">{{ p }}</h5>
            <small class="text-muted" style="font-size: 0.7rem;">{{ getPlantelTheme(p).name }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. SERVICIO SELECTION -->
    <div v-else-if="plantel && !servicio" class="fade-in">
      <div class="d-flex justify-content-between align-items-center mb-5 p-4 rounded-4 shadow-sm text-white" :style="{ background: currentTheme.gradient }">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light bg-opacity-25 text-white border-0 rounded-circle shadow-sm" style="width: 45px; height: 45px;" @click="goBackToPlanteles">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h3 class="fw-bold mb-0">Servicios: {{ currentTheme.name }}</h3>
            <small class="opacity-75">Selecciona el taller para administrar.</small>
          </div>
        </div>
        <button class="btn btn-light text-dark rounded-pill px-4 fw-bold shadow-sm" @click="showAllServices = !showAllServices">
          {{ showAllServices ? 'Ocultar vacíos' : 'Mostrar Todos' }}
        </button>
      </div>

      <div class="row g-4">
        <div class="col-md-4 col-lg-3" v-for="s in filteredServices" :key="s">
          <div class="card h-100 border-0 shadow-sm hover-card cursor-pointer rounded-4" @click="selectServicio(s)">
            <div class="card-body text-center p-4">
              <div class="mb-3 mx-auto d-flex align-items-center justify-content-center rounded-circle" 
                   :style="{ background: currentTheme.color + '1A', color: currentTheme.color, width: '60px', height: '60px' }">
                <i class="fas fa-xl" :class="getServiceIcon(s)"></i>
              </div>
              <h6 class="fw-bold mb-2 text-dark">{{ s }}</h6>
              <span class="badge bg-light text-secondary border rounded-pill px-3 py-2">{{ getStudentCount(s) }} inscritos</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. SERVICIO DETAILS (Tabs & Data) -->
    <div v-else class="fade-in">
      
      <!-- Header -->
      <div class="rounded-4 shadow-sm mb-4 p-4 d-flex justify-content-between align-items-center text-white" :style="{ background: currentTheme.gradient }">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light bg-opacity-25 text-white border-0 rounded-circle shadow-sm" style="width: 45px; height: 45px;" @click="goBackToServices">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h3 class="mb-0 fw-bold">{{ currentTheme.name }} - {{ servicio }}</h3>
            <div class="d-flex gap-3 opacity-75 small mt-1">
              <span><i class="fas fa-users me-1"></i> {{ flatStudents.length }} Totales</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABS -->
      <ul class="nav nav-pills bg-white rounded-pill shadow-sm border p-1 mb-4 d-inline-flex flex-wrap">
        <li class="nav-item cursor-pointer" @click="activeTab = 'current'">
          <a class="nav-link rounded-pill fw-semibold px-4" :class="{ 'active': activeTab === 'current' }" :style="activeTab === 'current' ? {backgroundColor: currentTheme.color} : {}">
            <i class="fas fa-list me-1"></i> Lista
          </a>
        </li>
        <li class="nav-item cursor-pointer" @click="handleRestrictedTab('add')">
          <a class="nav-link rounded-pill fw-semibold px-4 text-dark" :class="{ 'bg-light border': activeTab === 'add' }">
            <i class="fas fa-user-plus me-1"></i> Añadir
          </a>
        </li>
        <li class="nav-item cursor-pointer" @click="activeTab = 'attendance'">
          <a class="nav-link rounded-pill fw-semibold px-4" :class="{ 'active bg-success text-white': activeTab === 'attendance', 'text-dark': activeTab !== 'attendance' }">
            <i class="fas fa-clipboard-check me-1"></i> Asistencia Hoy
          </a>
        </li>
        <li class="nav-item cursor-pointer" @click="activeTab = 'history'">
          <a class="nav-link rounded-pill fw-semibold px-4 text-dark" :class="{ 'bg-light border': activeTab === 'history' }">
            <i class="fas fa-calendar-alt me-1"></i> Historial
          </a>
        </li>
        <li class="nav-item cursor-pointer" @click="activeTab = 'scheduled'">
          <a class="nav-link rounded-pill fw-semibold px-4" :class="{ 'active text-white': activeTab === 'scheduled', 'text-dark': activeTab !== 'scheduled' }" :style="activeTab === 'scheduled' ? {backgroundColor: '#0088cc'} : {}">
            <i class="fab fa-telegram-plane me-1"></i> Difusión Telegram
          </a>
        </li>
      </ul>

      <div class="bg-white rounded-4 shadow-sm border p-4">
        
        <!-- TAB: CURRENT STUDENTS -->
        <div v-if="activeTab === 'current'">
          <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div class="position-relative" style="width: 100%; max-width: 400px;">
              <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 12px;"></i>
              <input type="text" class="form-control rounded-pill ps-5 bg-light border-0 py-2" placeholder="Buscar alumno..." v-model="searchCurrent">
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary rounded-pill px-3 fw-semibold" @click="isGrouped = !isGrouped">
                <i class="fas" :class="isGrouped ? 'fa-th-list' : 'fa-th'"></i> {{ isGrouped ? 'Desagrupar' : 'Agrupar' }}
              </button>
              <button class="btn btn-success rounded-pill px-3 fw-semibold" @click="exportCurrentData"><i class="fas fa-file-excel me-1"></i> Excel</button>
              <button class="btn text-white rounded-pill px-3 fw-semibold shadow-sm" style="background-color: #0088cc;" @click="openTelegramFlow('Todo')" :disabled="!authStore.hasAdminAccess">
                <i class="fab fa-telegram-plane me-1"></i> Enviar Telegram
              </button>
            </div>
          </div>
          
          <div v-if="filteredGroupedCurrentKeys.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
            <h5>No hay alumnos en este servicio.</h5>
          </div>

          <div v-for="nivel in filteredGroupedCurrentKeys" :key="nivel" class="mb-4 pb-3 border-bottom">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold text-dark text-uppercase mb-0 tracking-wide fs-6" :style="{ color: currentTheme.color }">{{ nivel }}</h5>
            </div>

            <div v-for="(students, gradoGrupo) in filteredGroupedCurrent[nivel]" :key="gradoGrupo" class="mb-4 ms-2 ps-3 border-start border-3" :style="{ borderColor: currentTheme.color + '!important' }">
              <h6 class="fw-bold mb-3 text-secondary">{{ gradoGrupo }} <span class="badge bg-light text-dark border rounded-pill ms-2">{{ students.length }}</span></h6>
              
              <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-4" v-for="stu in students" :key="stu.matricula">
                  <div class="card h-100 border-0 bg-light rounded-4 overflow-hidden position-relative hover-card">
                    <div class="position-absolute top-0 end-0 m-2" v-if="stu.eventual == 1">
                      <span class="badge bg-warning text-dark shadow-sm">Eventual</span>
                    </div>
                    <div class="card-body d-flex align-items-center gap-3 p-3">
                      <img v-if="stu.foto" :src="stu.foto" class="rounded-circle object-fit-cover shadow-sm border border-2 border-white" width="55" height="55">
                      <div v-else class="rounded-circle shadow-sm border border-2 border-white bg-white d-flex align-items-center justify-content-center text-secondary" style="width: 55px; height: 55px;">
                        <i class="fas fa-user fa-lg"></i>
                      </div>
                      
                      <div class="flex-grow-1 overflow-hidden">
                        <h6 class="mb-0 fw-bold text-truncate" :title="stu.nombreCompleto">{{ stu.nombreCompleto }}</h6>
                        <small class="text-muted font-monospace">{{ stu.matricula }}</small>
                        <p class="mb-0 mt-1 small text-danger fw-semibold text-truncate" v-if="stu.observaciones"><i class="fas fa-exclamation-circle me-1"></i>{{ stu.observaciones }}</p>
                      </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 d-flex justify-content-end p-2 gap-2">
                      <button class="btn btn-sm btn-white text-danger fw-semibold rounded-pill shadow-sm" @click="removeStudent(stu.matricula)" v-if="authStore.hasAdminAccess">
                        <i class="fas fa-trash-alt"></i> Quitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB: ADD STUDENTS -->
        <div v-if="activeTab === 'add'">
          <div class="position-relative mb-4" style="max-width: 600px; margin: 0 auto;">
            <i class="fas fa-search position-absolute text-muted fa-lg" style="left: 20px; top: 16px;"></i>
            <input type="text" class="form-control form-control-lg rounded-pill ps-5 bg-light border-0 shadow-sm" placeholder="Buscar por nombre o matrícula global..." v-model="searchAdd">
          </div>
          
          <div class="row g-3" v-if="addSearchResults.length > 0">
            <div class="col-md-6 col-lg-4" v-for="stu in addSearchResults" :key="stu.matricula">
              <div class="card h-100 border rounded-4 shadow-sm" :style="{ borderColor: currentTheme.color + '40' }">
                <div class="card-body d-flex align-items-center gap-3 p-3">
                  <img v-if="stu.foto" :src="stu.foto" class="rounded-circle object-fit-cover border" width="50" height="50">
                  <div v-else class="rounded-circle border bg-light d-flex align-items-center justify-content-center text-secondary" style="width: 50px; height: 50px;">
                    <i class="fas fa-user"></i>
                  </div>
                  
                  <div class="flex-grow-1 overflow-hidden">
                    <h6 class="mb-0 fw-bold text-truncate">{{ stu.nombreCompleto }}</h6>
                    <small class="text-muted">{{ stu.nivel }} | {{ stu.grado }} | {{ stu.matricula }}</small>
                  </div>
                </div>
                <div class="card-footer bg-transparent border-0 pt-0">
                  <button class="btn w-100 rounded-pill fw-semibold shadow-sm text-white" :style="{ background: currentTheme.color }" @click="addStudentDialog(stu)">
                    <i class="fas fa-plus me-1"></i> Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="searchAdd.length > 2" class="text-center p-5 text-muted">
            <i class="fas fa-frown fa-3x mb-3 opacity-25"></i>
            <h5>No se encontraron resultados para "{{ searchAdd }}".</h5>
          </div>
          <div v-else class="text-center p-5 text-muted bg-light rounded-4 border border-dashed">
            <i class="fas fa-search fa-3x mb-3 opacity-25"></i>
            <h5>Escribe al menos 3 letras para buscar un alumno globalmente</h5>
          </div>
        </div>

        <!-- TAB: ATTENDANCE -->
        <div v-if="activeTab === 'attendance'">
          <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-4 border border-success border-opacity-25">
            <div>
              <h5 class="mb-0 fw-bold text-success"><i class="fas fa-calendar-day me-2"></i> Asistencia de Hoy</h5>
              <small class="text-muted">Haz clic sobre un alumno para marcarlo como presente.</small>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-success rounded-pill fw-semibold px-4" @click="toggleSelectAll">
                <i class="fas" :class="allSelected ? 'fa-check-square' : 'fa-square'"></i> {{ allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo' }}
              </button>
              <button class="btn btn-success rounded-pill fw-bold px-4 shadow-sm" @click="recordSelectedAttendance" :disabled="selectedForAttendance.length === 0">
                <i class="fas fa-save me-1"></i> Guardar ({{ selectedForAttendance.length }})
              </button>
            </div>
          </div>
          
          <div class="row g-3">
            <div class="col-6 col-md-3 col-lg-2" v-for="stu in flatStudents" :key="stu.matricula">
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

        <!-- TAB: HISTORY -->
        <div v-if="activeTab === 'history'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-dark">Historial Mensual</h5>
            <button class="btn btn-outline-success rounded-pill fw-semibold" @click="exportAttendanceToExcel">
              <i class="fas fa-file-excel me-1"></i> Exportar Asistencia
            </button>
          </div>
          <div class="table-responsive border rounded-4 shadow-sm" style="max-height: 600px;">
            <table class="table table-hover table-bordered mb-0 text-center align-middle" style="font-size: 0.85rem;">
              <thead class="table-light position-sticky top-0 z-2 shadow-sm">
                <tr>
                  <th class="text-start position-sticky start-0 bg-light z-3" style="min-width: 250px;">Estudiante</th>
                  <th v-for="day in daysInMonth" :key="day" style="min-width: 40px;" class="fw-bold text-secondary">{{ day }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stu in flatStudents" :key="stu.matricula">
                  <td class="text-start position-sticky start-0 bg-white fw-semibold z-1 border-end">
                    {{ stu.nombreCompleto }} <br>
                    <small class="text-muted fw-normal font-monospace">{{ stu.matricula }}</small>
                  </td>
                  <td v-for="day in daysInMonth" :key="day" class="p-1">
                    <div v-if="hasAttendedOnDay(stu.matricula, day)" class="bg-success rounded-circle mx-auto d-flex align-items-center justify-content-center text-white shadow-sm" style="width: 22px; height: 22px; font-size: 0.65rem;">
                      <i class="fas fa-check"></i>
                    </div>
                    <div v-else class="text-muted opacity-25 fw-light">-</div>
                  </td>
                </tr>
                <tr v-if="flatStudents.length === 0">
                  <td :colspan="daysInMonth.length + 1" class="py-5 text-muted">No hay estudiantes en este servicio para mostrar historial.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB: SCHEDULED (Telegram) -->
        <div v-if="activeTab === 'scheduled'">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold text-dark mb-0"><i class="fab fa-telegram-plane text-info me-2"></i>Envíos Programados de Telegram</h5>
            <button class="btn text-white rounded-pill px-4 shadow-sm fw-semibold" style="background-color: #0088cc;" @click="scheduleMessageModal" :disabled="!authStore.hasAdminAccess">
              <i class="fas fa-plus me-1"></i> Programar Nuevo Envío
            </button>
          </div>

          <div class="row g-3" v-if="scheduledJobs.length > 0">
            <div class="col-md-6" v-for="job in scheduledJobs" :key="job.id">
              <div class="card h-100 border-0 rounded-4 shadow-sm border-start border-4" :class="job.status === 'active' ? 'border-success' : 'border-warning'">
                <div class="card-body p-4">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 class="fw-bold text-dark mb-1"><i class="fas fa-clock me-2 text-info"></i>{{ job.scheduled_time }}</h4>
                      <small class="text-muted font-monospace"><i class="fas fa-arrow-right me-1"></i> {{ job.chatId }}</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm rounded-circle" :class="job.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'" @click="toggleJobStatus(job)">
                        <i class="fas" :class="job.status === 'active' ? 'fa-pause' : 'fa-play'"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger rounded-circle" @click="deleteJob(job.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div class="d-flex gap-2 mb-3">
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center" style="width:30px; height:30px; background-color: #0088cc;" v-if="job.days.includes('monday')">L</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center border text-muted" style="width:30px; height:30px;" v-else>L</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center" style="width:30px; height:30px; background-color: #0088cc;" v-if="job.days.includes('tuesday')">M</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center border text-muted" style="width:30px; height:30px;" v-else>M</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center" style="width:30px; height:30px; background-color: #0088cc;" v-if="job.days.includes('wednesday')">X</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center border text-muted" style="width:30px; height:30px;" v-else>X</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center" style="width:30px; height:30px; background-color: #0088cc;" v-if="job.days.includes('thursday')">J</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center border text-muted" style="width:30px; height:30px;" v-else>J</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center" style="width:30px; height:30px; background-color: #0088cc;" v-if="job.days.includes('friday')">V</span>
                    <span class="badge rounded-circle d-flex align-items-center justify-content-center border text-muted" style="width:30px; height:30px;" v-else>V</span>
                  </div>
                  
                  <p class="small text-muted bg-light p-2 rounded mb-0 text-truncate" :title="job.message">{{ job.message }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
            <i class="fab fa-telegram-plane fa-3x mb-3 opacity-25" style="color: #0088cc;"></i>
            <h5>No hay envíos automáticos de Telegram programados para este servicio.</h5>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import Swal from 'sweetalert2'
import { exportToExcel, base64ToFile } from '../utils/export'
import { logger } from '../utils/logger'
import { getPlantelTheme, getServiceIcon } from '../utils/theme'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const plantel = ref(route.params.plantel || null)
const servicio = ref(route.params.servicio || null)
const activeTab = ref('current')
const showAllServices = ref(false)
const isGrouped = ref(false)

const searchCurrent = ref('')
const searchAdd = ref('')

const globalData = ref({})
const allStudentsList = ref([]) 
const attendanceMap = ref({}) 
const scheduledJobs = ref([])

// Constants
const allowedPlanteles = ["PREET", "PREEM", "PT", "PM", "ST", "SM", "ISM", "DM", "CM", "CT"]
const allServiciosList = [
    "DESAYUNO", "COMIDA", "CENA", "BIBERÓN", "PAPILLA", "FÚTBOL", "TAE KWON DO", "BE AN ARTIST",
    "JAZZ", "BALLET", "DANZA ÁRABE", "ENSAMBLE MUSICAL", "TENNIS", "BASQUETBOL", "TOCHO BANDERA",
    "TECLADO", "TEATRO MUSICAL", "AJEDREZ", "VOLEIBOL", "GIMNASIA", "TE 0.5H", "TE 1H", "TE 1.5H",
    "TE 2H", "TE 2.5H", "TE 3H", "TE 3.5H", "TE 4H", "CLUB DE TAREAS", "DISEÑO GRÁFICO", "HUSKY BAND",
    "ROBÓTICA", "AJEDREZ (4 DÍAS)", "BE AN ARTIST (4 DÍAS)", "JAZZ REPRESENTATIVO (4 DÍAS)",
    "TRANSPORTE REDONDO R1", "TRANSPORTE REDONDO R2", "TRANSPORTE SENCILLO R1", "INGLÉS", "FRANCÉS", "CATECISMO"
]

// Computed Props
const currentTheme = computed(() => getPlantelTheme(plantel.value))

const filteredServices = computed(() => {
  let list = allServiciosList
  if (['PM', 'PT', 'SM', 'ST'].includes(plantel.value)) {
    list = list.filter(s => s !== 'BIBERÓN' && s !== 'PAPILLA')
  }
  if (showAllServices.value) return list
  return list.filter(s => getStudentCount(s) > 0)
})

const flatStudents = computed(() => {
  if (!globalData.value[plantel.value] || !globalData.value[plantel.value][servicio.value]) return []
  return globalData.value[plantel.value][servicio.value]
})

const groupedCurrentStudents = computed(() => {
  if (isGrouped.value && ['PM', 'PT'].includes(plantel.value)) {
    return groupByThreeGroups(flatStudents.value)
  }
  return groupByLevelGradeGroup(flatStudents.value)
})

const filteredGroupedCurrent = computed(() => {
  if (!searchCurrent.value) return groupedCurrentStudents.value
  const query = searchCurrent.value.toLowerCase()
  const filteredFlat = flatStudents.value.filter(s => 
    (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(query)) || 
    (s.matricula && s.matricula.toLowerCase().includes(query))
  )
  if (isGrouped.value && ['PM', 'PT'].includes(plantel.value)) return groupByThreeGroups(filteredFlat)
  return groupByLevelGradeGroup(filteredFlat)
})

const filteredGroupedCurrentKeys = computed(() => Object.keys(filteredGroupedCurrent.value))

const addSearchResults = computed(() => {
  const query = searchAdd.value.toLowerCase()
  if (query.length < 3) return []
  return allStudentsList.value.filter(s => 
    (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(query)) || 
    (s.matricula && s.matricula.toLowerCase().includes(query))
  ).slice(0, 20) 
})

const daysInMonth = computed(() => {
  const date = new Date()
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({length: d}, (_, i) => i + 1)
})

// Navigation
const handleRestrictedTab = (tab) => {
  if (tab === 'add' && !authStore.hasAdminAccess) {
    Swal.fire('Acceso Restringido', 'Necesitas iniciar sesión con cuenta administrativa.', 'warning')
    return
  }
  activeTab.value = tab
}

const selectPlantel = (p) => { plantel.value = p; router.push(`/admin/${p}`); fetchData(); }
const selectServicio = (s) => { servicio.value = s; router.push(`/admin/${plantel.value}/${s}`); fetchAttendance(); fetchJobs(); }
const goBackToPlanteles = () => { plantel.value = null; router.push('/admin'); }
const goBackToServices = () => { servicio.value = null; activeTab.value = 'current'; router.push(`/admin/${plantel.value}`); }

// Data Fetching
const fetchData = async () => {
  if (!plantel.value) return
  loading.value = true
  try {
    logger.api(`Fetching roster for ${plantel.value}`);
    const res = await axios.get(`https://matricula.casitaapps.com/fetch-servicios-data?plantel=${plantel.value}`)
    globalData.value = res.data
    
    const all = Object.values(res.data[plantel.value] || {}).flat().filter(s => s)
    allStudentsList.value = Array.from(new Map(all.map(s => [s.matricula, s])).values())

    if (servicio.value) {
      fetchAttendance()
      fetchJobs()
    }
  } catch (e) {
    logger.error('Failed to fetch data', e)
    Swal.fire('Error', 'Fallo al obtener datos del plantel', 'error')
  } finally { loading.value = false }
}

const fetchAttendance = async () => {
  if (!servicio.value || flatStudents.value.length === 0) return
  const payload = flatStudents.value.map(s => ({ matricula: s.matricula, servicio: servicio.value }))
  try {
    const res = await axios.post('https://bot.casitaapps.com/get-monthly-attendance-bulk', { students: payload })
    attendanceMap.value = res.data.attendanceData || {}
  } catch (e) { logger.error("Attendance fetch error", e) }
}

const fetchJobs = async () => {
  try {
    const res = await axios.get('https://bot.casitaapps.com/jobs')
    scheduledJobs.value = res.data.filter(j => j.message.includes(plantel.value) && j.message.includes(servicio.value))
  } catch (e) { logger.error("Jobs fetch error", e) }
}

// Logic Helpers
const getStudentCount = (srv) => {
  if (!globalData.value[plantel.value] || !globalData.value[plantel.value][srv]) return 0
  return new Set(globalData.value[plantel.value][srv].map(s => s.matricula)).size
}

const groupByLevelGradeGroup = (students) => {
  if (!students) return {}
  return students.reduce((acc, s) => {
    const nivel = s.nivel || "Sin Nivel"
    const gg = `${s.grado || "Sin"} - Grupo ${s.grupo || "-"}`
    if (!acc[nivel]) acc[nivel] = {}
    if (!acc[nivel][gg]) acc[nivel][gg] = []
    acc[nivel][gg].push(s)
    return acc
  }, {})
}

const groupByThreeGroups = (students) => {
  if (!students) return {}
  return students.reduce((acc, s) => {
    const grado = s.grado ? s.grado.toLowerCase() : "sin asignar"
    const gg = `${s.grado || "Sin"} - Grupo ${s.grupo || "-"}`
    let key = null
    if (['primero', 'segundo'].includes(grado)) key = 'Primero y Segundo'
    else if (['tercero', 'cuarto'].includes(grado)) key = 'Tercero y Cuarto'
    else if (['quinto', 'sexto'].includes(grado)) key = 'Quinto y Sexto'
    else key = 'Otros'

    if (!acc[key]) acc[key] = {}
    if (!acc[key][gg]) acc[key][gg] = []
    acc[key][gg].push(s)
    return acc
  }, {})
}

// Mutations
const addStudentDialog = (student) => {
  let notas = ''
  Swal.fire({
    title: `¿Agregar a ${student.nombreCompleto}?`,
    html: `<div class="text-start"><label class="fw-bold mb-2 text-dark">Observaciones:</label><textarea id="notas_swal" class="form-control bg-light" rows="3" placeholder="Escribe aquí..."></textarea></div>`,
    showDenyButton: true, showCancelButton: true,
    confirmButtonText: 'Por Contrato', confirmButtonColor: '#2D7D46',
    denyButtonText: 'Eventual', denyButtonColor: '#f59e0b',
    cancelButtonText: 'Cancelar',
    preConfirm: () => { notas = document.getElementById('notas_swal').value; return 0; },
    preDeny: () => { notas = document.getElementById('notas_swal').value; return 1; }
  }).then((res) => {
    if (res.isConfirmed || res.isDenied) submitAddStudent(student, res.isConfirmed ? 0 : 1, notas)
  })
}

const submitAddStudent = async (student, eventual, notas) => {
  loading.value = true
  try {
    await axios.post('https://bot.casitaapps.com/add-student', { plantel: plantel.value, servicio: servicio.value, matricula: student.matricula, eventual, notas })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agregado', showConfirmButton: false, timer: 2000 })
    fetchData()
  } catch (e) {
    logger.error('Add student failed', e)
    Swal.fire('Error', 'Fallo al agregar estudiante', 'error')
  } finally { loading.value = false }
}

const removeStudent = async (matricula) => {
  const conf = await Swal.fire({ title: '¿Quitar del taller?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, quitar', confirmButtonColor: '#ef4444' })
  if (!conf.isConfirmed) return

  loading.value = true
  try {
    await axios.post('https://bot.casitaapps.com/remove-student', { servicio: servicio.value, matricula })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 2000 })
    fetchData()
  } catch (e) { logger.error('Remove student failed', e); Swal.fire('Error', 'Fallo al eliminar', 'error') }
  finally { loading.value = false }
}

// Attendance
const selectedForAttendance = ref([])
const allSelected = ref(false)

const toggleAttendanceSelection = (matricula) => {
  const idx = selectedForAttendance.value.indexOf(matricula)
  if (idx > -1) selectedForAttendance.value.splice(idx, 1)
  else selectedForAttendance.value.push(matricula)
  allSelected.value = selectedForAttendance.value.length === flatStudents.value.length
}

const toggleSelectAll = () => {
  if (allSelected.value) selectedForAttendance.value = []
  else selectedForAttendance.value = flatStudents.value.map(s => s.matricula)
  allSelected.value = !allSelected.value
}

const recordSelectedAttendance = async () => {
  loading.value = true
  try {
    await axios.post('https://bot.casitaapps.com/record-attendance-bulk', { matriculas: selectedForAttendance.value, servicio: servicio.value })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asistencia Guardada', showConfirmButton: false, timer: 2000 })
    selectedForAttendance.value = []
    allSelected.value = false
    fetchAttendance()
  } catch (e) { Swal.fire('Error', 'No se guardó asistencia', 'error') }
  finally { loading.value = false }
}

const hasAttendedToday = (matricula) => hasAttendedOnDay(matricula, new Date().getDate())
const hasAttendedOnDay = (matricula, day) => {
  const key = `${matricula}-${servicio.value}`
  const arr = attendanceMap.value[key]
  return arr && arr.map(Number).includes(Number(day))
}

// Exports
const exportCurrentData = () => {
  const data = flatStudents.value.map(s => ({ Nombre: s.nombreCompleto, Matricula: s.matricula, Nivel: s.nivel, Grado: s.grado, Grupo: s.grupo, TelefonoMadre: s.telefonoMadre, TelefonoPadre: s.telefonoPadre }))
  exportToExcel(data, `Lista_${servicio.value}_${plantel.value}.xlsx`)
}

const exportAttendanceToExcel = () => {
  const data = flatStudents.value.map(s => {
    const row = { Nombre: s.nombreCompleto, Matricula: s.matricula, Servicio: s.servicio }
    daysInMonth.value.forEach(day => { row[`Día ${day}`] = hasAttendedOnDay(s.matricula, day) ? 'X' : '' })
    return row
  })
  exportToExcel(data, `Asistencia_${servicio.value}_${plantel.value}.xlsx`)
}

// Telegram Integration
const openTelegramFlow = async (nivel) => {
  try {
    const savedContactsStr = localStorage.getItem('telegramContacts')
    const savedContacts = savedContactsStr ? JSON.parse(savedContactsStr) : {}

    const contactChoice = await Swal.fire({
      title: 'Seleccione Chat de Telegram',
      input: 'select',
      inputOptions: { 'new': '+ Nuevo ID de Chat', ...savedContacts },
      showCancelButton: true, confirmButtonText: 'Siguiente', cancelButtonText: 'Cancelar',
      inputValidator: (val) => !val && 'Debe seleccionar una opción'
    })

    if (!contactChoice.isConfirmed) return

    let chatId = contactChoice.value === 'new' 
      ? await promptNewTelegramContact(savedContacts) 
      : contactChoice.value

    if (!chatId) return

    const fmtRes = await Swal.fire({
      title: 'Formato', text: 'Elige el formato del envío a Telegram:',
      showDenyButton: true, showCancelButton: true,
      confirmButtonText: 'Texto (Lista)', denyButtonText: 'Enviar Archivo Excel', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0088cc', denyButtonColor: '#28a745'
    })

    if (fmtRes.isConfirmed) {
      loading.value = true;
      const msg = generateTelegramMessage(nivel, true)
      await axios.post('https://tgbot.casitapps.com/sendMessages', { chatId: [chatId], message: msg })
      Swal.fire('Enviado', 'Mensaje de Telegram enviado.', 'success')
      loading.value = false;
    } else if (fmtRes.isDenied) {
      exportAndSendFileTelegram(nivel, [chatId])
    }
  } catch (e) {
    loading.value = false;
    logger.error('Telegram Error', e)
    Swal.fire('Error', 'Fallo al procesar envío por Telegram', 'error')
  }
}

const promptNewTelegramContact = async (contactsMap) => {
  const chatRes = await Swal.fire({
    title: 'ID de Chat Telegram', input: 'text', inputPlaceholder: 'Ej: -1001234567890', showCancelButton: true
  })
  if (!chatRes.isConfirmed || !chatRes.value) return null

  const nameRes = await Swal.fire({
    title: 'Guardar como', input: 'text', showCancelButton: true, confirmButtonText: 'Guardar'
  })
  
  if (nameRes.isConfirmed && nameRes.value) {
    contactsMap[chatRes.value] = nameRes.value
    localStorage.setItem('telegramContacts', JSON.stringify(contactsMap))
  }
  return chatRes.value
}

const generateTelegramMessage = (nivel, useBullets) => {
  let msg = `*Lista de ${servicio.value} | ${plantel.value}*\n\n`
  const source = nivel === 'Todo' ? filteredGroupedCurrent.value : { [nivel]: filteredGroupedCurrent.value[nivel] }
  for (const [niv, ggObj] of Object.entries(source)) {
    if (!ggObj) continue
    for (const [gg, list] of Object.entries(ggObj)) {
      msg += `*${gg}*\n`
      list.forEach((s, i) => { msg += `${useBullets ? '•' : i+1+'.'} ${s.nombreCompleto}\n` })
      msg += '\n'
    }
  }
  return msg
}

const exportAndSendFileTelegram = async (nivel, chatIds) => {
  loading.value = true;
  try {
    const dataFormat = flatStudents.value.map(s => ({
      Nombre: s.nombreCompleto, Matricula: s.matricula, Nivel: s.nivel, Grado: s.grado, Grupo: s.grupo
    }))
    
    const res = await axios.post('https://bot.casitaapps.com/exportToExcel', dataFormat)
    const file = base64ToFile(res.data, `Lista_${servicio.value}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    const fd = new FormData()
    chatIds.forEach(id => fd.append('chatId[]', id))
    fd.append('file', file, file.name)
    fd.append('message', `Documento adjunto: Lista de ${servicio.value} (${plantel.value})`)
    fd.append('mimetype', file.type)
    fd.append('filename', file.name)

    await axios.post('https://tgbot.casitapps.com/sendMessages', fd, { headers: { 'Content-Type': 'multipart/form-data' }})
    Swal.fire('Archivo Enviado', 'El Excel ha sido enviado a Telegram exitosamente.', 'success')
  } catch(e) {
    logger.error('Failed to send file to telegram', e)
    Swal.fire('Error', 'Fallo al enviar archivo por Telegram', 'error')
  } finally {
    loading.value = false;
  }
}

// Scheduling Telegram
const scheduleMessageModal = async () => {
  Swal.fire('Programación Telegram', 'Flujo de programación hacia TG bot en adaptación.', 'info')
}

const deleteJob = async (id) => {
  if (!(await Swal.fire({title:'¿Eliminar?', icon:'warning', showCancelButton:true})).isConfirmed) return
  await axios.post('https://bot.casitaapps.com/deleteJob', { jobId: id })
  fetchJobs()
}

const toggleJobStatus = async (job) => {
  const endpoint = job.status === 'active' ? 'pauseJob' : 'resumeJob'
  await axios.post(`https://bot.casitaapps.com/${endpoint}`, { jobId: job.id })
  fetchJobs()
}

onMounted(() => { if (plantel.value) fetchData() })
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.hover-card { transition: transform 0.2s, box-shadow 0.2s; }
.hover-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
.attendance-card { transition: all 0.2s; overflow: hidden; }
.attendance-card:hover { transform: scale(1.02); }
.border-transparent { border-color: transparent; }
.filter-drop-shadow { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from, .pop-leave-to { transform: scale(0); opacity: 0; }
</style>