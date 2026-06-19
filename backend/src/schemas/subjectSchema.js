const { z } = require('zod');

// 1. Definimos los campos base con TODOS sus mensajes y transformaciones
const subjectFields = z.object({
    abreviatura: z.string({ required_error: "La abreviatura es requerida." })
        .trim()
        .min(2, "La abreviatura debe tener al menos 2 caracteres (ej: MA, EF).")
        .max(6, "La abreviatura no puede exceder los 6 caracteres (ej: GHC).")
        .toUpperCase(), // Transforma automáticamente a mayúsculas consistentes
        
    nombre: z.string({ required_error: "El nombre de la materia es requerido." })
        .trim()
        .min(3, "El nombre de la materia debe tener al menos 3 caracteres.")
        .max(100, "El nombre de la materia es demasiado largo."),
        
    // 🌟 MODIFICADO: Se quita el enum rígido para dar soporte a escuelas técnicas (6to Año)
    grado: z.string({ required_error: "El año / grado es requerido." })
        .trim()
        .min(1, "El grado no puede estar vacío."),

    // 🌟 CAMBIO NUEVO: Validación estricta para la escala de calificaciones de SAGES
    tipo_evaluacion: z.enum(['cuantitativa', 'cualitativa'], {
        errorMap: () => ({ message: "El tipo de evaluación debe ser 'cuantitativa' (0-20) o 'cualitativa' (A-E)." })
    }).default('cuantitativa') // Si no se envía en el body, Zod le asigna el valor por defecto
});

const createSubjectSchema = z.object({
    body: subjectFields
});

const updateSubjectSchema = z.object({
    body: subjectFields.partial()
});

module.exports = {
    createSubjectSchema,
    updateSubjectSchema
};