<template>
  <div class="menus-view position-relative py-4">
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3">
      <div class="spinner-border text-warning border-4" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>

    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 rounded-4 shadow-sm text-dark bg-white border border-warning border-opacity-50">
      <div>
        <h2 class="fw-bold mb-1"><i class="fas fa-utensils text-warning me-2"></i> Gestión de Menús</h2>
        <p class="mb-0 text-muted">Configura los menús de alimentos que se enviarán a los padres.</p>
      </div>
      <button class="btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm mt-3 mt-md-0 hover-scale" @click="openModal()">
        <i class="fas fa-plus me-1"></i> Añadir Menú
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 rounded-4 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">Tipo de Comida</label>
            <select class="form-select rounded-pill bg-light border-0 shadow-sm" v-model="filterType" @change="loadMenus">
              <option value="">Todos los Tipos</option>
              <option value="DESAYUNO">Desayuno</option>
              <option value="COMIDA">Comida</option>
              <option value="CENA">Cena</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">Desde la fecha</label>
            <input type="date" class="form-control rounded-pill bg-light border-0 shadow-sm" v-model="filterDateStr" @change="loadMenus">
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="row g-4" v-if="menus.length > 0">
      <div class="col-md-6 col-lg-4" v-for="menu in menus" :key="menu.id">
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-card">
          <div class="position-relative bg-light" style="height: 180px;">
            <img v-if="menu.image_url" :src="menu.image_url" class="w-100 h-100 object-fit-cover">
            <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center bg-warning bg-opacity-25 text-warning">
              <i class="fas fa-camera fa-4x opacity-50"></i>
            </div>
            <div class="position-absolute top-0 end-0 m-3">
              <span class="badge rounded-pill shadow-sm" :class="menu.is_active ? 'bg-success' : 'bg-secondary'">
                {{ menu.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white">
              <h5 class="fw-bold mb-0 text-truncate">{{ menu.title }}</h5>
            </div>
          </div>
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-light text-dark border border-secondary shadow-sm px-3 py-2"><i class="fas fa-clock me-1 text-warning"></i> {{ menu.meal_type }}</span>
              <span class="text-muted small fw-bold"><i class="fas fa-calendar-alt me-1"></i> {{ formatDate(menu.meal_date) }}</span>
            </div>
            <p class="text-muted small mb-4 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              {{ menu.description }}
            </p>
            <div class="d-flex justify-content-end gap-2 border-top pt-3">
              <button class="btn btn-sm btn-light text-primary rounded-pill fw-bold border hover-scale" @click="openModal(menu)"><i class="fas fa-pen"></i> Editar</button>
              <button class="btn btn-sm btn-light text-danger rounded-pill fw-bold border hover-scale" @click="deleteMenu(menu.id)"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
      <i class="fas fa-utensils fa-3x text-muted opacity-25 mb-3"></i>
      <h5 class="fw-bold text-dark">No hay menús registrados</h5>
      <p class="text-muted">Ajusta los filtros o añade un nuevo menú para comenzar.</p>
    </div>

    <!-- Create/Edit Modal with Image Drag & Drop -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          <div class="modal-header border-bottom-0 pb-0 bg-light">
            <h5 class="modal-title fw-bold text-dark"><i class="fas fa-utensils text-warning me-2"></i> {{ formData.id ? 'Editar Menú' : 'Nuevo Menú' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          
          <div class="modal-body p-4 bg-light pt-3 custom-scrollbar" style="max-height: 80vh; overflow-y: auto;">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">Fecha</label>
                <input type="date" class="form-control rounded-pill border-0 shadow-sm" v-model="formData.meal_date">
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold text-muted">Tipo</label>
                <select class="form-select rounded-pill border-0 shadow-sm" v-model="formData.meal_type">
                  <option value="DESAYUNO">Desayuno</option>
                  <option value="COMIDA">Comida</option>
                  <option value="CENA">Cena</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">Título del Plato Principal</label>
              <input type="text" class="form-control rounded-pill border-0 shadow-sm" v-model="formData.title" placeholder="Ej: Pechuga empanizada con arroz">
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold text-muted">Descripción (Se enviará a los padres)</label>
              <textarea class="form-control rounded-4 border-0 shadow-sm" v-model="formData.description" rows="3" placeholder="Detalle nutricional o ingredientes principales..."></textarea>
            </div>

            <!-- PREMIUM DRAG & DROP ZONE -->
            <div class="mb-4">
              <label class="form-label small fw-bold text-muted d-block">Fotografía del Platillo (Opcional)</label>
              
              <div class="border-2 border-dashed rounded-4 p-4 text-center position-relative transition-all dropzone-area"
                   :class="isDragging ? 'border-warning bg-warning bg-opacity-10' : 'border-secondary bg-white'"
                   @dragover.prevent="isDragging = true"
                   @dragleave.prevent="isDragging = false"
                   @drop.prevent="handleFileDrop"
                   @click="triggerFileInput">
                
                <input type="file" ref="fileInput" class="d-none" accept="image/jpeg, image/png, image/webp" @change="handleFileSelect" />

                <!-- Image Preview State -->
                <div v-if="formData.image_url" class="position-relative">
                  <img :src="formData.image_url" class="img-fluid rounded-3 object-fit-cover shadow-sm" style="max-height: 200px; width: 100%;" />
                  <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow hover-scale" @click.stop="clearImage" title="Remover imagen">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>

                <!-- Uploading State -->
                <div v-else-if="uploadingImage" class="py-4">
                  <div class="spinner-border text-warning mb-2"></div>
                  <p class="text-muted small mb-0 fw-bold">Procesando y subiendo imagen...</p>
                </div>

                <!-- Empty State -->
                <div v-else class="py-3">
                  <div class="bg-light rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style="width: 65px; height: 65px;">
                    <i class="fas fa-cloud-upload-alt fa-2x text-warning"></i>
                  </div>
                  <h6 class="fw-bold text-dark mb-1">Subir fotografía</h6>
                  <p class="text-muted small mb-0">Arrastra una imagen aquí o <strong>haz clic para explorar</strong></p>
                  <p class="text-muted" style="font-size: 0.65rem; margin-top: 5px;">Recomendado: JPG, PNG o WEBP (Max 5MB)</p>
                </div>
              </div>
            </div>

            <div class="form-check form-switch mb-4 bg-white p-3 rounded-4 shadow-sm border border-light d-flex align-items-center">
              <input class="form-check-input ms-0 me-3 mt-0" type="checkbox" role="switch" id="activeSwitch" v-model="formData.is_active" style="width: 2.5em; height: 1.25em;">
              <label class="form-check-label fw-bold text-dark mb-0 cursor-pointer" for="activeSwitch">Activar este menú (Se incluirá en correos)</label>
            </div>

            <button class="btn btn-warning w-100 rounded-pill py-3 fw-bold shadow-sm text-dark hover-scale" @click="saveMenu" :disabled="!formData.title || !formData.meal_date || uploadingImage">
              {{ formData.id ? 'Guardar Cambios' : 'Crear Menú' }}
            </button>
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
const menus = ref([])
const showModal = ref(false)
const filterType = ref('')
const filterDateStr = ref(new Date().toISOString().split('T')[0]) 

const fileInput = ref(null)
const isDragging = ref(false)
const uploadingImage = ref(false)

const formData = ref({
  id: null,
  meal_date: '',
  meal_type: 'COMIDA',
  title: '',
  description: '',
  image_url: '',
  is_active: true
})

onMounted(() => {
  loadMenus()
})

const loadMenus = async () => {
  loading.value = true
  try {
    let url = `https://matricula.casitaapps.com/api/meal-menus?date_from=${filterDateStr.value}`
    if (filterType.value) url += `&type=${filterType.value}`
    const res = await axios.get(url)
    menus.value = res.data
  } catch (e) {
    logger.error('Error fetching menus', e)
    Swal.fire('Error', 'No se pudieron cargar los menús.', 'error')
  } finally {
    loading.value = false
  }
}

const openModal = (menu = null) => {
  if (menu) {
    formData.value = { ...menu, meal_date: menu.meal_date.split('T')[0], is_active: !!menu.is_active }
  } else {
    formData.value = {
      id: null,
      meal_date: new Date().toISOString().split('T')[0],
      meal_type: 'COMIDA',
      title: '',
      description: '',
      image_url: '',
      is_active: true
    }
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const triggerFileInput = () => { if (!uploadingImage.value) fileInput.value.click(); }

const handleFileDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
}

const handleFileSelect = (e) => {
  if (e.target.files.length > 0) processFile(e.target.files[0]);
}

const processFile = async (file) => {
  if (!file.type.startsWith('image/')) return Swal.fire('Inválido', 'Solo imágenes.', 'warning');
  if (file.size > 5 * 1024 * 1024) return Swal.fire('Error', 'Max 5MB.', 'warning');

  uploadingImage.value = true;
  try {
    const form = new FormData();
    form.append('image', file);
    const res = await axios.post('https://matricula.casitaapps.com/api/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    formData.value.image_url = res.data.url;
  } catch (error) {
    logger.error('Image upload failed', error);
    Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
  } finally {
    uploadingImage.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
}

const clearImage = () => { formData.value.image_url = ''; }

const saveMenu = async () => {
  loading.value = true
  try {
    const payload = { ...formData.value, is_active: formData.value.is_active ? 1 : 0 }
    if (payload.id) {
      await axios.put(`https://matricula.casitaapps.com/api/meal-menus/${payload.id}`, payload)
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Menú Actualizado', showConfirmButton: false, timer: 2000 })
    } else {
      await axios.post('https://matricula.casitaapps.com/api/meal-menus', payload)
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Menú Creado', showConfirmButton: false, timer: 2000 })
    }
    closeModal()
    loadMenus()
  } catch (e) {
    if (e.response?.status === 409) Swal.fire('Conflicto', 'Ya existe un menú en esta fecha.', 'warning')
    else Swal.fire('Error', 'Fallo al guardar el menú.', 'error')
  } finally {
    loading.value = false
  }
}

const deleteMenu = async (id) => {
  const conf = await Swal.fire({ title: '¿Eliminar Menú?', text: 'Esto no afectará los correos ya enviados.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (!conf.isConfirmed) return
  
  loading.value = true
  try {
    await axios.delete(`https://matricula.casitaapps.com/api/meal-menus/${id}`)
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 2000 })
    loadMenus()
  } catch (e) {
    logger.error('Error deleting menu', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}
</script>

<style scoped>
.hover-card { transition: transform 0.2s, box-shadow 0.2s; }
.hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1)!important; }
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }
.bg-gradient-dark { background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); }
.cursor-pointer { cursor: pointer; }

.dropzone-area { cursor: pointer; border-color: #cbd5e1; }
.dropzone-area:hover { border-color: #f59e0b; background-color: #fffbeb !important; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>