<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const userName = useCookie('user_name')
const userRole = useCookie('user_role')

const route = useRoute()

// Diccionario que mapea la URL con el título real de la página
const titulosPaginas = {
  '/dashboard': 'Inicio',
  '/dashboard/personal': 'Gestión de Personal',
  '/dashboard/estudiantes': 'Control de Estudiantes',
  '/dashboard/carga-academica': 'Carga Académica',
  '/calificaciones': 'Control de Calificaciones',
  '/calificaciones/carga-seccion': 'Calificaciones / Carga Por Sección',
  '/dashboard/perfil': 'Mi Perfil'
}

// Propiedad computada que vigila la URL y devuelve el título correspondiente
const tituloActual = computed(() => {
  return titulosPaginas[route.path] || 'SAGES'
})

// 1. Array de opciones limpio con la nomenclatura 'anio'
const aniosEscolares = [
  [
    { label: 'Año Escolar: 2025-2026', value: '2025-2026' },
    { label: 'Año Escolar: 2024-2025', value: '2024-2025' }
  ]
]

// 2. 🚀 Usamos useState para que el año seleccionado sea global y accesible en otras vistas
const anioSeleccionado = useState('anio_escolar_activo', () => aniosEscolares[0][0])
</script>

<template>
  <header class="h-16 bg-neutral-50 border-b border-gray-200 flex items-center justify-between px-6">
    
    <div class="flex gap-5">
      <h2 class="text-lg font-bold text-olivine-600 hidden md:block tracking-wide">
        {{ tituloActual }}
      </h2>
      <USeparator orientation="vertical" type="solid" size="sm" color="neutral" class="h-8"></USeparator>
      
      <USelectMenu 
        :items="aniosEscolares" 
        :search-input="false" 
        v-model="anioSeleccionado" 
        icon="i-lucide-calendar"
        class="bg-white"
      >
      </USelectMenu>
    </div>

    <div class="flex items-center gap-4">

      <!-- BARRA DE NOTIFICACIONES -->
      <!-- <UTooltip arrow text="Notificaciones" :delay-duration="150">
        <UButton
          icon="i-heroicons-bell"
          color="gray"
          variant="ghost"
          class="text-gray-500 hover:text-gray-700 hover:bg-olivine-300 rounded-full"
        />
      </UTooltip> -->
      
      <UTooltip arrow text="Ayuda" :delay-duration="150">
        <UButton
          icon="i-heroicons-question-mark-circle"
          color="gray"
          variant="ghost"
          class="text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-full"
          to="/soporte"
        />
      </UTooltip>
      
      <div class="h-6 w-[1px] bg-gray-200"></div>

      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-gray-700 leading-tight">
            Hola, {{ userName || 'Usuario' }}
          </p>
          <p class="text-xs text-gray-400 font-medium capitalize">
            {{ userRole || 'Invitado' }}
          </p>
        </div>

        <NuxtLink to="/dashboard/mi-perfil">
          <div class="size-9 rounded-full bg-olivine-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm border border-olivine-600">
            {{ userName?.charAt(0) || 'U' }}
          </div>
        </NuxtLink>
        
      </div>

    </div>

  </header>
</template>