<template>
  <div class="overview-view py-4">
    
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-success border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- Header & Date Stepper -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 p-4 rounded-4 shadow-sm border text-white" :style="{ background: currentTheme.gradient }">
      <div>
        <h2 class="fw-bold mb-1"><i class="fas fa-chart-pie me-2"></i> Visión Global <span v-if="currentPlantel">- {{ currentPlantel }}</span></h2>
        <p class="mb-0 opacity-75">Monitoreo de métricas y rendimiento extracurriculares</p>
      </div>
      
      <div class="d-flex align-items-center bg-white bg-opacity-25 rounded-pill p-1 border border-white border-opacity-50 shadow-sm mt-3 mt-md-0">
        <button class="btn btn-sm text-white" @click="prevMonth"><i class="fas fa-chevron-left"></i></button>
        <span class="fw-bold px-3 text-white" style="min-width: 120px; text-align: center;">{{ monthLabel }} {{ selectedYear }}</span>
        <button class="btn btn-sm text-white" @click="nextMonth" :disabled="isNextMonthDisabled"><i class="fas fa-chevron-right"></i></button>
        <div class="vr bg-white opacity-50 mx-2"></div>
        <button class="btn btn-light rounded-pill px-3 fw-bold text-dark btn-sm shadow-sm" @click="loadAnalytics">
          <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i> Sync
        </button>
      </div>
    </div>

    <div class="mb-4" v-if="viewState !== 'GLOBAL'">
      <button class="btn btn-white shadow-sm rounded-pill px-4 fw-semibold border" @click="goBack">
        <i class="fas fa-arrow-left me-2"></i> {{ viewState === 'PLANTEL' ? 'Volver a Global' : `Volver a Plantel (${currentPlantel})` }}
      </button>
    </div>

    <!-- KPIs -->
    <div class="row g-4 mb-5">
      <div class="col-md-6 col-lg-3">
        <div class="card h-100 border-0 rounded-4 shadow-sm border-start border-4 border-primary">
          <div class="card-body p-4">
            <h6 class="text-muted fw-bold mb-1 text-uppercase small">Total Inscritos</h6>
            <h2 class="fw-bold mb-0 text-dark">{{ kpis.enrolled }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card h-100 border-0 rounded-4 shadow-sm border-start border-4 border-success">
          <div class="card-body p-4">
            <h6 class="text-muted fw-bold mb-1 text-uppercase small">Asistencia Real</h6>
            <h2 class="fw-bold mb-2 text-dark">{{ kpis.attendanceRate.toFixed(1) }}%</h2>
            <div class="progress" style="height: 6px;"><div class="progress-bar bg-success" :style="{ width: kpis.attendanceRate + '%' }"></div></div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card h-100 border-0 rounded-4 shadow-sm border-start border-4 border-warning">
          <div class="card-body p-4">
            <h6 class="text-muted fw-bold mb-1 text-uppercase small">Inasistencia (Faltas)</h6>
            <h2 class="fw-bold mb-0 text-dark">{{ kpis.absenteeism.toFixed(1) }}%</h2>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card h-100 border-0 rounded-4 shadow-sm border-start border-4 border-danger">
          <div class="card-body p-4">
            <h6 class="text-muted fw-bold mb-1 text-uppercase small">Alumnos Riesgo (&lt;70%)</h6>
            <h2 class="fw-bold mb-0 text-dark">{{ kpis.atRisk }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- GLOBAL VIEW -->
    <div v-if="viewState === 'GLOBAL'" class="row g-4 animation-fade">
      <div class="col-lg-8">
        <div class="card border-0 rounded-4 shadow-sm h-100">
          <div class="card-header bg-white border-bottom p-4"><h5 class="fw-bold mb-0 text-dark">Rendimiento por Plantel</h5></div>
          <div class="table-responsive">
            <table class="table table-hover align-middle text-center mb-0">
              <thead class="table-light"><tr><th class="text-start ps-4">Plantel</th><th>Inscritos</th><th class="w-25 text-start">Asistencia</th><th>Evals</th><th class="pe-4">Acción</th></tr></thead>
              <tbody>
                <tr v-for="p in analytics.planteles" :key="p.name">
                  <td class="text-start ps-4 fw-bold">{{ p.name }}</td>
                  <td>{{ p.enrolled }}</td>
                  <td class="text-start">
                    <div class="d-flex justify-content-between small fw-bold mb-1" :class="getColorClassText(p.rate)"><span>{{ p.rate.toFixed(1) }}%</span></div>
                    <div class="progress" style="height: 6px;"><div class="progress-bar rounded-pill" :class="getColorClassBg(p.rate)" :style="{ width: p.rate + '%' }"></div></div>
                  </td>
                  <td class="text-muted">{{ p.evaluated }}</td>
                  <td class="pe-4"><button class="btn btn-sm btn-light rounded-pill px-3 fw-semibold border" @click="setView('PLANTEL', p.name)">Analizar <i class="fas fa-arrow-right ms-1"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 rounded-4 shadow-sm h-100">
          <div class="card-header bg-white border-bottom p-4"><h5 class="fw-bold mb-0 text-dark">Top Servicios</h5></div>
          <div class="list-group list-group-flush">
            <div class="list-group-item p-3 d-flex justify-content-between align-items-center" v-for="s in topServicios" :key="s.name">
              <div class="text-truncate flex-grow-1 pe-3">
                <i class="fas fa-arrow-up text-success me-2"></i><span class="fw-bold text-dark">{{ s.name }}</span>
                <div class="small text-muted">{{ s.plantel }}</div>
              </div>
              <span class="badge rounded-pill px-3 py-2" :class="getColorClassBg(s.rate)">{{ s.rate.toFixed(1) }}%</span>
            </div>
            <div v-if="topServicios.length === 0" class="text-center p-4 text-muted">Datos insuficientes.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- PLANTEL VIEW -->
    <div v-if="viewState === 'PLANTEL'" class="animation-fade">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold text-dark mb-0">Servicios de {{ currentPlantel }}</h4>
        <input type="text" class="form-control rounded-pill w-25 bg-white shadow-sm border-0 px-4 py-2" placeholder="Filtrar..." v-model="searchSrv">
      </div>
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="s in plantelServicios" :key="s.name">
          <div class="card h-100 border-0 rounded-4 shadow-sm hover-card cursor-pointer" @click="setView('SERVICIO', currentPlantel, s.name)">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark text-truncate mb-3"><i class="fas me-2 text-muted" :class="getServiceIcon(s.name)"></i>{{ s.name }}</h5>
              <div class="d-flex justify-content-between small fw-bold mb-1" :class="getColorClassText(s.rate)">
                <span class="text-muted">Tasa Real</span><span>{{ s.rate.toFixed(1) }}%</span>
              </div>
              <div class="progress mb-4" style="height: 6px;">
                <div class="progress-bar rounded-pill" :class="getColorClassBg(s.rate)" :style="{ width: s.rate + '%' }"></div>
              </div>
              <div class="d-flex justify-content-between pt-3 border-top small text-muted">
                <span><i class="fas fa-users text-primary me-1"></i> <strong>{{ s.enrolled }}</strong> Inscritos</span>
                <span><i class="fas fa-check-square text-success me-1"></i> <strong>{{ s.evaluated }}</strong> Evals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SERVICIO DETAIL VIEW -->
    <div v-if="viewState === 'SERVICIO'" class="animation-fade card border-0 rounded-4 shadow-sm overflow-hidden">
      <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h4 class="fw-bold text-dark mb-0"><i class="fas me-2" :class="getServiceIcon(currentServicio)" :style="{ color: currentTheme.color }"></i>{{ currentServicio }}</h4>
        <button class="btn btn-success rounded-pill fw-semibold px-4" @click="exportCSV"><i class="fas fa-file-csv me-2"></i> CSV</button>
      </div>
      <div class="bg-light p-2 border-bottom d-flex gap-3 justify-content-center small fw-semibold">
        <span class="text-muted">Leyenda de Celda:</span>
        <span class="text-success"><i class="fas fa-square me-1"></i> Presente</span>
        <span class="text-danger"><i class="fas fa-square me-1"></i> Ausente</span>
        <span class="text-secondary"><i class="far fa-square me-1"></i> Sin Evaluar</span>
      </div>
      <div class="table-responsive" style="max-height: 650px;">
        <table class="table table-hover align-middle text-center mb-0 table-bordered border-light" style="font-size: 0.85rem;">
          <thead class="table-light position-sticky top-0 z-2 shadow-sm">
            <tr>
              <th class="text-start position-sticky start-0 bg-light z-3" style="min-width: 220px;">Estudiante</th>
              <th style="min-width: 90px;">% Asist</th>
              <th v-for="d in workingDays" :key="d" style="min-width: 40px;" :class="{'text-primary text-decoration-underline': d === today && isCurrentMonth}">{{ d }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stu in currentServicioStudents" :key="stu.matricula">
              <td class="text-start position-sticky start-0 bg-white fw-semibold shadow-sm z-1 border-end">
                <div class="text-truncate text-dark" style="max-width: 200px;" :title="stu.nombreCompleto">{{ stu.nombreCompleto }}</div>
                <div class="text-muted small fw-normal">{{ stu.grado }} {{ stu.grupo }}</div>
              </td>
              <td class="fw-bold" :class="getColorClassText(stu.analytics.rate)">{{ stu.analytics.evaluated > 0 ? stu.analytics.rate.toFixed(0) + '%' : '-' }}</td>
              <td v-for="d in workingDays" :key="d" class="p-0 cursor-pointer cell-hover" :class="getCellClass(stu.matricula, d)" @click="toggleAttendance(stu, d)"></td>
            </tr>
          </tbody>
        </table>
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
const viewState = ref('GLOBAL')
const currentPlantel = ref(null)
const currentServicio = ref(null)
const searchSrv = ref('')

const masterData = ref({})
const flatStudents = ref([])
const attendanceMap = ref({}) 
const evaluatedServiceDays = ref(new Set()) // Tracks evaluated days per service

const todayObj = new Date()
const selectedMonth = ref(todayObj.getMonth() + 1)
const selectedYear = ref(todayObj.getFullYear())
const today = todayObj.getDate()

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const monthLabel = computed(() => months[selectedMonth.value - 1])
const isCurrentMonth = computed(() => selectedMonth.value === todayObj.getMonth() + 1 && selectedYear.value === todayObj.getFullYear())
const isNextMonthDisabled = computed(() => selectedYear.value > todayObj.getFullYear() || (selectedYear.value === todayObj.getFullYear() && selectedMonth.value >= todayObj.getMonth() + 1))
const currentTheme = computed(() => getPlantelTheme(viewState.value === 'GLOBAL' ? null : currentPlantel.value))

const workingDays = computed(() => {
  const arr = []
  const d = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  for (let i = 1; i <= d; i++) {
    const wd = new Date(selectedYear.value, selectedMonth.value - 1, i).getDay()
    if (wd !== 0 && wd !== 6) arr.push(i) 
  }
  return arr
})

const isFutureDate = (day) => {
  if (selectedYear.value > todayObj.getFullYear()) return true
  if (selectedYear.value === todayObj.getFullYear() && selectedMonth.value > todayObj.getMonth() + 1) return true
  if (isCurrentMonth.value && day > today) return true
  return false
}

const analytics = ref({ planteles: [], servicios: [] })
const currentServicioStudents = ref([])
const kpis = ref({ enrolled: 0, evaluated: 0, attendanceRate: 0, absenteeism: 0, atRisk: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get('https://matricula.casitaapps.com/fetch-servicios-data')
    masterData.value = res.data || {}
    
    flatStudents.value = []
    for (const [p, sObj] of Object.entries(masterData.value)) {
      for (const [s, list] of Object.entries(sObj)) {
        list.forEach(stu => {
          stu._plantel = p
          stu._servicio = s
          flatStudents.value.push(stu)
        })
      }
    }
    await loadAnalytics()
  } catch (e) {
    logger.error('Overview fetch failed', e)
  }
}

const loadAnalytics = async () => {
  loading.value = true
  try {
    const res = await axios.get(`https://bot.casitaapps.com/api/analytics/monthly-data?month=${selectedMonth.value}&year=${selectedYear.value}`)
    const raw = res.data.data || []
    
    attendanceMap.value = {}
    const evaluated = new Set()

    raw.forEach(r => {
      // THE FIX: Ignore the DB's default 0. The mere existence of the row means the teacher saved it as PRESENT!
      attendanceMap.value[`${r.matricula}_${r.servicio}_${r.day_of_month}`] = 1 
      
      // Mark this service as having been evaluated on this specific day
      evaluated.add(`${r.servicio}_${r.day_of_month}`)
    })
    
    evaluatedServiceDays.value = evaluated
    processAnalytics()
  } catch (e) {
    logger.error('Analytics load failed', e)
  } finally { loading.value = false }
}

// THE FIX: Smart reading logic to determine the UI state
const getCellState = (mat, srv, day) => {
  const hasRow = attendanceMap.value[`${mat}_${srv}_${day}`] === 1
  if (hasRow) return 1 // Presente (Verde)
  
  const isDayEvaluated = evaluatedServiceDays.value.has(`${srv}_${day}`)
  if (isDayEvaluated) return 0 // Ausente (Rojo) porque el profesor tomó lista pero no lo seleccionó
  
  return -1 // Sin evaluar (Gris)
}

const processAnalytics = () => {
  const aggP = {}, aggS = {}
  let gEnrolled = 0, gEval = 0, gAtt = 0, gRisk = 0

  let targetList = flatStudents.value
  if (viewState.value === 'PLANTEL') targetList = flatStudents.value.filter(s => s._plantel === currentPlantel.value)
  if (viewState.value === 'SERVICIO') {
    targetList = flatStudents.value.filter(s => s._plantel === currentPlantel.value && s._servicio === currentServicio.value)
    currentServicioStudents.value = targetList
  }

  targetList.forEach(s => {
    const p = s._plantel, srv = s._servicio, sKey = `${p}_${srv}`
    if (!aggP[p]) aggP[p] = { name: p, enrolled: 0, evaluated: 0, actualAtt: 0 }
    if (!aggS[sKey]) aggS[sKey] = { name: srv, plantel: p, enrolled: 0, evaluated: 0, actualAtt: 0 }
    
    aggP[p].enrolled++; aggS[sKey].enrolled++; gEnrolled++

    let stuEval = 0, stuAtt = 0
    workingDays.value.forEach(d => {
      if (isFutureDate(d)) return
      
      const state = getCellState(s.matricula, srv, d)
      if (state === 1 || state === 0) { // If Evaluated
        stuEval++; aggP[p].evaluated++; aggS[sKey].evaluated++; gEval++;
        if (state === 1) { stuAtt++; aggP[p].actualAtt++; aggS[sKey].actualAtt++; gAtt++; } // If Present
      }
    })

    const rate = stuEval > 0 ? (stuAtt / stuEval) * 100 : 0
    s.analytics = { evaluated: stuEval, rate }
    if (stuEval > 0 && rate < 70) gRisk++
  })

  const gRate = gEval > 0 ? (gAtt / gEval) * 100 : 0
  kpis.value = { enrolled: gEnrolled, evaluated: gEval, attendanceRate: gRate, absenteeism: gEval > 0 ? 100 - gRate : 0, atRisk: gRisk }

  analytics.value.planteles = Object.values(aggP).map(x => ({ ...x, rate: x.evaluated > 0 ? (x.actualAtt/x.evaluated)*100 : 0 })).sort((a,b)=>b.enrolled-a.enrolled)
  analytics.value.servicios = Object.values(aggS).map(x => ({ ...x, rate: x.evaluated > 0 ? (x.actualAtt/x.evaluated)*100 : 0 }))
}

const toggleAttendance = async (stu, day) => {
  if (isFutureDate(day)) return
  
  const srv = currentServicio.value
  const currentState = getCellState(stu.matricula, srv, day)
  const key = `${stu.matricula}_${srv}_${day}`
  
  let nextStatus;
  if (currentState === 1) {
    // Current is Present -> Make Absent (Delete the row)
    nextStatus = -1 // Assuming backend treats -1 as delete
    delete attendanceMap.value[key]
  } else {
    // Current is Absent or Unevaluated -> Make Present (Create the row)
    nextStatus = 1
    attendanceMap.value[key] = 1
    evaluatedServiceDays.value.add(`${srv}_${day}`) // Force day to be evaluated
  }
  
  processAnalytics() 

  const pad = n => n < 10 ? '0'+n : n
  const dateStr = `${selectedYear.value}-${pad(selectedMonth.value)}-${pad(day)}`

  try {
    await axios.post('https://bot.casitaapps.com/record-attendance', {
      matricula: stu.matricula, servicio: srv, status: nextStatus, targetDate: dateStr
    })
  } catch(e) {
    Swal.fire({toast:true, position:'top', icon:'error', title:'Error sync', showConfirmButton:false, timer:2000})
    loadAnalytics() 
  }
}

const topServicios = computed(() => analytics.value.servicios.filter(s => s.evaluated > 0).sort((a,b)=>b.rate-a.rate).slice(0, 5))
const plantelServicios = computed(() => analytics.value.servicios.filter(s => s.plantel === currentPlantel.value && s.name.toLowerCase().includes(searchSrv.value.toLowerCase())).sort((a,b)=>b.enrolled-a.enrolled))

const setView = (lvl, p=null, s=null) => { viewState.value = lvl; if(p) currentPlantel.value = p; if(s) currentServicio.value = s; searchSrv.value = ''; processAnalytics(); }
const goBack = () => { viewState.value = viewState.value === 'SERVICIO' ? 'PLANTEL' : 'GLOBAL'; processAnalytics(); }

const prevMonth = () => { selectedMonth.value--; if (selectedMonth.value < 1) { selectedMonth.value = 12; selectedYear.value--; } loadAnalytics(); }
const nextMonth = () => { if (isNextMonthDisabled.value) return; selectedMonth.value++; if (selectedMonth.value > 12) { selectedMonth.value = 1; selectedYear.value++; } loadAnalytics(); }

const getColorClassText = (r) => { if(r === 0) return 'text-muted'; if(r>=90) return 'text-success'; if(r>=70) return 'text-warning'; return 'text-danger'; }
const getColorClassBg = (r) => { if(r === 0) return 'bg-secondary opacity-25'; if(r>=90) return 'bg-success'; if(r>=70) return 'bg-warning'; return 'bg-danger'; }

const getCellClass = (mat, day) => {
  if (isFutureDate(day)) return 'bg-light cell-disabled opacity-50'
  const state = getCellState(mat, currentServicio.value, day)
  if (state === 1) return 'bg-success bg-opacity-25'
  if (state === 0) return 'bg-danger bg-opacity-25'
  return 'bg-white' // state === -1 (Sin evaluar)
}

const exportCSV = () => {
  let csv = "Matricula,Alumno,Grado,Grupo,Eventual,Asistencia %\r\n"
  currentServicioStudents.value.forEach(s => {
    csv += `${s.matricula},"${s.nombreCompleto}",${s.grado},${s.grupo},${s.eventual==1?'SI':'NO'},${s.analytics.evaluated>0?s.analytics.rate.toFixed(1):'N/A'}\r\n`
  })
  const link = document.createElement("a"); link.href = encodeURI("data:text/csv;charset=utf-8,"+csv); link.download = `Data_${currentServicio.value}.csv`; link.click();
}

onMounted(() => fetchData())
</script>

<style scoped>
.hover-card { transition: transform 0.2s, box-shadow 0.2s; }
.hover-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
.cursor-pointer { cursor: pointer; }
.animation-fade { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.cell-hover { transition: background-color 0.2s; }
.cell-hover:hover:not(.cell-disabled) { filter: brightness(0.95); }
.cell-disabled { cursor: not-allowed !important; }
</style>