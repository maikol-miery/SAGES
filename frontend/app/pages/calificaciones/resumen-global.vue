<template>
  <div class="p-6 w-full mx-auto">
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
      <p class="text-xs text-gray-400 mt-1 max-w-xs">Por favor, elija un año escolar y sección en el 
        menú superior para desplegar la sábana de notas EMG.</p>
    </div>

    <div v-else-if="loadingReporte" class="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
      <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
      <p class="text-xs text-gray-500 mt-4 font-medium tracking-wide">Compilando registros y cruzando calificaciones desde SAGES...</p>
    </div>

    <div v-else>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">

     
            <thead>
            <tr class="bg-primary-600 text-white">
                <th rowspan="2" class="py-3 px-3 text-center border-r border-primary-700 w-10 align-middle">N°</th>
                <th rowspan="2" class="py-3 px-4 border-r border-primary-700 min-w-[250px] align-middle">Apellidos</th>
             
                <th rowspan="2" class="py-3 px-4 border-r border-primary-700 min-w-[250px] align-middle">Nombres</th>
                <th rowspan="2" class="py-3 px-4 border-r border-primary-700 whitespace-nowrap align-middle">Fec.
                  Nacimiento</th>
                <th rowspan="2" class="py-3 px-4 border-r border-primary-700 align-middle">Género</th>

                <th
                v-for="materia in cabeceras"
                :key="materia.id"
                colspan="4"
            
                class="py-3 px-2 text-center border-r border-primary-700 font-bold tracking-wide"
                :title="materia.nombre"
                >
                {{ materia.abreviatura }}
                <span class="block text-[10px] font-normal text-primary-400 truncate max-w-[120px] mx-auto">
                 
                  {{ materia.nombre }}
                </span>
                </th>

                <th rowspan="2" class="py-3 px-3 text-center bg-primary-800 font-bold align-middle min-w-[60px]">
                Def.<br>Gral
                </th>
       
              </tr>

            <tr class="bg-primary-700 text-primary-300">
                <template v-for="materia in cabeceras" :key="`sub-${materia.id}`">
                <th class="py-2 px-2 text-center border-r border-primary-800 font-medium w-12">L1</th>
                
                <th class="py-2 px-2 text-center border-r border-primary-800 font-medium w-12">L2</th>
                <th class="py-2 px-2 text-center border-r border-primary-800 font-medium w-12">L3</th>
                <th class="py-2 px-2 text-center border-r border-primary-800 font-semibold text-white w-14">Def.</th>
                </template>
            </tr>
            </thead>

      
            <tbody class="divide-y divide-gray-100">
            <tr v-if="filas.length === 0">
                <td :colspan="3 + (cabeceras.length * 4) + 1" class="text-center py-12 text-gray-400 italic">
                No hay alumnos inscritos o calificaciones asentadas en esta sección.
                </td>
            </tr>

            <tr
                v-for="(alumno, idx) in filas"
                :key="alumno.student_id"
                class="hover:bg-blue-50/30 transition-colors"
                :class="idx % 2 === 0 ? 'bg-white' : 
                'bg-gray-50/50'"
            >
                <td class="py-3 px-3 text-center font-mono text-gray-400 border-r border-gray-100 font-medium">
                {{ alumno.numero_lista.toString().padStart(2, '0') }}
                </td>

           
                <td class="py-3 px-4 text-gray-800 border-r border-gray-100 uppercase text-sm">
                {{ alumno.apellido }}
                </td>
                <td class="py-3 px-4 text-gray-800 border-r border-gray-100 uppercase text-sm">
             
                {{ alumno.nombre}}
                </td>
                <td class="py-3 px-4 text-gray-800 border-r border-gray-100 uppercase text-sm">
                {{ alumno.fecha_nacimiento}}
                </td>
                <td class="py-3 px-4 text-gray-800 border-r border-gray-100 uppercase text-sm">
 
                {{ alumno.genero}}
                </td>

                <template v-for="materia in alumno.materias_desglose" :key="`nota-${materia.subject_id}`">
                <td class="py-3 px-2 text-center border-r border-gray-100 font-mono text-gray-600">
     
                    {{ materia.lapso_1 !== null ?
                    materia.lapso_1 : '—' }}
                </td>
                <td class="py-3 px-2 text-center border-r border-gray-100 font-mono text-gray-600">
                    {{ materia.lapso_2 !== null ?
                    materia.lapso_2 : '—' }}
                </td>
                <td class="py-3 px-2 text-center border-r border-gray-100 font-mono text-gray-600">
                    {{ materia.lapso_3 !== null ?
                    materia.lapso_3 : '—' }}
                </td>
                <td
                    class="py-3 px-2 text-center border-r border-gray-200 font-bold font-mono"
                    :class="materia.definitiva_materia !== null && materia.definitiva_materia < 10
             
                    ? 'text-red-600 bg-red-50/40'
                    : 'text-primary-700 bg-primary-50/60'"
                >
                    {{ materia.definitiva_materia !== null ?
                    materia.definitiva_materia : '—' }}
                </td>
                </template>

                <td
                class="py-3 px-3 text-center font-bold font-mono text-sm bg-blue-50/40"
        
                :class="alumno.definitiva_general !== null && alumno.definitiva_general < 10
                    ? 'text-red-600'
                    : 'text-blue-700'"
                >
                {{ alumno.definitiva_general !== null ?
                alumno.definitiva_general : '—' }}
                </td>
            </tr>
            </tbody>

            <tfoot>
            <tr class="bg-primary-100 border-t-2 border-primary-300 font-bold text-primary-600 text-[11px]">
         
                <td class="py-3 px-3 text-center border-r border-primary-200" colspan="5">
                Promedio Sección
                </td>
                <template v-for="materia in cabeceras" :key="`avg-${materia.id}`">
          
                <td class="py-3 px-2 text-center border-r border-primary-200 text-gray-400">—</td>
                <td class="py-3 px-2 text-center border-r border-primary-200 text-gray-400">—</td>
                <td class="py-3 px-2 text-center border-r border-primary-200 text-gray-400">—</td>
                <td class="py-3 px-2 text-center border-r border-primary-200 font-bold text-primary-700">
                    {{ 
                    promedioMateria(materia.id) }}
                </td>
                </template>
                <td class="py-3 px-3 text-center text-blue-700 bg-blue-50">
                {{ promedioGeneral }}
                </td>
            
            </tr>
            </tfoot>

        </table>
        </div>
    </div>

  <div v-if="profesoresListado.length > 0" class="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Nómina de Docentes y Materias Asociadas</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
      <div
        v-for="profe in profesoresListado"
        :key="profe.cedula + '-' + profe.materia"
    
        class="p-3.5 border border-gray-100 rounded-lg bg-primary-50/60 flex flex-col justify-center"
      >
        <p class="font-bold text-gray-900 text-sm">{{ profe.nombre_completo }}</p>
        <p class="text-gray-500 text-xs mt-0.5">C.I: {{ profe.cedula }}</p>
        <p class="text-primary-50 text-sm font-semibold mt-2 bg-primary-600 px-2 py-1 rounded w-max">
          {{ profe.materia }}
        </p>
      </div>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>

definePageMeta({
    
    middleware: 'auth',
    layout: 'dashboard'
})

import { ref, watch, onMounted, computed } from 'vue'

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
    const cargaData = resAcademicLoad.data ||
    []
    const materiasMapa = []
    const profesoresMapa = {}

    cargaData.forEach(carga => {
      const sub = carga.Subject || carga.subject
      if (sub && !materiasMapa.find(m => m.id === sub.id)) {
        materiasMapa.push({
          id: sub.id,
          academic_load_id: carga.id, // Guardamos el ID de la carga para cruzar notas más tarde
          abreviatura: sub.abreviatura || 
          sub.nombre.substring(0, 3).toUpperCase(),
          nombre: sub.nombre
        })
      }

      const docente = carga.Docente || carga.docente || carga.Staff || carga.staff
      if (docente) {
        // Clave única combinando ID del profesor y la materia para tarjetas separadas
        const profKey = `${docente.id}-${sub ? sub.id : 'sin-materia'}`
        
        if (!profesoresMapa[profKey]) {
          profesoresMapa[profKey] = {
            cedula: docente.cedula,
            nombre_completo: `${docente.apellido || ''}, ${docente.nombre || ''}`,
            materia: sub?.nombre || 'Desconocida'
          }
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
    const inscripciones = resRegistration.data ||
    []
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
    const todasLasNotas = resQualifications.data ||
    []

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

        // CAMBIO: Ahora dividimos entre readyLapsos en lugar de 3
        const definitivaMateria = readyLapsos > 0 ? Math.round(sumaLapsos / readyLapsos) : null

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
        ?
        Math.round(sumaDefinitivasEstudiante / materiasConNotaCount) 
        : null

      return {
        numero_lista: index + 1,
        student_id: est.id,
        cedula: est.cedula,
        nombre: est.nombre,
        genero: est.genero,
        fecha_nacimiento: est.fecha_nacimiento,
        apellido: est.apellido,
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

const promedioMateria = (subjectId) => {
  if (!filas.value.length) return '—'
  const notas = filas.value
    .map(f => f.materias_desglose.find(m => m.subject_id === subjectId)?.definitiva_materia)
    .filter(n => n !== null && n !== undefined)
  if (!notas.length) return '—'
  return Math.round(notas.reduce((a, b) => a + b, 0) / notas.length)
}

const promedioGeneral = computed(() => {
  
  if (!filas.value.length) return '—'
  const notas = filas.value
    .map(f => f.definitiva_general)
    .filter(n => n !== null && n !== undefined)
  if (!notas.length) return '—'
  return (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
})

// Watcher reactivo del USelectMenu
watch(seccionSeleccionada, (nuevaSeccion) => {
  if (nuevaSeccion && nuevaSeccion.id) {
    consultarReporteSeccion(nuevaSeccion.id)
  } else {
    consultarReporteSeccion(null)
  }
})
</script>