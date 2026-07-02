export const useAcademicData = () => {
  // ✅ useState en lugar de ref — estado compartido globalmente en Nuxt
  const secciones = useState('academic-secciones', () => [])
  const materias = useState('academic-materias', () => [])
  const loadingSecciones = useState('academic-loading-secciones', () => false)
  const loadingMaterias = useState('academic-loading-materias', () => false)

  const toast = useToast()
  const anioGlobal = useState('anio_escolar_activo')

  // ✅ Parámetro force para poder refrescar cuando se necesite
  const fetchSecciones = async (force = false) => {
    if (!force && secciones.value.length > 0) return

    loadingSecciones.value = true
    try {
      const response = await useApi('/sections', { method: 'GET' })
      const data = response?.sections || response?.data || response || []

      secciones.value = data
        .filter(sec => !anioGlobal.value || sec.anio_escolar === anioGlobal.value?.value)
        .map(sec => ({
          id: sec.id,
          label: `${sec.grado}° Año - Sección ${sec.seccion}`
        }))
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Error', description: 'No se pudieron cargar las secciones activas.', color: 'error' })
    } finally {
      loadingSecciones.value = false
    }
  }

  const fetchMateriasPorSeccion = async (sectionId) => {
    if (!sectionId) {
      materias.value = []
      return
    }

    loadingMaterias.value = true
    try {
      const response = await useApi(`/academic-load/section/${sectionId}`, { method: 'GET' })
      if (response?.status === 'success' && response?.data) {
        materias.value = response.data.map(load => ({
          academic_load_id: load.id,
          label: load.subject?.nombre || 'Materia sin nombre'
        }))
      }
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Error', description: 'No se pudieron sincronizar las materias de esta sección.', color: 'error' })
    } finally {
      loadingMaterias.value = false
    }
  }

  return {
    secciones,
    materias,
    loadingSecciones,
    loadingMaterias,
    fetchSecciones,
    fetchMateriasPorSeccion
  }
}