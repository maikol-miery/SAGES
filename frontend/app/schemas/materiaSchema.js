import { z } from 'zod'

export const materiaSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .trim(),
    
  abreviatura: z.string({ required_error: 'La abreviatura es obligatoria' })
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(5, 'No debe pasar de 5 caracteres')
    .trim()
    .transform(val => val.toUpperCase()), // SAGES la guarda siempre en mayúsculas automáticamente
    
  grado: z.string({ required_error: 'Debes seleccionar un año' })
    .min(1, 'Selecciona un año escolar válido'),

  // 🌟 CAMBIO NUEVO: Sincronizado con el selector y el backend
  tipo_evaluacion: z.enum(['cuantitativa', 'cualitativa'], {
    required_error: 'El tipo de evaluación es obligatorio'
  }).default('cuantitativa')
})