<script setup>
// 1. PROPS Y ESTADO REACTIVO (Siempre primero)
const props = defineProps({
  year: {
    type: [Number, String],
    required: true
  }
})

import { ref } from 'vue'

const seccionIdExpandida = ref(null)

const toggleExpandir = (id) => {
  seccionIdExpandida.value = seccionIdExpandida.value === id ? null : id
}

const loading = ref(true)
const secciones = ref([])

// 2. DECLARACIÓN DE FUNCIONES 
// Al declararla aquí, garantizamos que ya exista en memoria antes de que el watch la busque
const cargarSecciones = async () => {
  loading.value = true
  try {
    const response = await useApi('/academic-load', {
      method: 'GET',
      query: { grado: `${props.year}` }
    })
    
    // Validamos exactamente la estructura exitosa que te dio Thunder Client
    secciones.value = response.sections ?? []
  } catch (error) {
    console.error('Error cargando secciones en SAGES:', error)
    secciones.value = []
  } finally {
    loading.value = false
  }
}

// 3. WATCHERS (Abajo de las funciones que invocan)
watch(() => props.year, async () => {
  await cargarSecciones()
}, { immediate: true })

// 4. EXPOSE (Al final del script para el componente padre)
defineExpose({
  cargarSecciones
})
</script>

<template>
  <div class="h-[calc(95vh-280px)] overflow-y-auto pr-2 mt-4 custom-scrollbar">
    
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
          :class="{ 
            'row-span-2 h-full': seccionIdExpandida === seccion.id 
          }"
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
              
              <UBadge color="neutral" variant="subtle" size="sm" class="font-semibold text-gray-500">
                {{ seccion.capacidad }} Alumnos Máx.
              </UBadge>
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

        <div key="add-button" class="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50/10 transition-all bg-white cursor-pointer" tag="button">
          <div class="p-2 bg-gray-50 rounded-full border border-gray-100 text-gray-500">
            <UIcon name="i-lucide-plus" class="size-5" />
          </div>
          <span class="text-xs font-bold text-gray-500">Agregar Nueva Sección</span>
        </div>

      </TransitionGroup>
    </template>

  </div>
</template>

<style scoped>
/* Define la animación de movimiento para los elementos que NO se expanden */
.grid-expand-move {
  transition: transform 0.5s ease;
}

/* Evita saltos bruscos cuando un elemento se está moviendo */
.grid-expand-leave-active {
  position: absolute;
}
</style>