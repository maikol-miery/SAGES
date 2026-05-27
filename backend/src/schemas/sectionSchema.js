const { z } = require('zod');

// Esquema base para registrar una Sección (POST)
const createSectionSchema = z.object({
    body: z.object({
        grado: z.string()
            .trim()
            .min(1, "El campo grado es obligatorio.")
            .max(50, "El formato del grado es demasiado largo."),
            
        seccion: z.string()
            .trim()
            .length(1, "La sección debe ser un solo carácter (ej: A, B, C).")
            .toUpperCase() // Transforma "b" en "B" de forma automática
            .regex(/^[A-Za-z]$/, "La sección debe ser una letra de la A a la Z."),
            
        anio_escolar: z.string()
            .trim()
            .regex(/^\d{4}-\d{4}$/, "El año escolar debe cumplir con el formato AAAA-AAAA (ej: 2025-2026).")
            .refine((val) => {
                // Validación extra: Verificar que el segundo año sea mayor que el primero
                const [anioInicio, anioFin] = val.split('-').map(Number);
                return anioFin === anioInicio + 1;
            }, {
                message: "El año de cierre debe ser exactamente el año siguiente al de inicio (ej: 2025-2026)."
            }),
            
        capacidad: z.number()
            .int("La capacidad debe ser un número entero.")
            .min(1, "La capacidad mínima debe ser de al menos 1 estudiante.")
            .max(100, "La capacidad máxima por sección no puede exceder los 100 estudiantes.")
            .default(40)
            .optional() // Permite que no se envíe y Sequelize aplique su defaultValue
    })
});

// Esquema para editar una Sección (PUT)
const updateSectionSchema = z.object({
    body: createSectionSchema.shape.body.partial()
});

module.exports = {
    createSectionSchema,
    updateSectionSchema
};