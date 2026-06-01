const { z } = require('zod');

// 1. Definimos los campos base con TODOS sus mensajes, regex y refinamientos
const sectionFields = z.object({
    grado: z.string({ required_error: "El campo grado es obligatorio." })
        .trim()
        .min(1, "El campo grado es obligatorio.")
        .max(50, "El formato del grado es demasiado largo."),
        
    seccion: z.string({ required_error: "La sección es requerida (ej: A, B, C)." })
        .trim()
        .length(1, "La sección debe ser un solo carácter (ej: A, B, C).")
        .toUpperCase() // Transforma automáticamente "b" en "B"
        .regex(/^[A-Za-z]$/, "La sección debe ser una letra de la A a la Z."),
        
    anio_escolar: z.string({ required_error: "El año escolar es requerido." })
        .trim()
        .regex(/^\d{4}-\d{4}$/, "El año escolar debe cumplir con el formato AAAA-AAAA (ej: 2025-2026).")
        .refine((val) => {
            // Validación extra: Verificar que el segundo año sea mayor que el primero
            const [anioInicio, anioFin] = val.split('-').map(Number);
            return anioFin === anioInicio + 1;
        }, {
            message: "El año de cierre debe ser exactamente el año siguiente al de inicio (ej: 2025-2026)."
        }),
        
    capacidad: z.number({ invalid_type_error: "La capacidad debe ser un número válido." })
        .int("La capacidad debe ser un número entero.")
        .min(1, "La capacidad mínima debe ser de al menos 1 estudiante.")
        .max(100, "La capacidad máxima por sección no puede exceder los 100 estudiantes.")
        .optional() // Permite que no se envíe y herede las propiedades por defecto
});

// 2. Esquema para POST (Creación)
const createSectionSchema = z.object({
    body: sectionFields
});

// 3. Esquema para PATCH (Actualización Parcial)
const updateSectionSchema = z.object({
    body: sectionFields.partial() // Funciona perfecto para el PATCH gracias a la modularidad
});

module.exports = {
    createSectionSchema,
    updateSectionSchema
};