<script setup>
import { ref, h, resolveComponent, watch, onMounted } from 'vue'

// 1. Inyección explícita de subcomponentes para el renderizado de celdas
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

// Estado reactivo exigido por Nuxt UI para controlar el despliegue de filas
const expanded = ref({})

// 2. Configuración de Columnas con botón de expansión incluido
const columns = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expandir fila',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180 text-olivine-600' : ''
          ]
        },
        onClick: (e) => {
          e.stopPropagation()
          row.toggleExpanded() // Invoca la API interna de TanStack Table nativa en Nuxt UI
        }
      })
  },
  { accessorKey: 'cedula', header: 'CÉDULA' },
  { accessorKey: 'nombreCompleto', header: 'REPRESENTANTE' },
  { accessorKey: 'telefono', header: 'TELÉFONO' },
  { accessorKey: 'parentesco', header: 'PARENTESCO' },
  {
    id: 'acciones',
    header: 'ACCIONES',
    cell: () => h(UDropdownMenu, {
      content: { align: 'end' },
      items: [[{ label: 'Ver detalles', icon: 'i-lucide-user' }, { label: 'Editar datos', icon: 'i-lucide-pencil' }]]
    }, () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' }))
  }
]

// 3. Estado local reactivo mapeado a tu API
const representantes = ref([])
const totalRepresentantes = ref(0)
const pending = ref(false)

const search = ref('')
const page = ref(1)

// 4. Consumo del endpoint real verificado en Thunder Client
const cargarRepresentantes = async () => {
  pending.value = true
  try {
    const respuesta = await useApi('/representatives', {
      method: 'GET',
      query: {
        page: page.value,
        limit: 10,
        search: search.value
      }
    })

    // Hidratamos usando la anatomía exacta que muestra tu consola de red
    if (respuesta && respuesta.status === 'success') {
      totalRepresentantes.value = respuesta.totalItems || 0
      
      representantes.value = (respuesta.data || []).map(rep => ({
        id: rep.id,
        cedula: rep.cedula || 'S/C',
        nombreCompleto: `${rep.apellido || ''} ${rep.nombre || ''}`.toUpperCase(),
        telefono: rep.telefono || 'No posee',
        parentesco: (rep.parentesco || 'No especificado').toUpperCase(),
        alumnosRaw: rep.Students || [] // Captura la relación de estudiantes mapeada en Sequelize
      }))
    } else {
      representantes.value = []
      totalRepresentantes.value = 0
    }
  } catch (err) {
    console.error('Error al cargar representantes en SAGES:', err)
    representantes.value = []
    totalRepresentantes.value = 0
  } finally {
    pending.value = false
  }
}

// 5. Watchers de reactividad automatizada
watch([search, page], () => {
  cargarRepresentantes()
})

onMounted(() => {
  cargarRepresentantes()
})
</script>

<template>
  <div class="space-y-4 mb-6">
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar representante por nombre o cédula..."
        class="w-full"
        :ui="{ base: 'px-2 py-3' }"
      />
    </div>

    <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <UTable 
        v-model:expanded="expanded"
        sticky
        loading-animation="elastic"
        loading-color="primary"
        :loading="pending"
        :data="representantes" 
        :columns="columns" 
        :ui="{ tr: 'data-[expanded=true]:bg-olivine-50/20', td: 'py-2', th: 'py-2' }"
        class="w-full max-h-[340px]" 
      >
        <template #expanded="{ row }">
          <div class="p-4 bg-gray-50/80 border-y border-gray-100 rounded-lg m-2 shadow-inner">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-graduation-cap" class="w-5 h-5 text-olivine-600" />
              <h4 class="text-sm font-bold text-olivine-600 uppercase">
                Alumnos asociados a este representante
              </h4>
            </div>
            
            <div v-if="row.original.alumnosRaw && row.original.alumnosRaw.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                v-for="estudiante in row.original.alumnosRaw" 
                :key="estudiante.id"
                class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-md text-gray-800 uppercase">
                    {{ estudiante.apellido }} {{ estudiante.nombre }}
                  </span>
                  <span class="text-xs text-gray-400 font-mono">
                    C.I: {{ estudiante.cedula || 'S/C' }}
                  </span>
                </div>
                <UBadge variant="subtle" color="success" class="text-[9px] font-bold">
                  {{ estudiante.estado }}
                </UBadge>
              </div>
            </div>

            <div v-else class="text-xs text-gray-400 italic flex items-center gap-1 py-1">
              <UIcon name="i-lucide-info" class="w-4 h-4 text-gray-300" />
              Este representante no posee alumnos vinculados en el ciclo lectivo actual.
            </div>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <p class="text-sm text-gray-500">
            Mostrando {{ representantes.length }} de {{ totalRepresentantes }} registros
          </p>
          <UPagination v-model:page="page" :items-per-page="10" :total="totalRepresentantes" />
      </div>
    </div>
  </div>
</template>