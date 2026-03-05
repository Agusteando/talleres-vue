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
        <p class="text-muted">Elige el campus para administrar sus listas de servicios extracurriculares.</p>
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
          <button class="btn btn-light bg-opacity-25 text-white border-0 rounded-circle shadow-sm hover-scale" style="width: 45px; height: 45px;" @click="goBackToPlanteles">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h3 class="fw-bold mb-0">Servicios: {{ currentTheme.name }}</h3>
            <small class="opacity-75">Selecciona el taller para administrar listados.</small>
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
      
      <!-- Seamless Navigation Header -->
      <div class="rounded-4 shadow-sm mb-4 p-4 text-white position-relative" :style="{ background: currentTheme.gradient }">
        
        <!-- Interactive Breadcrumbs -->
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2 bg-transparent p-0" style="font-size: 0.85rem;">
            <li class="breadcrumb-item cursor-pointer text-white opacity-75 hover-opacity-100" @click="goBackToPlanteles">
              <i class="fas fa-home me-1"></i> Planteles
            </li>
            <li class="breadcrumb-item cursor-pointer text-white opacity-75 hover-opacity-100" @click="goBackToServices">
              {{ currentTheme.name }}
            </li>
            <li class="breadcrumb-item active text-white fw-bold" aria-current="page">{{ servicio }}</li>
          </ol>
        </nav>

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light bg-opacity-25 text-white border-0 rounded-circle shadow-sm hover-scale flex-shrink-0" style="width: 45px; height: 45px;" @click="goBackToServices" title="Volver a lista de talleres">
              <i class="fas fa-arrow-left"></i>
            </button>
            
            <!-- Quick Switcher Dropdown -->
            <div class="position-relative">
              <div v-if="showQuickSwitch" class="position-fixed top-0 start-0 w-100 h-100 z-2" @click="showQuickSwitch = false"></div>
              <h2 class="mb-0 fw-bold cursor-pointer d-flex align-items-center gap-2 hover-opacity-100 transition-all position-relative z-3" @click="showQuickSwitch = !showQuickSwitch">
                {{ servicio }} <i class="fas fa-chevron-down fs-5 opacity-75"></i>
              </h2>
              
              <transition name="pop">
                <div v-if="showQuickSwitch" class="position-absolute top-100 start-0 mt-2 bg-white rounded-4 shadow-lg border z-3 py-2 custom-scrollbar" style="min-width: 280px; max-height: 350px; overflow-y: auto;">
                  <div class="px-3 py-2 text-muted fw-bold small text-uppercase">Cambiar de Taller en {{ plantel }}</div>
                  <a v-for="s in currentPlantelServicesList" :key="s" 
                     class="dropdown-item cursor-pointer py-2 px-3 text-dark text-decoration-none d-block hover-bg-light transition-all" 
                     :class="{'bg-primary bg-opacity-10 text-primary fw-bold': s === servicio}" 
                     @click.stop="selectServicioAndClose(s)">
                     <div class="d-flex justify-content-between align-items-center">
                       <span>{{ s }}</span>
                       <span class="badge bg-light text-secondary border rounded-pill small" v-if="getStudentCount(s) > 0">{{ getStudentCount(s) }}</span>
                     </div>
                  </a>
                </div>
              </transition>
            </div>
          </div>
          <div class="d-flex gap-3 opacity-75 small">
            <span class="bg-white bg-opacity-25 px-3 py-1 rounded-pill fw-semibold"><i class="fas fa-users me-1"></i> {{ flatStudents.length }} Inscritos</span>
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
                    
                    <div class="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-end gap-1 z-2">
                      <span class="badge bg-warning text-dark shadow-sm" v-if="stu.eventual == 1">Eventual</span>
                      <span v-if="isNewStudent(timelineData[stu.matricula]?.started_at)" class="badge bg-success shadow-sm border border-white pulse-animation"><i class="fas fa-star text-warning me-1"></i> NUEVO</span>
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
                        
                        <div class="d-flex gap-2 mt-2 align-items-center flex-wrap">
                           <span class="badge rounded-pill shadow-sm" 
                                 :class="isNewStudent(timelineData[stu.matricula]?.started_at) ? 'bg-success text-white pulse-animation border border-success' : 'bg-white text-secondary border'" 
                                 style="font-size: 0.65rem;" v-if="timeAgo(timelineData[stu.matricula]?.started_at)">
                             <i class="fas fa-clock me-1" :class="isNewStudent(timelineData[stu.matricula]?.started_at) ? 'text-white' : ''"></i> Antigüedad: {{ timeAgo(timelineData[stu.matricula]?.started_at) }}
                           </span>
                           <button class="btn btn-sm text-primary p-0 bg-transparent border-0 ms-1 hover-scale" @click.stop="openTimelineModal(stu)" title="Ver Historial">
                             <i class="fas fa-history fs-6"></i>
                           </button>
                        </div>
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
            <input type="text" class="form-control form-control-lg rounded-pill ps-5 bg-light border-0 shadow-sm" placeholder="Buscar por nombre o matrícula en el plantel..." v-model="searchAdd">
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
            <h5>Escribe al menos 3 letras para buscar un alumno en este plantel</h5>
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
          <div class="table-responsive border rounded-4 shadow-sm custom-scrollbar" style="max-height: 600px;">
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

                <h6 class="fw-bold mb-3 text-secondary text-uppercase small" style="letter-spacing: 0.5px;">Línea de tiempo ({{ plantel }})</h6>
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
const showQuickSwitch = ref(false)

const searchCurrent = ref('')
const searchAdd = ref('')

const globalData = ref({})
const allStudentsList = ref([]) 
const attendanceMap = ref({}) 
const scheduledJobs = ref([])
const timelineData = ref({})
const viewingTimelineStu = ref(null)

// Constants
const allowedPlanteles = ["PREET", "PREEM", "PT", "PM", "ST", "SM", "ISM", "DM", "CM", "CT"]
const allServiciosList = [
    "DESAYUNO", "COMIDA", "CENA", "BIBERÓN", "PAPILLA", "FÚTBOL", "TAE KWON DO", "BE AN ARTIST",
    "JAZZ", "BALLET", "DANZA ÁRABE", "ENSAMBLE MUSICAL", "TENNIS", "BASQUETBOL", "TOCHO BANDERA",
    "TECLADO", "TEATRO MUSICAL", "AJEDREZ", "VOLEIBOL", "GIMNASIA", "TE 0.5H", "TE 1H", "TE 1.5H",
    "TE 2H", "TE 2.5H", "TE 3H", "TE 3.5H", "TE 4H", "CLUB DE TAREAS", "DISEÑO GRÁFICO", "HUSKY BAND",
    "ROBÓTICA", "AJEDREZ (4 DÍAS)", "BE AN ARTIST (4 DÍAS)", "JAZZ REPRESENTATIVO (4 DÍAS)",
    "TRANSPORTE REDONDO R1", "TRANSPORTE REDONDO R2", "TRANSPORTE SENCILLO R1", "TRANSPORTE SENCILLO R3", "INGLÉS", "FRANCÉS", "CATECISMO"
]

// Computed Props
const currentTheme = computed(() => getPlantelTheme(plantel.value))

const currentPlantelServicesList = computed(() => {
  let list = allServiciosList
  if (['PM', 'PT', 'SM', 'ST'].includes(plantel.value)) {
    list = list.filter(s => s !== 'BIBERÓN' && s !== 'PAPILLA')
  }
  return list
})

const filteredServices = computed(() => {
  if (showAllServices.value) return currentPlantelServicesList.value
  return currentPlantelServicesList.value.filter(s => getStudentCount(s) > 0)
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

// Navigation & Handlers
const handleRestrictedTab = (tab) => {
  if (tab === 'add' && !authStore.hasAdminAccess) {
    Swal.fire('Acceso Restringido', 'Necesitas iniciar sesión con cuenta administrativa.', 'warning')
    return
  }
  activeTab.value = tab
}

const selectPlantel = (p) => { plantel.value = p; router.push(`/admin/${p}`); fetchData(); }
const selectServicio = (s) => { 
  servicio.value = s; 
  router.push(`/admin/${plantel.value}/${s}`); 
  fetchAttendance(); 
  fetchJobs(); 
  fetchTimeline();
}
const selectServicioAndClose = (s) => {
  showQuickSwitch.value = false;
  selectServicio(s);
}
const goBackToPlanteles = () => { plantel.value = null; servicio.value = null; router.push('/admin'); }
const goBackToServices = () => { servicio.value = null; activeTab.value = 'current'; router.push(`/admin/${plantel.value}`); }

// Date Utilities
const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if(isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 0) return 'Hoy';
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
      fetchTimeline()
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

const fetchTimeline = async () => {
  if (!servicio.value || flatStudents.value.length === 0) return;
  const matriculas = flatStudents.value.map(s => s.matricula);
  try {
    const res = await axios.post('https://bot.casitaapps.com/api/talleres/timeline/bulk', {
      plantel: plantel.value,
      servicio: servicio.value,
      matriculas
    });
    timelineData.value = res.data?.data || {};
  } catch(e) {
    logger.error("Timeline bulk fetch gracefully failed or missing endpoint", e);
    timelineData.value = {}; 
  }
}

// Modal Timeline Helpers
const openTimelineModal = (stu) => { viewingTimelineStu.value = stu; }
const closeTimelineModal = () => { viewingTimelineStu.value = null; }

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
    didOpen: () => {
      const inputEl = document.getElementById('notas_swal');
      if (inputEl) {
        inputEl.addEventListener('input', (e) => {
          notas = e.target.value;
        });
      }
    }
  }).then((res) => {
    if (res.isConfirmed || res.isDenied) submitAddStudent(student, res.isConfirmed ? 0 : 1, notas)
  })
}

const submitAddStudent = async (student, eventual, notas) => {
  loading.value = true
  try {
    // IMPORTANT: Pointing Add to matricula.casitaapps.com
    await axios.post('https://matricula.casitaapps.com/add-student', { plantel: plantel.value, servicio: servicio.value, matricula: student.matricula, eventual, notas })
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
    // IMPORTANT: Pointing Remove to matricula.casitaapps.com
    await axios.post('https://matricula.casitaapps.com/remove-student', { servicio: servicio.value, matricula })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 2000 })
    fetchData()
  } catch (e) { logger.error('Remove student failed', e); Swal.fire('Error', 'Fallo al eliminar', 'error') }
  finally { loading.value = false }
}

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
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.05); }
.hover-bg-light:hover { background-color: #f8fafc; }
.hover-opacity-100 { transition: opacity 0.2s; }
.hover-opacity-100:hover { opacity: 1 !important; text-decoration: underline; }

.pulse-animation { animation: pulse 2s infinite; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.pop-enter-active, .pop-leave-active { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from, .pop-leave-to { transform: scale(0.95); opacity: 0; }
</style>