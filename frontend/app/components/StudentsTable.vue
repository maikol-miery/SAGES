<script setup>
import { ref, h, resolveComponent, watch, onMounted } from 'vue'

const { refreshCounter } = useStudentRefresh()

// Componentes de Nuxt UI v3 mapeados para el renderizado de celdas
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

// Referencia local única para controlar el Slideover propio de esta tabla
const studentSlideRef = ref(null)

// 2. Definición de Columnas adaptada para usar la referencia interna local
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
  accessorKey: 'tipo_inscripcion', 
  header: 'ESCOLARIDAD',
  cell: ({ row }) => {
    const valor = row.original.tipo_inscripcion.toUpperCase()

    // Diccionario con las abreviaturas conocidas, sus textos largos y colores
    const escolaridadMap = {
      RG: { label: 'Regular',           color: 'success' },
      RP: { label: 'Repitente',         color: 'error'   },
      MP: { label: 'Materia Pendiente', color: 'neutral' },
      EQ: { label: 'Equivalencia',      color: 'info'    }
    }

    const config = escolaridadMap[valor]

    // 1. Si NO es ninguna de las abreviaturas conocidas, renderizamos el Badge simple y plano
    if (!config) {
      return h(
        UBadge, 
        { variant: 'subtle', color: 'neutral', class: 'font-bold' }, 
        () => valor || 'N/D'
      )
    }

    // 2. Si SÍ es una abreviatura conocida, le ponemos su color correspondiente y el Tooltip largo
    return h(
      UTooltip,
      { text: config.label, arrow: true },
      () => h(
        UBadge, 
        { variant: 'subtle', color: config.color, class: 'font-bold cursor-help' }, 
        () => valor
      )
    )
  }
},
  {
    id: 'acciones',
    header: 'ACCIONES',
    cell: ({ row }) => h(
      UDropdownMenu,
      {
        content: { align: 'end' },
        // Apuntamos directamente a "studentSlideRef.value" pasándole solo el modo y los datos limpios
        items: [[
          { 
            label: 'Ver expediente', 
            icon: 'i-lucide-eye',
            onSelect: () => studentSlideRef.value?.open('view', row.original.rawStudentData)
          }, 
          { 
            label: 'Editar alumno', 
            icon: 'i-lucide-pencil',
            onSelect: () => studentSlideRef.value?.open('edit', row.original.rawStudentData)
          }
        ]]
      },
      () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' })
    )
  }
]

// 3. Estado Reactivo
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

// 4. Carga de datos
const cargarEstudiantes = async () => {
  pending.value = true 
  try {
    const respuesta = await useApi('/registrations', {
      method: 'GET',
      query: {
        page: page.value,             
        limit: 10,                     
        search: search.value,
        year: selectedYear.value,     
        section: selectedSection.value, 
        status: selectedStatus.value   
      }
    })
    
    console.log('📦 SAGES - RESPUESTA PAGINADA:', respuesta)
    
    if (respuesta && respuesta.status === 'success') {
      totalAlumnos.value = respuesta.totalItems || 0
      
      alumnos.value = (respuesta.data || []).map(inscripcion => {
          const student = inscripcion.Student || {}
          const section = inscripcion.Section || {}
          const representative = student.Representative || {}
          
          const fechaBase = inscripcion.createdAt || student.createdAt
          const tipoInscripcion = inscripcion.tipo_inscripcion 
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
            fechaInscrito: `Inscrito en ${fechaFormat}`,
            
            // 🎯 SOLUCIÓN AL BUG: Ahora la raíz del objeto sí tiene la propiedad que busca el accessorKey de la tabla
            tipo_inscripcion: tipoInscripcion, 

            // 🗂️ El cofre de datos que consumirá el Slideover directamente
            rawStudentData: {
              id: inscripcion.id,
              cedula: student.cedula || '',
              nombre: student.nombre || '',
              apellido: student.apellido || '',
              genero: student.genero || 'No definido',
              direccion: student.direccion || 'No registrada',
              estado: (student.estado || 'ACTIVO').toUpperCase(),
              
              // 🛠️ Guardamos también la escolaridad aquí dentro por si el Slideover la necesita mostrar
              tipo_inscripcion: tipoInscripcion, 
              
              fechaNacimiento: student.fecha_nacimiento || '',
              fechaInscripcionFormat: fechaFormat,

              grado: section.grado || 'Por asignar',
              seccion: section.seccion || '',
              
              representanteData: {
                nombre: representative.nombre || '',
                apellido: representative.apellido || '',
                cedula: representative.cedula || 'No registrada',
                telefono: representative.telefono || 'No registrado'
              }
            }
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

watch(refreshCounter, async () => {
  console.log("Detectado nuevo estudiante desde el sidebar. Recargando tabla...")
  await cargarEstudiantes() // Ejecuta el HTTP GET de nuevo en segundo plano de forma nativa
})

onMounted(() => {
  cargarEstudiantes()
})
</script>

<template>
  <div class="space-y-4 mb-6">
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
        <UPagination v-model:page="page" :items-per-page="10" :total="totalAlumnos" />
      </div>
    </div>

    <StudentSlideover ref="studentSlideRef" @refresh="cargarEstudiantes"/>
  </div>
</template>