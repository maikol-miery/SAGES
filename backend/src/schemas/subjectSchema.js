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
        
    grado: z.enum(["1", "2", "3", "4", "5"], {
        errorMap: () => ({ message: "Grado inválido. Debe ser un año del '1' al '5' de bachillerato." })
    })
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