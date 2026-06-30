<script setup>
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const toast = useToast()
const loading = ref(false)
const formRef = ref(null)
const page = ref(1)

const { 
  secciones, 
  materias, 
  loadingSecciones, 
  loadingMaterias, 
  fetchSecciones, 
  fetchMateriasPorSeccion 
} = useAcademicData()

const seccionesOptions = computed(() => {
  if (!secciones.value) return []
  return secciones.value.map(sec => ({
    value: sec.id,
    label: `${sec.grado}° Año - Sección "${sec.seccion}"`
  }))
})

const materiasOptions = computed(() => {
  if (!materias.value) return []
  return materias.value.map(mat => ({
    value: mat.academic_load_id,
    label: mat.label
  }))
})

const selectedSection = ref(null)
const selectedLoad = ref(null)
const pasoActual = ref(0)

const pasos = [
  { title: 'Carga de Notas',    description: 'Ingresa las evaluaciones',  icon: 'i-lucide-clipboard-list'     },
  { title: 'Ajustes y Cierre', description: 'Revisión final y cláusulas', icon: 'i-lucide-sliders-horizontal' },
]

const momentos = [
  { slot: '1', label: 'I Momento',   icon: 'i-lucide-graduation-cap', value: '1' },
  { slot: '2', label: 'II Momento',  icon: 'i-lucide-graduation-cap', value: '2' },
  { slot: '3', label: 'III Momento', icon: 'i-lucide-graduation-cap', value: '3' },
]

const opcionesClausulas = [
  { value: 'ninguna',     label: 'Ninguna'                            },
  { value: 'literal_9',  label: 'Incentivo de Lapso (Literal 9)'    },
  { value: 'literal_13', label: 'Excepción de Consejo (Literal 13)' },
]

const state = reactive({
  academic_load_id: null,
  lapso: 1,
  estudiantes: []
})

// ✅ Computed para sincronizar state.lapso (número) con UTabs (string)
const lapsoActivo = computed({
  get: () => String(state.lapso),
  set: (val) => { state.lapso = Number(val) }
})

const schemas = [
  z.object({
    estudiantes: z.array(z.object({
      notas_parciales: z.array(z.object({
        // 🔥 VALIDACIÓN FLEXIBLE: Permite string vacío, null o números válidos entre 0 y 20
        nota: z.union([
          z.number().min(0, 'Min 0').max(20, 'Max 20'),
          z.literal(''),
          z.null()
        ]).optional()
      })).length(5, 'Deben ser 5 evaluaciones') 
    }))
  }),
  z.object({
    estudiantes: z.array(z.object({
      puntos_ajuste:       z.number().min(0).max(2),
      puntos_extracatedra: z.number().min(0).max(20),
      clausula_aplicada:   z.string(),
      observaciones:       z.string().max(255).optional()
    }))
  })
]

const schemaActual = computed(() => schemas[pasoActual.value])

// ==========================================
// PETICIONES HTTP
// ==========================================

const fetchSectionData = async () => {
  loading.value = true
  try {
    const response = await useApi(`/qualifications/${state.academic_load_id}/${state.lapso}`, { method: 'GET' })
    
    if (response?.status === 'success' && response?.data?.nomina) {
      state.estudiantes = response.data.nomina.map(est => {
        const notasBase = Array.from({ length: 5 }, (_, i) => {
          const parcialExistente = est.notas_parciales?.find(p => p.numero_evaluacion === i + 1)
          return {
            numero_evaluacion: i + 1,
            // 🔥 CAMBIA SOLO ESTA LÍNEA:
            nota: parcialExistente && parcialExistente.nota !== null ? parcialExistente.nota : '' 
          }
        })
        return {
          student_id:          est.student_id,
          first_name:          est.first_name,
          last_name:           est.last_name,
          id_card:             est.id_card,
          calificacion_final:  est.calificacion_final || 0,
          puntos_ajuste:       est.puntos_ajuste || 0,
          puntos_extracatedra: est.puntos_extracatedra || 0,
          clausula_aplicada:   est.clausula_aplicada || 'ninguna',
          nota_definitiva:     est.nota_definitiva || 0,
          observaciones:       est.observaciones || '',
          notas_parciales:     notasBase,
          control_anual:       est.control_anual
        }
      })
    }
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'No se pudo obtener la nómina de calificaciones.', color: 'error' })
  } finally {
    loading.value = false
  }
}

const submitActa = async () => {
  try {
    await formRef.value.validate()
  } catch (err) {
    toast.add({ title: 'Validación', description: 'Revisa las celdas con errores en la planilla.', color: 'warning' })
    return
  }

  loading.value = true
  try {
    const payload = {
      academic_load_id: state.academic_load_id,
      lapso: String(state.lapso),
      estudiantes: state.estudiantes.map(est => ({
        student_id:          est.student_id,
        calificacion_final:  est.calificacion_final,
        puntos_ajuste:       est.puntos_ajuste,
        puntos_extracatedra: est.puntos_extracatedra,
        clausula_aplicada:   est.clausula_aplicada,
        nota_definitiva:     est.nota_definitiva,
        observaciones:       est.clausula_aplicada !== 'ninguna' ? est.observaciones : '',
        notas_parciales:     est.notas_parciales
      }))
    }

    console.log(payload)
    const response = await useApi('/qualifications/bulk', { method: 'POST', body: payload })

    if (response?.status === 'success') {
      toast.add({ title: 'Éxito', description: 'Acta procesada y guardada con éxito.', color: 'success' })
      await fetchSectionData()
    }
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Error de Red', description: error.message || 'Error al procesar el lote.', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ==========================================
// CÁLCULOS REACTIVOS
// ==========================================

const recalcularFilaDefinitiva = (alumno) => {
  let ajuste = parseInt(alumno.puntos_ajuste || 0, 10)
  let extra  = parseInt(alumno.puntos_extracatedra || 0, 10)

  if (alumno.clausula_aplicada !== 'literal_13') {
    const maxPermitido = alumno.control_anual?.puntos_disponibles_restantes ?? 2
    if ((ajuste + extra) > maxPermitido) {
      if (ajuste > maxPermitido) {
        alumno.puntos_ajuste = maxPermitido
        alumno.puntos_extracatedra = 0
      } else {
        alumno.puntos_extracatedra = maxPermitido - ajuste
      }
      ajuste = parseInt(alumno.puntos_ajuste || 0, 10)
      extra  = parseInt(alumno.puntos_extracatedra || 0, 10)
      toast.add({ title: 'Límite Institucional', description: `Suma máxima permitida alcanzada (${maxPermitido} ptos).`, color: 'warning' })
    }
  }

  alumno.nota_definitiva = Math.min(20, alumno.calificacion_final + ajuste + extra)
}

const handleNotaChange = (alumno) => {
  // 👈 CAMBIA SOLO ESTA LÍNEA DE TU FUNCIÓN ORIGINAL:
  const validNotas = alumno.notas_parciales
    .map(n => n.nota)
    .filter(n => n !== null && n !== undefined && n !== '' && !isNaN(Number(n)))
    .map(Number) // Asegura que todos pasen a ser números reales para sumar

  if (validNotas.length === 0) {
    alumno.calificacion_final = 0
  } else {
    const avg = validNotas.reduce((a, b) => a + b, 0) / validNotas.length
    alumno.calificacion_final = Math.round(avg)
  }
  recalcularFilaDefinitiva(alumno)
}

const avanzarPasoAjustes = async () => {
  try {
    if (formRef.value) {
      await formRef.value.validate()
      pasoActual.value = 1
    }
  } catch (err) {
    toast.add({ title: 'Planilla Incompleta', description: 'Llena todas las calificaciones parciales correctamente.', color: 'error' })
  }
}

const getNotaColor = (nota) => {
  if (nota >= 15) return 'bg-primary-500'
  if (nota >= 10) return 'bg-info'
  return 'bg-error-500'
}

const promedioSeccion = computed(() => {
  if (!state.estudiantes.length) return 0
  const suma = state.estudiantes.reduce((acc, est) => acc + est.nota_definitiva, 0)
  return (suma / state.estudiantes.length).toFixed(1)
})

// ==========================================
// CICLO DE VIDA Y WATCHERS
// ==========================================

onMounted(() => {
  fetchSecciones()
})

watch(selectedSection, async (newSection) => {
  selectedLoad.value = null
  state.estudiantes = []
  if (newSection) {
    await fetchMateriasPorSeccion(newSection.id) // ✅ extrae el id aquí
  }
})

watch(selectedLoad, (newLoad) => {
  if (newLoad) {
    state.academic_load_id = newLoad.value // ✅ extrae el id aquí
    pasoActual.value = 0
    fetchSectionData()
  } else {
    state.estudiantes = []
  }
})

watch(() => state.lapso, () => {
  if (state.academic_load_id) {
    pasoActual.value = 0
    fetchSectionData()
  }
})
</script>

<template>
  <div class="flex items-center gap-3 mb-4">
    <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/calificaciones" />
  </div>

  <!-- FILTROS -->
  <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
    <div class="grid grid-cols-2 gap-4">

      <div class="w-full flex flex-col gap-1">
        <label class="text-md font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
          <UIcon name="i-lucide-calendar-days" /> Año y Sección
        </label>
        <USelectMenu
          v-model="selectedSection"
          :items="secciones"
          placeholder="Selecciona Sección..."
          :loading="loadingSecciones"
          class="w-full"
        />
      </div>

      <div class="w-full flex flex-col gap-1">
        <label class="text-md font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
          <UIcon name="i-lucide-book-open" /> Materia
        </label>
        <USelectMenu
          v-model="selectedLoad"
          :items="materiasOptions"
          placeholder="Esperando sección..."
          :disabled="!selectedSection"
          :loading="loadingMaterias"
          class="w-full"
        />
      </div>

    </div>
  </div>

  <UStepper v-model="pasoActual" disabled :items="pasos" class="w-full mb-6" />

  <UForm :schema="schemaActual" :state="state" ref="formRef" @submit="submitActa" class="space-y-6">

    <UTabs v-model="lapsoActivo" :items="momentos" class="w-full" />

    <UCard :ui="{ body: 'p-0' }" class="overflow-hidden border-primary-100">

      <!-- Loading -->
      <div v-if="loading" class="p-8 flex justify-center items-center">
        <UIcon name="i-lucide-loader-circle" class="size-8 text-primary animate-spin" />
      </div>

      <div v-else-if="!state.academic_load_id" class="p-8 text-center text-gray-400 italic">
        Selecciona una sección y materia para desplegar la sábana de notas.
      </div>

      <table v-else class="w-full text-left text-md border-collapse">
        <thead class="bg-slate-100 text-[10px] uppercase font-bold text-slate-500">
          <tr>
            <th class="p-4 text-sm w-12 text-center">N°</th>
            <th class="p-4 text-sm w-32">Cédula</th>
            <th class="p-4 text-sm">Apellidos y Nombres</th>
            <template v-if="pasoActual === 0">
              <th v-for="n in 5" :key="n" class="p-4 text-sm text-center w-20">Eval {{ n }}</th>
            </template>
            <template v-else>
              <th class="p-4 text-center text-sm w-24">Ajuste</th>
              <th class="p-4 text-center text-sm w-24">P. Extra</th>
              <th class="p-4 w-44 text-sm">Cláusula Aplicada</th>
            </template>
            <th class="p-4 text-sm text-primary text-center w-24 bg-primary-50/50">
              {{ pasoActual === 0 ? 'Calific. F.' : 'Definitiva' }}
            </th>
            <th v-if="pasoActual === 1" class="p-4">Observaciones Institucionales</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(alumno, index) in state.estudiantes"
            :key="alumno.student_id"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="p-4 text-center font-mono text-gray-400">
              {{ (index + 1).toString().padStart(2, '0') }}
            </td>
            <td class="p-4 font-medium text-slate-600">{{ alumno.id_card }}</td>
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="size-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 bg-primary-500">
                  {{ alumno.first_name.charAt(0) }}
                </div>
                <span class="font-bold text-slate-800 uppercase text-sm">
                  {{ alumno.last_name }}, {{ alumno.first_name }}
                </span>
              </div>
            </td>

            <template v-if="pasoActual === 0">
              <td v-for="(evaluacion, i) in alumno.notas_parciales" :key="i" class="p-2 text-center">
                <UFormField :name="`estudiantes.${index}.notas_parciales.${i}.nota`">
                  <input
                    v-model.number="evaluacion.nota"
                    type="number"
                    min="0"
                    max="20"
                    @input="handleNotaChange(alumno)"
                    class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-md transition-all"
                  />
                </UFormField>
              </td>
            </template>

            <template v-else>
              <td class="p-2 text-center">
                <input
                  v-model.number="alumno.puntos_ajuste"
                  type="number"
                  min="0"
                  max="2"
                  :disabled="alumno.control_anual?.materia_bloqueada_anual && alumno.clausula_aplicada !== 'literal_13'"
                  @input="recalcularFilaDefinitiva(alumno)"
                  class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-md transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </td>
              <td class="p-2 text-center">
                <input
                  v-model.number="alumno.puntos_extracatedra"
                  type="number"
                  min="0"
                  max="20"
                  :disabled="alumno.control_anual?.materia_bloqueada_anual && alumno.clausula_aplicada !== 'literal_13'"
                  @input="recalcularFilaDefinitiva(alumno)"
                  class="w-14 h-10 text-center bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-md transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </td>
              <td class="p-2">
                <USelect
                  v-model="alumno.clausula_aplicada"
                  :items="opcionesClausulas"
                  value-key="value"
                  :disabled="alumno.control_anual?.materia_bloqueada_anual && alumno.clausula_aplicada !== 'literal_13'"
                  class="w-full"
                  @update:model-value="recalcularFilaDefinitiva(alumno)"
                />
              </td>
            </template>

            <td class="p-4 text-center bg-primary-50/30">
              <div
                class="w-10 h-10 mx-auto rounded-md borde flex items-center justify-center font-bold text-white relative"
                :class="getNotaColor(pasoActual === 0 ? alumno.calificacion_final : alumno.nota_definitiva)"
              >
                {{ pasoActual === 0 ? alumno.calificacion_final : alumno.nota_definitiva }}
                <span
                  v-if="pasoActual === 1 && alumno.control_anual?.materia_bloqueada_anual"
                  class="absolute -top-1 -right-1 bg-slate-800 text-white p-0.5 rounded-full size-4 flex items-center justify-center text-[8px]"
                  title="Bloqueo Anual de Incentivos Activo"
                >
                  <UIcon name="i-lucide-lock" />
                </span>
              </div>
            </td>

            <td v-if="pasoActual === 1" class="p-2">
              <input
                v-model="alumno.observaciones"
                type="text"
                placeholder="Indique los motivos del ajuste..."
                :disabled="alumno.control_anual?.materia_bloqueada_anual && alumno.clausula_aplicada !== 'literal_13'"
                class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all disabled:bg-slate-50 disabled:text-gray-400 placeholder:italic"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="state.academic_load_id && !loading" class="bg-slate-100 p-3 flex justify-between items-center text-sm">
        <div class="flex gap-6">
          <span class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-info" />
            Estudiantes en Nómina: <strong class="text-info">{{ state.estudiantes.length }}</strong>
          </span>
          <span class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-primary-500" />
            Promedio Sección: <strong class="text-primary-500">{{ promedioSeccion }}</strong>
          </span>
        </div>
      </div>
    </UCard>

    <div v-if="state.academic_load_id" class="flex justify-between items-start gap-4 pt-2">
      <div class="max-w-md">
        <UAlert
          v-if="pasoActual === 0"
          icon="i-lucide-info"
          color="primary"
          variant="subtle"
          title="Nota de Proceso continuo"
          description="Al avanzar al Paso 2, se transmutará la cuadrícula para abrir las actas del Consejo de Sección y gestionar cláusulas institucionales."
        />
        <UAlert
          v-else
          icon="i-lucide-sliders-horizontal"
          color="info"
          variant="subtle"
          title="Firma del Acta del Período"
          description="Al guardar y firmar el acta activa, los incentivos aplicados se consolidarán restándose del inventario del candado anual del alumno."
        />
      </div>

      <div class="flex gap-3">
        <UButton
          v-if="pasoActual === 1"
          color="neutral"
          variant="outline"
          size="xl"
          class="px-6 py-4 font-bold rounded-xl"
          icon="i-lucide-arrow-left"
          @click="pasoActual = 0"
        >
          Volver a Notas
        </UButton>

        <UButton
          v-if="pasoActual === 0"
          color="primary"
          size="xl"
          class="px-8 py-4 font-bold rounded-xl group"
          @click="avanzarPasoAjustes"
        >
          Siguiente Paso: Ajustes
          <template #trailing>
            <UIcon name="i-lucide-arrow-right" class="group-hover:translate-x-1 transition-transform" />
          </template>
        </UButton>

        <UButton
          v-else
          type="submit"
          color="primary"
          size="xl"
          class="px-8 py-4 font-bold rounded-xl"
          icon="i-lucide-check-circle"
          label="Guardar y Firmar Acta Activa"
          :loading="loading"
        />
      </div>
    </div>

  </UForm>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>