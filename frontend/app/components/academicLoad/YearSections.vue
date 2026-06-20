<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  year: {
    type: [Number, String],
    required: true
  },
  anioEscolar: {
    type: String,
    default: '2025-2026'
  }
})

const toast = useToast()
const seccionIdExpandida = ref(null)
const loading = ref(true)
const secciones = ref([])

// Estados para Modal de Creación
const modalAbierto = ref(false)
const creandoSeccion = ref(false)

// 🚨 Estados para Modal de Eliminación Estricta
const modalEliminarAbierto = ref(false)
const seccionParaEliminar = ref(null)
const eliminandoSeccion = ref(false)

const siguienteLetra = computed(() => {
  if (!secciones.value || secciones.value.length === 0) return 'A'
  const letrasUsadas = secciones.value.map(s => s.letra ? s.letra.trim().toUpperCase() : '')
  const codigos = letrasUsadas.map(l => l.charCodeAt(0)).filter(c => !isNaN(c))
  if (codigos.length === 0) return 'A'
  const maxCodigo = Math.max(...codigos)
  return String.fromCharCode(maxCodigo + 1)
})

const toggleExpandir = (id) => {
  seccionIdExpandida.value = seccionIdExpandida.value === id ? null : id
}

const cargarSecciones = async () => {
  loading.value = true
  try {
    const response = await useApi('/academic-load', {
      method: 'GET',
      query: { grado: `${props.year}` }
    })
    secciones.value = response.sections ?? []
  } catch (error) {
    console.error('Error cargando secciones en SAGES:', error)
    secciones.value = []
  } finally {
    loading.value = false
  }
}

const confirmarNuevaSeccion = async () => {
  creandoSeccion.value = true
  try {
    const response = await useApi('/sections', {
      method: 'POST',
      body: {
        grado: `${props.year}`,
        seccion: siguienteLetra.value,
        anio_escolar: props.anioEscolar
      }
    })

    if (response && response.status === "success") {
      toast.add({
        title: '¡Sección Creada!',
        description: `La sección ${siguienteLetra.value} de ${props.year}° Año fue registrada con éxito.`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
      modalAbierto.value = false
      await cargarSecciones()
    }
  } catch (error) {
    console.error('Error al registrar la sección:', error)
    toast.add({
      title: 'Error de registro',
      description: error.data?.msg || 'Ocurrió un problema al intentar crear la sección.',
      color: 'error',
      icon: 'i-lucide-alert-triangle'
    })
  } finally {
    creandoSeccion.value = false
  }
}

// 🚨 Funciones para la eliminación estricta
const abrirConfirmarEliminar = (seccion) => {
  seccionParaEliminar.value = seccion
  modalEliminarAbierto.value = true
}

const ejecutarEliminacionEstricta = async () => {
  if (!seccionParaEliminar.value) return
  
  eliminandoSeccion.value = true
  try {
    const response = await useApi(`/sections/${seccionParaEliminar.value.id}`, {
      method: 'DELETE'
    })

    if(response && response.status === "success"){
      toast.add({
        title: 'Sección Eliminada',
        description: response.msg,
        color: 'success',
        icon: 'i-lucide-trash-2'
      })

      modalEliminarAbierto.value = false
      seccionParaEliminar.value = null
      await cargarSecciones() // Recargar grilla
    }
  } catch (error) {
    console.error('Error al eliminar sección:', error)
    // Captura el error 409 (Conflict) enviado por las reglas de negocio del backend
    toast.add({
      title: 'Acción Rechazada',
      description: error.data?.msg || 'No se pudo eliminar la sección debido a dependencias activas.',
      color: 'error',
      icon: 'i-lucide-shield-alert'
    })
  } finally {
    eliminandoSeccion.value = false
  }
}

watch(() => props.year, async () => {
  await cargarSecciones()
}, { immediate: true })

defineExpose({ cargarSecciones })
</script>

<template>
  <div class="h-[calc(90vh-280px)] overflow-y-auto pr-2 mt-4 custom-scrollbar">
    
    <template v-if="loading">
      <div class="grid grid-cols-2 gap-4">
        <USkeleton v-for="i in 2" :key="i" class="h-44 rounded-xl bg-gray-100" />
      </div>
    </template>
    
    <template v-else>
      <TransitionGroup 
        tag="div" 
        name="grid-expand" 
        class="grid grid-cols-2 auto-rows-[calc(50%-20px)] gap-4 h-full"
      >
        <UCard
          v-for="seccion in secciones"
          :key="seccion.id"
          class="hover:shadow-sm transition-all bg-white border border-gray-200 flex flex-col overflow-hidden cursor-pointer"
          :class="{ 'row-span-2 h-full': seccionIdExpandida === seccion.id }"
          :ui="{ body: 'p-4 flex-1 flex flex-col min-h-0 overflow-hidden' }" 
          @click.self="toggleExpandir(seccion.id)"
        >
          <template #header>
            <div class="flex justify-between items-center" @click.self="toggleExpandir(seccion.id)">
              <span class="font-bold text-sm text-gray-700 flex items-center gap-2 pointer-events-none">
                <span class="size-5 bg-primary-600 text-white rounded-md flex items-center justify-center text-[11px] font-black">
                  {{ seccion.letra }}
                </span>
                Sección {{ seccion.letra }}
              </span>
              
              <div class="flex items-center gap-2">
                <UBadge color="neutral" variant="subtle" size="sm" class="font-semibold text-gray-500">
                  {{ seccion.capacidad || 40 }} Alumnos Máx.
                </UBadge>
                
                <UButton 
                  color="error" 
                  variant="ghost" 
                  icon="i-lucide-trash-2" 
                  size="xs" 
                  class="opacity-50 hover:opacity-100 transition-opacity"
                  @click.stop="abrirConfirmarEliminar(seccion)"
                />
              </div>
            </div>
          </template>

          <div 
            class="transition-all duration-500 ease-in-out min-h-0 overflow-hidden flex flex-col flex-1"
            :class="{ 
              'max-h-[160px]': seccionIdExpandida !== seccion.id,
              'max-h-[1000px]': seccionIdExpandida === seccion.id 
            }"
          >
            <div class="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <template v-if="seccion.materias && seccion.materias.length > 0">
                <div
                  v-for="materia in seccion.materias"
                  :key="materia.id"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100/80 hover:bg-primary-50 hover:border hover:border-primary-600 transition-ease duration-500 shrink-0"
                >
                  <div class="flex flex-col">
                    <span class="text-md font-bold text-gray-700 leading-tight">{{ materia.nombre }}</span>
                    <span class="text-sm text-primary-600 font-semibold mt-0.5">{{ materia.docente }}</span>
                  </div>
                  <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs" />
                </div>
              </template>

              <div v-else class="text-xs text-gray-400 text-center py-6 italic border border-dashed border-gray-100 rounded-xl bg-gray-50/50 flex-1 flex items-center justify-center">
                Sin materias asignadas en este ciclo
              </div>
            </div>
          </div>
        </UCard>

        <div 
          key="add-button" 
          @click="modalAbierto = true"
          class="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50/10 transition-all bg-white cursor-pointer"
        >
          <div class="p-2 bg-gray-50 rounded-full border border-gray-100 text-gray-500">
            <UIcon name="i-lucide-plus" class="size-5" />
          </div>
          <span class="text-xs font-bold text-gray-500">Agregar Nueva Sección</span>
        </div>
      </TransitionGroup>
    </template>

    <UModal v-model:open="modalAbierto">
      <template #header>
        <div class="flex items-center gap-2 text-primary-700">
          <UIcon name="i-lucide-plus-circle" class="size-5" />
          <h3 class="font-bold text-base">¿Crear nueva sección automáticamente?</h3>
        </div>
      </template>

      <template #body>
        <div class="space-y-2 text-sm text-neutral-600">
          <p>El sistema calculará y generará la siguiente sección en secuencia correlativa para este nivel.</p>
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1 font-semibold text-xs">
            <p>• <span class="text-neutral-400">Año / Grado:</span> {{ props.year }}° Año</p>
            <p>• <span class="text-neutral-400">Letra de Sección:</span> Sección {{ siguienteLetra }}</p>
            <p>• <span class="text-neutral-400">Año Escolar:</span> Período {{ props.anioEscolar }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" :disabled="creandoSeccion" @click="modalAbierto = false">
            Cancelar
          </UButton>
          <UButton color="primary" icon="i-lucide-check" :loading="creandoSeccion" @click="confirmarNuevaSeccion">
            Confirmar y crear
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="modalEliminarAbierto">
      <template #header>
        <div class="flex items-center gap-2 text-error-700">
          <UIcon name="i-lucide-alert-triangle" class="size-5 text-red-500" />
          <h3 class="font-bold text-base text-gray-800">Confirmar eliminación de sección</h3>
        </div>
      </template>

      <template #body>
        <div class="space-y-3 text-sm text-neutral-600">
          <p>¿Estás seguro de que deseas eliminar permanentemente la <span class="font-bold text-gray-800">Sección {{ seccionParaEliminar?.letra }}</span> de {{ props.year }}° Año?</p>
          <p class="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100/60">
            ⚠️ Esta acción es irreversible. El sistema rechazará la solicitud si la sección cuenta con materias asignadas o alumnos inscritos.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" :disabled="eliminandoSeccion" @click="modalEliminarAbierto = false">
            Cancelar
          </UButton>
          <UButton color="error" icon="i-lucide-trash-2" :loading="eliminandoSeccion" @click="ejecutarEliminacionEstricta">
            Eliminar Registro
          </UButton>
        </div>
      </template>
    </UModal>

  </div>
</template>

<style scoped>
.grid-expand-move {
  transition: transform 0.5s ease;
}
.grid-expand-leave-active {
  position: absolute;
}
</style>