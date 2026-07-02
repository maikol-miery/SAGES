<script setup>
// ✅ Sin imports manuales de Vue ni de materiaSchema (no se usa)

const toast = useToast()
const anioGlobal = useState('anio_escolar_activo')

// 🚀 INTEGRACIÓN DEL COMPOSABLE ACADÉMICO
const { secciones: seccionesGlobales, fetchSecciones } = useAcademicData()

// 1. ESTADO REACTIVO DE CONTROL DE UI
const activeYear = ref('1')
const loading = ref(false)
const childRef = ref(null)
const popoverAbierto = ref(false)

// 2. CACHÉ DE SELECTORES REMOTOS
const docentes = ref([])
const materias = ref([])
const todasLasSecciones = ref([])

// ✅ computed declarado fuera del reactive
const anioEscolarComputed = computed(() => anioGlobal.value?.value || '')

// 3. ESTADOS DE FORMULARIOS (REACTIVE)
const state = reactive({
  staff_id: undefined,
  subject_id: undefined,
  section_id: undefined,
  anio_escolar: anioEscolarComputed // ✅ referencia al computed externo
})

const stateMateria = reactive({
  nombre: '',
  abreviatura: '',
  grado: '',
  tipo_evaluacion: 'cuantitativa'
})

// 4. OPCIONES ESTÁTICAS
const evaluacionOptions = [
  { value: 'cuantitativa', label: 'Cuantitativa (0-20)' },
  { value: 'cualitativa', label: 'Cualitativa (A-E)' }
]

const years = [
  { slot: '1', label: '1er Año', value: '1' },
  { slot: '2', label: '2do Año', value: '2' },
  { slot: '3', label: '3er Año', value: '3' },
  { slot: '4', label: '4to Año', value: '4' },
  { slot: '5', label: '5to Año', value: '5' },
]

// 5. WATCHERS
watch(popoverAbierto, (abierto) => {
  if (!abierto) {
    stateMateria.nombre = ''
    stateMateria.abreviatura = ''
    stateMateria.grado = ''
    stateMateria.tipo_evaluacion = 'cuantitativa'
  }
})

watch(() => state.section_id, async (nuevoSectionId) => {
  if (!nuevoSectionId) {
    materias.value = []
    state.subject_id = undefined
    stateMateria.grado = '' // ✅ string vacío, no undefined
    return
  }

  const seccionSeleccionada = todasLasSecciones.value.find(s => s.id === nuevoSectionId)

  if (seccionSeleccionada) {
    state.subject_id = undefined
    stateMateria.grado = String(seccionSeleccionada.grado)

    try {
      const res = await useApi('/subjects', {
        method: 'GET',
        query: { year: seccionSeleccionada.grado, all: true }
      })

      const materiasBackend = res.subjects || []
      materias.value = materiasBackend.map(m => ({
        label: `${m.nombre} (${m.grado}° Año)`,
        value: m.id
      }))
    } catch (error) {
      console.error('Error al traer las materias del grado bajo demanda:', error)
    }
  }
})

watch(anioGlobal, () => {
  state.section_id = undefined
  state.subject_id = undefined
  materias.value = []
  fetchSecciones(true)
  cargarSelectores
})

// 6. PETICIONES API
const cargarSelectores = async () => {
   console.log('🟢 PADRE: cargarSelectores ejecutado')
  try {
    // ✅ fetchSecciones() fuera del Promise.all ya que es un efecto de composable
    const [resDocentes, resSecciones] = await Promise.all([
      useApi('/staff', { method: 'GET', query: { tipo_personal: 'docente' } }),
      useApi('/sections', { method: 'GET' })
    ])

    await fetchSecciones(true) // ✅ llamada separada, alimenta seccionesGlobales

    const listaDocentes = resDocentes.data || []
    docentes.value = listaDocentes.map(d => ({
      label: `Prof. ${d.nombre} ${d.apellido}`,
      value: d.id
    }))

    todasLasSecciones.value = resSecciones.sections || []
  } catch (error) {
    console.error('Error cargando selectores del formulario:', error)
  }
}

const asignarCarga = async () => {
  if (!state.staff_id || !state.subject_id || !state.section_id) return

  loading.value = true
  try {
    const response = await useApi('/academic-load', {
      method: 'POST',
      body: state
    })

    if (response?.status === 'success') {
      toast.add({
        title: '¡Carga Asignada!',
        description: response?.message || 'El docente ha sido vinculado a la materia y sección correctamente.',
        color: 'success',
        icon: 'i-lucide-check-circle',
        duration: 4000 // ✅ era "timeout", el prop correcto es "duration"
      })

      state.staff_id = undefined
      state.subject_id = undefined
      state.section_id = undefined

      if (childRef.value) {
        await childRef.value.cargarSecciones()
      }
    }
  } catch (error) {
    console.error('Error al guardar la carga académica:', error)
    toast.add({
      title: 'Error de Asignación',
      description: error.data?.message || 'No se pudo vincular la carga. Verifica si el docente ya tiene esa materia en la misma sección.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
      duration: 5000 // ✅
    })
  } finally {
    loading.value = false
  }
}

const nuevaMateria = async () => {
  if (!stateMateria.nombre || !stateMateria.grado || !stateMateria.abreviatura) return

  loading.value = true
  try {
    const response = await useApi('/subjects', {
      method: 'POST',
      body: stateMateria
    })

    if (response?.status === 'success') {
      toast.add({
        title: '¡Materia Añadida!',
        description: `${response.newSubject.nombre} ha sido añadida correctamente`,
        color: 'success',
        icon: 'i-lucide-check-circle',
        duration: 4000 // ✅
      })

      popoverAbierto.value = false
      stateMateria.nombre = ''
      stateMateria.abreviatura = ''

      const nuevaMateriaBackend = response.newSubject

      if (nuevaMateriaBackend) {
        const seccionSeleccionada = todasLasSecciones.value.find(s => s.id === state.section_id)

        if (seccionSeleccionada && String(nuevaMateriaBackend.grado) === String(seccionSeleccionada.grado)) {
          materias.value.push({
            label: `${nuevaMateriaBackend.nombre} (${nuevaMateriaBackend.grado}° Año)`,
            value: nuevaMateriaBackend.id
          })
        }
      }
    }
  } catch (error) {
    console.error('❌ Error al agregar materia', error)
    toast.add({
      title: 'Error al agregar la materia',
      description: error.data?.msg || 'No se pudo agregar la materia. Revisa los campos.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
      duration: 5000 // ✅
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarSelectores()
})
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    
    <div class="col-span-1 space-y-4">
      <UCard :ui="{ body: 'p-5' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-link" class="text-primary-700" />
            <h3 class="font-bold text-lg text-primary-700">Vincular Carga Académica</h3>
          </div>
          <p class="font-semibold text-sm text-neutral-700">Asigne docentes a materias y secciones específicas</p>
        </template>

        <UForm :state="state" class="space-y-4 w-full max-w-sm mx-auto" @submit="asignarCarga">
          <UFormField label="Seleccionar Docente" name="staff_id" class="w-full">
            <USelectMenu
              v-model="state.staff_id"
              :items="docentes"
              value-key="value"
              size="lg"
              placeholder="Buscar docente..."
              class="w-full p-2.5 text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500"
            />
          </UFormField>

          <UFormField label="Seleccionar grado y sección" name="section_id">
            <USelectMenu
              v-model="state.section_id"
              :items="seccionesGlobales"
              value-key="id"
              by="id"
              size="lg"
              placeholder="Seleccionar sección..."
              class="w-full p-2.5 text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500"
            />
          </UFormField>

          <UFormField label="Seleccionar Materia" name="subject_id" class="w-full">
            <div class="w-full flex gap-2">
              <USelectMenu
                v-model="state.subject_id"
                :items="materias"
                value-key="value"
                size="lg"
                placeholder="Seleccionar materia..."
                :disabled="!state.section_id"
                class="w-full p-2.5 text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500"
              />
              <UPopover
                v-model:open="popoverAbierto"
                :content="{
                  align: 'center',
                  side: 'bottom',
                  sideOffset: 8
                }"
              >
                <UButton icon="i-lucide-plus" />

                <template #content>
                  <UCard :ui="{ body: 'p-3' }">
                    <template #header>
                      <p class="text-sm font-semibold text-primary-700">Agregar Nueva Materia</p>
                    </template>

                    <UForm :state="stateMateria" class="space-y-5 w-full max-w-sm mx-auto" @submit="nuevaMateria" :schema="materiaSchema">
                      <UFormField label="Nombre de la Materia" name="nombre" class="w-full">
                        <UInput
                          v-model="stateMateria.nombre"
                          size="lg"
                          icon="i-lucide-book-open"
                          placeholder="Ej: Matemáticas, Química..."
                        />
                      </UFormField>

                      <UFormField label="Abreviatura" name="abreviatura" class="w-full">
                        <UInput
                          v-model="stateMateria.abreviatura"
                          size="lg"
                          icon="i-lucide-hash"
                          placeholder="Ej: MAT, QUI, EF"
                        />
                      </UFormField>

                      <UFormField label="Año / Grado Escolar" name="grado" class="w-full">
                        <USelectMenu
                          v-model="stateMateria.grado"
                          :items="years"
                          value-attribute="value"
                          value-key="value"
                          size="lg"
                          :search-input="false"
                          icon="i-lucide-graduation-cap"
                          placeholder="Seleccionar año..."
                        />
                      </UFormField>

                      <UFormField label="Tipo de Evaluación" name="tipo_evaluacion" class="w-full">
                        <URadioGroup
                          v-model="stateMateria.tipo_evaluacion"
                          :items="evaluacionOptions"
                          class="mt-1"
                          :ui="{ wrapper: 'flex items-center gap-4' }"
                        />
                      </UFormField>

                      <UButton 
                        :loading="loading" 
                        type="submit" 
                        block 
                        color="primary" 
                        icon="i-lucide-plus-circle" 
                        class="mt-6 text-md font-semibold"
                      >
                        Registrar Materia
                      </UButton>
                    </UForm>
                  </UCard>
                </template>
              </UPopover>
            </div>
          </UFormField>            

          <UButton :loading="loading" type="submit" block color="primary" icon="i-lucide-plus-circle" class="mt-6 text-md">
            Asignar Clase
          </UButton>
        </UForm>
      </UCard>


      <!-- METRICAS DE PROFESORES Y MATERIAS -->
      <!-- <AcademicLoadMetrics /> -->
    </div>

    <div class="col-span-2 space-y-6">
      <UTabs 
        v-model="activeYear" 
        :items="years" 
        :ui="{ list: 'bg-white rounded-xl p-2 border border-neutral-200' }"
      />

      <academicLoadYearSections 
        ref="childRef" 
        :year="activeYear"
        :anioEscolar="anioGlobal?.value"
        @actualizado="cargarSelectores"
      />
    </div>

  </div>
</template>