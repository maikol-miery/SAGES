<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const userName = useCookie('user_name')
const userRole = useCookie('user_role')

const route = useRoute()

// 2. Diccionario que mapea la URL con el título real que quieres mostrar
const titulosPaginas = {
  '/dashboard': 'Inicio',
  '/dashboard/personal': 'Gestión de Personal',
  '/dashboard/estudiantes': 'Control de Estudiantes',
  '/dashboard/carga-academica': 'Carga Académica',
  '/dashboard/calificaciones': 'Control de Calificaciones',
  '/dashboard/perfil': 'Mi Perfil'
}

// 3. Propiedad computada que vigila la URL y devuelve el título correspondiente
const tituloActual = computed(() => {
  // Buscamos la ruta actual en nuestro diccionario. 
  // Si por alguna razón no existe (ej: una subruta), ponemos 'SAGES' por defecto.
  return titulosPaginas[route.path] || 'SAGES'
})

// 1. El array de opciones vuelve a ser un JSON plano, limpio y sin funciones adentro
const anosEscolares = [
  [
    { label: 'Año Escolar: 2025-2026', value: '2025-2026' },
    { label: 'Año Escolar: 2024-2025', value: '2024-2025' }
  ]
]

// 2. Tu ref inicializado con el objeto completo por defecto
const anoSeleccionado = ref(anosEscolares[0][0])
</script>

<template>
  <header class="h-16 bg-neutral-50 border-b border-gray-200 flex items-center justify-between px-6">
    
    <div class="flex gap-5">
      <h2 class="text-lg font-bold text-olivine-600 hidden md:block tracking-wide">
        {{ tituloActual }}
      </h2>
      <USeparator orientation="vertical" type="solid" size="sm" color="neutral" class="h-8"></USeparator>
      <USelectMenu 
      :items="anosEscolares" 
      :search-input="false" 
      v-model="anoSeleccionado" 
      icon="i-lucide-calendar"
      class="bg-white"
      >
      </USelectMenu>
    </div>

    <div class="flex items-center gap-4">
      <UTooltip arrow text="Notificaciones" :delay-duration="150">
        <UButton
            icon="i-heroicons-bell"
            color="gray"
            variant="ghost"
            class="text-gray-500 hover:text-gray-700 hover:bg-olivine-300 rounded-full"
        />
      </UTooltip>
      
    <UTooltip arrow text="Ayuda" :delay-duration="150">
        <UButton
        icon="i-heroicons-question-mark-circle"
        color="gray"
        variant="ghost"
        class="text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-full"
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

        <div class="size-9 rounded-full bg-olivine-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm border border-olivine-600">
          {{ userName?.charAt(0) || 'U' }}
        </div>
      </div>

    </div>

  </header>
</template>