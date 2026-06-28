<template>
  <USlideover v-model:open="isOpen" title="Detalles del Personal">
    <template #body>
      <form @submit.prevent="handleGuardar" class="space-y-5 flex flex-col h-full justify-between pb-4">

        <div class="space-y-5 overflow-y-auto pr-1 max-h-[calc(100vh-120px)]">
          <div class="bg-gray-50/60 p-4 rounded-xl border border-gray-100 space-y-4">
            <div class="flex items-center gap-2 text-primary-700 font-bold text-md uppercase tracking-wider border-b pb-1.5">
              <UIcon name="i-lucide-user" class="size-6 text-primary-600" />
              <span>Información Básica</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Cédula" required>
                <UInput
                  v-model="formData.cedula"
                  placeholder="V124567889"
                  :disabled="mode === 'view'"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Teléfono">
                <UInput
                  v-model="formData.telefono"
                  placeholder="04120000000"
                  :disabled="mode === 'view'"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nombre" required>
                <UInput
                  v-model="formData.nombre"
                  placeholder="Ej. Carlos"
                  :disabled="mode === 'view'"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Apellido" required>
                <UInput
                  v-model="formData.apellido"
                  placeholder="Ej. Pérez"
                  :disabled="mode === 'view'"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Correo Electrónico" required>
              <UInput
                v-model="formData.email"
                type="email"
                placeholder="carlos@sages.edu"
                :disabled="mode === 'view'"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4 pt-1 border-t border-gray-100 mt-2">
  
                <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Clasificación</p>
                    
                    <p v-if="mode === 'view'" class="text-xs font-bold text-gray-700 uppercase pt-1">
                    {{ formData.tipo_personal }}
                    </p>
                    
                    <USelectMenu
                    v-else
                    v-model="formData.tipo_personal"
                    :items="[
                        { value: 'docente', label: 'Docente' },
                        { value: 'administrativo', label: 'Administrativo' }
                    ]"
                    value-key="value"
                    class="w-full"
                    />
                </div>

                <div v-if="mode !== 'create'">
                    <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Estatus Sistema</p>
                    
                    <p v-if="mode === 'view'" class="text-xs font-bold text-emerald-700 uppercase pt-1">
                    {{ formData.estado }}
                    </p>
                    
                    <USelectMenu
                    v-else
                    v-model="formData.estado"
                    :items="[
                        { value: 'activo', label: 'Activo' },
                        { value: 'inactivo', label: 'Inactivo' }
                    ]"
                    value-key="value"
                    class="w-full"
                    />
                </div>  

            </div>
          </div>

          <div class="bg-gray-50/60 p-4 rounded-xl border border-gray-100 space-y-4">
            <div class="flex items-center justify-between border-b pb-1.5">
              <div class="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                <UIcon name="i-lucide-lock" class="size-4 text-emerald-800" />
                <span>Cuenta de Usuario</span>
              </div>
              <USwitch
                v-if="mode !== 'view'"
                v-model="habilitarUsuario"
                color="primary"
                size="sm"
              />
            </div>

            <div v-if="habilitarUsuario || mode === 'view'" class="space-y-4 pt-1">
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Nombre de Usuario" :required="mode !== 'view'">
                  <UInput
                    v-model="formData.username"
                    placeholder="cperez"
                    :disabled="mode === 'view'"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Rol Asignado" :required="mode !== 'view'">
                  <USelectMenu
                    v-model="formData.rol"
                    :items="opcionesRoles"
                    value-key="value"
                    :disabled="mode === 'view'"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField
                v-if="mode !== 'view'"
                :label="mode === 'edit' ? 'Nueva Contraseña (Opcional)' : 'Contraseña'"
                :required="mode === 'create'"
              >
                <UInput
                  v-model="formData.password"
                  type="password"
                  placeholder="••••••••"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div v-else class="text-center py-2">
              <p class="text-xs text-gray-400 italic">Este miembro del personal no poseerá credenciales de acceso al sistema.</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton
            v-if="mode !== 'view'"
            type="submit"
            color="primary"
            :loading="loading"
            class="font-semibold"
          >
            {{ mode === 'create' ? 'Registrar Personal' : 'Guardar Cambios' }}
          </UButton>
        </div>
      </form>
    </template>
  </USlideover>
</template>

<script setup>
// Nuxt auto-importa: ref, useToast

const emit = defineEmits(['refresh'])

const isOpen          = ref(false)
const mode            = ref('view') // view | create | edit
const loading         = ref(false)
const habilitarUsuario = ref(false)
const toast           = useToast()

const opcionesRoles = [
  { value: 'profesor',   label: 'Profesor' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'admin',      label: 'Administrador' }
]

const estructuraLimpia = () => ({
  id:           null,
  cedula:       '',
  nombre:       '',
  apellido:     '',
  email:        '',
  telefono:     '',
  tipo_personal: '',
  estado:       'activo',
  username:     '',
  rol:          '',
  password:     ''
})

const formData = ref(estructuraLimpia())

// Disparado desde StaffTable via ref
const open = (actionMode, data = null) => {
  mode.value            = actionMode
  formData.value        = estructuraLimpia()
  habilitarUsuario.value = false
  isOpen.value          = true

  if (data) {
    formData.value.id           = data.id
    formData.value.cedula       = data.cedula
    formData.value.nombre       = data.nombre
    formData.value.apellido     = data.apellido
    formData.value.email        = data.email
    formData.value.telefono     = data.telefono || ''
    formData.value.tipo_personal = data.tipo_personal
    formData.value.estado       = data.estado ?? 'activo';

    if (data.cuenta) {
      habilitarUsuario.value  = true
      formData.value.username = data.cuenta.username
      formData.value.rol      = data.cuenta.rol
    }
  }
}

const handleGuardar = async () => {
  if (!formData.value.cedula || !formData.value.nombre || !formData.value.apellido || !formData.value.email) {
    toast.add({ title: 'Campos incompletos', description: 'Por favor rellena los campos obligatorios.', color: 'warning' })
    return
  }

  loading.value = true
  try {
    const payload = {
      cedula:   formData.value.cedula,
      nombre:   formData.value.nombre,
      apellido: formData.value.apellido,
      email:    formData.value.email,
      telefono: formData.value.telefono,
      tipo_personal: formData.value.tipo_personal,
      estado: formData.value.estado

    }

    if (habilitarUsuario.value) {
      payload.username = formData.value.username
      payload.rol      = formData.value.rol
      if (formData.value.password?.trim()) {
        payload.password = formData.value.password
      }
    }

    if (mode.value === 'create') {
      await useApi('/staff', { method: 'POST', body: payload })
      toast.add({ title: 'Éxito', description: 'Miembro del personal registrado con éxito.', color: 'success' })
    } else if (mode.value === 'edit') {
      await useApi(`/staff/${formData.value.id}`, { method: 'PATCH', body: payload })
      toast.add({ title: 'Éxito', description: 'Datos actualizados correctamente.', color: 'success' })
    }

    emit('refresh')
    isOpen.value = false
  } catch (error) {
    console.error('Error en la operación de Staff:', error)
    toast.add({
      title: 'Error en la solicitud',
      description: error.data?.message || 'No se pudo procesar la transacción en el servidor SAGES.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>