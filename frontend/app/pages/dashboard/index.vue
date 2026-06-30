<script setup>
definePageMeta({
  middleware: 'auth',
  layout: "dashboard"
})

const userRole = useCookie('user_role')
const toast = useToast()

const frases = [
  { texto: 'Nada como un buen café para iniciar la jornada...', icono: 'i-lucide-coffee' },
  { texto: '¡Hagamos que la jornada de hoy sea excelente!.', icono: 'i-lucide-calendar-check' },
  { texto: 'Detrás de una gran gestión escolar, siempre hay un equipo administrativo excepcional', icono: 'i-lucide-award' },
  { texto: 'Un sistema ordenado es el reflejo de una gestión eficiente.', icono: 'i-lucide-layout-dashboard' }
]

const indiceActual = ref(0)
let temporizador = null

const cargandoBackup  = ref(false)
const cargandoRestore = ref(false)
const modalRestore    = ref(false)
const fileBackup      = ref(null)

const fraseActual = computed(() => frases[indiceActual.value])

onMounted(() => {
  temporizador = setInterval(() => {
    indiceActual.value = (indiceActual.value + 1) % frases.length
  }, 10000)
})

onUnmounted(() => {
  if (temporizador) clearInterval(temporizador)
})

// 🏆 EXPORTAR: Volvemos al flujo nativo de archivos .bak
const handleExportar = async () => {
  cargandoBackup.value = true
  try {
    // Lo dejamos como GET nativo, que es como lo tenías originalmente y funcionaba
    const data = await useApi('/maintenance/export', { responseType: 'blob' })

    const blob = new Blob([data], { type: 'application/octet-stream' })
    const url  = window.URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const hoy  = new Date().toISOString().split('T')[0]

    a.href     = url
    // 👇 Aquí está el cambio: de .bak a .backup
    a.download = `sages_db_${hoy}.backup` 
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.add({ title: 'Éxito', description: 'Copia de seguridad guardada.', color: 'success' })
  } catch (error) {
    console.error('Error al exportar:', error)
    toast.add({ title: 'Error', description: 'No se pudo exportar la data.', color: 'error' })
  } finally {
    cargandoBackup.value = false
  }
}

const onSubirArchivo = (e) => {
  const target = e.target
  if (target && target.files && target.files.length > 0) {
    fileBackup.value = target.files[0]
    console.log('📌 Archivo cargado en memoria listo para enviar:', fileBackup.value.name)
  }
}

// 🏆 RESTAURAR: Envío seguro de FormData por useApi
const handleRestaurar = async () => {
  if (!fileBackup.value) return
  cargandoRestore.value = true
  
  try {
    const form = new FormData()
    form.append('backupFile', fileBackup.value)

    await useApi('/maintenance/restore', {
      method: 'POST',
      body: form
    })

    toast.add({ title: 'Sistema Restablecido', description: 'Los datos históricos se cargaron correctamente.', color: 'success' })
    modalRestore.value = false
    fileBackup.value = null
  } catch (error) {
    console.error('Error al restaurar:', error)
    toast.add({ title: 'Falla de restauración', description: error.data?.message || 'Error al restaurar.', color: 'error' })
  } finally {
    cargandoRestore.value = false
  }
}
</script>
<template>
  <div class="flex flex-col gap-6 items-center justify-center min-h-[75vh] w-full px-4 select-none">

    <img
      src="/icon.png"
      alt="SAGES Logo"
      class="logo-flotante w-32 h-32 object-contain drop-shadow-sm"
    />

    <h1 class="text-4xl font-bold text-slate-700 text-center tracking-tight">
      ¡Bienvenido al Sistema SAGES!
    </h1>

    <div class="text-lg text-slate-400 text-center max-w-xl leading-relaxed h-16 flex gap-2 flex-col justify-center mb-6">
      <p class="flex items-center justify-center gap-2 transition-all duration-500 ease-in-out">
        <span>"{{ fraseActual.texto }}"</span>
        <UIcon :name="fraseActual.icono" class="w-5 h-5 text-slate-400 flex-shrink-0" />
      </p>
      <p class="text-primary font-bold text-sm">Por favor, seleccione un módulo para empezar.</p>
    </div>

    <div v-if="userRole === 'admin'" class="w-full max-w-xl border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
      <h2 class="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-4 text-left">
        Mantenimiento de Base de Datos (PostgreSQL)
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <UCard class="text-left shadow-sm hover:shadow-md transition-shadow">
          <div class="flex flex-col h-full justify-between">
            <div>
              <div class="flex items-center gap-2 text-primary-600 font-bold text-sm mb-1">
                <UIcon name="i-lucide-database-backup" class="w-4 h-4" />
                <span>Copia de Seguridad</span>
              </div>
              <p class="text-xs text-slate-400 mb-4">
                Descarga un volcado completo comprimido (.bak) del estado actual del sistema.
              </p>
            </div>
            <UButton
              icon="i-lucide-download"
              label="Hacer Backup"
              class="w-full justify-center text-xs"
              :loading="cargandoBackup"
              @click="handleExportar"
            />
          </div>
        </UCard>

        <UCard class="text-left shadow-sm hover:shadow-md transition-shadow border-red-100 dark:border-red-900/30">
          <div class="flex flex-col h-full justify-between">
            <div>
              <div class="flex items-center gap-2 text-red-600 font-bold text-sm mb-1">
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
                <span>Restaurar Sistema</span>
              </div>
              <p class="text-xs text-slate-400 mb-4">
                Sube un archivo previo para revertir o recuperar el estado completo del SAGES.
              </p>
            </div>
            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-upload"
              label="Cargar Restore"
              class="w-full justify-center text-xs"
              @click="modalRestore = true"
            />
          </div>
        </UCard>

      </div>
    </div>

    <UModal v-model:open="modalRestore">
      <template #content>
        <div class="p-6 space-y-4 text-left">
          <div class="flex items-center gap-3 text-red-600">
            <UIcon name="i-lucide-triangle-alert" class="w-7 h-7 flex-shrink-0" />
            <h3 class="text-base font-bold">¿Ejecutar restauración crítica?</h3>
          </div>

          <p class="text-xs text-slate-500">
            Atención: Al procesar este archivo se <strong>eliminarán por completo</strong> todas las secciones,
            matrículas y notas actuales para sobreescribirlas con los datos pasados. Esta acción no se puede deshacer.
          </p>

          <div class="space-y-1">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Archivo de Respaldo (.bak)</label>
            <input
              type="file"
              accept=".bak"
              class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              @change="onSubirArchivo"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              label="Cancelar"
              size="xs"
              @click="modalRestore = false"
            />
            <UButton
              type="button"
              color="error"
              label="Restaurar Base de Datos"
              size="xs"
              :loading="cargandoRestore"
              :disabled="!fileBackup"
              @click="handleRestaurar"
            />
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>

<style scoped>
.logo-flotante {
  animation: levitacion 3.5s ease-in-out infinite;
  will-change: transform;
}

@keyframes levitacion {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}
</style>