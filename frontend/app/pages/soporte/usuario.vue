<template>
  <div class="fixed inset-0 bg-[#f4f7f9] flex flex-col font-sans antialiased overflow-hidden">
    
    <header class="w-full h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm z-50">
      
      <div class="flex items-center gap-4">
        <NuxtLink 
          to="/" 
          class="p-2 text-gray-500 hover:text-emerald-800 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center justify-center"
          title="Volver al inicio"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="2.5" 
            stroke="currentColor" 
            class="w-6 h-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </NuxtLink>
        
        <h1 class="text-lg font-bold text-emerald-950 tracking-tight">
          Manual de Usuario del Sistema (SAGES)
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-6 w-[1px] bg-gray-200"></div>

        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-gray-700 leading-tight">
            Hola, {{ userName || 'Usuario' }}
          </p>
          <p class="text-xs text-gray-400 font-medium capitalize">
            {{ userRole || 'Invitado' }}
          </p>
        </div>

        <div class="size-9 rounded-full bg-olivine-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm border border-olivine-600">
          {{ userName ? userName.charAt(0) : 'U' }}
        </div>
      </div>

    </header>

    <main class="w-full flex-grow relative bg-gray-100">
      <iframe 
        src="/manual-usuario.pdf" 
        class="absolute inset-0 w-full h-full border-0 m-0 p-0"
        title="Manual de Usuario PDF"
      ></iframe>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// Variables reactivas listas para enlazar con el sistema de autenticación
const userName = ref('')
const userRole = ref('')
</script>