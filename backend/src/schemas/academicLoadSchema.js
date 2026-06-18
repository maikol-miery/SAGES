const { z } = require('zod');

// 1. Definimos los campos base de la Carga Académica con sus mensajes y refinamientos
const academicLoadFields = z.object({
    staff_id: z.string({ required_error: "El ID del profesor es requerido." })
        .uuid("El ID del profesor debe ser un UUID válido."),
        
    subject_id: z.string({ required_error: "El ID de la materia es requerido." })
        .uuid("El ID de la materia debe ser un UUID válido."),
        
    section_id: z.string({ required_error: "El ID de la sección es requerido." })
        .uuid("El ID de la sección debe ser un UUID válido."),
        
    anio_escolar: z.string({ required_error: "El año escolar es requerido." })
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
});

// 2. Esquema para POST (Creación)
const createAcademicLoadSchema = z.object({
    body: academicLoadFields
});

// 3. Esquema para PATCH (Actualización Parcial)
const updateAcademicLoadSchema = z.object({
    body: academicLoadFields.partial() 
});

module.exports = {
    createAcademicLoadSchema,
    updateAcademicLoadSchema
};