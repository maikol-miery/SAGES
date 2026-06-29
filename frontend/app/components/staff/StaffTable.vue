<template>
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <div class="w-full lg:max-w-md">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Buscar por cédula, nombre, apellido o correo..."
          clearable
          class="w-full"
        />
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Personal:</span>
          <USelectMenu
            v-model="filtroTipo"
            :items="opcionesTipo"
            value-key="value"
            class="w-40"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Rol SAGES:</span>
          <USelectMenu
            v-model="filtroRol"
            :items="opcionesRol"
            value-key="value"
            class="w-40"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Estatus:</span>
          <USelectMenu
            v-model="filtroEstado"
            :items="opcionesEstado"
            value-key="value"
            class="w-36"
          />
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <UTable
        sticky
        loading-animation="elastic"
        loading-color="primary"
        :loading="status === 'pending'"
        :data="personal"
        :columns="columns"
        class="w-full md:max-h-[60dvh] sm:max-h-[30dvh]"
        :ui="{
          td: 'py-2.5',
          th: 'py-2.5',
          thead: 'after:h-0.5'
        }"
      />

      <div class="flex items-center justify-between pt-2 border-t border-gray-100 px-2">
        <p class="text-xs font-medium text-gray-500">
          Mostrando <span class="font-bold text-gray-700">{{ personal.length }}</span> de
          <span class="font-bold text-gray-700">{{ totalRegistros }}</span> empleados
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="totalRegistros"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          color="neutral"
          variant="outline"
          size="sm"
        />
      </div>
    </div>

    <StaffSlideOver
      ref="staffSlideRef"
      @refresh="refresh"
    />

    <!-- ✅ Corregido: v-model:open en lugar de :v-model -->
    <UModal v-model:open="modalEliminarAbierto" title="¿Confirmar eliminación?">
      <template #content>
        <div class="p-4 space-y-4">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
              <UIcon name="i-lucide-alert-triangle" class="size-5" />
            </div>
            <div>
              <p class="text-md font-semibold text-gray-900">
                ¿Estás seguro de que deseas eliminar este registro?
              </p>
              <p class="text-sm text-gray-500 mt-1">
                Esta acción removerá el perfil de
                <span class="font-bold text-gray-700">{{ personalAEliminar?.nombre }} {{ personalAEliminar?.apellido }}</span>
                (C.I: {{ personalAEliminar?.cedula }}) de SAGES de manera permanente junto con sus accesos al sistema si posee cuenta.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <UButton
              variant="ghost"
              color="neutral"
              :disabled="eliminando"
              @click="modalEliminarAbierto = false"
            >
              Cancelar
            </UButton>
            <UButton
              color="error"
              :loading="eliminando"
              class="font-semibold"
              @click="handleEliminar"
            >
              Eliminar Permanentemente
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
// Nuxt auto-importa: ref, computed, watch, h, resolveComponent, useAsyncData

const UBadge        = resolveComponent('UBadge')
const UButton       = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const staffSlideRef = ref(null)
const toast         = useToast() // ✅ Agregado — faltaba en el componente

// Estado reactivo de filtros y paginación
const searchQuery  = ref('')
const filtroTipo   = ref('TODOS')
const filtroRol    = ref('TODOS')
const filtroEstado = ref('TODOS')
const currentPage  = ref(1)
const itemsPerPage = 10

const modalEliminarAbierto = ref(false)
const personalAEliminar    = ref(null)
const eliminando           = ref(false)

const opcionesTipo = [
  { value: 'TODOS',          label: 'Todos' },
  { value: 'docente',        label: 'Docente' },
  { value: 'administrativo', label: 'Administrativo' }
]

const opcionesRol = [
  { value: 'TODOS',      label: 'Todos' },
  { value: 'admin',      label: 'Administrador' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'profesor',   label: 'Profesor' }
]

const opcionesEstado = [
  { value: 'TODOS',    label: 'Todos' },
  { value: 'activo',   label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' }
]

// Definición de columnas
const columns = [
  {
    accessorKey: 'cedula',
    header: 'CÉDULA',
    cell: ({ row }) =>
      h('span', { class: 'font-semibold text-gray-700' }, row.original.cedula)
  },
  {
    id: 'nombreCompleto',
    header: 'NOMBRE COMPLETO',
    cell: ({ row }) =>
      h('div', { class: 'flex flex-col' }, [
        h('p', { class: 'font-bold text-primary-600 uppercase' }, `${row.original.nombre} ${row.original.apellido}`),
        h('p', { class: 'text-xs text-gray-400' }, row.original.email)
      ])
  },
  {
    accessorKey: 'tipo_personal',
    header: 'TIPO PERSONAL',
    cell: ({ row }) => {
      const esDocente = row.original.tipo_personal === 'docente'
      return h(UBadge, {
        variant: 'subtle',
        color: esDocente ? 'info' : 'warning',
        size: 'md',
        class: 'uppercase font-bold'
      }, () => row.original.tipo_personal)
    }
  },
  {
    id: 'cuentaRol',
    header: 'ROL SISTEMA',
    cell: ({ row }) => {
      const tieneCuenta = !!row.original.cuenta
      return h(UBadge, {
        variant: 'soft',
        color: tieneCuenta ? 'primary' : 'neutral',
        size: 'md',
        class: 'uppercase font-bold'
      }, () => tieneCuenta ? row.original.cuenta.rol : 'Sin Acceso')
    }
  },
  {
    accessorKey: 'estado',
    header: 'ESTADO',
    cell: ({ row }) => {
      const activo = row.original.estado === 'activo'
      return h(UBadge, {
        variant: 'solid',
        color: activo ? 'primary' : 'neutral',
        size: 'md',
        class: 'capitalize font-bold rounded-full px-2.5'
      }, () => row.original.estado)
    }
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    cell: ({ row }) => {
      const items = [
        [
          {
            label: 'Ver Detalles',
            icon: 'i-lucide-eye',
            onSelect: () => staffSlideRef.value?.open('view', row.original)
          },
          {
            label: 'Editar Información',
            icon: 'i-lucide-pencil',
            onSelect: () => staffSlideRef.value?.open('edit', row.original)
          },
          {
            label: 'Eliminar Miembro',
            icon: 'i-lucide-trash-2',
            color: 'error',
            onSelect: () => confirmarEliminacion(row.original)
          }
        ]
      ]
      return h(UDropdownMenu, { items }, () =>
        h(UButton, {
          icon: 'i-lucide-ellipsis-vertical',
          color: 'neutral',
          variant: 'ghost',
          size: 'sm',
          class: 'rounded-full hover:bg-gray-100'
        })
      )
    }
  }
]

// Parámetros de consulta computados
const queryParams = computed(() => {
  const params = { page: currentPage.value, limit: itemsPerPage }
  if (searchQuery.value.trim())       params.search        = searchQuery.value.trim()
  if (filtroTipo.value !== 'TODOS')   params.tipo_personal = filtroTipo.value
  if (filtroRol.value !== 'TODOS')    params.rol           = filtroRol.value
  if (filtroEstado.value !== 'TODOS') params.estado        = filtroEstado.value
  return params
})

const { data: response, status, refresh } = useAsyncData(
  'staff-list',
  () => useApi('/staff/list', { method: 'GET', query: queryParams.value }),
  { watch: [queryParams] }
)

const personal       = computed(() => response.value?.data              || [])
const totalRegistros = computed(() => response.value?.pagination?.total || 0)

// Resetear página al cambiar filtros
watch([searchQuery, filtroTipo, filtroRol, filtroEstado], () => {
  currentPage.value = 1
})

const triggerNuevo = () => staffSlideRef.value?.open('create')

defineExpose({ triggerNuevo })

// Abre el modal guardando el objeto seleccionado
const confirmarEliminacion = (staff) => {
  personalAEliminar.value    = staff
  modalEliminarAbierto.value = true
}

// Ejecuta la petición DELETE
const handleEliminar = async () => {
  if (!personalAEliminar.value) return

  eliminando.value = true
  try {
    await useApi(`/staff/${personalAEliminar.value.id}`, { method: 'DELETE' })

    toast.add({
      title: 'Personal eliminado',
      description: `Se ha retirado del sistema a ${personalAEliminar.value.nombre} ${personalAEliminar.value.apellido} correctamente.`,
      color: 'success'
    })

    modalEliminarAbierto.value = false
    personalAEliminar.value    = null
    refresh()
  } catch (error) {
    console.error('Error al eliminar personal:', error)
    toast.add({
      title: 'Error al procesar la solicitud',
      description: error.data?.message || 'No se pudo eliminar el registro de la base de datos.',
      color: 'error'
    })
  } finally {
    eliminando.value = false
  }
}
</script>