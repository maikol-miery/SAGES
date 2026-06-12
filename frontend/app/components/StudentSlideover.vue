<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const mode = ref('view')

// Estructura reactiva inicial con campos vacíos para evitar errores de renderizado
const student = ref({
  cedula: '',
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  genero: '',
  direccion: '',
  grado: '',
  seccion: '',
  fechaInscripcionFormat: '',
  representanteData: {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: ''
  }
})

// Exponemos el método para que la tabla de estudiantes lo abra
const open = (actionMode, data) => {
  mode.value = actionMode
  
  // Clonamos los datos para que la reactividad sea limpia
  const formattedData = { ...data }
  
  // Limpiamos la fecha de nacimiento (YYYY-MM-DD) para que el input tipo date la pinte bien
  if (formattedData.fechaNacimiento) {
    formattedData.fechaNacimiento = formattedData.fechaNacimiento.includes('T')
      ? formattedData.fechaNacimiento.split('T')[0]
      : formattedData.fechaNacimiento
  }

  student.value = {
    ...formattedData,
    representanteData: formattedData.representanteData || {}
  }
  
  isOpen.value = true
}

defineExpose({ open })
</script>

<template>
  <USlideover side="left" v-model:open="isOpen" title="Expediente del Estudiante">
    <template #body>
      <div class="space-y-6 p-1 pb-10">
        
        <div class="flex items-center gap-3 border-b pb-4">
          <div class="p-2 bg-olivine-100 rounded-lg">
            <UIcon name="i-lucide-user" class="text-olivine-600 size-6" />
          </div>
          <div>
            <h3 class="font-black text-gray-800 uppercase tracking-tight">
              {{ mode === 'view' ? 'Ver' : 'Editar' }} Estudiante
            </h3>
            <p class="text-xs text-gray-500 font-bold uppercase">Expediente Completo</p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <UIcon name="i-lucide-graduation-cap" class="size-4 text-gray-400" />
            Estructura Académica
          </h4>
          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase">Grado y Sección</p>
              <p class="text-sm font-black text-gray-700 mt-0.5">
                {{ student.grado }} Año '{{ student.seccion }}'
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase">Historial</p>
              <p class="text-xs font-bold text-gray-600 mt-0.5">{{ student.fechaInscripcionFormat }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <UIcon name="i-lucide-id-card" class="size-4 text-gray-400" />
            Información del Estudiante
          </h4>
          
          <div class="space-y-4">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cédula / Escolar</p>
              <UInput v-model="student.cedula" :disabled="mode === 'view'" block />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 tracking-widest uppercase">Nombre</p>
                <UInput v-model="student.nombre" :disabled="mode === 'view'" block />
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 tracking-widest uppercase">Apellido</p>
                <UInput v-model="student.apellido" :disabled="mode === 'view'" block />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 tracking-widest uppercase">Fecha de Nacimiento</p>
                <UInput v-model="student.fechaNacimiento" type="date" :disabled="mode === 'view'" block />
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 tracking-widest uppercase">Género</p>
                <USelect v-model="student.genero" :options="['M', 'F']" :disabled="mode === 'view'" block />
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[10px] font-black text-gray-400 tracking-widest uppercase">Dirección de Habitación</p>
              <UTextarea v-model="student.direccion" :disabled="mode === 'view'" :rows="2" block />
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <UIcon name="i-lucide-users" class="size-4 text-gray-400" />
            Información del Representante
          </h4>
          
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-bold text-gray-400 uppercase">Nombre</p>
                <p class="text-sm font-black text-gray-800 uppercase">{{ student.representanteData.nombre || 'No registrado' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase">Apellido</p>
                <p class="text-sm font-black text-gray-800 uppercase">{{ student.representanteData.apellido || 'No registrado' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-1 border-t border-gray-200">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase">Cédula</p>
                <p class="text-xs font-bold text-gray-700">{{ student.representanteData.cedula || 'S/C' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase">Teléfono</p>
                <p class="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <UIcon name="i-lucide-phone" class="size-3 text-gray-400" />
                  {{ student.representanteData.telefono || 'No asignado' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="mode === 'edit'" class="pt-4 border-t">
          <UButton label="Actualizar Estudiante" color="primary" block class="font-bold" @click="isOpen = false" />
        </div>
      </div>
    </template>
  </USlideover>
</template>