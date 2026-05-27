const { z } = require('zod');

// Esquema base para registrar una Inscripción (POST)
const createRegistrationSchema = z.object({
    body: z.object({
        student_id: z.string().uuid({
            message: "El ID del estudiante debe ser un UUID válido."
        }),
        
        section_id: z.string().uuid({
            message: "El ID de la sección debe ser un UUID válido."
        }),
        
        tipo_inscripcion: z.string()
            .trim()
            .toLowerCase()
            .refine((val) => ['regular', 'repitente', 'traslado'].includes(val), {
                message: "Tipo de inscripción inválido. Valores permitidos: regular, repitente, traslado."
            }),
            
        observaciones: z.string()
            .trim()
            .max(255, "Las observaciones no pueden exceder los 255 caracteres.")
            .optional()
            .nullable(),
            
        estado: z.string()
            .trim()
            .toLowerCase()
            .refine((val) => ['pendiente', 'confirmada', 'anulada'].includes(val), {
                message: "Estado inválido. Valores permitidos: pendiente, confirmada, anulada."
            })
            .default('confirmada') // Por defecto asumimos que se confirma al guardarse
    })
});

// Esquema para editar una Inscripción (PUT)
const updateRegistrationSchema = z.object({
    body: createRegistrationSchema.shape.body.partial()
});

module.exports = {
    createRegistrationSchema,
    updateRegistrationSchema
};