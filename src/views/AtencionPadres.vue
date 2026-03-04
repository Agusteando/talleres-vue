<template>
  <div class="container py-4 position-relative">
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-warning border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- Search View -->
    <div v-if="!showForm" class="text-center animation-fade pt-5">
      <div class="bg-warning bg-opacity-10 text-warning mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
        <i class="fas fa-users fa-2x"></i>
      </div>
      <h2 class="fw-bold text-dark mb-4">Atención a Padres (Fichas)</h2>
      
      <div class="position-relative mx-auto" style="max-width: 600px;">
        <i class="fas fa-search position-absolute text-muted fa-lg" style="left: 20px; top: 20px;"></i>
        <input type="text" class="form-control form-control-lg rounded-pill ps-5 bg-white border border-2 shadow-sm py-3" placeholder="Buscar Alumno..." v-model="searchText">
      </div>

      <div class="list-group mx-auto mt-3 shadow-sm text-start" style="max-width: 600px; max-height: 300px; overflow-y: auto;" v-if="searchText.length > 2">
        <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 border-bottom" v-for="stu in filteredStudents" :key="stu.matricula" @click="selectStudent(stu)">
          <div>
            <h6 class="fw-bold mb-1">{{ stu.nombreCompleto }}</h6>
            <small class="text-muted">{{ stu.plantel }} | {{ stu.matricula }}</small>
          </div>
          <i class="fas fa-chevron-right text-muted opacity-50"></i>
        </button>
        <div v-if="filteredStudents.length === 0" class="p-4 text-center text-muted">No se encontraron alumnos.</div>
      </div>
    </div>

    <!-- Form & Fichas View -->
    <div v-else class="animation-fade bg-white rounded-4 shadow-sm border p-4">
      <button class="btn btn-light rounded-pill px-4 mb-4 shadow-sm fw-semibold border" @click="goBack">
        <i class="fas fa-arrow-left me-2"></i> Volver a Búsqueda
      </button>

      <ul class="nav nav-pills mb-4 gap-2 bg-light p-2 rounded-4 d-inline-flex border">
        <li class="nav-item" v-for="(sib, idx) in siblingsForms" :key="idx">
          <a class="nav-link rounded-pill px-4 fw-semibold cursor-pointer d-flex align-items-center gap-2" :class="{'active bg-warning text-dark': activeIdx === idx, 'text-dark': activeIdx !== idx}" @click="activeIdx = idx">
            <img v-if="sib.foto" :src="sib.foto" class="rounded-circle object-fit-cover border border-white" width="30" height="30">
            <div v-else class="rounded-circle border border-white bg-white d-flex align-items-center justify-content-center text-secondary" style="width: 30px; height: 30px;">
              <i class="fas fa-user small"></i>
            </div>
            {{ sib.nombreCompleto.split(' ')[0] }}
          </a>
        </li>
      </ul>

      <div v-if="siblingsForms[activeIdx]" class="row g-5">
        <div class="col-lg-7 border-end">
          <div class="d-flex align-items-center gap-4 mb-4 pb-3 border-bottom">
            <img v-if="siblingsForms[activeIdx].foto" :src="siblingsForms[activeIdx].foto" class="rounded-circle object-fit-cover shadow-sm border border-3 border-white" width="100" height="100">
            <div v-else class="rounded-circle shadow-sm border border-3 border-white bg-light d-flex align-items-center justify-content-center text-secondary" style="width: 100px; height: 100px;">
              <i class="fas fa-user fa-3x"></i>
            </div>
            <div>
              <h4 class="fw-bold text-dark mb-1">{{ siblingsForms[activeIdx].nombreCompleto }}</h4>
              <p class="text-muted mb-0 font-monospace">{{ siblingsForms[activeIdx].matricula }} | {{ siblingsForms[activeIdx].plantel }}</p>
            </div>
          </div>

          <form @submit.prevent>
            <div class="mb-4 p-3 rounded-4" :class="{'bg-warning bg-opacity-10 border border-warning': siblingsForms[activeIdx].currentStep === 1}">
              <label class="fw-bold mb-3 d-block text-dark">1. Selecciona Servicios Involucrados</label>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn rounded-pill fw-semibold shadow-sm" v-for="srv in siblingsForms[activeIdx].servicios" :key="srv"
                        :class="siblingsForms[activeIdx].selectedServicios.includes(srv) ? 'btn-success' : 'btn-outline-secondary bg-white'"
                        @click="toggleServicio(srv)" :disabled="isReadOnly">
                  {{ srv }}
                </button>
              </div>
            </div>

            <div class="mb-4 p-3 rounded-4 transition-all" :class="{'bg-warning bg-opacity-10 border border-warning': siblingsForms[activeIdx].currentStep === 2, 'opacity-50 pointer-events-none': siblingsForms[activeIdx].currentStep < 2}">
              <label class="fw-bold mb-2 text-dark">2. Motivo de la ficha</label>
              <textarea class="form-control rounded-4 bg-light border-0 p-3" rows="3" v-model="siblingsForms[activeIdx].motivo" placeholder="Mínimo 10 caracteres..." :readonly="isReadOnly" @input="evalSteps"></textarea>
            </div>

            <div class="mb-4 p-3 rounded-4 transition-all" :class="{'bg-warning bg-opacity-10 border border-warning': siblingsForms[activeIdx].currentStep === 3, 'opacity-50 pointer-events-none': siblingsForms[activeIdx].currentStep < 3}">
              <label class="fw-bold mb-2 text-dark">3. Acciones Tomadas</label>
              <textarea class="form-control rounded-4 bg-light border-0 p-3" rows="3" v-model="siblingsForms[activeIdx].acciones" placeholder="Mínimo 10 caracteres..." :readonly="isReadOnly" @input="evalSteps"></textarea>
            </div>

            <button class="btn btn-warning rounded-pill px-5 py-3 fw-bold w-100 shadow" @click="submitForms" :disabled="isReadOnly || !isReadyToSubmit" v-if="!isReadOnly">
              Crear Ficha(s)
            </button>
            <button class="btn btn-outline-secondary w-100 rounded-pill py-2 fw-semibold mt-3" @click="clearFichaSelection" v-if="isReadOnly">
              ← Cancelar visualización y crear nueva
            </button>
          </form>
        </div>

        <div class="col-lg-5">
          <h5 class="fw-bold text-dark mb-4"><i class="fas fa-folder-open text-warning me-2"></i> Historial de Fichas</h5>
          
          <div class="list-group shadow-sm mb-4">
            <button class="list-group-item list-group-item-action p-3" v-for="f in fichas" :key="f.id" @click="selectFicha(f)" :class="{'bg-light border-start border-warning border-4': selectedFicha?.id === f.id}">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-1 text-truncate">{{ f.servicios }}</h6>
                <small class="text-muted">{{ new Date(f.date_created).toLocaleDateString() }}</small>
              </div>
              <p class="small text-muted mb-0 text-truncate">{{ f.motivo }}</p>
            </button>
            <div v-if="fichas.length === 0" class="p-4 text-center text-muted bg-light rounded border border-dashed">
              No hay fichas previas.
            </div>
          </div>

          <div v-if="isViewingFicha" class="animation-fade bg-light p-4 rounded-4 border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">Seguimientos de la ficha</h6>
              <button class="btn btn-sm btn-success rounded-pill fw-semibold" @click="addFollowUpFlow">
                <i class="fas fa-plus"></i> Añadir
              </button>
            </div>
            
            <div class="timeline ps-3 border-start border-success border-2">
              <div class="mb-3 position-relative" v-for="fu in followUps" :key="fu.id">
                <i class="fas fa-circle text-success position-absolute" style="left: -23px; top: 4px; font-size: 0.7rem;"></i>
                <div class="bg-white p-3 rounded-4 shadow-sm border">
                  <h6 class="fw-bold mb-1 text-success">{{ fu.area }}</h6>
                  <p class="small text-muted mb-2">{{ fu.acciones }}</p>
                  <small class="text-muted fst-italic" style="font-size: 0.7rem;">{{ new Date(fu.date_created).toLocaleString() }}</small>
                </div>
              </div>
              <div v-if="followUps.length===0" class="text-muted small ms-2">Sin seguimientos registrados.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { logger } from '../utils/logger'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const showForm = ref(false)
const studentsData = ref([])
const searchText = ref('')

const siblingsForms = ref([])
const activeIdx = ref(0)
const isReadOnly = ref(false)

const fichas = ref([])
const selectedFicha = ref(null)
const isViewingFicha = computed(() => selectedFicha.value !== null)
const followUps = ref([])

onMounted(async () => {
  loading.value = true
  try {
    const res = await axios.get('https://bot.casitaapps.com/fetch-servicios-data-all')
    studentsData.value = Object.values(res.data).flat().map(s => ({
      ...s,
      servicios: s.servicio ? s.servicio.split(',').map(x=>x.trim()) : [],
      selectedServicios: [],
      motivo: '', acciones: '', currentStep: 1
    }))
    
    if (route.params.matricula) {
      const match = studentsData.value.find(x => x.matricula === route.params.matricula)
      if (match) selectStudent(match)
    }
  } catch (e) {
    logger.error('Atencion Data fetch error', e)
  } finally { loading.value = false }
})

const filteredStudents = computed(() => {
  const q = searchText.value.toLowerCase()
  if (q.length < 3) return []
  return studentsData.value.filter(s => s.nombreCompleto.toLowerCase().includes(q))
})

const selectStudent = (stu) => {
  showForm.value = true
  activeIdx.value = 0
  isReadOnly.value = false
  selectedFicha.value = null
  
  const forms = [JSON.parse(JSON.stringify(stu))]
  if (stu.siblings) forms.push(...JSON.parse(JSON.stringify(stu.siblings)))
  
  siblingsForms.value = forms.map(f => ({
    ...f, selectedServicios: [], motivo: '', acciones: '', currentStep: 1
  }))

  loadFichas(stu.matricula)
}

const loadFichas = async (mat) => {
  try {
    const res = await axios.get(`https://bot.casitaapps.com/api/servicios-atencion?matricula=${mat}`)
    fichas.value = res.data
  } catch (e) { logger.error('Fichas error', e) }
}

const toggleServicio = (srv) => {
  if (isReadOnly.value) return
  const sib = siblingsForms.value[activeIdx.value]
  const idx = sib.selectedServicios.indexOf(srv)
  if (idx > -1) sib.selectedServicios.splice(idx, 1)
  else sib.selectedServicios.push(srv)
  evalSteps()
}

const evalSteps = () => {
  const sib = siblingsForms.value[activeIdx.value]
  if (sib.selectedServicios.length > 0 && sib.currentStep < 2) sib.currentStep = 2
  if (sib.motivo.length >= 10 && sib.currentStep < 3) sib.currentStep = 3
  if (sib.acciones.length >= 10 && sib.currentStep < 4) sib.currentStep = 4
}

const isReadyToSubmit = computed(() => {
  if (siblingsForms.value.length === 0) return false
  return siblingsForms.value[0].currentStep >= 4
})

const goBack = () => { showForm.value = false; searchText.value = ''; router.replace('/atencion-padres'); }

const selectFicha = async (f) => {
  selectedFicha.value = f
  isReadOnly.value = true
  
  const sib = siblingsForms.value[activeIdx.value]
  sib.selectedServicios = f.servicios ? f.servicios.split(',').map(x=>x.trim()) : []
  sib.motivo = f.motivo
  sib.acciones = f.acciones
  sib.currentStep = 4

  try {
    const res = await axios.get(`https://bot.casitaapps.com/api/servicios-seguimientos/${f.id}`)
    followUps.value = res.data
  } catch (e) { logger.error('Followups err', e) }
}

const clearFichaSelection = () => {
  selectedFicha.value = null
  isReadOnly.value = false
  followUps.value = []
  const sib = siblingsForms.value[activeIdx.value]
  sib.selectedServicios = []; sib.motivo = ''; sib.acciones = ''; sib.currentStep = 1;
}

const addFollowUpFlow = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Añadir Seguimiento',
    html: `
      <input id="swal-fu-area" class="form-control mb-3" placeholder="Área (ej. Psicología)">
      <textarea id="swal-fu-acc" class="form-control" rows="3" placeholder="Acciones tomadas..."></textarea>
    `,
    focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar',
    preConfirm: () => {
      return [ document.getElementById('swal-fu-area').value, document.getElementById('swal-fu-acc').value ]
    }
  })
  
  if (formValues && formValues[0] && formValues[1].length >= 10) {
    loading.value = true
    try {
      await axios.post('https://bot.casitaapps.com/api/servicios-seguimientos', {
        atencion_id: selectedFicha.value.id, area: formValues[0], acciones: formValues[1]
      })
      Swal.fire({toast:true, icon:'success', title:'Guardado', timer: 2000, showConfirmButton:false})
      selectFicha(selectedFicha.value) 
    } catch (e) { Swal.fire('Error', 'Fallo guardado', 'error') }
    finally { loading.value = false }
  } else if (formValues) {
    Swal.fire('Error', 'Completa los campos. Las acciones deben tener al menos 10 caracteres.', 'warning')
  }
}

const submitForms = async () => {
  const ready = siblingsForms.value.filter(s => s.currentStep >= 4)
  if (ready.length === 0) return Swal.fire('Incompleto', 'Termina el formulario principal.', 'warning')
  
  const payload = ready.map(s => ({
    matricula: s.matricula, nombre_alumno: s.nombreCompleto, servicios: s.selectedServicios.join(', '),
    motivo: s.motivo, acciones: s.acciones, plantel: s.plantel, area: 'Artes y Deportes'
  }))

  loading.value = true
  try {
    await Promise.all(payload.map(p => axios.post('https://bot.casitaapps.com/api/servicios-atencion', p)))
    Swal.fire('Éxito', 'Ficha(s) creadas exitosamente', 'success')
    goBack()
  } catch (e) {
    Swal.fire('Error', 'Fallo al guardar en DB', 'error')
  } finally { loading.value = false }
}
</script>

<style scoped>
.animation-fade { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.3s ease; }
.pointer-events-none { pointer-events: none; }
</style>