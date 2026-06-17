<script setup>
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Mapeamos los ítems agregando la propiedad 'slot' explícita
const items = [
  { label: 'Estudiantes', icon: 'i-lucide-users', slot: 'estudiantes' },
  { label: 'Representantes', icon: 'i-lucide-user-round', slot: 'representantes' }
]
const pestañaActiva = ref('0')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-800">Registro Académico</h1>
      <p class="text-gray-500 text-sm">Gestión centralizada de expedientes estudiantiles y estados académicos.</p>
    </div>

    <UTabs
    size="xl"
    v-model="pestañaActiva"
    :items="items"
    class="w-full font-medium text-sm text-gray-500 mb-0"
    :ui="{
      root: 'flex items-start gap-2',
      list: 'w-fit'
    }"
  >
    <template #estudiantes>
      <USeparator :ui="{ border: 'border-neutral-300' }" />
      <div class="mt-4">
        <StudentsTable />
      </div>
    </template>

    <template #representantes>
      <USeparator :ui="{ border: 'border-neutral-300' }" />
      <div class="mt-4">
        <RepresentativesTable />
      </div>
    </template>
  </UTabs>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
        <div class="p-3 bg-green-100 rounded-lg">
          <UIcon name="i-lucide-user-plus" class="text-green-600 size-6" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-400 uppercase leading-none">Nuevos Ingresos</p>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-gray-800">12</span>
            <span class="text-xs font-bold text-green-600">+2%</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
        <div class="p-3 bg-red-100 rounded-lg">
          <UIcon name="i-lucide-triangle-alert" class="text-red-600 size-6" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-400 uppercase leading-none">Riesgo Académico</p>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-gray-800">5</span>
            <span class="text-xs font-bold text-red-600">-3</span>
          </div>
        </div>
      </div>

      <div class="bg-green-700 p-4 rounded-xl text-white flex flex-col justify-between shadow-md">
        <div>
          <p class="text-xs font-bold uppercase opacity-80">Exportar Datos</p>
          <p class="text-sm font-medium">Generar reporte PDF del ciclo actual.</p>
        </div>
        <UButton
          icon="i-lucide-file-down"
          label="Descargar"
          color="neutral"
          variant="solid"
          block
          class="mt-2 font-bold bg-white text-green-700 hover:bg-gray-100"
        />
      </div>
    </div>
  </div>
</template>