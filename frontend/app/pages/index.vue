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
            <p class="transition-colors duration-300 group-hover:text-white uppercase">
              Ingresar
            </p>
          </div>
        </UButton>
      </UForm>

      <footer>
        <button 
          type="button"
          @click="modalRecuperarAbierto = true" 
          class="text-olivine-600 font-semibold text-sm hover:underline block text-left cursor-pointer bg-transparent border-0 p-0"
        >
          ¿Olvidaste tu contraseña? (Solo Administrador)
        </button>

        <p class="text-gray-400 text-sm">© SAGES 2026</p>
      </footer>
    </section>
  </main>

  <UModal v-model:open="modalRecuperarAbierto" title="Recuperación de Cuenta SAGES">
    <template #body>
      <div class="p-6 space-y-6">

        <UStepper v-model="currentStep" :items="stepsItems" :linear="false" class="mb-4" />

        <div v-if="currentStep === 0" class="space-y-4">
          <p class="text-xs text-gray-500">
            Ingrese su credencial única de acceso institucional. Este flujo es exclusivo para roles con privilegios de Administrador.
          </p>
          <UFormField label="Usuario o Correo Administrativo">
            <UInput
              v-model="recuperacionForm.username"
              placeholder="Ej: mmiery_admin"
              icon="i-heroicons-user"
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" @click="modalRecuperarAbierto = false">Cancelar</UButton>
            <!-- ✅ Corregido: era irAPreguntas, ahora apunta a solicitarPreguntasDinamicas -->
            <UButton color="primary" class="bg-primary-600 hover:bg-primary-700 font-semibold" :loading="cargandoRecuperacion" @click="solicitarPreguntasDinamicas">
              Siguiente
            </UButton>
          </div>
        </div>

        <div v-if="currentStep === 1" class="space-y-4">
          <div class="p-3 bg-primary-50 text-primary-800 rounded-lg text-xs font-medium flex items-center gap-2">
            <UIcon name="i-heroicons-shield-exclamation" class="size-5 shrink-0" />
            <span>Conteste las preguntas asignadas a su perfil físico. Las respuestas no distinguen mayúsculas.</span>
          </div>

          <UFormField :label="preguntasAdmin.question1">
            <UInput
              v-model="recuperacionForm.answer1"
              type="password"
              placeholder="Escriba su primera respuesta secreta"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="preguntasAdmin.question2">
            <UInput
              v-model="recuperacionForm.answer2"
              type="password"
              placeholder="Escriba su segunda respuesta secreta"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" :disabled="cargandoRecuperacion" @click="currentStep = 0">Atrás</UButton>
            <UButton color="primary" class="bg-primary-600 hover:bg-primary-700 font-semibold" :loading="cargandoRecuperacion" @click="ejecutarVerificacionPreguntas">
              Validar Respuestas
            </UButton>
          </div>
        </div>

        <div v-if="currentStep === 2" class="space-y-4">
          <p class="text-xs text-gray-500">
            Su identidad ha sido validada mediante criptografía simétrica. Ingrese la nueva clave definitiva para SAGES.
          </p>
          <UFormField label="Nueva Contraseña del Sistema">
            <UInput
              v-model="recuperacionForm.passwordNueva"
              type="password"
              placeholder="Introduzca una contraseña robusta"
              icon="i-heroicons-lock-closed"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" :disabled="cargandoRecuperacion" @click="currentStep = 1">Atrás</UButton>
            <UButton color="success" class="font-semibold" :loading="cargandoRecuperacion" @click="ejecutarRestablecimientoClave">
              Guardar y Sincronizar
            </UButton>
          </div>
        </div>

      </div>
    </template>
  </UModal>
</template>

<script setup>
// ✅ Corregido: eliminado import innecesario, Nuxt auto-importa ref y reactive
import { loginSchema } from '~/schemas/auth.js'

const loading = ref(false)
const toast = useToast()
const showPassword = ref(false)

const state = reactive({
  username: '',
  password: ''
})

async function onSubmit(event) {
  loading.value = true
  
  try {
    const response = await useApi('/auth/login', {
      method: 'POST',
      body: {
        username: event.data.username,
        password: event.data.password
      }
    })

    console.log('Respuesta del Backend:', response)

    const token = response?.data?.token
    const usuario = response?.data?.user

    if (token && usuario) {
      const tokenCookie = useCookie('token', { maxAge: 60 * 60 * 24 })
      const roleCookie = useCookie('user_role', { maxAge: 60 * 60 * 24 })
      const nameCookie = useCookie('user_name', { maxAge: 60 * 60 * 24 })

      tokenCookie.value = token
      nameCookie.value = usuario.nombre
      roleCookie.value = usuario.rol

      toast.add({
        title: '¡Acceso concedido!',
        description: 'Bienvenido al sistema SAGES.',
        color: 'primary',
        icon: 'i-heroicons-check-circle'
      })

      await navigateTo('/dashboard')
    } else {
      console.warn('El backend respondió, pero el JSON no traía el token o el usuario esperado.')
    }

  } catch (error) {
    console.error('Error en el login:', error.data)
    
    let mensajeFinal = 'Ocurrió un error inesperado.'

    if (error.data?.errors && error.data.errors.length > 0) {
      mensajeFinal = error.data.errors[0].mensaje
    } else if (error.data?.message) {
      mensajeFinal = error.data.message
    }

    toast.add({
      title: 'No se pudo iniciar sesión',
      description: mensajeFinal,
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
      duration: 3000 // ✅ Corregido: era `timeout`, la prop correcta es `duration`
    })
  } finally {
    loading.value = false
  }
}

const modalRecuperarAbierto = ref(false)
const cargandoRecuperacion = ref(false)
const currentStep = ref(0)

// ✅ Corregido: values eran strings ('1','2','3'), ahora son números (0,1,2)
// para que coincidan con las comparaciones currentStep === 0/1/2 del template
const stepsItems = [
  { value: 0, label: 'Identidad', icon: 'i-heroicons-user',        description: 'Administrador' },
  { value: 1, label: 'Seguridad', icon: 'i-heroicons-shield-check', description: 'Cuestionario'  },
  { value: 2, label: 'Finalizar', icon: 'i-heroicons-key',          description: 'Nueva clave'   }
]

const recuperacionForm = ref({
  username: '',
  answer1: '',
  answer2: '',
  passwordNueva: ''
})

const resetTokenTemp = ref('')

const preguntasAdmin = ref({
  question1: '',
  question2: ''
})

const solicitarPreguntasDinamicas = async () => {
  if (!recuperacionForm.value.username.trim()) {
    return toast.add({ title: 'Atención', description: 'Por favor, introduce tu usuario administrativo.', color: 'warning' })
  }

  cargandoRecuperacion.value = true
  try {
    const res = await useApi('/auth/get-questions', {
      method: 'POST',
      body: { username: recuperacionForm.value.username }
    })

    preguntasAdmin.value.question1 = res.data.question1
    preguntasAdmin.value.question2 = res.data.question2

    currentStep.value = 1
  } catch (error) {
    toast.add({
      title: 'Módulo Bloqueado',
      description: error.data?.message || 'No se pudieron recuperar las preguntas del servidor.',
      color: 'error'
    })
  } finally {
    cargandoRecuperacion.value = false
  }
}

const ejecutarVerificacionPreguntas = async () => {
  if (!recuperacionForm.value.answer1.trim() || !recuperacionForm.value.answer2.trim()) {
    return toast.add({ title: 'Campos Vacíos', description: 'Debe responder ambas preguntas secretas.', color: 'warning' })
  }

  cargandoRecuperacion.value = true
  try {
    const res = await useApi('/auth/verify-questions', {
      method: 'POST',
      body: {
        username: recuperacionForm.value.username,
        answer1: recuperacionForm.value.answer1,
        answer2: recuperacionForm.value.answer2
      }
    })

    resetTokenTemp.value = res.temporaryToken
    toast.add({ title: 'Verificación Exitosa', description: res.message, color: 'success' })
    currentStep.value = 2
  } catch (error) {
    toast.add({
      title: 'Error de Seguridad',
      description: error.data?.message || 'Respuestas incorrectas.',
      color: 'error'
    })
  } finally {
    cargandoRecuperacion.value = false
  }
}

const ejecutarRestablecimientoClave = async () => {
  if (!recuperacionForm.value.passwordNueva || recuperacionForm.value.passwordNueva.trim().length < 6) {
    return toast.add({ title: 'Contraseña Débil', description: 'La clave debe poseer al menos 6 caracteres.', color: 'warning' })
  }

  cargandoRecuperacion.value = true
  try {
    const res = await useApi('/auth/reset-password', {
      method: 'POST',
      body: {
        temporaryToken: resetTokenTemp.value,
        newPassword: recuperacionForm.value.passwordNueva
      }
    })

    toast.add({ title: 'Proceso Culminado', description: res.message, color: 'success' })
    
    modalRecuperarAbierto.value = false
    currentStep.value = 0
    recuperacionForm.value = { username: '', answer1: '', answer2: '', passwordNueva: '' }
    resetTokenTemp.value = ''
  } catch (error) {
    toast.add({
      title: 'Fallo en Restablecimiento',
      description: error.data?.message || 'Sesión expirada.',
      color: 'error'
    })
  } finally {
    cargandoRecuperacion.value = false
  }
}
</script>

<style scoped>
::-ms-reveal {
  display: none;
}
</style>