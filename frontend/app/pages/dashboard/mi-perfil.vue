<template>
  <div class="flex gap-3 items-center justify-start">
    <div class="flex justify-center items-center p-3 bg-primary-100 rounded-lg">
      <UIcon name="i-heroicons-user-circle" class="size-10 text-primary-700" />
    </div>
    <div>
      <h1 class="text-3xl font-bold text-gray-800">Mi Perfil</h1>
      <p class="text-sm text-gray-500 mt-0.5">Gestiona tu información de usuario, contacto y seguridad en SAGES.</p>
    </div>
  </div>

  <div class="p-6 w-full mx-auto max-w-5xl">
    <UForm :schema="perfilSchema" :state="formData" @submit="handleGuardarCambios" class="space-y-4 max-h-[70dvh]">

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center gap-2 mb-4 text-gray-700 border-b pb-2">
          <UIcon name="i-lucide-user" class="size-5 text-gray-500" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-gray-600">Información General</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <UFormField label="Nombre" name="nombre" required>
            <UInput v-model="formData.nombre" placeholder="Ej. Juan" class="w-full" />
          </UFormField>

          <UFormField label="Apellido" name="apellido" required>
            <UInput v-model="formData.apellido" placeholder="Ej. Pérez" class="w-full" />
          </UFormField>

          <UFormField label="Cédula de Identidad" name="cedula">
            <UInput 
              v-model="formData.cedula" 
              placeholder="Ej. 12345678" 
              class="w-full"
              :disabled="esCedulaBloqueada"
            />
          </UFormField>

          <UFormField label="Nombre de Usuario" name="username" required>
            <UInput v-model="formData.username" placeholder="Ej. jperez" class="w-full" />
          </UFormField>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center gap-2 mb-4 text-gray-700 border-b pb-2">
          <UIcon name="i-lucide-phone" class="size-5 text-gray-500" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-gray-600">Contacto</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UFormField label="Correo Electrónico" name="email" required>
            <UInput v-model="formData.email" type="email" placeholder="correo@institucion.com" class="w-full" />
          </UFormField>

          <UFormField label="Número Telefónico" name="telefono">
            <UInput v-model="formData.telefono" placeholder="Ej. +58 412-1234567" class="w-full" />
          </UFormField>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center gap-2 mb-4 text-gray-700 border-b pb-2">
          <UIcon name="i-lucide-shield-check" class="size-5 text-gray-500" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-gray-600">Seguridad</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <UFormField label="Contraseña Actual" name="passwordActual">
            <UInput 
              v-model="formData.passwordActual" 
              :type="showPasswordActual ? 'text' : 'password'" 
              placeholder="••••••••" 
              class="w-full"
            >
              <template #trailing>
                <UButton
                  type="button"
                  color="neutral"
                  variant="link"
                  :icon="showPasswordActual ? 'i-lucide-eye-slash' : 'i-lucide-eye'"
                  @click="showPasswordActual = !showPasswordActual"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Nueva Contraseña" name="passwordNueva">
            <UInput 
              v-model="formData.passwordNueva" 
              :type="showPasswordNueva ? 'text' : 'password'" 
              placeholder="Mínimo 8 caracteres" 
              class="w-full"
            >
              <template #trailing>
                <UButton
                  type="button"
                  color="neutral"
                  variant="link"
                  :icon="showPasswordNueva ? 'i-lucide-eye-slash' : 'i-lucide-eye'"
                  @click="showPasswordNueva = !showPasswordNueva"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Confirmar Nueva Contraseña" name="passwordConfirmar">
            <UInput 
              v-model="formData.passwordConfirmar" 
              :type="showPasswordConfirmar ? 'text' : 'password'" 
              placeholder="Repite la nueva contraseña" 
              class="w-full"
            >
              <template #trailing>
                <UButton
                  type="button"
                  color="neutral"
                  variant="link"
                  :icon="showPasswordConfirmar ? 'i-lucide-eye-slash' : 'i-lucide-eye'"
                  @click="showPasswordConfirmar = !showPasswordConfirmar"
                />
              </template>
            </UInput>
          </UFormField>
        </div>

        <div v-if="userRole === 'admin'">
          <div class="mt-6 pt-5 border-t border-green-100 flex items-center gap-2 mb-4 text-green-700">
            <UIcon name="i-lucide-badge-help" class="size-5 text-green-600" />
            <h3 class="text-sm font-bold uppercase tracking-wider text-green-700">Recuperación de Cuenta (Cuestionario)</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <UFormField label="Pregunta Secreta #1" name="preguntaSeguridad1">
                <UInput 
                  v-model="formData.preguntaSeguridad1" 
                  placeholder="Ej. ¿Cuál es el nombre de tu primera mascota?" 
                  class="w-full" 
                />
              </UFormField>
              <UFormField label="Respuesta de Seguridad 1" name="answer1">
                <UInput 
                  v-model="formData.respuestaSeguridad1" 
                  :type="showAnswer1 ? 'text' : 'password'" 
                  :placeholder="formData.preguntaSeguridad1 ? '•••••••• (Ya configurada)' : 'Escribe tu respuesta aquí'" 
                  class="w-full"
                >
                  <template #trailing>
                    <UButton
                      type="button"
                      color="neutral"
                      variant="link"
                      :icon="showAnswer1 ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      @click="showAnswer1 = !showAnswer1"
                    />
                  </template>
                </UInput>
              </UFormField>
            </div>

            <div class="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <UFormField label="Pregunta Secreta #2" name="preguntaSeguridad2">
                <UInput 
                  v-model="formData.preguntaSeguridad2" 
                  placeholder="Ej. ¿Cuál es tu ciudad de nacimiento?" 
                  class="w-full" 
                />
              </UFormField>
              <UFormField label="Respuesta de Seguridad 2" name="answer2">
                <UInput 
                  v-model="formData.respuestaSeguridad2" 
                  :type="showAnswer2 ? 'text' : 'password'" 
                  :placeholder="formData.preguntaSeguridad2 ? '•••••••• (Ya configurada)' : 'Escribe tu respuesta aquí'" 
                  class="w-full"
                >
                  <template #trailing>
                    <UButton
                      type="button"
                      color="neutral"
                      variant="link"
                      :icon="showAnswer2 ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      @click="showAnswer2 = !showAnswer2"
                    />
                  </template>
                </UInput>
              </UFormField>
            </div>
          </div>
        </div>

      </div>

      <div class="flex justify-end gap-3">
        <UButton type="submit" color="primary" :loading="enviandoForm">
          Guardar Cambios
        </UButton>
      </div>

    </UForm>
  </div>
</template>

<script setup>
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const userRole = useCookie('user_role')

const esCedulaBloqueada = computed(() => userRole.value !== 'admin')

const toast = useToast()

const showPasswordActual    = ref(false)
const showPasswordNueva     = ref(false)
const showPasswordConfirmar = ref(false)
const showAnswer1 = ref(false)
const showAnswer2 = ref(false)
const enviandoForm          = ref(false)

const formData = ref({
  nombre:              '',
  apellido:            '',
  cedula:              '',
  username:            '',
  telefono:            '',
  email:               '',
  passwordActual:      '',
  passwordNueva:       '',
  passwordConfirmar:   '',
  preguntaSeguridad1:  '',
  respuestaSeguridad1: '',
  preguntaSeguridad2:  '',
  respuestaSeguridad2: ''
})

const perfilSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  cedula:   z.string().optional(),
  username: z
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email:    z.string().email('Introduce un correo electrónico válido'),
  telefono: z
    .string()
    .regex(/^$|^[0-9+ \-]{10,20}$/, 'Introduce un número de teléfono válido')
    .optional(),
  passwordActual:      z.string().optional(),
  passwordNueva:       z.string().optional(),
  passwordConfirmar:   z.string().optional(),
  preguntaSeguridad1:  z.string().optional(),
  respuestaSeguridad1: z.string().optional(),
  preguntaSeguridad2:  z.string().optional(),
  respuestaSeguridad2: z.string().optional()
})
.refine((data) => {
  if (data.passwordNueva && !data.passwordActual) return false
  return true
}, {
  message: 'La contraseña actual es requerida para establecer una nueva.',
  path: ['passwordActual']
})
.refine((data) => {
  if (data.passwordNueva && data.passwordNueva.length < 8) return false
  return true
}, {
  message: 'La nueva contraseña debe tener al menos 8 caracteres.',
  path: ['passwordNueva']
})
.refine((data) => {
  // Si ambas están vacías no hay nada que comparar
  if (!data.passwordNueva && !data.passwordConfirmar) return true
  if (data.passwordNueva !== data.passwordConfirmar) return false
  return true
}, {
  message: 'Las nuevas contraseñas no coinciden.',
  path: ['passwordConfirmar']
})
.refine((data) => {
  if (data.preguntaSeguridad1 && !data.respuestaSeguridad1) return false
  return true
}, {
  message: 'Debe ingresar la respuesta para la primera pregunta.',
  path: ['respuestaSeguridad1']
})
.refine((data) => {
  if (data.preguntaSeguridad2 && !data.respuestaSeguridad2) return false
  return true
}, {
  message: 'Debe ingresar la respuesta para la segunda pregunta.',
  path: ['respuestaSeguridad2']
})

onMounted(async () => {
  try {
    const response = await useApi('/auth/me', { method: 'GET' })
    if (response && response.data) {
      const user = response.data
      formData.value.nombre    = user.nombre
      formData.value.apellido  = user.apellido
      formData.value.cedula    = user.cedula
      formData.value.email     = user.email
      formData.value.telefono  = user.telefono || ''
      formData.value.username  = user.username
      formData.value.preguntaSeguridad1 =  user.question1,
      formData.value.preguntaSeguridad2 = user.question2
    }
  } catch (error) {
    console.error('Error cargando los datos del perfil:', error)
  }
})

const handleGuardarCambios = async () => {
  enviandoForm.value = true
  try {
    const payload = {
      nombre:              formData.value.nombre,
      apellido:            formData.value.apellido,
      cedula:              formData.value.cedula,
      username:            formData.value.username,
      telefono:            formData.value.telefono,
      email:               formData.value.email,
      question1:  formData.value.preguntaSeguridad1  || null,
      answer1: formData.value.respuestaSeguridad1 || null,
      question2:  formData.value.preguntaSeguridad2  || null,
      answer2: formData.value.respuestaSeguridad2 || null
    }

    if (formData.value.passwordNueva) {
      payload.passwordActual = formData.value.passwordActual
      payload.passwordNueva  = formData.value.passwordNueva
    }

    if (!payload.answer1 || payload.answer1.trim() === '') {
      delete payload.question1
      delete payload.answer1
    }
    if (!payload.answer2 || payload.answer2.trim() === '') {
      delete payload.question2
      delete payload.answer2
    }

    await useApi('/auth/update-profile', { method: 'PUT', body: payload })

    toast.add({
      title:       '¡Perfil actualizado!',
      description: 'Los cambios fueron guardados correctamente.',
      color:       'success'
    })

    formData.value.passwordActual      = ''
    formData.value.passwordNueva       = ''
    formData.value.passwordConfirmar   = ''
  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    const errorData = error.data
    let mensajeError = 'Hubo un error al procesar la actualización.'

    if (errorData) {
      if (errorData.errors && errorData.errors.length > 0) {
        mensajeError = errorData.errors[0].mensaje
      } else if (errorData.message) {
        mensajeError = errorData.message
      }
    } else if (error.message) {
      mensajeError = error.message
    }

    toast.add({
      title:       'Error de Validación',
      description: mensajeError,
      color:       'error'
    })
  } finally {
    enviandoForm.value = false
  }
}
</script>