<template>
  <div class="fixed inset-0 bg-[#f4f7f9] flex flex-col font-sans antialiased overflow-hidden">
    


    <main class="w-full flex-grow relative bg-gray-100">
      <iframe 
        src="/manual_tecnico.pdf" 
        class="absolute inset-0 w-full h-full border-0 m-0 p-0"
        title="Manual Técnico PDF"
      ></iframe>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue'
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Variables reactivas listas para enlazar con el sistema de autenticación
const userName = ref('')
const userRole = ref('')
</script>