<template>
  <div class=" w-full space-y-6">
    <div class="mb-8 rounded-xl flex justify-between items-start gap-3">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión De Personal</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Administra los perfiles de docentes, administrativos y sus accesos al sistema SAGES.
        </p>
      </div>
      
      <UButton
        color="primary"
        icon="i-lucide-user-plus"
        size="xl"
        class="font-semibold shadow-sm"
        @click="clickNuevoPersonal"
      >
        Nuevo Personal
      </UButton>
    </div>

    <StaffTable ref="staffTableRef" />
  </div>
</template>

<script setup>

// ref es auto-importado en Nuxt, no necesita importarse manualmente

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const staffTableRef = ref(null)

const clickNuevoPersonal = () => {
  // El signo '?' (optional chaining) evita que se caiga si es null temporalmente  
  staffTableRef.value.triggerNuevo()
}
</script>