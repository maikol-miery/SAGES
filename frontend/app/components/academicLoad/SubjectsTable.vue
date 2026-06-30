<script setup>
import { h, resolveComponent } from 'vue'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const UIcon = resolveComponent('UIcon')

// ✅ useToast al top level
const toast = useToast()

const columns = [
  {
    accessorKey: 'abreviatura',
    header: 'ABREVIATURA',
    cell: ({ row }) => h('span', { class: 'font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs' }, row.original.abreviatura)
  },
  {
    accessorKey: 'nombre', 
    header: 'NOMBRE DE LA MATERIA',
    cell: ({ row }) => {
      return h('div', { class: 'flex flex-col' }, [
        h('p', { class: 'font-bold text-olivine-600 uppercase' }, row.original.nombre),
        h('p', { class: 'text-[10px] text-gray-500' }, `ID Asignatura: #${row.original.id}`)
      ])
    }
  },
  {
    accessorKey: 'tipo_evaluacion', 
    header: 'EVALUACIÓN',
    cell: ({ row }) => {
      const valor = row.original.tipo_evaluacion
      const colorMap = { cuantitativa: 'info', cualitativa: 'warning' }
      const color = colorMap[valor] || 'neutral'
      return h(UBadge, { variant: 'subtle', color: color, class: 'font-bold uppercase tracking-wider text-[11px]' }, () => valor)
    }
  },
  {
    accessorKey: 'grado_format', 
    header: 'AÑO',
    cell: ({ row }) => h('span', { class: 'font-semibold text-neutral-700' }, `${row.original.grado}° Año`)
  },
  {
    id: 'acciones',
    header: 'ACCIONES',
    cell: ({ row }) => h(
      UDropdownMenu,
      {
        content: { align: 'end' },
        items: [[
          { 
            label: 'Editar materia', 
            icon: 'i-lucide-pencil',
            onSelect: () => abrirEditarMateria(row.original)
          },
          { 
            label: 'Eliminar', 
            icon: 'i-lucide-trash',
            class: 'text-red-600 focus:text-red-600',
            onSelect: () => confirmarEliminarMateria(row.original)
          }
        ]]
      },
      () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' })
    )
  }
]

const listaMaterias = ref([])
const totalMaterias = ref(0) 
const pending = ref(false) 

const modalEdicionAbierto = ref(false)
const cargandoEdicion = ref(false)
const stateEditar = ref({
  id: '',
  nombre: '',
  abreviatura: '',
  grado: '',
  tipo_evaluacion: 'cuantitativa'
})

const modalEliminarAbierto = ref(false)
const loading = ref(false)
const materiaAEliminar = ref(null)

const search = ref('')
const selectedYear = ref('Todos')
const page = ref(1)

const years = ['Todos', '1', '2', '3', '4', '5']

const selectedType = ref('Todos')
const evaluationTypes = ['Todos', 'cuantitativa', 'cualitativa']

const formatYearLabel = (year) => {
  return year === 'Todos' ? 'Todos' : `${year}° Año`
}

const formatTypeLabel = (type) => {
  if (type === 'Todos') return 'Todos'
  return type === 'cuantitativa' ? 'Cuantitativa (0-20)' : 'Cualitativa (A-E)'
}

const cargarMaterias = async () => {
  pending.value = true 
  try {
    const respuesta = await useApi('/subjects', {
      method: 'GET',
      query: {
        page: page.value,             
        limit: 10,                    
        search: search.value,
        year: selectedYear.value,
        type: selectedType.value
      }
    })
    
    console.log('📦 SAGES - MATERIAS PAGINADAS:', respuesta)
    
    if (respuesta && respuesta.status === 'success') {
      totalMaterias.value = respuesta.totalItems || 0
      listaMaterias.value = respuesta.subjects || []
    } else {
      listaMaterias.value = []
      totalMaterias.value = 0
    }
  } catch (err) {
    console.error('Error al procesar el listado paginado de materias en SAGES:', err)
    listaMaterias.value = []
    totalMaterias.value = 0
  } finally {
    pending.value = false
  }
}

const abrirEditarMateria = (materia) => {
  stateEditar.value = {
    id: materia.id,
    nombre: materia.nombre,
    abreviatura: materia.abreviatura,
    grado: String(materia.grado),
    tipo_evaluacion: materia.tipo_evaluacion
  }
  modalEdicionAbierto.value = true
}

const guardarCambiosMateria = async () => {
  if (!stateEditar.value.nombre || !stateEditar.value.abreviatura || !stateEditar.value.grado) return
  
  cargandoEdicion.value = true
  try {
    const response = await useApi(`/subjects/${stateEditar.value.id}`, {
      method: 'PATCH',
      body: {
        nombre:          stateEditar.value.nombre,
        abreviatura:     stateEditar.value.abreviatura,
        grado:           stateEditar.value.grado,
        tipo_evaluacion: stateEditar.value.tipo_evaluacion
      }
    })

    if (response && response.status === 'success') {
      // ✅ Usando la instancia del top level
      toast.add({
        title: '¡Materia Actualizada!',
        description: 'Los cambios se guardaron correctamente en el sistema.',
        color: 'success',
        icon: 'i-lucide-check-circle',
        timeout: 4000
      })
      modalEdicionAbierto.value = false
      cargarMaterias() 
    }
  } catch (error) {
    console.error('❌ Error al actualizar materia', error)
    // ✅ Usando la instancia del top level
    toast.add({
      title: 'Error al actualizar',
      description: error.data?.msg || 'No se pudieron guardar los cambios.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
      timeout: 5000
    })
  } finally {
    cargandoEdicion.value = false
  }
}

// Función para capturar los datos e invocar el modal
const confirmarEliminarMateria = (materia) => {
  materiaAEliminar.value = materia
  modalEliminarAbierto.value = true
}

const ejecutarEliminacion = async () => {
  if (!materiaAEliminar.value) return

  loading.value = true
  try {
    // 🌟 Mañana configuramos esta petición con Sequelize en el backend
    const response = await useApi(`/subjects/${materiaAEliminar.value.id}`, {
      method: "DELETE",
    })

    if(response && response.status === "success"){
    
      toast.add({
        title: 'Materia eliminada',
        description: response.msg,
        color: 'success',
        icon: 'i-lucide-check-circle',
        timeout: 4000
      })
      
      modalEliminarAbierto.value = false
      materiaAEliminar.value = null
      cargarMaterias() // Recarga la tabla de inmediato
    }
  } catch (error) {
    console.error('❌ Error al eliminar materia', error)
  } finally {
    loading.value = false
  }
}

watch([search, selectedYear, selectedType], () => {
  page.value = 1
  cargarMaterias()
})

watch(page, () => {
  cargarMaterias()
})

onMounted(() => {
  cargarMaterias()
})
</script>

<template>
  <div class="space-y-4 mb-6">
    
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center gap-4">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Buscar materia por nombre o abreviatura..."
          class="flex-1 min-w-[300px]"
          :ui="{ base: 'px-2 py-3'}"
        />

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Año:</span>
          <USelectMenu v-model="selectedYear" :items="years" class="w-40">
            <template #label>
              {{ formatYearLabel(selectedYear) }}
            </template>
            <template #item-label="{ item }">
              {{ formatYearLabel(item) }}
            </template>
          </USelectMenu>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Evaluación:</span>
          <USelectMenu v-model="selectedType" :items="evaluationTypes" class="w-52">
            <template #label>
              {{ formatTypeLabel(selectedType) }}
            </template>
            <template #item-label="{ item }">
              {{ formatTypeLabel(item) }}
            </template>
          </USelectMenu>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <UTable 
        sticky
        loading-animation="elastic"
        loading-color="primary"
        :loading="pending"
        :data="listaMaterias" 
        :columns="columns" 
        class="w-full max-h-[340px]" 
        :ui="{
          td: 'py-2',
          th: 'py-2',
          thead: 'after:h-0.5'
        }" 
      />

      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <p class="text-sm text-gray-500">
          Mostrando {{ listaMaterias.length }} de {{ totalMaterias }} asignaturas globales
        </p>
        <UPagination 
          v-model:page="page" 
          :items-per-page="10" 
          :total="totalMaterias" 
        />
      </div>
    </div>

    <!-- ✅ v-model:open en vez de v-model -->
    <UModal v-model:open="modalEdicionAbierto" :ui="{ content: 'sm:max-w-md' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-neutral-800">
            <UIcon name="i-lucide-pencil" class="w-5 h-5 text-olivine-600" />
            <h3 class="font-bold text-lg">Editar Materia</h3>
          </div>
        </div>
      </template>

      <template #body>
        <UForm 
          :state="stateEditar" 
          class="space-y-4 p-2"
          @submit="guardarCambiosMateria"
        >
          <UFormField label="Nombre de la Materia" name="nombre" size="xl">
            <UInput 
              v-model="stateEditar.nombre" 
              placeholder="Ej. Matemática" 
              icon="i-lucide-book-open"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Abreviatura" name="abreviatura" size="xl">
            <UInput 
              v-model="stateEditar.abreviatura" 
              placeholder="Ej. MAT" 
              icon="i-lucide-hash"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Año / Grado Escolar" name="grado" size="xl">
            <USelectMenu 
              v-model="stateEditar.grado" 
              :items="['1', '2', '3', '4', '5']"
              :search-input="false"
              class="w-full"
            >
              <template #label>
                {{ stateEditar.grado ? `${stateEditar.grado}° Año` : 'Seleccionar año' }}
              </template>
              <template #item-label="{ item }">
                {{ item }}° Año
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField label="Tipo de Evaluación" name="tipo_evaluacion" size="xl">
            <URadioGroup
              v-model="stateEditar.tipo_evaluacion"
              :items="[
                { value: 'cuantitativa', label: 'Cuantitativa (0-20)' },
                { value: 'cualitativa', label: 'Cualitativa (A-E)' }
              ]"
            />
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton 
            label="Cancelar" 
            color="neutral" 
            variant="ghost" 
            @click="modalEdicionAbierto = false" 
          />
          <UButton 
            label="Guardar Cambios" 
            color="primary" 
            icon="i-lucide-save"
            :loading="cargandoEdicion"
            @click="guardarCambiosMateria" 
          />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="modalEliminarAbierto" :ui="{ content: 'sm:max-w-md' }">
      
      <template #header>
        <div class="flex items-center gap-2 text-red-600 w-full">
          <h3 class="font-bold text-xl">¿Confirmar eliminación?</h3>
        </div>
      </template>

      <template #body>
        <div class="space-y-3 py-2">
          <p class="text-sm text-neutral-600">
            Estás a punto de desincorporar la materia 
            <span class="font-bold text-neutral-900 uppercase">
              {{ materiaAEliminar?.nombre }} ({{ materiaAEliminar?.abreviatura }})
            </span>.
          </p>
          <div class="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 space-y-1">
            <p><strong>⚠️ Nota importante:</strong></p>
            <p>Esta acción no eliminará el historial de notas ni cargas académicas de años anteriores, pero la materia ya no estará disponible para nuevas asignaciones.</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton 
            label="Cancelar" 
            color="neutral" 
            variant="ghost" 
            @click="modalEliminarAbierto = false" 
          />
          <UButton 
            label="Eliminar Asignatura"  
            icon="i-lucide-trash"
            color="error"
            :loading="loading"
            @click="ejecutarEliminacion" 
          />
        </div>
      </template>
    </UModal>

  </div>
</template>