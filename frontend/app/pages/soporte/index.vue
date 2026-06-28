<template>
  <div class="h-full overflow-hidden bg-[#f4f7f9] flex flex-col font-sans antialiased text-gray-800">

    <main class="flex-grow px-6 py-6 flex flex-col items-center justify-center text-center max-h-[calc(100dvh-53px)] overflow-y-auto">
      
      <div class="mb-4 flex-shrink-0">
        <img src="/icon.png" alt="SAGES" class="w-20 h-20 object-contain rounded-xl" />
      </div>

      <div class="mb-6 flex-shrink-0">
        <h2 class="text-2xl md:text-3xl font-extrabold text-emerald-950 mb-2 tracking-tight">
          Bienvenido al Centro de Soporte
        </h2>
        <p class="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Seleccione el recurso que necesita a continuación. Estamos aquí para ayudarle a configurar, mantener y solucionar problemas de su sistema de manera eficiente y segura.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl flex-shrink-0">
        
        <div class="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200 flex flex-col justify-between text-left min-h-[180px]">
          <div>
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-0.5">Manual de Usuario</h3>
            <p class="text-xs text-gray-400 leading-normal mb-4">Guía paso a paso para usuarios finales</p>
          </div>
          <div class="flex justify-end pt-1">
            <NuxtLink 
              to="/soporte/usuario" 
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors duration-200"
            >
              Ver Manual
            </NuxtLink>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200 flex flex-col justify-between text-left min-h-[180px]">
          <div>
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.293.225-.438.59-.393.955v.08c-.045.365.1.73.393.954l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.292-.225.437-.59.392-.955v-.079c.045-.365-.1-.73-.392-.955l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356 1.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-0.5">Manual Técnico</h3>
            <p class="text-xs text-gray-400 leading-normal mb-4">Especificaciones técnicas y configuración avanzada</p>
          </div>
          <div class="flex justify-end pt-1">
            <NuxtLink 
              to="/soporte/tecnico" 
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors duration-200"
            >
              Ver Manual Técnico
            </NuxtLink>
          </div>
        </div>

      </div>
    </main>

    <footer class="py-4 relative flex-shrink-0">
      <div class="w-full flex justify-end items-center">
        <div class="relative">
          <button @click="toggleContacto" class="text-gray-500 hover:text-gray-800 font-semibold transition-colors focus:outline-none text-sm">
            Contacto
          </button>
          <Transition
            enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1"
          >
            <div v-if="mostrarContacto" class="absolute bottom-full right-0 mb-2 w-64 bg-white p-4 rounded-lg border border-gray-200 shadow-xl z-50 text-left">
              <h4 class="font-bold text-gray-900 text-sm mb-1">Soporte Técnico</h4>
              <p class="text-gray-400 text-xs leading-relaxed mb-3">Para asistencia personalizada, escríbenos a:</p>
              <a href="mailto:db.mmer@gmail.com" class="text-sm font-semibold text-emerald-700 hover:underline break-all">db.mmer@gmail.com</a>
            </div>
          </Transition>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Variables reactivas compartidas en la landing page principal
const userName = ref('')
const userRole = ref('')

const mostrarContacto = ref(false)
const toggleContacto = (event) => { event.stopPropagation(); mostrarContacto.value = !mostrarContacto.value }
const cerrarPopover = () => { mostrarContacto.value = false }
onMounted(() => { window.addEventListener('click', cerrarPopover) })
onUnmounted(() => { window.removeEventListener('click', cerrarPopover) })
</script>