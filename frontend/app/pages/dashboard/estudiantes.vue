<script setup>
import { ref, h, resolveComponent, watch, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// 1. Componentes de Nuxt UI v3 mapeados para el renderizado de celdas
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

// 2. Definición de Columnas adaptada a la anatomía real de tu BD
const columns = [
  {
    accessorKey: 'cedula',
    header: 'CÉDULA'
  },
  {
    accessorKey: 'nombreCompleto', 
    header: 'NOMBRE DEL ALUMNO',
    cell: ({ row }) => {
      return h('div', { class: 'flex flex-col' }, [
        h('p', { class: 'font-bold text-olivine-600' }, row.original.nombreCompleto),
        h('p', { class: 'text-[10px] text-gray-500' }, row.original.fechaInscrito)
      ])
    }
  },
  {
    accessorKey: 'seccion_format', 
    header: 'AÑO / SECCIÓN'
  },
  {
    accessorKey: 'representante', 
    header: 'REPRESENTANTE'
  },
  {
    accessorKey: 'estado', 
    header: 'ESTATUS',
    cell: ({ row }) => {
      const colorMap = { ACTIVO: 'success', GRADUADO: 'info', RETIRADO: 'neutral' }
      const color = colorMap[row.original.estado] || 'neutral'
      return h(UBadge, { variant: 'subtle', color, class: 'font-bold' }, () => row.original.estado)
    }
  },
  {
    id: 'acciones',
    header: 'ACCIONES',
    cell: () => h(
      UDropdownMenu,
      {
        content: { align: 'end' },
        items: [[{ label: 'Ver expediente', icon: 'i-lucide-eye' }, { label: 'Editar alumno', icon: 'i-lucide-pencil' }]]
      },
      () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' })
    )
  }
]

// 3. Estado Reactivo de la Vista
const alumnos = ref([])
const totalAlumnos = ref(0) 
const pending = ref(false) 

const search = ref('')
const selectedYear = ref('Todos')
const selectedSection = ref('Todas')
const selectedStatus = ref('Activo') 
const page = ref(1)

const years = ['Todos', '1er Año', '2do Año', '3er Año', '4to Año', '5to Año']
const sections = ['Todas', 'A', 'B', 'C']
const statuses = ['Todos', 'ACTIVO', 'GRADUADO', 'RETIRADO']

const items = [
  { label: 'Estudiantes', icon: 'i-lucide-users' },
  { label: 'Representantes', icon: 'i-lucide-user-round' }
]
const pestañaActiva = ref('0')

// 4. Carga de datos optimizada para tu respuesta estructurada
const cargarEstudiantes = async () => {
  pending.value = true 
  try {
    const respuesta = await useApi('/registrations', {
      method: 'GET',
      query: {
        page: page.value,             // 🎯 Manda la página activa del componente
        limit: 10,                     // 🎯 Define el límite por página (coincide con tu UPagination)
        search: search.value,
        year: selectedYear.value,     // 🎯 Envía el filtro de Año
        section: selectedSection.value, // 🎯 Envía el filtro de Sección
        status: selectedStatus.value   // 🎯 Envía el filtro de Estatus
      }
    })
    
    console.log('📦 SAGES - RESPUESTA PAGINADA:', respuesta)
    
    if (respuesta && respuesta.status === 'success') {
      // 🎯 Ajustado a la nueva anatomía de la respuesta: totalItems
      totalAlumnos.value = respuesta.totalItems || 0
      
      alumnos.value = (respuesta.data || []).map(inscripcion => {
        const student = inscripcion.Student || {}
        const section = inscripcion.Section || {}
        const representative = student.Representative || {}
        
        const fechaBase = inscripcion.createdAt || student.createdAt
        const fechaFormat = fechaBase 
          ? new Date(fechaBase).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' })
          : 'Jun 2026'

        return {
          id: inscripcion.id,
          cedula: student.cedula || 'S/C',
          nombreCompleto: `${student.apellido || ''} ${student.nombre || ''}`.toUpperCase(),
          seccion_format: section.grado ? `${section.grado} '${section.seccion}'` : 'Por asignar',
          representante: representative.nombre 
            ? `${representative.apellido || ''} ${representative.nombre}`.toUpperCase() 
            : 'NO ASIGNADO',
          estado: (student.estado || 'ACTIVO').toUpperCase(),
          fechaInscrito: `Inscrito en ${fechaFormat}`
        }
      })
    } else {
      alumnos.value = []
      totalAlumnos.value = 0
    }
  } catch (err) {
    console.error('Error al procesar el listado paginado en SAGES:', err)
    alumnos.value = []
    totalAlumnos.value = 0
  } finally {
    pending.value = false
  }
}

watch([search, page, selectedYear, selectedSection, selectedStatus], () => {
  cargarEstudiantes()
})

onMounted(() => {
  cargarEstudiantes()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-800">Registro Académico</h1>
      <p class="text-gray-500 text-sm">Gestión centralizada de expedientes estudiantiles y estados académicos.</p>
    </div>

    <UTabs size="xl" v-model="pestañaActiva" :items="items" class="w-fit font-medium text-sm text-gray-500 mb-0" />
    <USeparator :ui="{ border: 'border-neutral-300 border-1' }" />

    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center gap-4">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Buscar por nombre, cédula o representante..."
          class="flex-1 min-w-[300px]"
          :ui="{ base: 'px-2 py-3'}"
        />

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Año:</span>
          <USelectMenu v-model="selectedYear" :items="years" class="w-32" />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Sección:</span>
          <USelectMenu v-model="selectedSection" :items="sections" class="w-32" />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Estatus:</span>
          <USelectMenu v-model="selectedStatus" :items="statuses" class="w-32" />
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <UTable 
        sticky
        loading-animation="elastic"
        loading-color="primary"
        :loading="pending"
        :data="alumnos" 
        :columns="columns" 
        class="w-full max-h-[340px]" 
        :ui="{
            td: 'py-2',
            th: 'py-2',
            thead: 'after:h-0.5'
        }" 
        />

        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-500">Mostrando 1 - {{ alumnos.length }} de {{ totalAlumnos }} estudiantes</p>
            <UPagination v-model:page="page" :items-per-page="5" :total="totalAlumnos" />
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
        <div class="p-3 bg-green-100 rounded-lg">
          <UIcon name="i-lucide-user-plus" class="text-green-600 size-6" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-400 uppercase leading-none">Nuevos Ingresos</p>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-gray-800">12</span>
            <span class="text-xs font-bold text-green-600">+2%</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
        <div class="p-3 bg-red-100 rounded-lg">
          <UIcon name="i-lucide-triangle-alert" class="text-red-600 size-6" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-400 uppercase leading-none">Riesgo Académico</p>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-black text-gray-800">5</span>
            <span class="text-xs font-bold text-red-600">-3</span>
          </div>
        </div>
      </div>

      <div class="bg-green-700 p-4 rounded-xl text-white flex flex-col justify-between shadow-md">
        <div>
          <p class="text-xs font-bold uppercase opacity-80">Exportar Datos</p>
          <p class="text-sm font-medium">Generar reporte PDF del ciclo actual.</p>
        </div>
        <UButton
          icon="i-lucide-file-down"
          label="Descargar"
          color="neutral"
          variant="solid"
          block
          class="mt-2 font-bold bg-white text-green-700 hover:bg-gray-100"
        />
      </div>
    </div>
  </div>
</template>