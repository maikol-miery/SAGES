<script setup>
import { ref } from 'vue'
import { representativeSchema } from '~/schemas/representativeSchema'

const isOpen = ref(false)
const mode = ref('view')
const loading = ref(false) 
const toast = useToast()
const emit = defineEmits(['refresh'])

// Estado inicial limpio mapeado a las columnas reales de la DB
const state = ref({
  id: null,
  cedula: '',
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  parentesco: '',
  alumnosAsociados: []
})

// Apertura limpia que asimila el rawRepresentativeData de la fila
const open = (actionMode, data) => {
  mode.value = actionMode
  
  // Asignamos la data al estado reactivo local
  state.value = { 
    ...data, 
    alumnosAsociados: data.alumnosAsociados || [] 
  }
  
  isOpen.value = true
}

const onSubmit = async (event) => {
  loading.value = true
  
  // 🔍 BLOQUE DE AUDITORÍA (Muestra en consola qué se va a enviar)
  console.group('🚀 AUDITORÍA SAGES - INTENTO DE PATCH')
  console.log('1. ID del Representante (state.value.id):', state.value.id)
  console.log('2. URL Objetivo:', `/representatives/${state.value.id}`)
  console.log('3. Data limpia capturada del Formulario (event.data):', JSON.parse(JSON.stringify(event.data)))
  console.groupEnd()

  try {
    const idRepresentante = state.value.id
    
    // Validación de seguridad en el cliente
    if (!idRepresentante) {
      throw new Error('No se pudo ejecutar la acción porque el ID del representante es nulo o indefinido.')
    }

    // Desestructuramos para extraer el ID y el array de alumnos, enviando solo data limpia en el body
    const { alumnosAsociados, id, ...bodyData } = event.data
    console.log(bodyData)
    // Petición PATCH segura hacia el endpoint del backend
    const respuesta = await useApi(`/representatives/${idRepresentante}`, {
      method: 'PATCH',
      body: bodyData
    })

    if (respuesta && respuesta.status === 'success') {
      toast.add({
        title: '¡Actualización Exitosa!',
        description: 'Los datos del representante han sido guardados correctamente en el sistema.',
        color: 'success', 
        icon: 'i-lucide-check-circle',
        timeout: 4000
      })
      
      emit('refresh')
      isOpen.value = false
    }
  } catch (err) {
    console.error('❌ Error crítico al actualizar el representante:', err)
    
    toast.add({
      title: 'Error al Guardar',
      description: err.data?.message || 'No se pudieron actualizar los datos del representante. Revisa los campos.',
      color: 'danger', 
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
  <USlideover side="left" v-model:open="isOpen" title="Ficha del Representante">
    <template #body>
      <div class="space-y-6 p-1 pb-10">

        <div class="flex items-center gap-3 border-b pb-4">
          <div class="p-2 bg-green-100 rounded-lg">
            <UIcon name="i-lucide-users" class="text-green-600 size-6" />
          </div>
          <div>
            <h3 class="font-black text-gray-800 uppercase tracking-tight">
              {{ mode === 'view' ? 'Ver' : 'Editar' }} Representante
            </h3>
            <p class="text-xs text-gray-500 font-bold uppercase">Datos de Contacto y Filiación</p>
          </div>
        </div>

        <UForm
          :schema="mode === 'edit' ? representativeSchema : undefined"
          :state="state"
          class="space-y-6"
          @submit="onSubmit"
        >
          <div class="space-y-3">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <UIcon name="i-lucide-id-card" class="size-4" />
              Información Identificativa
            </h4>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Cédula de Identidad" name="cedula" :required="mode === 'edit'">
                <UInput v-model="state.cedula" :disabled="mode === 'view' || loading" class="w-full" />
              </UFormField>

              <UFormField label="Parentesco / Relación" name="parentesco" :required="mode === 'edit'">
                <UInput v-model="state.parentesco" :disabled="mode === 'view' || loading" class="w-full" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nombre" name="nombre" :required="mode === 'edit'">
                <UInput v-model="state.nombre" :disabled="mode === 'view' || loading" class="w-full" />
              </UFormField>

              <UFormField label="Apellido" name="apellido" :required="mode === 'edit'">
                <UInput v-model="state.apellido" :disabled="mode === 'view' || loading" class="w-full" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Teléfono Móvil" name="telefono" :required="mode === 'edit'">
                <UInput
                  v-model="state.telefono"
                  type="tel"
                  placeholder="0412-0000000"
                  :disabled="mode === 'view' || loading"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Correo Electrónico" name="email" :required="mode === 'edit'">
                <UInput
                  v-model="state.email"
                  type="email"
                  placeholder="nombre@correo.com"
                  :disabled="mode === 'view' || loading"
                  class="w-full"
                />
              </UFormField>
            </div>

          </div>

          <div class="space-y-3 pt-2">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <UIcon name="i-lucide-graduation-cap" class="size-4" />
              Estudiantes a su Cargo
            </h4>

            <div v-if="state.alumnosAsociados?.length" class="space-y-2">
              <div
                v-for="alumno in state.alumnosAsociados"
                :key="alumno.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user" class="size-4 text-gray-400" />
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-gray-700 uppercase">
                      {{ alumno.apellido }} {{ alumno.nombre }}
                    </span>
                    <span class="text-[10px] text-gray-400 font-mono">C.I: {{ alumno.cedula || 'S/C' }}</span>
                  </div>
                </div>
                <UBadge variant="subtle" color="success" class="text-[9px] font-bold uppercase">
                  {{ alumno.estado || 'ACTIVO' }}
                </UBadge>
              </div>
            </div>

            <div v-else class="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              Este representante no posee vinculaciones registradas.
            </div>
          </div>

          <div v-if="mode === 'edit'" class="pt-4 border-t">
            <UButton 
              type="submit" 
              :loading="loading" 
              label="Guardar Cambios" 
              color="primary" 
              block 
              class="font-bold" 
              :ui="{ base: 'py-2.5' }"
            />
          </div>
        </UForm>

      </div>
    </template>
  </USlideover>
</template>