<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// 1. ESTADO REACTIVO
const activeYear = ref('1') 
const loading = ref(false)
const childRef = ref(null)

const docentes = ref([])
const materias = ref([])
const secciones = ref([])

const state = reactive({
  staff_id: undefined,    
  subject_id: undefined,
  section_id: undefined,
  anio_escolar: '2025-2026'
})

const years = [
  { slot: '1', label: '1er Año', value: '1' },
  { slot: '2', label: '2do Año', value: '2' },
  { slot: '3', label: '3er Año', value: '3' },
  { slot: '4', label: '4to Año', value: '4' },
  { slot: '5', label: '5to Año', value: '5' },
]

// 📡 CORREGIDO: Ajustado exactamente a las columnas de tu pgAdmin y Thunder Client
const cargarSelectores = async () => {
  try {
    const [resDocentes, resMaterias, resSecciones] = await Promise.all([
      useApi('/staff', { method: 'GET' }),
      useApi('/subjects', { method: 'GET' }),
      useApi('/sections', { method: 'GET' })
    ])
    
    // 1. Docentes: Tu backend devuelve array directo o en .data o .staff (ajusta según corresponda, aquí usamos fallback seguro)
    const listaDocentes = resDocentes.staff || resDocentes.data || resDocentes || []
    docentes.value = listaDocentes.map(d => ({ 
      label: `Prof. ${d.nombre} ${d.apellido}`, 
      value: d.id 
    }))
    
    // 2. Materias: En pgAdmin veo las columnas 'nombre' y 'grado'
    const listaMaterias = resMaterias.subjects || resMaterias.data || resMaterias || []
    materias.value = listaMaterias.map(m => ({ 
      label: `${m.nombre} (${m.grado}° Año)`, 
      value: m.id 
    }))
    
    // 3. Secciones: En pgAdmin veo que usas las columnas 'seccion' (letra A, B) y 'grado' (año 1, 2)
    const listaSecciones = resSecciones.sections || resSecciones.data || resSecciones || []
    secciones.value = listaSecciones.map(s => ({ 
      label: `Sección ${s.seccion} - ${s.grado}° Año`, 
      value: s.id 
    }))
  } catch (error) {
    console.error('Error cargando listas del formulario:', error)
  }
}

const asignarCarga = async () => {
  if (!state.staff_id || !state.subject_id || !state.section_id) return
  
  loading.value = true
  try {
    await useApi('/academic-load', {
      method: 'POST',
      body: state
    })
    
    state.staff_id = undefined
    state.subject_id = undefined
    state.section_id = undefined

    // Forzar al hijo a recargar tras guardar
    if (childRef.value) {
      await childRef.value.cargarSecciones()
    }
  } catch (error) {
    console.error('Error al guardar la carga académica:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarSelectores()
})
</script>

<template>
  <div class="p-4 space-y-6">
    
    <div class="flex items-center gap-3">
      <div class="p-2 bg-primary-100 rounded-lg">
        <UIcon name="i-lucide-book-open" class="size-6 text-primary-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Carga Académica</h1>
        <p class="text-sm text-gray-500">Asigne docentes a materias y secciones específicas.</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      
      <div class="col-span-1 space-y-2">
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
                size="lg"
                placeholder="Buscar docente..."
                class="w-full p-2.5 text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500"
              />
            </UFormField>

            <UFormField label="Seleccionar Materia" name="subject_id" class="w-full">
              <USelectMenu
                v-model="state.subject_id"
                :items="materias"
                size="lg"
                placeholder="Seleccionar materia..."
                class="w-full p-2.5 text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500"
              />
            </UFormField>

            <UFormField label="Seleccionar grado y sección" name="section_id" class="w-full">
              <USelectMenu
                v-model="state.section_id"
                :items="secciones"
                size="lg"
                placeholder="Seleccionar sección..."
                class="w-full p-2.5 text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500"
              />
            </UFormField>

            <UButton :loading="loading" type="submit" block color="primary" icon="i-lucide-plus-circle" class="mt-6 text-md">
              Asignar Clase
            </UButton>
          </UForm>
        </UCard>


      <!-- CARDS INFORMACION GENERAL -->

        <div class="grid grid-cols-1 gap-2">
          <div class="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-primary-300 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div class="p-2.5 bg-green-50 rounded-lg text-green-600"><UIcon name="i-lucide-users" class="size-6" /></div>
            <div>
              <p class="text-sm text-gray-400 font-bold uppercase tracking-wider group-hover:text-gray-700">Docentes Activos</p>
              <p class="text-lg font-bold text-gray-700 group-hover:text-black">42</p>
            </div>
          </div>
          
          <div class="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-blue-300 hover:scale-105 transition-all duration-300 group cursor-pointer">
  
            <div class="p-2.5 bg-blue-50 rounded-lg text-blue-600 transition-colors group-hover:bg-blue-100">
              <UIcon name="i-lucide-book" class="size-6" />
            </div>
            
            <div>
              <p class="text-sm text-gray-400 font-bold uppercase tracking-wider transition-colors group-hover:text-gray-700">
                Materias Totales
              </p>
              <p class="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">
                18
              </p>
            </div>

          </div>

          <div class="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-error-300 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <div class="p-2.5 bg-red-50 rounded-lg text-error transition-colors"><UIcon name="i-lucide-alert-triangle" class="size-6" /></div>
            <div>
              <p class="text-sm text-gray-400 font-bold uppercase tracking-wider transition-colors group-hover:text-gray-700">Sin Asignar</p>
              <p class="text-lg font-bold text-gray-700 ransition-colors group-hover:text-black">03</p>
            </div>
          </div>
        </div>

      </div>

      <div class="col-span-2 space-y-6">
        <UTabs 
        v-model="activeYear" 
        :items="years" 
         :ui="{
            list: 'bg-white rounded-xl p-2 border border-neutral-200',
          }"
        />

        <YearSections 
          ref="childRef" 
          :year="activeYear" 
        />

      </div>
    </div>
  </div>
</template>