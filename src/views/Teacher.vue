<template>
  <div class="teacher-view py-4 position-relative">
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-info border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <div class="rounded-4 shadow-sm border p-4 mb-4 text-white" :style="{ background: currentTheme.gradient }">
      <h3 class="fw-bold mb-4 text-white"><i class="fas fa-chalkboard-user me-2"></i> Portal Docente</h3>
      
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label fw-semibold small text-white opacity-75">Plantel</label>
          <select class="form-select rounded-pill border-0 shadow-sm text-dark" v-model="plantel" @change="fetchData">
            <option :value="null">Seleccione Plantel</option>
            <option v-for="p in planteles" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small text-white opacity-75">Grado</label>
          <select class="form-select rounded-pill border-0 shadow-sm text-dark" v-model="selectedGrado" :disabled="!plantel">
            <option :value="null">Todos los Grados</option>
            <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small text-white opacity-75">Grupo</label>
          <select class="form-select rounded-pill border-0 shadow-sm text-dark" v-model="selectedGrupo" :disabled="!selectedGrado">
            <option :value="null">Todos los Grupos</option>
            <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small text-white opacity-75">Servicio Extracurricular</label>
          <select class="form-select rounded-pill border-0 shadow-sm text-dark" v-model="selectedServicio" :disabled="!plantel">
            <option :value="null">Todos los Servicios</option>
            <option v-for="s in servicios" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div class="position-relative w-100" style="max-width: 400px;">
        <i class="fas fa-search position-absolute text-muted" style="left: 15px; top: 12px;"></i>
        <input type="text" class="form-control rounded-pill ps-5 bg-light border-0 py-2" placeholder="Buscar por nombre o matrícula..." v-model="searchText">
      </div>
      <button class="btn text-white rounded-pill px-4 fw-bold shadow-sm" :style="{ background: currentTheme.color }" @click="recordSelectedAttendance" :disabled="selectedStudents.length === 0">
        <i class="fas fa-save me-1"></i> Guardar Asistencia ({{ selectedStudents.length }})
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="filteredStudents.length === 0 && !loading" class="text-center py-5 text-muted bg-white rounded-4 shadow-sm border border-dashed">
      <i class="fas fa-users-slash fa-3x mb-3 opacity-25"></i>
      <h5>Utiliza los filtros arriba para mostrar estudiantes.</h5>
    </div>

    <div class="row g-4" v-else>
      <div class="col-md-6 col-lg-3" v-for="stu in filteredStudents" :key="stu.matricula">
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-card cursor-pointer"
             :style="selectedStudents.includes(stu.matricula) ? { border: `2px solid ${currentTheme.color} !important` } : {}"
             @click="toggleSelection(stu.matricula)">
          
          <div class="text-white text-center py-2 fw-bold small text-truncate px-2" :style="{ background: currentTheme.color }">
            {{ stu.servicios.join(', ') }}
          </div>
          
          <div class="card-body text-center p-4">
            <transition name="pop">
              <div v-if="selectedStudents.includes(stu.matricula) || hasAttendedToday(stu)" class="position-absolute top-50 start-50 translate-middle z-1">
                <i class="fas fa-check-circle text-success opacity-75 drop-shadow" style="font-size: 5rem;"></i>
              </div>
            </transition>

            <img v-if="stu.foto" :src="stu.foto" class="rounded-circle mb-3 object-fit-cover shadow-sm border" width="80" height="80">
            <div v-else class="rounded-circle mb-3 mx-auto shadow-sm border bg-light d-flex align-items-center justify-content-center text-secondary" style="width: 80px; height: 80px;">
              <i class="fas fa-user fa-2x"></i>
            </div>
            
            <h6 class="fw-bold mb-1 text-dark">{{ stu.nombreCompleto }}</h6>
            <div class="small text-muted mb-2 font-monospace">{{ stu.matricula }} | {{ stu.grado }} {{ stu.grupo }}</div>
            
            <p v-if="stu.observaciones" class="small text-danger fw-semibold bg-danger bg-opacity-10 rounded p-1 mb-2">
              <i class="fas fa-exclamation-triangle"></i> {{ stu.observaciones }}
            </p>
            
            <div class="d-flex flex-column gap-1 text-start mt-3 small bg-light p-2 rounded-3 border z-2 position-relative">
              <div class="d-flex justify-content-between align-items-center" v-if="stu.telefonoPadre">
                <span class="text-muted"><i class="fas fa-male me-1" :style="{ color: currentTheme.color }"></i> Padre</span>
                <span class="fw-semibold font-monospace" @click.stop="copyText(stu.telefonoPadre)">{{ stu.telefonoPadre }} <i class="fas fa-copy text-primary ms-1 cursor-pointer"></i></span>
              </div>
              <div class="d-flex justify-content-between align-items-center" v-if="stu.telefonoMadre">
                <span class="text-muted"><i class="fas fa-female me-1" :style="{ color: currentTheme.color }"></i> Madre</span>
                <span class="fw-semibold font-monospace" @click.stop="copyText(stu.telefonoMadre)">{{ stu.telefonoMadre }} <i class="fas fa-copy text-primary ms-1 cursor-pointer"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'
import { getPlantelTheme } from '../utils/theme'

const loading = ref(false)
const planteles = ['PM', 'PT', 'SM', 'ST', 'PREET', 'PREEM','CM','CT','DM','ISM']
const plantel = ref(null)

const students = ref([])
const servicios = ref([])
const grades = ref([])
const groups = ref([])
const attendanceData = ref({})

const selectedGrado = ref(null)
const selectedGrupo = ref(null)
const selectedServicio = ref(null)
const searchText = ref('')
const selectedStudents = ref([])

const currentTheme = computed(() => getPlantelTheme(plantel.value))

const fetchData = async () => {
  if (!plantel.value) return
  loading.value = true
  selectedGrado.value = null
  selectedGrupo.value = null
  selectedServicio.value = null
  
  try {
    const res = await axios.get(`https://matricula.casitaapps.com/fetch-servicios-data?plantel=${plantel.value}`)
    const studentMap = {}
    const srvSet = new Set()

    Object.values(res.data[plantel.value] || {}).flat().forEach(s => {
      if (!studentMap[s.matricula]) studentMap[s.matricula] = { ...s, servicios: [s.servicio] }
      else if (!studentMap[s.matricula].servicios.includes(s.servicio)) studentMap[s.matricula].servicios.push(s.servicio)
      if (s.servicio && s.servicio !== 'Sin asignar') srvSet.add(s.servicio)
    })

    students.value = Object.values(studentMap)
    servicios.value = Array.from(srvSet).sort()
    grades.value = [...new Set(students.value.map(s => s.grado))].sort()
  } catch (e) {
    logger.error('Teacher Fetch Error', e)
    Swal.fire('Error', 'Fallo la carga de datos', 'error')
  } finally { loading.value = false }
}

watch([selectedGrado, selectedServicio], () => {
  const filtered = students.value.filter(s => 
    (!selectedGrado.value || s.grado === selectedGrado.value) &&
    (!selectedServicio.value || s.servicios.includes(selectedServicio.value))
  )
  groups.value = [...new Set(filtered.map(s => s.grupo))].sort()
  if (!groups.value.includes(selectedGrupo.value)) selectedGrupo.value = null
})

const filteredStudents = computed(() => {
  const query = searchText.value.toLowerCase()
  return students.value.filter(s => 
    (!selectedGrado.value || s.grado === selectedGrado.value) &&
    (!selectedGrupo.value || s.grupo === selectedGrupo.value) &&
    (!selectedServicio.value || s.servicios.includes(selectedServicio.value)) &&
    (s.nombreCompleto.toLowerCase().includes(query) || s.matricula.toLowerCase().includes(query))
  )
})

watch(filteredStudents, (newVal) => { if (newVal.length > 0) fetchAttendanceForFiltered() })

const fetchAttendanceForFiltered = async () => {
  if (filteredStudents.value.length === 0) return
  const payload = filteredStudents.value.map(s => ({ matricula: s.matricula, servicio: selectedServicio.value || s.servicios[0] }))
  try {
    const res = await axios.post('https://bot.casitaapps.com/get-attendance-bulk', { students: payload })
    attendanceData.value = res.data.attendanceData || {}
  } catch (e) { logger.error('Attendance fetch failed', e) }
}

const toggleSelection = (mat) => {
  const idx = selectedStudents.value.indexOf(mat)
  if (idx > -1) selectedStudents.value.splice(idx, 1)
  else selectedStudents.value.push(mat)
}

const recordSelectedAttendance = async () => {
  loading.value = true
  const payload = selectedStudents.value.map(mat => {
    const s = students.value.find(x => x.matricula === mat)
    return { matricula: mat, servicio: selectedServicio.value || s.servicios[0] }
  })
  try {
    await axios.post('https://bot.casitaapps.com/record-attendance-bulk-per-student', { students: payload })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asistencia registrada', showConfirmButton: false, timer: 2000 })
    selectedStudents.value = []
    fetchAttendanceForFiltered()
  } catch (e) { Swal.fire('Error', 'Fallo al registrar asistencia', 'error') }
  finally { loading.value = false }
}

const hasAttendedToday = (stu) => {
  const todayStr = String(new Date().getDate())
  const key = `${stu.matricula}-${selectedServicio.value || stu.servicios[0]}`
  const days = attendanceData.value[key] || []
  return days.map(String).includes(todayStr)
}

const copyText = (txt) => {
  navigator.clipboard.writeText(txt)
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copiado', showConfirmButton: false, timer: 1500 })
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.hover-card { transition: transform 0.2s, box-shadow 0.2s; }
.hover-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
.drop-shadow { filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from, .pop-leave-to { transform: scale(0); opacity: 0; }
</style>