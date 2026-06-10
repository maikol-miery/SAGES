<script setup>
import { computed } from 'vue'

// 1. Obtenemos el rol del usuario de las cookies
const userRole = useCookie('user_role')
const userName = useCookie('user_name')

// 2. Definimos los enlaces en la estructura de matriz que pide UNavigationMenu [ [{}], [{}] ]
const todosLosEnlaces = [
  [
    {
      label: 'Inicio',
      icon: 'i-heroicons-home',
      to: '/dashboard',
      rolesPermitidos: ['admin', 'secretaria']
    },
    {
      label: 'Gestión de Personal',
      icon: 'i-heroicons-users',
      to: '/dashboard/personal',
      rolesPermitidos: ['admin']
    },
    {
      label: 'Estudiantes',
      icon: 'i-heroicons-identification',
      to: '/dashboard/estudiantes',
      rolesPermitidos: ['admin', 'secretaria']
    },
    {
      label: 'Carga Académica',
      icon: 'i-heroicons-folder-open',
      to: '/dashboard/carga-academica',
      rolesPermitidos: ['admin', 'secretaria']
    },
    {
      label: 'Calificaciones',
      icon: 'i-heroicons-star',
      to: '/dashboard/calificaciones',
      rolesPermitidos: ['admin', 'secretaria']
    }
  ]
]

// 3. Filtramos los enlaces según el rol del usuario de forma dinámica
const enlacesPermitidos = computed(() => {
  return todosLosEnlaces.map(grupo => 
    grupo.filter(enlace => enlace.rolesPermitidos.includes(userRole.value))
  )
})

// Función para borrar las cookies y salir al login
async function handleLogout() {
  const token = useCookie('token')
  const role = useCookie('user_role')
  const name = useCookie('user_name')
  
  token.value = null
  role.value = null
  name.value = null
  
  await navigateTo('/')
}
</script>

<template>
  <aside class="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4">
    
    <div>
      <div class="mb-8 px-2 flex items-center gap-3">
        <img src="/icon.png" alt="" class="w-12">
        <div>
            <h1 class="text-xl font-bold text-primary-500 tracking-wide">SAGES</h1>
            <p class="text-xs text-gray-400 font-medium">Dashboard</p>
        </div>
        
      </div>

      <USeparator></USeparator>

      <UNavigationMenu
        orientation="vertical"
        :items="enlacesPermitidos"
        color="primary"
        class="mt-4"
        >
        <template #item="{ item, active }">
        <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 px-2 py-4 text-sm rounded-sm transition-colors w-full"
            :class="active
            ? 'text-olivine-700 font-semibold border-l-4 border-olivine-700 rounded-l-none'
            : 'text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50'
            "
        >
            <UIcon v-if="item.icon" :name="item.icon" class="size-5 shrink-0" />
            <span>{{ item.label }}</span>
        </NuxtLink>
        </template>
    </UNavigationMenu>

      <div class="mt-6 px-2">
        <UButton
          icon="i-heroicons-plus"
          label="Nueva Inscripción"
          block
          color="green"
          variant="solid"
          class="bg-olivine-500 hover:bg-olivine-700 hover:cursor-pointer text-white font-medium shadow-sm"
        />
      </div>
    </div>

    <div class="border-t border-gray-100 pt-4 space-y-2">
      <NuxtLink 
        to="/dashboard/perfil" 
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
      >
        <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-gray-400" />
        <span>Mi Perfil</span>
      </NuxtLink>

      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition text-left"
      >
        <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5 text-red-400" />
        <span>Cerrar Sesión</span>
      </button>
    </div>

  </aside>
</template>