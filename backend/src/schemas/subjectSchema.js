const { z } = require('zod');

// Esquema base para registrar una Materia (POST)
const createSubjectSchema = z.object({
    body: z.object({
        abreviatura: z.string()
            .trim()
            .min(2, "La abreviatura debe tener al menos 2 caracteres (ej: MA, EF).")
            .max(6, "La abreviatura no puede exceder los 6 caracteres (ej: GHC, premil).")
            .toUpperCase(), // Transforma "mat" o "Mat" en "MAT" automáticamente
            
        nombre: z.string()
            .trim()
            .min(3, "El nombre de la materia debe tener al menos 3 caracteres.")
            .max(100, "El nombre de la materia es demasiado largo."),
            
        grado: z.string()
            .trim()
            .min(1, "El campo grado es obligatorio.")
            .max(20, "El formato del grado es demasiado largo.")
    })
});

// Esquema para editar una Materia (PUT)
const updateSubjectSchema = z.object({
    body: createSubjectSchema.shape.body.partial()
});

module.exports = {
    createSubjectSchema,
    updateSubjectSchema
};