<template>
  <div class="grid grid-cols-1 gap-2">
    <div class="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-primary-300 hover:scale-105 transition-all duration-300 group cursor-pointer">
      <div class="p-2.5 bg-green-50 rounded-lg text-green-600">
        <UIcon name="i-lucide-users" class="size-6" />
      </div>
      <div>
        <p class="text-sm text-gray-400 font-bold uppercase tracking-wider group-hover:text-gray-700">Docentes Activos</p>
        <p class="text-lg font-bold text-gray-700 group-hover:text-black">42</p>
      </div>
    </div>
    
    <div class="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-blue-300 hover:scale-105 transition-all duration-300 group cursor-pointer">
      <div class="p-2.5 bg-blue-50 rounded-lg text-blue-600 transition-colors group-hover:bg-blue-100">
        <UIcon name="i-lucide-book" class="size-6" />
      </div>
      <div>
        <p class="text-sm text-gray-400 font-bold uppercase tracking-wider transition-colors group-hover:text-gray-700">Materias Totales</p>
        <p class="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">18</p>
      </div>
    </div>

    <div class="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-3 hover:bg-error-300 hover:scale-105 transition-all duration-300 group cursor-pointer">
      <div class="p-2.5 bg-red-50 rounded-lg text-error transition-colors">
        <UIcon name="i-lucide-alert-triangle" class="size-6" />
      </div>
      <div>
        <p class="text-sm text-gray-400 font-bold uppercase tracking-wider transition-colors group-hover:text-gray-700">Sin Asignar</p>
        <p class="text-lg font-bold text-gray-700 transition-colors group-hover:text-black">03</p>
      </div>
    </div>
  </div>
</template>

<script setup></script>