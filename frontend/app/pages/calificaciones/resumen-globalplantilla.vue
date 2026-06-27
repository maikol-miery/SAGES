<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-800">Sábana Oficial de Calificaciones Anuales</h1>
          <p class="text-sm text-gray-500 mt-0.5">Formato de Evaluación General (EMG)</p>
        </div>
        
        <div class="flex items-center gap-3 min-w-[320px]">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sección:</span>
          <USelectMenu
            v-model="seccionSeleccionada"
            :items="secciones"
            
            placeholder="Seleccione un año y sección"
            :loading="loadingSecciones"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div v-if="!seccionSeleccionada" class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 text-center">
      <div class="p-3 bg-gray-50 rounded-full text-gray-400 mb-3">
        <span class="text-2xl">📋</span>
      </div>
      <h3 class="text-sm font-semibold text-gray-700">Ninguna sección seleccionada</h3>
      <p class="text-xs text-gray-400 mt-1 max-w-xs">Por favor, elija un año escolar y sección en el menú superior para desplegar la sábana de notas EMG.</p>
    </div>

    <div v-else-if="loadingReporte" class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
      <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
      <p class="text-xs text-gray-500 mt-4 font-medium tracking-wide">Compilando registros y cruzando calificaciones desde SAGES...</p>
    </div>

    <div v-else>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th class="py-4 px-4 text-center w-12 border-r border-gray-200">N°</th>
                <th class="py-4 px-4 w-32 border-r border-gray-200">Cédula</th>
                <th class="py-4 px-4 border-r border-gray-200 min-w-[240px]">Apellidos y Nombres</th>
                
                <th 
                  v-for="materia in cabeceras" 
                  :key="materia.id" 
                  class="py-4 px-2 text-center border-r border-gray-200 min-w-[70px]"
                  :title="materia.nombre"
                >
                  {{ materia.abreviatura }}
                </th>
                
                <th class="py-4 px-4 text-center text-blue-700 bg-blue-50 font-bold">Def. Gral</th>
              </tr>
            </thead>
            
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr v-if="filas.length === 0">
                <td :colspan="4 + cabeceras.length" class="text-center py-10 text-xs text-gray-400">
                  No hay alumnos inscritos o calificaciones asentadas en esta sección.
                </td>
              </tr>
              
              <template v-else v-for="alumno in filas" :key="alumno.student_id">
                <tr class="hover:bg-gray-50/70 transition-colors">
                  <td class="py-3 px-4 text-center font-medium text-gray-400 border-r border-gray-100">
                    {{ alumno.numero_lista }}
                  </td>
                  <td class="py-3 px-4 font-mono text-xs border-r border-gray-100">
                    {{ alumno.cedula }}
                  </td>
                  <td class="py-3 px-4 font-semibold text-gray-900 border-r border-gray-100">
                    {{ alumno.nombre_completo }}
                  </td>
                  
                  <td 
                    v-for="materia in alumno.materias_desglose" 
                    :key="materia.subject_id" 
                    class="py-3 px-2 text-center border-r border-gray-100 font-medium font-mono"
                    :class="materia.definitiva_materia !== null && materia.definitiva_materia < 10 ? 'text-red-600 bg-red-50/30' : 'text-gray-800'"
                  >
                    {{ materia.definitiva_materia !== null ? materia.definitiva_materia : '-' }}
                  </td>
                  
                  <td 
                    class="py-3 px-4 text-center font-bold font-mono bg-blue-50/40"
                    :class="alumno.definitiva_general !== null && alumno.definitiva_general < 10 ? 'text-red-600' : 'text-blue-700'"
                  >
                    {{ alumno.definitiva_general !== null ? alumno.definitiva_general : '-' }}
                  </td>
                </tr>

                <tr class="bg-gray-50/40">
                  <td :colspan="4 + cabeceras.length" class="px-6 py-2 border-b border-gray-200">
                    <div class="flex flex-wrap gap-4 py-1 text-xs text-gray-500">
                      <span class="font-semibold text-gray-400 uppercase tracking-wider text-[10px] flex items-center">
                        Detalle de Lapsos:
                      </span>
                      <div 
                        v-for="m in alumno.materias_desglose" 
                        :key="m.subject_id" 
                        class="bg-white border border-gray-200 rounded px-2 py-1 flex items-center gap-1.5 font-mono shadow-2xs"
                      >
                        <span class="font-sans font-bold text-gray-700">{{ m.abreviatura }}:</span>
                        <span class="text-gray-400">L1:</span><span class="text-gray-900 font-semibold">{{ m.lapso_1 !== null ? m.lapso_1 : '—' }}</span>
                        <span class="text-gray-400">L2:</span><span class="text-gray-900 font-semibold">{{ m.lapso_2 !== null ? m.lapso_2 : '—' }}</span>
                        <span class="text-gray-400">L3:</span><span class="text-gray-900 font-semibold">{{ m.lapso_3 !== null ? m.lapso_3 : '—' }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="profesoresListado.length > 0" class="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Nómina de Docentes y Cátedras Asociadas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="profe in profesoresListado" 
            :key="profe.cedula" 
            class="p-3.5 border border-gray-100 rounded-lg bg-gray-50/60 flex flex-col justify-center"
          >
            <p class="font-bold text-gray-900 text-sm">{{ profe.nombre_completo }}</p>
            <p class="text-gray-500 text-xs mt-0.5">C.I: {{ profe.cedula }}</p>
            <p class="text-blue-600 text-xs font-semibold mt-2 bg-blue-50 px-2 py-1 rounded w-max">
              {{ profe.materia }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

// Consumir el composable de secciones activas de SAGES
const { secciones, loadingSecciones, fetchSecciones } = useAcademicData()

// Estados reactivos de la vista
const seccionSeleccionada = ref(null)
const cabeceras = ref([])
const filas = ref([])
const profesoresListado = ref([])
const loadingReporte = ref(false)

onMounted(() => {
  fetchSecciones()
})

const consultarReporteSeccion = async (idSeccion) => {
  if (!idSeccion) {
    cabeceras.value = []
    filas.value = []
    profesoresListado.value = []
    return
  }

  try {
    loadingReporte.value = true
    
    // 1. Peticiones Paralelas apuntando a las rutas reales de tus controladores de Sequelize
    const [resRegistration, resAcademicLoad, resQualifications] = await Promise.all([
      useApi(`/registrations?section_id=${idSeccion}`, { method: 'GET' }),
      useApi(`/academic-load/section/${idSeccion}`, { method: 'GET' }),
      useApi(`/qualifications/section/${idSeccion}`, { method: 'GET' })
    ])

    // ==========================================
    // PASO 1: MAPEAR MATERIAS Y DOCENTES DESDE ACADEMIC-LOAD
    // ==========================================
    const cargaData = resAcademicLoad.data || []
    const materiasMapa = []
    const profesoresMapa = {}

    cargaData.forEach(carga => {
      const sub = carga.Subject || carga.subject
      if (sub && !materiasMapa.find(m => m.id === sub.id)) {
        materiasMapa.push({
          id: sub.id,
          academic_load_id: carga.id, // Guardamos el ID de la carga para cruzar notas más tarde
          abreviatura: sub.abreviatura || sub.nombre.substring(0, 3).toUpperCase(),
          nombre: sub.nombre
        })
      }

      const docente = carga.Docente || carga.docente || carga.Staff || carga.staff
      if (docente && !profesoresMapa[docente.id]) {
        profesoresMapa[docente.id] = {
          cedula: docente.cedula,
          nombre_completo: `${docente.apellido || ''}, ${docente.nombre || ''}`,
          materia: sub?.nombre || 'Desconocida'
        }
      }
    })
    
    // Ordenar asignaturas por nombre
    materiasMapa.sort((a, b) => a.nombre.localeCompare(b.nombre))
    cabeceras.value = materiasMapa
    profesoresListado.value = Object.values(profesoresMapa)

    // ==========================================
    // PASO 2: EXTRAER ESTUDIANTES DESDE REGISTRATIONS
    // ==========================================
    const inscripciones = resRegistration.data || []
    const estudiantes = inscripciones.map(i => i.Student || i.student).filter(Boolean)
    
    // Orden alfabético estricto
    estudiantes.sort((a, b) => {
      const apellidoComp = (a.apellido || '').localeCompare(b.apellido || '')
      if (apellidoComp !== 0) return apellidoComp
      return (a.nombre || '').localeCompare(b.nombre || '')
    })

    // ==========================================
    // PASO 3 Y 4: CRUZAR CALIFICACIONES CRUDAS (ARRAY PLANO)
    // ==========================================
    const todasLasNotas = resQualifications.data || []

    filas.value = estudiantes.map((est, index) => {
      const desgloseMaterias = []
      let sumaDefinitivasEstudiante = 0
      let materiasConNotaCount = 0

      materiasMapa.forEach(materia => {
        // Filtrar las notas que correspondan a este alumno y a la carga académica de esta materia
        const notasEstudianteMateria = todasLasNotas.filter(q => {
          return q.student_id === est.id && q.academic_load_id === materia.academic_load_id
        })

        let lapso_1 = null
        let lapso_2 = null
        let lapso_3 = null

        // Ubicar cada nota en su respectivo lapso académico
        notasEstudianteMateria.forEach(q => {
          const lapsoStr = String(q.lapso).trim()
          const nota = q.nota_definitiva !== null ? parseFloat(q.nota_definitiva) : null

          if (lapsoStr === '1' || lapsoStr === 'I') lapso_1 = nota
          if (lapsoStr === '2' || lapsoStr === 'II') lapso_2 = nota
          if (lapsoStr === '3' || lapsoStr === 'III') lapso_3 = nota
        })

        // Calcular promedio redondeado de la asignatura (Suma de lapsos existentes / 3)
        let readyLapsos = 0
        let sumaLapsos = 0
        if (lapso_1 !== null) { sumaLapsos += lapso_1; readyLapsos++ }
        if (lapso_2 !== null) { sumaLapsos += lapso_2; readyLapsos++ }
        if (lapso_3 !== null) { sumaLapsos += lapso_3; readyLapsos++ }

        const definitivaMateria = readyLapsos > 0 ? Math.round(sumaLapsos / 3) : null

        if (definitivaMateria !== null) {
          sumaDefinitivasEstudiante += definitivaMateria
          materiasConNotaCount++
        }

        desgloseMaterias.push({
          subject_id: materia.id,
          abreviatura: materia.abreviatura,
          nombre: materia.nombre,
          lapso_1,
          lapso_2,
          lapso_3,
          definitiva_materia: definitivaMateria
        })
      })

      // Calcular promedio general anual de SAGES
      const definitivaGeneral = materiasConNotaCount > 0 
        ? Math.round(sumaDefinitivasEstudiante / materiasConNotaCount) 
        : null

      return {
        numero_lista: index + 1,
        student_id: est.id,
        cedula: est.cedula,
        nombre_completo: `${est.apellido}, ${est.nombre}`,
        definitiva_general: definitivaGeneral,
        materias_desglose: desgloseMaterias
      }
    })

  } catch (error) {
    console.error("Error estructurando el cruce manual del EMG:", error)
  } finally {
    loadingReporte.value = false
  }
}

// Watcher reactivo del USelectMenu
watch(seccionSeleccionada, (nuevaSeccion) => {
  if (nuevaSeccion && nuevaSeccion.id) {
    consultarReporteSeccion(nuevaSeccion.id)
  } else {
    consultarReporteSeccion(null)
  }
})
</script>