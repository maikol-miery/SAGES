<script setup>
definePageMeta({
    middleware: 'auth',
    layout: 'dashboard'
})
import { ref } from 'vue'

// Estado del buscador centralizado
const busquedaEstudiante = ref('')

// Actividad Reciente Mock (SAGES)
const actividades = ref([
  {
    id: 1,
    tipo: 'carga',
    titulo: 'Notas de Matemáticas I cargadas',
    subtitulo: 'Sección A - Hace 5 min',
    badge: '24 Alumnos',
    icon: 'i-heroicons-document-text'
  },
  {
    id: 2,
    tipo: 'revision',
    titulo: 'Revisión de expediente completada',
    subtitulo: 'Ana Martínez - Hace 12 min',
    badge: 'Finalizado',
    icon: 'i-heroicons-user-badge'
  }
])

// Funciones para los clicks de las tarjetas principales

const descargarManual = () => {
  console.log('Descargando Manual de Usuario...')
}
</script>

<template>
    <div class="w-full max-h-screen flex justify-center items-center flex-col">

      <div class="text-center mx-auto mb-8">
        <h1 class="text-3xl font-bold text-neutral-800 tracking-tight mb-2">
          Consola de Control de Calificaciones
        </h1>
        <p class="max-w-200 text-md text-neutral-500 leading-relaxed">
          Gestiona el rendimiento académico de la institución con herramientas centralizadas para la carga masiva y el análisis de resultados.
        </p>
      </div>

      <!-- BARRA DE BUSQUEDA -->

      <div class="max-w-2xl flex justify-center items-center mb-12">
        <UInput
          v-model="busquedaEstudiante"
          icon="i-heroicons-magnifying-glass"
          color="white"
          size="xl"
          :trailing="false"
          placeholder="Buscar estudiante por nombre o cédula para acceso rápido..."
          :ui="{ 
                base: 'px-3 py-3 w-4xl rounded-xl text-md transition-all duration-300 focus:bg-olivine-50 focus:ring-2 focus:ring-olivine-500 focus:scale-[1.01]'
            }"
        >
        </UInput>
      </div>

      <!-- CARDS DE OPCIONES DE CARGA -->

      <div class="px-20 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <NuxtLink to="calificaciones/carga-seccion">
            <UCard 
            class="max-w-[420px] h-80 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
            :ui="{ 
                base: 'overflow-hidden border border-slate-200/80 rounded-2xl bg-white w-full',
                body: { padding: 'p-8 flex flex-col items-start' },
                ring: 'ring-0'
            }"
            >
            <div class="w-fit px-5 py-4 bg-primary-100 rounded-xl mb-6 group-hover:bg-primary-600 transition-colors">
                <UIcon name="i-lucide-users" class="size-9 text-primary-700 group-hover:text-white transition-colors" />
            </div>
            <h3 class="text-lg font-bold text-neutral-800 mb-2">Carga por Sección</h3>
            <p class="text-sm text-neutral-500 leading-relaxed">
                Subir notas de una materia para todo un grupo de estudiantes de forma simultánea.
            </p>
            </UCard>
        </NuxtLink>
        
        <NuxtLink to="carga-estudiante">
            <UCard 
            class="max-w-[420px] rounded-3xl h-80 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
            :ui="{ 
                base: 'overflow-hidden border border-slate-200/80 rounded-2xl bg-white w-full',
                body: { padding: 'p-8 flex flex-col items-start' },
                ring: 'ring-0'
            }"
            >
            <div class="w-fit px-5 py-4 bg-primary-100 rounded-xl mb-6 group-hover:bg-primary-600 transition-colors">
                <UIcon name="i-lucide-contact" class="size-9 text-primary-700 group-hover:text-white transition-colors" />
            </div>
            <h3 class="text-lg font-bold text-neutral-800 mb-2">Carga por Estudiante</h3>
            <p class="text-sm text-neutral-500 leading-relaxed">
                Subir todas las notas de un alumno específico a través de su historial académico individual.
            </p>
            </UCard>
        </NuxtLink>

        <NuxtLink to="calificaciones/resumen-global">
            <UCard 
            class="max-w-[420px] rounded-3xl h-80 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
            :ui="{ 
                base: 'overflow-hidden border border-slate-200/80 rounded-2xl bg-white w-full',
                body: { padding: 'p-8 flex flex-col items-start' },
                ring: 'ring-0'
            }"
            >
            <div class="w-fit px-5 py-4 bg-primary-100 rounded-xl mb-6 group-hover:bg-primary-600 transition-colors">
                <UIcon name="i-lucide-bar-chart-3" class="size-9 text-primary-700 group-hover:text-white transition-colors" />
            </div>
            <h3 class="text-lg font-bold text-neutral-800 mb-2">Resumen Global</h3>
            <p class="text-sm text-neutral-500 leading-relaxed">
                Ver matriz completa de notas por sección y generar reportes de rendimiento estadístico.
            </p>
            </UCard>
        </NuxtLink>
        

      </div>

      <!-- CAMBIOS RECIENTES -->
        <div class="grid grid-cols-2 gap-6">
            
            <div class="bg-slate-100/60 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-center mb-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800">Actividad Reciente</h4>
                <UBadge color="primary" variant="soft" size="xs" class="font-bold uppercase px-2 rounded-md">Vivo</UBadge>
                </div>

                <div class="space-y-3">
                <div 
                    v-for="actividad in actividades" 
                    :key="actividad.id" 
                    class="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                >
                    <div class="flex items-center gap-4">
                    <div class="p-2 bg-primary-50 text-primary-600 rounded-lg">
                        <UIcon :name="actividad.icon" class="w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800">{{ actividad.titulo }}</p>
                        <p class="text-xs text-slate-400">{{ actividad.subtitulo }}</p>
                    </div>
                    </div>
                    <span class="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    {{ actividad.badge }}
                    </span>
                </div>
                </div>
            </div>
            </div>

            <!-- GADGET CARGA DE NOTAS -->

            <div class="bg-slate-100/60 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Estado del Sistema</h4>
                <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-medium text-slate-500">Carga del Periodo</span>
                <span class="text-sm font-bold text-primary-600">82%</span>
                </div>
                
                <UProgress :value="82" color="primary" size="sm" class="mb-4" />
                
                <p class="text-xs text-slate-400 leading-relaxed mb-6">
                Quedan 48 horas para el cierre de actas del primer corte académico.
                </p>
            </div>

            <UButton 
                @click="descargarManual"
                color="primary" 
                variant="outline" 
                block
                size="md"
                class="rounded-xl font-medium bg-white hover:bg-primary-50/50 border-primary-600 text-primary-700"
            >
                Descargar Manual de Usuario
            </UButton>
            </div>
        </div>
    </div>
</template>