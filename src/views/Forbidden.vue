<template>
  <div class="d-flex flex-column justify-content-center align-items-center h-100 py-5 text-center animation-fade">
    <div class="bg-danger bg-opacity-10 text-danger rounded-circle d-flex justify-content-center align-items-center mb-4" style="width: 100px; height: 100px;">
      <i class="fas fa-ban fa-3x"></i>
    </div>
    <h1 class="fw-bold text-dark mb-3">Acceso Restringido</h1>
    <p class="text-muted fs-5 mb-5" style="max-width: 500px;">
      Tu cuenta no tiene los privilegios necesarios para ver esta sección. Si crees que esto es un error, solicita permisos a la administración.
    </p>
    <router-link to="/" class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow">
      Volver al Inicio
    </router-link>
  </div>
</template>

<style scoped>
.animation-fade { animation: fadeIn 0.5s ease-out backwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>