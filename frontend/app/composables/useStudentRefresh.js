// composables/useStudentRefresh.js
export const useStudentRefresh = () => {
  // Estado global: un simple interruptor numérico
  const refreshCounter = useState('student-refresh-counter', () => 0)

  // Función para avisar a toda la app que aumente el contador
  const triggerRefresh = () => {
    refreshCounter.value++
  }

  return {
    refreshCounter,
    triggerRefresh
  }
}