<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Pestañas principales del módulo
const tabsGestion = [
  { slot: 'carga', label: 'Distribución de Carga', icon: 'i-lucide-git-branch' },
  { slot: 'materias', label: 'Catálogo de Materias', icon: 'i-lucide-book-open' }
]
</script>

<template>
  <div class="p-6 space-y-6">
    
    <div class="flex items-center gap-3">
      <div class="p-2 bg-primary-100 rounded-lg">
        <UIcon name="i-lucide-graduation-cap" class="size-6 text-primary-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Gestión Académica</h1>
        <p class="text-sm text-gray-500">Administre las asignaturas de la institución y la distribución de la carga docente.</p>
      </div>
    </div>

    <UTabs :items="tabsGestion" class="w-full space-y-4">
      
      <template #carga>
        <div class="mt-2">
          <AcademicLoadDistribution />
        </div>
      </template>

      <template #materias>
        <div class="mt-2">
          <AcademicLoadSubjectsTable />
        </div>
      </template>

    </UTabs>

  </div>
</template>