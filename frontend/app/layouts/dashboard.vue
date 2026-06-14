<template>
  <div class="flex h-screen w-full bg-gray-50 overflow-hidden">
    <Sidebar />
    <div class="flex flex-col flex-1 h-full overflow-hidden">
      <Header />
      <UMain class="flex-1 overflow-y-auto p-6 bg-neutral-100">
        <slot />
      </UMain>
    </div>
  </div>
</template>
<script setup>
  const handleSuccess = () => {
  // Recarga los datos de las peticiones useFetch activas en la pantalla actual
    refreshNuxtData() 
  }
</script>