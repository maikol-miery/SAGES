<template>
  <div class="p-6 w-full mx-auto max-w-5xl">
    <div class="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Mi Perfil</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestiona tu información de usuario, contacto y seguridad en SAGES.</p>
      </div>
    </div>

    <UForm :schema="perfilSchema" :state="formData" @submit="handleGuardarCambios" class="space-y-6">

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

          <UFormField label="Nombre de Usuario" name="username" required>
            <UInput v-model="formData.username" placeholder="Ej. juan_perez" class="w-full" />
          </UFormField>

          <UFormField label="Cédula" name="cedula">
            <UInput v-model="formData.cedula" disabled class="w-full bg-gray-50 text-gray-500 cursor-not-allowed" />
          </UFormField>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center gap-2 mb-4 text-gray-700 border-b pb-2">
          <UIcon name="i-lucide-phone" class="size-5 text-gray-500" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-gray-600">Contacto</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UFormField label="Teléfono" name="telefono">
            <UInput v-model="formData.telefono" placeholder="Ej. +1 234 567 890" class="w-full" />
          </UFormField>

          <UFormField label="Correo electrónico" name="email" required>
            <UInput v-model="formData.email" type="email" placeholder="usuario@sages.edu" class="w-full" />
          </UFormField>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-green-200/60 ring-1 ring-green-500/5">
        <div class="flex items-center gap-2 mb-4 text-green-700 border-b border-green-100 pb-2">
          <UIcon name="i-lucide-shield" class="size-5 text-green-600" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-green-700">Seguridad</h2>
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
                  color="neutral"
                  variant="link"
                  :icon="showPasswordActual ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showPasswordActual = !showPasswordActual"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Nueva Contraseña" name="passwordNueva">
            <UInput
              v-model="formData.passwordNueva"
              :type="showPasswordNueva ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  :icon="showPasswordNueva ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showPasswordNueva = !showPasswordNueva"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Confirmar Nueva Contraseña" name="passwordConfirmar">
            <UInput
              v-model="formData.passwordConfirmar"
              :type="showPasswordConfirmar ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  :icon="showPasswordConfirmar ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showPasswordConfirmar = !showPasswordConfirmar"
                />
              </template>
            </UInput>
          </UFormField>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <UButton
          type="submit"
          color="success"
          size="md"
          icon="i-lucide-save"
          :loading="enviandoForm"
          class="px-6 font-semibold"
        >
          Guardar Cambios
        </UButton>
      </div>

    </UForm>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const toast = useToast()

const showPasswordActual   = ref(false)
const showPasswordNueva    = ref(false)
const showPasswordConfirmar = ref(false)
const enviandoForm = ref(false)

const formData = ref({
  nombre:           '',
  apellido:         '',
  cedula:           '',
  username:         '', // Mantenemos tu estado reactivo original
  telefono:         '',
  email:            '',
  passwordActual:   '',
  passwordNueva:    '',
  passwordConfirmar: ''
})

const perfilSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  cedula: z.string().optional(),
  // Añadimos la validación para el username en el front que coincida con tus criterios
  username: z.string().min(4, 'El nombre de usuario debe tener al menos 4 caracteres').regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z.string().email('Introduce un correo electrónico válido'),
  telefono: z.string().regex(/^$|^[0-9+ \-]{10,20}$/, 'Introduce un número de teléfono válido').optional(),
  passwordActual: z.string().optional(),
  passwordNueva: z.string().optional(),
  passwordConfirmar: z.string().optional()
}).refine((data) => {
  if (data.passwordNueva && !data.passwordActual) return false
  return true
}, {
  message: 'La contraseña actual es requerida para establecer una nueva.',
  path: ['passwordActual']
}).refine((data) => {
  if (data.passwordNueva && data.passwordNueva.length < 8) return false
  return true
}, {
  message: 'La nueva contraseña debe tener al menos 8 caracteres.',
  path: ['passwordNueva']
}).refine((data) => {
  if (data.passwordNueva !== data.passwordConfirmar) return false
  return true
}, {
  message: 'Las nuevas contraseñas no coinciden.',
  path: ['passwordConfirmar']
})

onMounted(async () => {
  try {
    const response = await useApi('/auth/me', { method: 'GET' })
    if (response && response.data) {
      const user = response.data
      formData.value.nombre = user.nombre
      formData.value.apellido = user.apellido
      formData.value.cedula = user.cedula
      formData.value.email = user.email
      formData.value.telefono = user.telefono || ''
      formData.value.username = user.username // Trae el username correctamente
    }
  } catch (error) {
    console.error('Error cargando los datos del perfil:', error)
  }
})

const handleGuardarCambios = async () => {
  enviandoForm.value = true
  try {
    const payload = {
      nombre:   formData.value.nombre,
      apellido: formData.value.apellido,
      username: formData.value.username, // ✨ Enviamos el username al backend
      telefono: formData.value.telefono,
      email:    formData.value.email,
    }

    if (formData.value.passwordNueva) {
      payload.passwordActual = formData.value.passwordActual
      payload.passwordNueva  = formData.value.passwordNueva
    }

    await useApi('/auth/update-profile', { method: 'PUT', body: payload })

    toast.add({ title: '¡Perfil actualizado!', description: 'Los cambios fueron guardados correctamente.', color: 'success' })

    formData.value.passwordActual    = ''
    formData.value.passwordNueva     = ''
    formData.value.passwordConfirmar = ''

  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    toast.add({ title: 'Error', description: error.data?.message || 'Hubo un error al procesar la actualización.', color: 'error' })
  } finally {
    enviandoForm.value = false
  }
}
</script>