<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const mode = ref('view')
const loading = ref(false) 
const toast = useToast()
const emit = defineEmits(['refresh'])

const opcionesGrados = [
  { value: '1', label: "1er Año" },
  { value: '2', label: "2do Año" },
  { value: '3', label: "3er Año" },
  { value: '4', label: "4to Año" },
  { value: '5', label: "5to Año" }
]

const opcionesSecciones = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' }
]

// Estructura reactiva inicial con campos vacíos para evitar errores de renderizado
const student = ref({
  id: null,
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

const onSubmit = async (event) =>{

  console.group('🚀 AUDITORÍA SAGES - INTENTO DE PATCH')
  console.log('1. ID del estudiante (student.value.id):', student.value.id)
  console.log('2. URL Objetivo:', `/register/${student.value.id}`)
  console.log('3. Data limpia capturada del Formulario (event.data):', JSON.parse(JSON.stringify(event.data)))
  console.groupEnd()

  try {
    
    const idInscripcion = student.value.id

    if (!idInscripcion) {
      throw new Error('No se pudo ejecutar la acción porque el ID nulo o indefinido.')
    }

    const { representanteData, id, ...bodyData } = event.data
    console.log(bodyData)
    // Petición PATCH segura hacia el endpoint del backend
    const respuesta = await useApi(`/registrations/${idInscripcion}`, {
      method: 'PATCH',
      body: bodyData
    })

    if (respuesta && respuesta.status === 'success') {
      toast.add({
        title: '¡Actualización Exitosa!',
        description: `Los datos de ${student.value.nombre} han sido actualizados correctamente.`,
        color: 'success', 
        icon: 'i-lucide-check-circle',
        timeout: 4000
      })
    }

    emit('refresh')
    isOpen.value = false

  } catch (error) {
    console.error('❌ Error crítico al actualizar el estudiantes:', error)
    
    toast.add({
      title: 'Error al Guardar',
      description: error.data?.message || 'No se pudieron actualizar los datos del estudiante. Revisa los campos.',
      color: 'error', 
      icon: 'i-lucide-alert-triangle',
      timeout: 5000
    })
  } finally {
    loading.value = false 
  }

}

defineExpose({ open })
</script>

<template>
  <USlideover side="left" v-model:open="isOpen" title="Expediente del Estudiante">
    <template #body>
      <UForm :state="student" class="space-y-6 p-1 pb-10" @submit="onSubmit">
        
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
          <div class="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Año</p>
              <UFormField name="grado">
                <USelect v-model="student.grado" :items="opcionesGrados" :disabled="mode === 'view'" block />
              </UFormField>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Sección</p>
              <UFormField name="seccion">
                <USelect v-model="student.seccion" :items="opcionesSecciones" :disabled="mode === 'view'" block />
              </UFormField>
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
            <UFormField label="Cédula" name="cedula">
              <UInput v-model="student.cedula" :disabled="mode === 'view'" block />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nombre" name="nombre">
                <UInput v-model="student.nombre" :disabled="mode === 'view'" block />
              </UFormField>
              
              <UFormField label="Apellido" name="apellido">
                <UInput v-model="student.apellido" :disabled="mode === 'view'" block />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de Nacimiento" name="fechaNacimiento">
                <UInput v-model="student.fechaNacimiento" type="date" :disabled="mode === 'view'" block />
              </UFormField>
              
              <UFormField label="Género" name="genero">
                <USelect v-model="student.genero" :items="['M', 'F']" :disabled="mode === 'view'" block />
              </UFormField>
            </div>

            <UFormField label="Dirección de Habitación" name="direccion">
              <UTextarea v-model="student.direccion" :disabled="mode === 'view'" :rows="2" block />
            </UFormField>
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
          <UButton 
            type="submit" 
            label="Actualizar Estudiante" 
            color="primary" 
            block 
            class="font-bold" 
            :loading="loading" 
          />
        </div>
        
      </UForm>
    </template>
  </USlideover>
</template>