const { z } = require('zod');

// Esquema base para registrar una Carga Académica (POST)
const createAcademicLoadSchema = z.object({
    body: z.object({
        teacher_id: z.string().uuid({
            message: "El ID del profesor debe ser un UUID válido."
        }),
        
        subject_id: z.string().uuid({
            message: "El ID de la materia debe ser un UUID válido."
        }),
        
        section_id: z.string().uuid({
            message: "El ID de la sección debe ser un UUID válido."
        }),
        
        anio_escolar: z.string()
            .trim()
            .regex(/^\d{4}-\d{4}$/, "El año escolar debe cumplir con el formato AAAA-AAAA (ej: 2025-2026).")
            .refine((val) => {
                const [anioInicio, anioFin] = val.split('-').map(Number);
                return anioFin === anioInicio + 1;
            }, {
                message: "El año de cierre debe ser exactamente el año siguiente al de inicio (ej: 2025-2026)."
            }),
            
        estado: z.string()
            .trim()
            .toLowerCase()
            .refine((val) => ['activo', 'inactivo'].includes(val), {
                message: "Estado de la carga académica inválido. Valores permitidos: activo, inactivo."
            })
            .default('activo')
    })
});

// Esquema para editar una Carga Académica (PUT)
const updateAcademicLoadSchema = z.object({
    body: createAcademicLoadSchema.shape.body.partial()
});

module.exports = {
    createAcademicLoadSchema,
    updateAcademicLoadSchema
};