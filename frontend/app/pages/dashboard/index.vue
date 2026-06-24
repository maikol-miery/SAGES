<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: "dashboard"
})

// 1. Tu banco de frases personalizadas con sus respectivos iconos
const frases = [
  { texto: 'Nada como un buen café para iniciar la jornada...', icono: 'i-lucide-coffee' },
  { texto: '¡Hagamos que la jornada de hoy sea excelente!.', icono: 'i-lucide-calendar-check' },
  { texto: 'Detrás de una gran gestión escolar, siempre hay un equipo administrativo excepcional', icono: 'i-lucide-award' },
  { texto: 'Un sistema ordenado es el reflejo de una gestión eficiente.', icono: 'i-lucide-layout-dashboard' }
]

// 2. Estado para controlar cuál frase se está mostrando
const indiceActual = ref(0)
let temporizador = null

// 3. Propiedad computada para renderizar la frase activa
const fraseActual = computed(() => frases[indiceActual.value])

// 4. Ciclo de vida: Iniciar la rotación al cargar el componente
onMounted(() => {
  temporizador = setInterval(() => {
    // Incrementa el índice y vuelve a 0 cuando llega al final del arreglo
    indiceActual.value = (indiceActual.value + 1) % frases.length
  }, 6000) // Cambia cada 6000 milisegundos (6 segundos)
})

// 5. Buenas prácticas: Limpiar el temporizador si el usuario sale de la vista de Inicio
onUnmounted(() => {
  if (temporizador) clearInterval(temporizador)
})
</script>

<template>
  <!-- Contenedor principal centrado flexible -->
  <div class="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 select-none">
    
    <!-- Imagotipo de SAGES -->
    <img 
      src="/icon.png" 
      alt="SAGES Logo" 
      class="w-32 h-32 object-contain mb-6 drop-shadow-sm"
    />

    <!-- Título de Bienvenida -->
    <h1 class="text-2xl font-bold text-slate-700 text-center tracking-tight mb-2">
      ¡Bienvenido al Sistema SAGES!
    </h1>

    <!-- Bloque de Frases Dinámicas -->
    <div class="text-sm text-slate-400 text-center max-w-xl leading-relaxed mb-6 h-12 flex flex-col justify-center">
      <!-- Transición suave de Tailwind al cambiar de frase -->
      <p class="flex items-center justify-center gap-2 mb-1 transition-all duration-500 ease-in-out">
        <span>"{{ fraseActual.texto }}"</span>
        <UIcon :name="fraseActual.icono" class="w-5 h-5 text-slate-400 flex-shrink-0" />
      </p>
      
      <p>Por favor, seleccione un módulo para empezar.</p>
    </div>

  </div>
</template>
