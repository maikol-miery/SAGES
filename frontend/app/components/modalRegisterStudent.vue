<script setup>
import { z } from 'zod'

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const currentStep = ref(0)
const form = ref()
const secciones = ref([])

const schemas = [
  z.object({
    estudiante: z.object({
      cedula:           z.string().min(5, 'Cédula muy corta').max(15, 'Cédula muy larga'),
      nombre:           z.string().min(2, 'El nombre es requerido'),
      apellido:         z.string().min(2, 'El apellido es requerido'),
      fecha_nacimiento: z.string().min(1, 'La fecha es requerida'),
      genero:           z.string().length(1),
      direccion:        z.string().max(255).optional().nullable()
    })
  }),
  z.object({
    representante: z.object({
      cedula:     z.string().min(6, 'Cédula de representante requerida'),
      nombre:     z.string().min(2, 'Nombre requerido'),
      apellido:   z.string().min(2, 'Apellido requerido'),
      telefono:   z.string().regex(/^\d{11}$/, 'El teléfono debe tener 11 dígitos'),
      email:      z.string().email('Email inválido').optional().or(z.literal('')),
      parentesco: z.string().min(3, 'Indique el parentesco')
    })
  }),
  z.object({
    section_id:       z.string().min(1, 'Debes seleccionar una sección'),
    tipo_inscripcion: z.string(),
    observaciones:    z.string().max(255).optional().nullable()
  })
]

const schemaActual = computed(() => schemas[currentStep.value])

const state = reactive({
  section_id:       '',
  tipo_inscripcion: 'regular',
  observaciones:    '',
  estudiante: {
    cedula:           '',
    nombre:           '',
    apellido:         '',
    fecha_nacimiento: '',
    genero:           'M',
    direccion:        ''
  },
  representante: {
    cedula:     '',
    nombre:     '',
    apellido:   '',
    telefono:   '',
    email:      '',
    parentesco: ''
  }
})


const steps = [
  { slot: 'step1', title: 'Estudiante',    icon: 'i-lucide-user'           },
  { slot: 'step2', title: 'Representante', icon: 'i-lucide-users'          },
  { slot: 'step3', title: 'Inscripción',   icon: 'i-lucide-graduation-cap' },
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)
const toast = useToast()

const siguiente = async () => {
  const result = await form.value.validate()
  if (!result.errors?.length) {
    currentStep.value++
  }
}

const onSubmit = async () => {
  loading.value = true
  try {
    const response = await useApi('/registrations', { method: 'POST', body: state })
    if (response?.status === 'success') {
      toast.add({ title: '¡Éxito!', description: 'Estudiante inscrito correctamente.', color: 'success' })
      emit('close')
      emit('success')
      currentStep.value = 0
    }
  } catch (error) {
    toast.add({ title: 'Error', description: error.data?.msg || 'No se pudo procesar', color: 'error' })
  } finally {
    loading.value = false
  }
}

const seccionesItems = computed(() =>
  secciones.value.map(sec => ({
    label: `${sec.grado} - Sección ${sec.seccion}`,
    value: sec.id
  }))
)

onMounted(async () => {
  try {
    const response = await useApi('/sections', { method: 'GET' })
    secciones.value = response.sections
    console.log(response)
  } catch (error) {
    console.error('Error cargando secciones:', error)
    toast.add({ title: 'Error', description: 'No se pudieron cargar las secciones', color: 'error' })
  }
})

const buscandoRepresentante = ref(false)

let debounceTimeout = null

watch(
  () => state.representante.cedula,
  (nuevaCedula, viejaCedula) => { // 👈 Agregamos viejaCedula para comparar
    // 1. Limpiamos el timeout anterior
    if (debounceTimeout) clearTimeout(debounceTimeout)

    const cedulaLimpia = nuevaCedula?.trim() || ''
    const cedulaViejaLimpia = viejaCedula?.trim() || ''

    // 2. DETECCIÓN DE BORRADO: Si la longitud actual es menor a la anterior,
    // o si es muy corta, asumimos que están borrando y limpiamos todo al instante.
    if (cedulaLimpia.length < 6 || cedulaLimpia.length < cedulaViejaLimpia.length) {
      state.representante.nombre     = ''
      state.representante.apellido   = ''
      state.representante.telefono   = ''
      state.representante.email      = ''
      state.representante.parentesco = ''
      return // Frenamos la petición HTTP
    }

    // 3. Si está escribiendo hacia adelante y llegó a los dígitos válidos, ejecutamos la búsqueda
    debounceTimeout = setTimeout(async () => {
      try {
        buscandoRepresentante.value = true
        
        const response = await useApi('/representatives', { 
          method: 'GET',
          query: { search: cedulaLimpia }
        })
        
        if (response && response.status === 'success' && response.data) {
          const rep = response.data[0]
          
          if (rep) {
            // Rellenamos solo si el input sigue teniendo exactamente la misma cédula que buscamos
            // (Evita desfases si el usuario escribe extremadamente rápido)
            if (state.representante.cedula.trim() === rep.cedula) {
              state.representante.cedula = rep.cedula 
              state.representante.nombre     = rep.nombre || ''
              state.representante.apellido   = rep.apellido || ''
              state.representante.telefono   = rep.telefono || ''
              state.representante.email      = rep.email || ''
              // state.representante.parentesco = rep.parentesco || ''
              
              toast.add({
                title: 'Representante encontrado',
                description: `Se cargaron los datos de: ${rep.nombre} ${rep.apellido}`,
                color: 'success'
              })
            }
          } else {
            // Si no hay coincidencias exactas en el backend (ej: cédula nueva)
            state.representante.nombre     = ''
            state.representante.apellido   = ''
            state.representante.telefono   = ''
            state.representante.email      = ''
            state.representante.parentesco = ''
          }
        }
      } catch (error) {
        if (error.statusCode !== 404) {
          console.error('Error al consultar el representante:', error)
        }
      } finally {
        buscandoRepresentante.value = false
      }
    }, 500)
  }
)
</script>

<template>
  <!-- Sin v-model:open, useOverlay maneja el ciclo de vida del componente -->
  <UModal
    prevent-close
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-file-plus" class="size-5 text-primary" />
          <h3 class="text-base font-semibold text-gray-900">Nueva Inscripción Académica</h3>
        </div>
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="emit('close')" />
      </div>
    </template>
    <template #body>
        <div class="p-2 space-y-6">
        <UStepper
            v-model="currentStep"
            disabled
            :items="steps"
        />

        <UForm ref="form" :state="state" :schema="schemaActual" class="space-y-6" @submit="onSubmit">

            <!-- Paso 1: Estudiante -->
            <div v-if="currentStep === 0" class="space-y-4 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Cédula" name="estudiante.cedula" :required="true">
                <UInput v-model="state.estudiante.cedula" placeholder="Ej: 30123456" icon="i-lucide-id-card" class="w-full" />
                </UFormField>
                <UFormField label="Género" name="estudiante.genero" required>
                <USelect
                    v-model="state.estudiante.genero"
                    :items="['M','F']"
                    class="w-full"
                />
                </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Nombres" name="estudiante.nombre" required>
                <UInput v-model="state.estudiante.nombre" class="w-full" />
                </UFormField>
                <UFormField label="Apellidos" name="estudiante.apellido" required>
                <UInput v-model="state.estudiante.apellido" class="w-full" />
                </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Fecha de Nacimiento" name="estudiante.fecha_nacimiento" required>
                <UInput v-model="state.estudiante.fecha_nacimiento" type="date" icon="i-lucide-calendar" class="w-full" />
                </UFormField>
                <UFormField label="Dirección" name="estudiante.direccion">
                  <UTextarea v-model="state.estudiante.direccion" icon="i-lucide-map-pin" autoresize :maxrows="3" class="w-full" />
                </UFormField>
            </div>
            </div>

            <!-- Paso 2: Representante -->
            <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Cédula" name="representante.cedula" required>
                  <UInput 
                    v-model="state.representante.cedula" 
                    placeholder="Ej: 30123456" 
                    :icon="buscandoRepresentante ? 'i-lucide-loader-2' : 'i-lucide-id-card'" 
                    :loading="buscandoRepresentante"
                    class="w-full" 
                  />
                </UFormField>
                <UFormField label="Parentesco" name="representante.parentesco" required>
                  <UInput v-model="state.representante.parentesco" class="w-full"/>
                </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Nombres" name="representante.nombre" required>
                <UInput v-model="state.representante.nombre" class="w-full" />
                </UFormField>
                <UFormField label="Apellidos" name="representante.apellido" required>
                <UInput v-model="state.representante.apellido" class="w-full" />
                </UFormField>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Teléfono" name="representante.telefono" required>
                <UInput v-model="state.representante.telefono" icon="i-lucide-phone" type="tel" placeholder="04121234567" class="w-full" />
                </UFormField>
                <UFormField label="Correo Electrónico" name="representante.email">
                  <UInput v-model="state.representante.email" icon="i-lucide-mail" type="email" class="w-full" />
                </UFormField>
            </div>
            </div>

            <!-- Paso 3: Inscripción -->
            <div v-if="currentStep === 2" class="space-y-4 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Sección Destino" name="section_id" required hint="Selecciona el año y sección">
                  <USelectMenu
                    v-model="state.section_id"
                    :items="seccionesItems"
                    value-key="value"
                    placeholder="Selecciona el año y sección..."
                    class="w-full"
                  />
                </UFormField>
                
                <UFormField label="Condición de Ingreso" name="tipo_inscripcion" required>
                <USelect
                    v-model="state.tipo_inscripcion"
                    :items="[
                    { label: 'Regular',   value: 'regular'   },
                    { label: 'Repitente', value: 'repitente' },
                    { label: 'Traslado',  value: 'traslado'  }
                    ]"
                    value-key="value"
                    class="w-full"
                />
                </UFormField>
            </div>
            <UFormField label="Observaciones Finales" name="observaciones">
                <UTextarea v-model="state.observaciones" placeholder="Indique alguna condición especial o nota..." class="w-full" />
            </UFormField>
            <div class="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <p class="text-xs text-primary-700">
                Al hacer clic en "Finalizar Inscripción", se creará el registro del estudiante,
                se vinculará con su representante y se le asignará un cupo en la sección seleccionada.
                </p>
            </div>
            </div>

            <!-- Botones de navegación -->
            <div class="flex justify-between items-center border-t pt-4">
            <UButton
                label="Atrás"
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-left"
                :disabled="currentStep === 0"
                @click="currentStep--"
            />
            <div class="flex gap-2">
                <UButton
                v-if="!isLastStep"
                label="Continuar"
                trailing-icon="i-lucide-chevron-right"
                @click="siguiente"
                />
                <UButton
                v-else
                type="submit"
                label="Finalizar Inscripción"
                color="primary"
                icon="i-lucide-check-circle"
                :loading="loading"
                />
            </div>
            </div>

        </UForm>
        </div>
    </template>
  </UModal>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0);   }
}
</style>