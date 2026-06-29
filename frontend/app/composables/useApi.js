// composables/useApi.js
export const useApi = (endpoint, options = {}) => {
  const config = useRuntimeConfig()
  const tokenCookie = useCookie('token')

  const headers = {}

  // ✅ Solo fuerza application/json si el body NO es un FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (tokenCookie.value) {
    headers['Authorization'] = `Bearer ${tokenCookie.value}`
  }

  return $fetch(endpoint, {
    baseURL: config.public.apiBase,
    ...options,
    // ✅ Merge correcto de headers: los del caller pueden sobrescribir los defaults
    headers: { ...headers, ...options.headers }
  })
}