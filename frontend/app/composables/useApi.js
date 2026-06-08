// composables/useApi.js
export const useApi = (endpoint, options = {}) => {
  const config = useRuntimeConfig()
  const tokenCookie = useCookie('token')

  // Configuración por defecto para todas las peticiones de SAGES
  const defaults = {
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  // Si la cookie tiene el token, se lo inyectamos al Header Authorization
  if (tokenCookie.value) {
    defaults.headers['Authorization'] = `Bearer ${tokenCookie.value}`
  }

  // Retornamos el fetch nativo combinando las opciones
  return $fetch(endpoint, { ...defaults, ...options })
}