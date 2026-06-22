const { z } = require('zod');

// 1. Definimos los campos base de la inscripción
const registrationFields = z.object({
    student_id: z.string({ required_error: "El ID del estudiante es requerido." })
        .uuid("El ID del estudiante debe ser un UUID válido."),
        
    section_id: z.string({ required_error: "El ID de la sección es requerido." })
        .uuid("El ID de la sección debe ser un UUID válido."),
        
    tipo_inscripcion: z.string({ required_error: "El tipo de inscripción es requerido." })
        .trim()
        .toUpperCase() // 🔄 Modificado para procesar las siglas en mayúsculas del frontend
        .refine((val) => ['RG', 'RP', 'MP', 'EQ'].includes(val), {
            message: "Tipo de inscripción inválido. Valores permitidos: RG, RP, MP, EQ."
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
            message: "Estado inválido. Valores permitidos: pendiente, confirmada, annulada."
        })
        .default('confirmada')
});

// 2. Esquemas finales
const createRegistrationSchema = z.object({
    body: registrationFields
});

const updateRegistrationSchema = z.object({
    body: registrationFields.partial() // ✅ Mucho más limpio así
});

// 3. Esquema para inscripción masiva (Bulk)
const bulkRegistrationSchema = z.object({
    body: z.object({
        section_id: z.string({ required_error: "El ID de la sección es requerido." })
            .uuid("El ID de la sección debe ser un UUID válido."),
            
        tipo_inscripcion: z.string({ required_error: "El tipo de inscripción es requerido." })
            .trim()
            .toUpperCase(), // 🔄 Modificado también aquí para mantener consistencia
            
        observaciones: z.string().max(255).optional().nullable(),
        
        estado: z.string().default('activo'),
        
        estudiantes: z.array(
            z.object({
                student_id: z.string({ required_error: "El ID del estudiante es requerido." })
                    .uuid("El ID del estudiante debe ser un UUID válido.")
            })
        ).min(1, { message: "El arreglo de estudiantes no puede estar vacío." })
    })
});

module.exports = {
    createRegistrationSchema,
    updateRegistrationSchema,
    bulkRegistrationSchema
};