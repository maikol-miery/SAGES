<template>
  <main class="h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
    
    <aside class="w-full h-full bg-linear-to-br from-olivine-400 to-olivine-600 flex justify-center items-center flex-col p-14 relative animate-fade-in text-white">
      <div class="bg-white/20 p-4 rounded-3xl backdrop-blur-sm mb-6" aria-hidden="true">
          <UIcon name="i-heroicons-academic-cap" class="w-20 h-20 text-white" />
      </div>
      <h1 class="text-6xl font-bold tracking-tighter mb-2">Bienvenido a</h1>
      <p class="text-3xl font-bold tracking-[0.2em] opacity-90">SAGES</p>
      <div class="overflow-hidden w-full mb-4">
        <UPageLogos
          title=""
          :marquee="{repeat: 10, speed: 'slow', pauseOnHover: true, overlay: false}"
          class="mt-8 mb-8 text-olivine-700"
          :items="[
            'i-simple-icons-nodedotjs',
            'i-simple-icons-postgresql',
            'i-simple-icons-supabase',
            'i-simple-icons-vuejs',
            'i-simple-icons-nuxt',
            'i-simple-icons-tailwindcss',
          ]"
        />
      </div>
      
      <footer class="text-center">
        <p class="text-xs tracking-[0.3em] font-medium opacity-60">SISTEMA ADMINISTRATIVO DE GESTIÓN ESTUDIANTIL</p>
      </footer>
    </aside>

    <section class="size-full bg-white p-14 flex items-center justify-center flex-col">

      <header class="mb-10 text-left">
        <h2 id="login-heading" class="text-4xl font-semibold text-olivine-600 mb-2">Iniciar Sesión</h2>
        <p class="text-l text-gray-500 font-medium">Accede a tu cuenta institucional</p>
      </header>
      <UForm 
      :validate-on="['input','blur', 'change']" 
      :schema="loginSchema" 
      :state="state"
      @submit="onSubmit"
      novalidate
      >
        <UFormField label="Usuario o Correo Electrónico" name="username" :required="true" class="mb-8">
          <UInput
            v-model="state.username"
            placeholder="Ingrese su usuario" 
            type="text"
            variant="soft"
            size="xl"
            icon="i-heroicons-user"
            :ui="{ base: 'px-4 py-5 w-md text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500 focus:scale-[1.01]'}"
          />
        </UFormField>

        <UFormField label="Contraseña" name="password" :required="true" class="mb-8">
          <UInput 
            v-model="state.password"
            placeholder="Contraseña" 
            variant="soft"
            size="xl"
            icon="i-heroicons-lock-closed"
            :type="showPassword ? 'text' : 'password'"
            :ui="{ base: 'px-4 py-5 w-md text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500 focus:scale-[1.01]'}"
          >
            <template #trailing>
              <button
                type="button"
                aria-label="Mostrar u ocultar contraseña"
                class="text-gray-500 hover:text-gray-700 flex items-center justify-center"
                @click="showPassword = !showPassword"
              >
                <UIcon 
                  :name="showPassword ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'" 
                  :class="[
                    'w-5 h-5 transition-colors', 
                    showPassword ? 'text-olivine-500 hover:text-olivine-700' : 'text-gray-500 hover:text-gray-700'
                  ]" 
                />
              </button>
            </template>
          </UInput>
        </UFormField>

        <UButton 
          type="submit" 
          :loading="loading" 
          :disabled="loading"
          class="bg-white text-center w-full max-w-md rounded-2xl h-14 relative text-gray-600 text-md font-semibold group shadow-sm overflow-hidden mb-8"
          >
          <div
            class="bg-olivine-500 rounded-xl h-12 w-12 absolute left-1 top-[4px] group-hover:w-full group-hover:h-full group-hover:left-0 group-hover:top-0 group-hover:rounded-2xl z-10 duration-500"
          ></div>

          <div 
            class="absolute left-4 z-20 transition-all duration-500 ease-out group-hover:left-[calc(100%-40px)] flex items-center justify-center w-8 h-8"
          >
            <UIcon 
              name="i-heroicons-arrow-right" 
              class="w-6 h-6 text-white" 
            />
          </div>

          <div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <p class="transition-colors duration-300 group-hover:text-white uppercase f">
              Ingresar
            </p>
          </div>

          </UButton>
      </UForm>

      <footer>
        <NuxtLink to="#" class="text-olivine-600 font-semibold text-sm hover:underline block">
          ¿Olvidaste tu contraseña? (Solo Administrador)
        </NuxtLink>

        <p class="text-gray-400 text-sm">© SAGES 2026</p>
      </footer>
    </section>
  </main>
</template>

<script setup>
import {ref, reactive} from 'vue'
import { loginSchema } from '~/schemas/auth.js'


const loading = ref(false)
const toast = useToast()
const showPassword = ref(false)
const password = ref('')

const state = reactive({
  username: '',
  password: ''
})

async function onSubmit(event) {
  // 1. Encendemos el estado de carga (congela el botón)
  loading.value = true
  
  try {
    // 2. Realizamos la petición POST usando $fetch
    // Reemplaza '/api/auth/login' por la URL real de tu backend
    const response = await useApi('/auth/login', {
      method: 'POST',
      body: {
        username: event.data.username,
        password: event.data.password
      }
    })

    // 3. Si el backend responde con éxito, aquí tienes tu JSON con el token
    console.log('Respuesta del Backend:', response)
    
    if (response.data && response.data.token) {
      const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 })
      tokenCookie.value = response.data.token
      
      // Toast opcional de éxito antes de irse al dashboard
      toast.add({
        title: '¡Acceso concedido!',
        description: 'Bienvenido al sistema SAGES.',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })

      await navigateTo('/dashboard')
    }

  } catch (error) {
    // 4. Si el backend devuelve un error (ej: 401 Credenciales Incorrectas)
    console.error('Error en el login:', error.data)
    
    let mensajeFinal = 'Ocurrió un error inesperado.'

    if (error.data?.errors && error.data.errors.length > 0) {
      mensajeFinal = error.data.errors[0].mensaje
    } else if (error.data?.message) {
      // Respaldo por si viene solo el mensaje genérico
      mensajeFinal = error.data.message
    }

    // 3. Disparamos el Toast con el nombre de tu variable corregido
    toast.add({
      title: 'No se pudo iniciar sesión',
      description: mensajeFinal, // <-- Aquí ya no se romperá
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error', // O usa 'red' si tu config de Nuxt UI mapea el estado de error ahí
      timeout: 3000
    })
  } finally {
    // 5. Apagamos el loading siempre, pase lo que pase
    loading.value = false
  }
}

</script>

<style scoped>
::-ms-reveal {
    display: none;
}
</style>